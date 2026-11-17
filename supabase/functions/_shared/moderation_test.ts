import { deepStrictEqual as equal, rejects, ok } from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { moderateStory } from './moderation.ts';
import { ApiError } from './respond.ts';
function database(failUpload = false) {
  let revision = 0;
  const story = {
    id: 'id',
    status: 'pending',
    updated_at: '0',
    moderation_note: null as string | null,
    approved_at: null,
  };
  const photos = [{ bucket: 'vault-pending', path_full: 'id/0-full.webp', path_thumb: 'id/0-thumb.webp' }];
  const events: string[] = [];
  let fail = failUpload;
  const fetcher: typeof fetch = async (input, init) => {
    const req = new Request(input, init),
      url = new URL(req.url);
    const path = url.pathname;
    if (path.startsWith('/storage/')) {
      const bucket = path.includes('vault-public') ? 'vault-public' : 'vault-pending';
      events.push(`${req.method}:${bucket}`);
      if (req.method === 'GET')
        return new Response(new Uint8Array([1, 2, 3]), { headers: { 'content-type': 'image/webp' } });
      if (req.method === 'POST' && fail) {
        fail = false;
        return Response.json({ message: 'injected upload failure' }, { status: 500 });
      }
      return Response.json(req.method === 'DELETE' ? [] : { Key: 'uploaded' });
    }
    const table = path.split('/').at(-1);
    const body = req.method === 'GET' ? null : await req.json();
    if (table === 'moderation_log') {
      events.push('log');
      return new Response(null, { status: 201 });
    }
    if (table === 'story_photos') {
      if (req.method === 'PATCH') Object.assign(photos[0], body);
      return Response.json(photos);
    }
    if (table === 'stories') {
      if (req.method === 'PATCH') {
        const expected = url.searchParams.get('updated_at');
        if (expected && expected !== `eq.${story.updated_at}`) return Response.json(null);
        Object.assign(story, body, { updated_at: String(++revision) });
        events.push(
          `story:${story.status}:${story.moderation_note?.startsWith('[vault-operation:') ? 'reserved' : 'released'}`,
        );
      }
      return Response.json(req.headers.get('accept')?.includes('vnd.pgrst.object') ? story : [story]);
    }
    throw new Error(`Unexpected test route ${path}`);
  };
  const db = createClient('https://example.supabase.co', 'sb_secret_test', {
    global: { fetch: fetcher },
    auth: { persistSession: false },
  });
  return { db, story, photos, events };
}
Deno.test('publication logs before approval and retains private originals until commit', async () => {
  const { db, story, photos, events } = database();
  await moderateStory(db, 'approve', 'id', 'moderator');
  equal(story.status, 'approved');
  equal(story.moderation_note, null);
  equal(photos[0].bucket, 'vault-public');
  ok(events.indexOf('log') < events.indexOf('story:approved:reserved'));
  ok(events.indexOf('DELETE:vault-pending') > events.indexOf('story:approved:released'));
  equal(events.filter((s) => s === 'POST:vault-public').length, 2);
});
Deno.test('failed copy stays hidden/reserved and does not delete private originals', async () => {
  const { db, story, events } = database(true);
  await rejects(() => moderateStory(db, 'approve', 'id', 'moderator'), ApiError);
  equal(story.status, 'hidden');
  ok(story.moderation_note?.startsWith('[vault-operation:'));
  ok(!events.includes('DELETE:vault-pending'));
  await rejects(() => moderateStory(db, 'restore', 'id', 'another-moderator'), ApiError);
});

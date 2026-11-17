import { beforeEach, expect, it, vi } from 'vitest';
import { FunctionsHttpError } from '@supabase/supabase-js';
const mocked = vi.hoisted(() => ({ rpc: vi.fn(), invoke: vi.fn(), from: vi.fn() }));
vi.mock('@/lib/supabase', () => ({
  supabase: { rpc: mocked.rpc, functions: { invoke: mocked.invoke }, from: mocked.from },
}));
import { supabaseApi } from './supabaseApi';
beforeEach(() => vi.resetAllMocks());
it('uses keyset RPC arguments and preserves multipart bodies', async () => {
  const cursor = { id: '00000000-0000-4000-8000-000000000001', approved_at: '2026-11-01T00:00:00Z' };
  mocked.rpc.mockResolvedValue({ data: [], error: null });
  await supabaseApi.listStories({ country: 'both', category: 'diary', cursor });
  expect(mocked.rpc).toHaveBeenCalledWith('get_stories', {
    p_country: 'both',
    p_category: 'diary',
    p_before_approved_at: cursor.approved_at,
    p_before_id: cursor.id,
    p_limit: 12,
  });
  mocked.invoke.mockResolvedValue({ data: { ok: true }, error: null });
  const data = new FormData();
  data.set('name', 'Visitor');
  await supabaseApi.submitStory(data);
  expect(mocked.invoke).toHaveBeenCalledWith('submit-story', { body: data });
});
it('reads story detail through the approved-only RPC', async () => {
  mocked.rpc.mockResolvedValue({ data: null, error: null });
  expect(await supabaseApi.getStory('missing')).toBeNull();
  expect(mocked.rpc).toHaveBeenCalledWith('get_story', { p_id: 'missing' });
});
it('extracts public Edge Function error codes without exposing internals', async () => {
  mocked.invoke.mockResolvedValue({
    data: null,
    error: new FunctionsHttpError(new Response(JSON.stringify({ error: 'captcha_failed' }), { status: 400 })),
  });
  await expect(
    supabaseApi.subscribe({ email: 'a@example.com', locale: 'en', consent: true, turnstileToken: 'bad' }),
  ).rejects.toMatchObject({ code: 'captcha_failed' });
});
it('reads and maps active alert translations and links', async () => {
  const limit = vi.fn().mockResolvedValue({
    data: [
      {
        id: 'a',
        level: 'info',
        message_en: 'Hello',
        message_fr: 'Bonjour',
        message_ar: 'مرحبا',
        starts_at: '2026-11-01',
        link_url: 'https://example.com',
      },
    ],
    error: null,
  });
  const order = vi.fn().mockReturnValue({ limit });
  const select = vi.fn().mockReturnValue({ order });
  mocked.from.mockReturnValue({ select });
  expect((await supabaseApi.getAlerts())[0]).toMatchObject({
    id: 'a',
    message: { en: 'Hello', fr: 'Bonjour', ar: 'مرحبا' },
    createdAt: '2026-11-01',
  });
  expect(mocked.from).toHaveBeenCalledWith('site_alerts');
  expect(limit).toHaveBeenCalledWith(3);
});

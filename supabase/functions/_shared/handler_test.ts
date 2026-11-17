import { deepStrictEqual as equal, strictEqual as same } from 'node:assert/strict';
import { handler, readJson } from './handler.ts';
import { json } from './respond.ts';
Deno.test('request boundary handles preflight, methods, declared and streamed size before auth', async () => {
  Deno.env.set('ALLOWED_ORIGINS', 'https://site.test');
  let called = 0;
  const serve = handler('none', () => {
    called++;
    return Promise.resolve(json({ ok: true }));
  });
  const headers = { origin: 'https://site.test' };
  same((await serve(new Request('https://fn.test', { method: 'OPTIONS', headers }))).status, 204);
  same((await serve(new Request('https://fn.test', { headers }))).status, 400);
  same(
    (
      await serve(
        new Request('https://fn.test', {
          method: 'POST',
          headers: { ...headers, 'content-length': '7000000' },
          body: 'x',
        }),
      )
    ).status,
    413,
  );
  const streamed = await serve(
    new Request('https://fn.test', {
      method: 'POST',
      headers,
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array(16385));
          controller.close();
        },
      }),
    }),
  );
  same(streamed.status, 413);
  same(streamed.headers.get('Access-Control-Allow-Origin'), 'https://site.test');
  same(called, 0);
});
Deno.test('JSON input errors are generic and preserve allowed-origin CORS', async () => {
  Deno.env.set('ALLOWED_ORIGINS', 'https://site.test');
  Deno.env.set('SUPABASE_URL', 'https://example.supabase.co');
  Deno.env.set('SUPABASE_SECRET_KEYS', JSON.stringify({ default: 'sb_secret_test' }));
  Deno.env.set('SUPABASE_PUBLISHABLE_KEYS', JSON.stringify({ default: 'sb_publishable_test' }));
  const serve = handler('none', async (req) => json(await readJson(req)));
  const response = await serve(
    new Request('https://fn.test', {
      method: 'POST',
      headers: { origin: 'https://site.test', 'content-type': 'application/json' },
      body: '{broken',
    }),
  );
  same(response.status, 400);
  equal(await response.json(), { error: 'invalid_input' });
  same(response.headers.get('Access-Control-Allow-Origin'), 'https://site.test');
});

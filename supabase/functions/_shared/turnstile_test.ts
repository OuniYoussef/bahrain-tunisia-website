import { strictEqual as same, ok, rejects } from 'node:assert/strict';
import { captcha } from './turnstile.ts';
import { ApiError } from './respond.ts';
Deno.test('Turnstile sends required fields and rejects failure or mismatched action', async () => {
  Deno.env.set('TURNSTILE_SECRET_KEY', 'test-only-secret');
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async (url, init) => {
      same(url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
      const form = init?.body as URLSearchParams;
      same(form.get('secret'), 'test-only-secret');
      same(form.get('response'), 'token');
      same(form.get('remoteip'), '192.0.2.1');
      ok(form.get('idempotency_key'));
      return Response.json({ success: true, action: 'subscribe' });
    };
    await captcha('token', '192.0.2.1', 'subscribe');
    await rejects(() => captcha('token', '192.0.2.1', 'submit-story'), ApiError);
    globalThis.fetch = () => Promise.resolve(Response.json({ success: false }));
    await rejects(() => captcha('token', '192.0.2.1', 'subscribe'), ApiError);
  } finally {
    globalThis.fetch = original;
  }
});

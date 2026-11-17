import { ApiError } from './respond.ts';
import { secret } from './ip.ts';
export async function captcha(token: string, ip: string, action: string) {
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    signal: AbortSignal.timeout(10000),
    body: new URLSearchParams({
      secret: secret('TURNSTILE_SECRET_KEY'),
      response: token,
      remoteip: ip,
      idempotency_key: crypto.randomUUID(),
    }),
  });
  if (!response.ok) throw new ApiError('captcha_failed');
  const data = await response.json();
  if (data.success !== true || (data.action && data.action !== action)) throw new ApiError('captcha_failed');
}

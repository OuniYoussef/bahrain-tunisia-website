import { ApiError } from './respond.ts';
export function secret(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new ApiError('server_error');
  return value;
}
export async function hash(value: string) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(secret('IP_HASH_SALT') + value),
  );
  return [...new Uint8Array(digest)].map((n) => n.toString(16).padStart(2, '0')).join('');
}
export function clientIp(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim();
  if (!ip || ip.length > 64) throw new ApiError('invalid_input');
  return ip;
}

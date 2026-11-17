import { ApiError } from './respond.ts';
export function cors(req: Request, unsubscribe = false) {
  const origin = req.headers.get('origin');
  const allowed = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if ((!origin && !unsubscribe) || (origin && !allowed.includes(origin))) throw new ApiError('forbidden');
  const headers = new Headers({
    Vary: 'Origin',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Max-Age': '600',
  });
  if (origin) headers.set('Access-Control-Allow-Origin', origin);
  return headers;
}

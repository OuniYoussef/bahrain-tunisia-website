import { withSupabase } from '@supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../../src/lib/database.types.ts';
import { cors } from './cors.ts';
import { ApiError, errorResponse, checked } from './respond.ts';
export type Client = SupabaseClient<Database>;
type Context = { supabaseAdmin: Client; supabase: Client };
export function handler(
  auth: 'none' | 'user',
  run: (req: Request, ctx: Context) => Promise<Response>,
  allowUnsubscribe = false,
) {
  const wrapped = withSupabase<Database>({ auth, cors: 'disabled' }, async (req, ctx) => {
    try {
      return await run(req, ctx);
    } catch (error) {
      return errorResponse(error);
    }
  });
  return async (req: Request) => {
    let headers: Headers;
    try {
      const unsubscribe =
        allowUnsubscribe && req.method === 'GET' && new URL(req.url).searchParams.has('unsubscribe');
      headers = cors(req, unsubscribe);
      if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
      if (req.method !== 'POST' && !unsubscribe) throw new ApiError('invalid_input');
      // Bound streamed bodies too: Content-Length alone is attacker-controlled/optional.
      if (req.method === 'POST')
        req = await boundedRequest(
          req,
          req.headers.get('content-type')?.startsWith('multipart/form-data') ? 6 * 1024 * 1024 : 16384,
        );
      const response = await wrapped(req);
      const output = new Response(response.body, response);
      headers.forEach((v, k) => output.headers.set(k, v));
      if (
        response.headers.has('x-supabase-server-error') ||
        response.status === 401 ||
        response.status === 403
      ) {
        const denied = errorResponse(
          new ApiError(response.status === 401 || response.status === 403 ? 'forbidden' : 'server_error'),
        );
        headers.forEach((v, k) => denied.headers.set(k, v));
        return denied;
      }
      return output;
    } catch (error) {
      const response = errorResponse(error);
      response.headers.set('Vary', 'Origin');
      try {
        cors(req).forEach((v, k) => response.headers.set(k, v));
      } catch {
        /* No CORS grant for disallowed origins. */
      }
      return response;
    }
  };
}
async function boundedRequest(req: Request, max: number) {
  if (Number(req.headers.get('content-length')) > max) throw new ApiError('payload_too_large');
  const reader = req.body?.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  if (reader) {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > max) {
        await reader.cancel();
        throw new ApiError('payload_too_large');
      }
      chunks.push(value);
    }
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return new Request(req.url, { method: req.method, headers: req.headers, body: bytes });
}
export async function readJson(req: Request): Promise<unknown> {
  if (!req.headers.get('content-type')?.includes('application/json')) throw new ApiError('invalid_input');
  try {
    return await req.json();
  } catch {
    throw new ApiError('invalid_input');
  }
}
export async function limit(db: Client, ip: string, action: string, max: number, window: string) {
  if (
    !checked(
      await db.rpc('hit_rate_limit', { p_ip_hash: ip, p_action: action, p_max: max, p_window: window }),
    )
  )
    throw new ApiError('rate_limited');
}

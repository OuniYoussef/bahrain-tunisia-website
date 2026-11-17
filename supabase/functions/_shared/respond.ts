export const statuses = {
  invalid_input: 400,
  captcha_failed: 400,
  rate_limited: 429,
  payload_too_large: 413,
  not_found: 404,
  forbidden: 403,
  server_error: 500,
} as const;
export type ErrorCode = keyof typeof statuses;
export class ApiError extends Error {
  code: ErrorCode;
  constructor(code: ErrorCode) {
    super(code);
    this.code = code;
  }
}
export function json(value: unknown, status = 200) {
  return Response.json(value, { status, headers: { 'Cache-Control': 'no-store' } });
}
export function errorResponse(error: unknown) {
  const code = error instanceof ApiError ? error.code : 'server_error';
  return json({ error: code }, statuses[code]);
}
export function checked<T>(result: { data: T; error: unknown }): T {
  if (result.error) throw new ApiError('server_error');
  return result.data;
}

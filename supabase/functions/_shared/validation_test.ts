import { ok as assert, deepStrictEqual as assertEquals, throws as assertThrows } from 'node:assert/strict';
import { storySchema, reactSchema, reportSchema, subscribeSchema, moderateSchema, parse } from './schemas.ts';
import { isBot, normalize, countUrls } from './text.ts';
import { ApiError, errorResponse, statuses } from './respond.ts';
import { cors } from './cors.ts';
import { webp } from './webp.ts';
const story = {
  name: 'Visitor',
  country: 'tunisia',
  category: 'story',
  title: 'A quiet walk',
  body: 'A neutral note about a walk through the city.',
  locale: 'en',
  consent: 'true',
  startedAt: '1000',
  website: '',
  turnstileToken: 'test',
};
Deno.test('normalization and text boundaries', () => {
  assertEquals(normalize('  e\u0301\u0000\n\n\nhello  '), 'é\n\nhello');
  assertEquals(countUrls('https://one.test www.two.test HTTP://three.test'), 3);
  assert(storySchema.safeParse(story).success);
  for (const invalid of [
    { name: '' },
    { title: 'ab' },
    { body: 'x'.repeat(1501) },
    { body: 'https://a.test https://b.test www.c.test' },
    { consent: 'false' },
    { locale: 'de' },
    { country: 'unknown' },
    { placeYear: 'x'.repeat(81) },
  ]) {
    assert(!storySchema.safeParse({ ...story, ...invalid }).success);
  }
});
Deno.test('UUID, consent, reason and moderation contracts', () => {
  const id = '00000000-0000-4000-8000-000000000001';
  assert(reactSchema.safeParse({ storyId: id, deviceId: id }).success);
  assert(!reactSchema.safeParse({ storyId: id, deviceId: 'bad' }).success);
  assert(!reportSchema.safeParse({ storyId: id, reason: 'bad', turnstileToken: 'test' }).success);
  assert(
    !subscribeSchema.safeParse({ email: 'bad', locale: 'en', consent: true, turnstileToken: 'test' }).success,
  );
  assert(
    !subscribeSchema.safeParse({
      email: 'a@example.com',
      locale: 'en',
      consent: false,
      turnstileToken: 'test',
    }).success,
  );
  assertEquals(
    parse(subscribeSchema, { email: ' A@Example.com ', locale: 'en', consent: true, turnstileToken: 'test' })
      .email,
    'a@example.com',
  );
  assert(!moderateSchema.safeParse({ action: 'delete' }).success);
  assert(!moderateSchema.safeParse({ action: 'resolve-report', storyId: id }).success);
  assert(!moderateSchema.safeParse({ action: 'hide', storyId: id, note: '[vault-operation:fake]' }).success);
  assert(moderateSchema.safeParse({ action: 'approve', storyId: id }).success);
});
Deno.test('honeypot and minimum fill time include exact boundary and future dates', () => {
  assert(!isBot('', '1000', 5000));
  for (const [site, start] of [
    ['bot', '1000'],
    ['', '1001'],
    ['', '6000'],
    ['', 'NaN'],
    ['', ''],
    [null, '1000'],
  ])
    assert(isBot(site, start, 5000));
});
Deno.test('generic error mapping never exposes internals', async () => {
  assertEquals(await errorResponse(new Error('database password')).json(), { error: 'server_error' });
  for (const [code, status] of Object.entries(statuses)) {
    const response = errorResponse(new ApiError(code as keyof typeof statuses));
    assertEquals(response.status, status);
    assertEquals(await response.json(), { error: code });
  }
});
Deno.test('CORS rejects missing and suffix-matched origins, permits unsubscribe navigation', () => {
  Deno.env.set('ALLOWED_ORIGINS', 'https://site.test, http://localhost:5173');
  assertEquals(
    cors(new Request('https://fn.test', { headers: { origin: 'https://site.test' } })).get(
      'Access-Control-Allow-Origin',
    ),
    'https://site.test',
  );
  for (const origin of ['', 'https://site.test.evil.test', 'null'])
    assertThrows(() => cors(new Request('https://fn.test', { headers: origin ? { origin } : {} })), ApiError);
  assertEquals(cors(new Request('https://fn.test'), true).get('Vary'), 'Origin');
});
function fixture(type: 'VP8 ' | 'VP8L' | 'VP8X', width: number, height: number) {
  const bytes = new Uint8Array(type === 'VP8X' ? 48 : 30),
    view = new DataView(bytes.buffer);
  const tag = (offset: number, s: string) => bytes.set(new TextEncoder().encode(s), offset);
  tag(0, 'RIFF');
  view.setUint32(4, bytes.length - 8, true);
  tag(8, 'WEBP');
  tag(12, type);
  view.setUint32(16, type === 'VP8L' ? 5 : 10, true);
  if (type === 'VP8X') {
    for (const [offset, n] of [
      [24, width - 1],
      [27, height - 1],
    ]) {
      bytes[offset] = n & 255;
      bytes[offset + 1] = n >> 8;
      bytes[offset + 2] = n >> 16;
    }
    bytes.set(fixture('VP8 ', width, height).subarray(12), 30);
  } else if (type === 'VP8L') {
    // RIFF uses even padding; allocate just the chunk's padded length.
    const short = bytes.slice(0, 26);
    new DataView(short.buffer).setUint32(4, 18, true);
    short[20] = 0x2f;
    new DataView(short.buffer).setUint32(21, (width - 1) | ((height - 1) << 14), true);
    return short;
  } else {
    bytes.set([0x9d, 1, 0x2a], 23);
    view.setUint16(26, width, true);
    view.setUint16(28, height, true);
  }
  return bytes;
}
Deno.test('WebP checks VP8/VP8L/VP8X dimensions, truncation, metadata and bounds', () => {
  for (const type of ['VP8 ', 'VP8L', 'VP8X'] as const) {
    const bytes = fixture(type, 480, 300);
    assertEquals(webp(bytes, 1000, 480), { width: 480, height: 300 });
    assertThrows(() => webp(bytes, 1000, 479), ApiError);
    assertThrows(() => webp(bytes, 10, 480), ApiError);
    assertThrows(() => webp(bytes.slice(0, -1), 1000, 480), ApiError);
  }
  const invalid = fixture('VP8X', 480, 300);
  invalid[20] = 8;
  assertThrows(() => webp(invalid, 1000, 480), ApiError);
  assertThrows(() => webp(new TextEncoder().encode('<svg onload=alert(1)>'), 1000, 480), ApiError);
});

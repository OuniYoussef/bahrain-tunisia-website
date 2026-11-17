// Local-only integration checks. Requires functions serve with the documented Turnstile test secret.
// Credentials stay in memory; curl receives headers through stdin, never process arguments.
import { execFileSync } from 'node:child_process';
import { createHmac, randomUUID, randomInt } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
const status = JSON.parse(execFileSync(process.execPath, ['node_modules/supabase/dist/supabase.js', 'status', '-o', 'json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
const url = status.API_URL;
assert.match(url, /^http:\/\/(127\.0\.0\.1|localhost):/);
const admin = createClient(url, status.SECRET_KEY, { auth: { persistSession: false } });
const user = createClient(url, status.PUBLISHABLE_KEY, { auth: { persistSession: false } });
const check = (result) => { assert.equal(result.error, null, result.error?.message); return result.data; };
const token = 'XXXX.DUMMY.TOKEN.XXXX';
let calls = 0;
const runIp = `198.51.100.${randomInt(1, 250)}`;
function curl(name, body, { origin = 'http://localhost:5173', ip = runIp, jwt, method = 'POST', form } = {}) {
  const headers = [`Origin: ${origin}`, `X-Forwarded-For: ${ip}`, `apikey: ${status.PUBLISHABLE_KEY}`];
  if (jwt) headers.push(`Authorization: Bearer ${jwt}`);
  const args = ['--silent', '--show-error', '--max-time', '30', '--config', '-', '-X', method, '-w', '\n%{http_code}', `${url}/functions/v1/${name}`];
  if (form) for (const field of form) args.push('-F', field);
  else if (body) { headers.push('Content-Type: application/json'); args.push('--data-binary', JSON.stringify(body)); }
  const config = headers.map((h) => `header = "${h}"`).join('\n');
  const output = execFileSync(process.platform === 'win32' ? 'curl.exe' : 'curl', args, { input: config, encoding: 'utf8' });
  const split = output.lastIndexOf('\n'), code = Number(output.slice(split + 1));
  const raw = output.slice(0, split);
  calls++;
  let data; try { data = JSON.parse(raw); } catch { data = raw; }
  return { code, data };
}
const expect = (result, code) => { assert.equal(result.code, code, JSON.stringify(result.data)); return result.data; };
function totp(secret) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const bits = [...secret.toUpperCase().replace(/=+$/, '')].map((c) => alphabet.indexOf(c).toString(2).padStart(5, '0')).join('');
  const key = Buffer.from(bits.match(/.{8}/g).map((b) => parseInt(b, 2)));
  const counter = Buffer.alloc(8); counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
  const mac = createHmac('sha1', key).update(counter).digest(), offset = mac[19] & 15;
  return String((mac.readUInt32BE(offset) & 0x7fffffff) % 1000000).padStart(6, '0');
}
let userId, storyId;
const email = `backend-${randomUUID()}@example.com`, password = `${randomUUID()}aA!`;
try {
  expect(curl('react', {}, { origin: 'https://denied.example' }), 403);
  expect(curl('react', {}), 400);
  expect(curl('react', null, { method: 'OPTIONS' }), 204);
  assert.ok([401, 403].includes(curl('moderate', { action: 'delete', storyId: randomUUID() }).code));
  expect(curl('submit-story', null, { form: ['website=bot', 'startedAt=1'] }), 200);
  expect(curl('subscribe', { email: 'invalid-email', locale: 'en', consent: true, turnstileToken: token }), 400);
  const dir = 'node_modules/.cache/backend-smoke'; mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/photo.webp`, await sharp({ create: { width: 32, height: 24, channels: 3, background: '#aa7755' } }).webp().toBuffer());
  const title = `Smoke ${randomUUID()}`;
  const form = ['name=Local smoke', 'country=both', 'category=photo', `title=${title}`, 'body=This is a neutral local integration test story.', 'locale=en', 'consent=true', `startedAt=${Date.now()-5000}`, 'website=', `turnstileToken=${token}`, `photo_0_full=@${dir}/photo.webp;type=image/webp`, `photo_0_thumb=@${dir}/photo.webp;type=image/webp`, 'photo_0_alt=Test colour'];
  expect(curl('submit-story', null, { form }), 201);
  const story = check(await admin.from('stories').select('*').eq('title', title).single()); storyId = story.id;
  assert.equal(story.status, 'pending'); assert.equal(story.photo_count, 1);
  assert.equal(check(await user.rpc('get_story', { p_id: storyId })), null);
  const created = check(await admin.auth.admin.createUser({ email, password, email_confirm: true })); userId = created.user.id;
  check(await admin.from('admins').insert({ user_id: userId }));
  const signed = check(await user.auth.signInWithPassword({ email, password }));
  expect(curl('moderate', { action: 'approve', storyId }, { jwt: signed.session.access_token }), 403);
  const factor = check(await user.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Local smoke' }));
  check(await user.auth.mfa.challengeAndVerify({ factorId: factor.id, code: totp(factor.totp.secret) }));
  const jwt = check(await user.auth.getSession()).session.access_token;
  expect(curl('moderate', { action: 'approve', storyId }, { jwt }), 200);
  assert.equal(check(await user.rpc('get_story', { p_id: storyId })).photos.length, 1);
  const deviceId = randomUUID();
  assert.equal(expect(curl('react', { storyId, deviceId }), 200).hearts, 1);
  assert.equal(expect(curl('react', { storyId, deviceId }), 200).hearts, 1);
  for (let i = 1; i <= 3; i++) expect(curl('report-post', { storyId, reason: 'spam', turnstileToken: token }, { ip: `192.0.2.${20+i}` }), 200);
  assert.equal(check(await admin.from('stories').select('status').eq('id', storyId).single()).status, 'hidden');
  assert.equal(check(await user.rpc('get_story', { p_id: storyId })), null);
  expect(curl('moderate', { action: 'restore', storyId }, { jwt }), 200);
  expect(curl('moderate', { action: 'hide', storyId }, { jwt }), 200);
  const report = check(await admin.from('reports').select('id').eq('story_id', storyId).limit(1).single());
  expect(curl('moderate', { action: 'resolve-report', reportId: report.id }, { jwt }), 200);
  expect(curl('moderate', { action: 'reject', storyId }, { jwt }), 200);
  expect(curl('moderate', { action: 'delete', storyId }, { jwt }), 200);
  const subscribe = { email, locale: 'fr', consent: true, turnstileToken: token };
  assert.equal(expect(curl('subscribe', subscribe), 200).status, 'subscribed');
  assert.equal(expect(curl('subscribe', subscribe), 200).status, 'already');
  const subscriber = check(await admin.from('newsletter_subscribers').select('unsubscribe_token').eq('email', email).single());
  expect(curl(`subscribe?unsubscribe=${subscriber.unsubscribe_token}`, null, { method: 'GET' }), 200);
  assert.equal(check(await admin.from('newsletter_subscribers').select('status').eq('email', email).single()).status, 'unsubscribed');
  console.log(`PASS: ${calls} curl requests; submission, private/public storage, aal1/aal2, all moderation actions, deduplicated reactions, auto-hide, subscription/unsubscribe.`);
} finally {
  if (storyId) {
    const paths = [`${storyId}/0-full.webp`, `${storyId}/0-thumb.webp`];
    for (const bucket of ['vault-public', 'vault-pending']) check(await admin.storage.from(bucket).remove(paths));
    check(await admin.from('stories').delete().eq('id', storyId));
    check(await admin.from('moderation_log').delete().eq('story_id', storyId));
  }
  check(await admin.from('newsletter_subscribers').delete().eq('email', email));
  if (userId) check(await admin.auth.admin.deleteUser(userId));
}

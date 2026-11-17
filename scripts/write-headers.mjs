import { writeFile, mkdir, cp } from 'node:fs/promises';
import { locales, pagesFor } from './seo-data.mjs';
async function staticPaths(base) {
  return (await Promise.all(locales.map(async (lang) => (await pagesFor(lang)).map((page) => `${base}${lang}${page.path ? `/${page.path}` : ''}`)))).flat();
}
export function securityHeaders(env) {
  const origin = (value) => value ? new URL(value).origin : '';
  const supabase = origin(env.VITE_SUPABASE_URL);
  const cookie = origin(env.VITE_IEEE_COOKIE_SCRIPT_URL);
  const csp = ["default-src 'self'", `script-src 'self' https://challenges.cloudflare.com ${cookie}`, "style-src 'self' 'unsafe-inline'", `img-src 'self' data: blob: ${supabase}`, "font-src 'self'", `connect-src 'self' ${supabase} https://challenges.cloudflare.com ${cookie}`, 'frame-src https://challenges.cloudflare.com https://www.youtube-nocookie.com https://player.vimeo.com', `media-src 'self' ${supabase}`, "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'", 'upgrade-insecure-requests'].map((s) => s.trim().replace(/ +/g, ' ')).join('; ');
  return { 'Content-Security-Policy': csp, 'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload', 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()', 'Cross-Origin-Opener-Policy': 'same-origin' };
}
export async function writeHeaders(env, out, base) {
  const headers = securityHeaders(env);
  const immutable = 'public, max-age=31536000, immutable';
  const htmlPaths = [base, `${base}*.html`, ...['en', 'fr', 'ar'].flatMap((lang) => [`${base}${lang}`, `${base}${lang}/*`])];
  await writeFile(`${out}/_headers`, `/*\n${Object.entries(headers).map(([key, value]) => `  ${key}: ${value}`).join('\n')}\n${htmlPaths.map((path) => `${path}\n  Cache-Control: no-cache`).join('\n')}\n${base}assets/*\n  Cache-Control: ${immutable}\n${base}images/photos/*\n  Cache-Control: ${immutable}\n`);
  const paths = await staticPaths(base);
  await writeFile('vercel.json', JSON.stringify({ buildCommand: 'npm run build', outputDirectory: 'dist', headers: [{ source: '/(.*)', headers: [...Object.entries(headers).map(([key, value]) => ({ key, value })), { key: 'Cache-Control', value: 'no-cache' }] }, ...['assets', 'images/photos'].map((path) => ({ source: `${base}${path}/(.*)`, headers: [{ key: 'Cache-Control', value: immutable }] }))], rewrites: [...paths.map((path) => ({ source: path, destination: `${path}/index.html` })), { source: `${base}:lang(en|fr|ar)/admin/:path*`, destination: `${base}index.html` }, { source: '/(.*)', destination: `${base}index.html` }] }, null, 2) + '\n');
  await writeFile(`${out}/_redirects`, locales.flatMap((lang) => [`${base}${lang}/admin ${base}index.html 200`, `${base}${lang}/admin/* ${base}index.html 200`]).join('\n') + '\n');
  return headers;
}
export async function writeVercelOutput(out, base, headers) {
  // Build Output API consumes the current build's environment, even when the
  // host read vercel.json before running the build command.
  const target = '.vercel/output';
  const paths = await staticPaths(base);
  await mkdir(`${target}/static${base}`, { recursive: true });
  await cp(out, `${target}/static${base}`, { recursive: true });
  const config = { version: 3, routes: [
    { src: '/(.*)', headers, continue: true },
    { src: `${base}(?:assets|images/photos)/(.*)`, headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }, continue: true },
    { src: `${base}(?:|.*\\.html|(?:en|fr|ar)(?:/.*)?)`, headers: { 'Cache-Control': 'no-cache' }, continue: true },
    ...paths.map((path) => ({ src: `${path}/?`, dest: `${path}/index.html` })),
    { handle: 'filesystem' },
    { src: '/(.*)', dest: `${base}index.html` },
  ] };
  await writeFile(`${target}/config.json`, JSON.stringify(config, null, 2) + '\n');
}

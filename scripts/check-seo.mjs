import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { chromium } from '@playwright/test';
import { loadEnv } from 'vite';
import { locales, pagesFor, escape } from './seo-data.mjs';

const root = resolve(process.argv[2] || 'dist');
const base = process.env.VITE_BASE_PATH || '/';
const env = loadEnv('production', process.cwd(), 'VITE_');
const origin = env.VITE_SITE_URL || 'https://your-domain.example';
const headerText = await readFile(`${root}/_headers`, 'utf8');
const headers = Object.fromEntries(headerText.split('\n').slice(1).filter((line) => line.startsWith('  ') && !line.includes('Cache-Control')).map((line) => { const i = line.indexOf(':'); return [line.slice(0, i).trim(), line.slice(i + 1).trim()]; }));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.xml': 'application/xml' };
// Serve actual static files first. Missing routes emulate GitHub Pages' 404
// response; --spa emulates the documented 200 fallback on the other hosts.
const server = createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (!path.startsWith(base)) { res.writeHead(404).end(); return; }
    let file = resolve(root, path.slice(base.length));
    if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    let status = 200;
    try { if ((await stat(file)).isDirectory()) file += '/index.html'; await stat(file); }
    catch { status = process.argv.includes('--spa') ? 200 : 404; file = `${root}/${status === 200 ? 'index' : '404'}.html`; }
    const body = await readFile(file);
    res.writeHead(status, { ...(process.argv.includes('--meta') ? {} : headers), 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': /\/(assets|images\/photos)\//.test(path) ? 'public, max-age=31536000, immutable' : 'no-cache' }).end(body);
  } catch { res.writeHead(500).end(); }
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const local = `http://127.0.0.1:${server.address().port}${base}`;
let browser;
try {
  const sitemap = await readFile(`${root}/sitemap.xml`, 'utf8');
  assert.equal((sitemap.match(/<url>/g) || []).length, 93);
  for (const lang of locales) for (const item of await pagesFor(lang)) {
    const path = `${lang}${item.path ? `/${item.path}` : ''}`;
    const response = await fetch(local + path);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.ok(html.includes(`<title data-prerender>${escape(item.title)}</title>`), path);
    assert.ok(html.includes(`dir="${lang === 'ar' ? 'rtl' : 'ltr'}"`));
    assert.equal((html.match(/hreflang=/g) || []).length, 4);
    assert.ok(html.includes(new URL(`${base}${path}`, origin).href));
    assert.ok(!/<script(?![^>]*\bsrc=)[^>]*>/i.test(html));
  }
  browser = await chromium.launch({ channel: 'chromium' });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error' && !message.text().includes('404 (Not Found)')) errors.push(message.text()); });
  await page.addInitScript(() => { window.__csp = []; document.addEventListener('securitypolicyviolation', (event) => window.__csp.push(`${event.effectiveDirective}: ${event.blockedURI}`)); });
  for (const lang of locales) {
    for (const path of ['', '/tunisia', '/bahrain', '/common-grounds', '/common-grounds/sea', '/vault', '/contact', '/credits', '/missing-route']) {
      const response = await page.goto(local + lang + path);
      await page.locator('h1').waitFor();
      await page.waitForLoadState('networkidle');
      assert.equal(response.status(), path === '/missing-route' && !process.argv.includes('--spa') ? 404 : 200);
      assert.equal(await page.locator('html').getAttribute('dir'), lang === 'ar' ? 'rtl' : 'ltr');
      assert.equal(await page.locator('head > title').count(), 1);
      assert.equal(await page.locator('link[rel=canonical]').count(), 1);
      if (path === '/missing-route') assert.equal(await page.locator('meta[name=robots]').getAttribute('content'), 'noindex');
      assert.deepEqual(await page.evaluate(() => window.__csp), [], lang + path);
    }
  }
  // Client navigation must replace the prerendered head rather than duplicate it.
  await page.goto(local + 'en/contact');
  await page.locator('.footer-links a[href$="/en/tunisia"]').click();
  await page.waitForURL('**/en/tunisia');
  await page.waitForLoadState('networkidle');
  assert.equal(await page.locator('meta[name=description]').count(), 1);
  for (const lang of locales) for (const width of [360, 768, 1280, 1920]) for (const reducedMotion of ['reduce', 'no-preference']) {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion });
    await page.goto(local + lang + '/contact');
    await page.locator('h1').waitFor();
    await page.waitForLoadState('networkidle');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${lang}/${width}/${reducedMotion}`);
    await page.locator(`a[href="${base}sitemap.xml"]`).focus();
    assert.equal(await page.locator(`a[href="${base}sitemap.xml"]`).evaluate((element) => element === document.activeElement), true);
    assert.deepEqual(await page.evaluate(() => window.__csp), []);
  }
  assert.deepEqual(errors, []);
  console.log('93 static heads and 30 browser deep links: metadata, RTL, noindex, 404, client navigation and zero CSP violations passed.');
} finally { await browser?.close(); await new Promise((done) => server.close(done)); }


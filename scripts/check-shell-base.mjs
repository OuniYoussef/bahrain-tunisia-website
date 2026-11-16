import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { chromium } from '@playwright/test';

const base = '/exchange/';
const outDir = 'node_modules/.cache/shell-base';
const env = { ...process.env, VITE_BASE_PATH: base, VITE_SITE_URL: 'https://exchange.example.test',
  VITE_CONTACT_EMAIL: 'team@example.test', VITE_SOCIAL_INSTAGRAM: 'https://instagram.com/example',
  VITE_IEEE_COOKIE_SCRIPT_URL: 'https://consent.example.test/ieee.js' };
const build = spawnSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build', '--outDir', outDir], { env, encoding: 'utf8', windowsHide: true });
assert.equal(build.status, 0, build.stderr);
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4175', '--strictPort', '--outDir', outDir], { env, stdio: 'pipe', windowsHide: true });
let browser;
try {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Preview did not start')), 15_000);
    server.stdout.on('data', (data) => { if (data.toString().includes('4175')) { clearTimeout(timer); resolve(); } });
    server.once('exit', (code) => { clearTimeout(timer); reject(new Error(`Preview exited: ${code}`)); });
  });
  browser = await chromium.launch({ channel: 'chromium' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  let cookieLoads = 0;
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (['error', 'warning'].includes(message.type())) errors.push(message.text()); });
  await page.route('https://consent.example.test/ieee.js', (route) => { cookieLoads++; return route.fulfill({ contentType: 'application/javascript', body: '' }); });
  await page.goto('http://127.0.0.1:4175/exchange/');
  await page.waitForURL('**/exchange/en');
  await page.locator('h1').waitFor();
  await page.locator('.footer-links a[href="/exchange/en/contact"]').click();
  await page.waitForURL('**/exchange/en/contact');
  await page.locator('a[href="mailto:team@example.test"]').waitFor();
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://exchange.example.test/exchange/en/contact');
  await page.locator('.language-switcher summary').click();
  await page.locator('.language-links a[lang="ar"]:visible').click();
  await page.waitForURL('**/exchange/ar/contact');
  await page.waitForLoadState('networkidle');
  assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
  assert.equal(await page.locator('a[href="https://instagram.com/example"]').count(), 2);
  assert.equal(await page.locator('#ieee-cookie-script').count(), 1);
  assert.equal(cookieLoads, 1);
  assert.equal(await page.locator('.master-brand img').getAttribute('src'), '/exchange/brand/ieee-master-brand-black.PLACEHOLDER.svg');
  assert.deepEqual(errors, []);
  console.log('Subpath routing, locale navigation, canonical URLs, brand/photo assets, contact/social configuration and one-time cookie script: passed.');
} finally {
  await browser?.close();
  server.kill();
}

import sharp from 'sharp';
import { chromium } from 'playwright';
import { mkdir, readdir } from 'node:fs/promises';
const source = 'test-results/screens';
const destination = `${source}/review`;
await mkdir(destination, { recursive: true });
const widths = process.argv[2] ? [Number(process.argv[2])] : [360, 768, 1280, 1920];
const browser = await chromium.launch();
for (const width of widths) for (const locale of process.argv[3] ? [process.argv[3]] : ['en', 'fr', 'ar']) {
  const files = (await readdir(source)).filter(name => name.startsWith(`${locale}-`) && name.endsWith(`-${width}.png`)).sort();
  const tiles = [];
  if (!files.length) continue;
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
  await page.goto(`http://127.0.0.1:4173/${locale}/admin`);
  await page.locator('.site-footer').waitFor();
  await page.evaluate('document.fonts.ready');
  const footerHeight = await page.locator('.site-footer').evaluate(el => el.getBoundingClientRect().height);
  await page.close();
  for (const file of files) {
    const original = sharp(`${source}/${file}`);
    const dimensions = await original.metadata();
    // Review the shared footer once per locale/width; all route-specific pixels remain.
    const full = await original.extract({ left: 0, top: 0, width: dimensions.width, height: file === `${locale}-admin-${width}.png` ? dimensions.height : Math.max(1, dimensions.height - Math.floor(footerHeight)) }).resize({ width: 300 }).png().toBuffer();
    const { height } = await sharp(full).metadata();
    // Show every pixel, splitting long documents into readable consecutive strips.
    for (let y = 0; y < height; y += 650) {
      const label = `${file.replace(`${locale}-`, '').replace(`-${width}.png`, '')} · ${y / 650 + 1}`;
      const title = Buffer.from(`<svg width="300" height="28"><rect width="300" height="28" fill="white"/><text x="6" y="19" font-size="12" font-family="sans-serif">${label}</text></svg>`);
      tiles.push(await sharp({ create: { width: 300, height: 680, channels: 3, background: '#e8e8e8' } }).composite([
        { input: title, top: 0, left: 0 },
        { input: await sharp(full).extract({ left: 0, top: y, width: 300, height: Math.min(650, height - y) }).toBuffer(), top: 28, left: 0 },
      ]).png().toBuffer());
    }
  }
  for (let start = 0; start < tiles.length; start += 12) {
    await sharp({ create: { width: 1200, height: 2040, channels: 3, background: '#aaa' } }).composite(
      tiles.slice(start, start + 12).map((input, i) => ({ input, left: i % 4 * 300, top: Math.floor(i / 4) * 680 })),
    ).png().toFile(`${destination}/${locale}-${width}-${String(start / 12 + 1).padStart(2, '0')}.png`);
  }
  console.log(`${locale}-${width}: ${files.length} screenshots, ${Math.ceil(tiles.length / 12)} review sheets`);
}
await browser.close();

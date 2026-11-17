import { mkdir, readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { chromium } from '@playwright/test';
import { locales, pagesFor, readJson, escape } from './seo-data.mjs';

// Chromium rasterizes the SVG overlay so bundled WOFF2 fonts and Arabic shaping
// are identical on Windows and Linux. Sharp crops, composites and encodes JPGs.
const catalog = (await readJson('src/content/generated/images.generated.json')).images;
const ids = ['tn-hero-sidi-bou-said-sea', 'bh-hero-manama-skyline'];
const photos = await Promise.all(ids.map(async (id) => sharp(`public${catalog[id].src}-1280.webp`).resize(600, 630, { fit: 'cover' }).toBuffer()));
const background = await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#0B1B2B' } }).composite(photos.map((input, i) => ({ input, left: i * 600, top: 0 }))).png().toBuffer();
const fonts = await Promise.all(['@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2', '@fontsource-variable/fraunces/files/fraunces-latin-ext-full-normal.woff2', '@fontsource/amiri/files/amiri-arabic-400-normal.woff2'].map(async (path) => (await readFile(`node_modules/${path}`)).toString('base64')));
await mkdir('public/og', { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  for (const lang of locales) for (const item of await pagesFor(lang)) {
    const title = item.page === 'united' ? item.site.name : item.title.split(' | ')[0];
    const lines = [];
    for (const word of title.split(' ')) {
      if (!lines.length || `${lines.at(-1)} ${word}`.length > 29) lines.push(word);
      else lines[lines.length - 1] += ` ${word}`;
    }
    const family = lang === 'ar' ? 'Amiri' : 'Fraunces';
    const css = `@font-face{font-family:Fraunces;src:url(data:font/woff2;base64,${fonts[0]})} @font-face{font-family:Fraunces;src:url(data:font/woff2;base64,${fonts[1]});unicode-range:U+0100-02FF} @font-face{font-family:Amiri;src:url(data:font/woff2;base64,${fonts[2]})}`;
    await page.setContent(`<style>${css}body{margin:0;background:transparent}</style><svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><linearGradient id="shade" x2="0" y2="1"><stop stop-color="#0B1B2B" stop-opacity=".4"/><stop offset="1" stop-color="#0B1B2B" stop-opacity=".96"/></linearGradient></defs><rect width="1200" height="630" fill="url(#shade)"/><path d="M70 100H1130" stroke="#D8B56D" stroke-width="2"/><g fill="#FFF9EC" font-family="${family}" text-anchor="middle" direction="${lang === 'ar' ? 'rtl' : 'ltr'}"><text x="600" y="165" font-size="30">${escape(item.site.name)}</text>${lines.map((line, i) => `<text x="600" y="${280 + i * 72}" font-size="62">${escape(line)}</text>`).join('')}<text x="600" y="558" font-size="27">${escape(item.site.identifierLine1)}</text></g></svg>`);
    await page.evaluate(async () => { await document.fonts.load('62px Fraunces'); await document.fonts.load('62px Amiri'); await document.fonts.ready; });
    const overlay = await page.screenshot({ omitBackground: true });
    await sharp(background).composite([{ input: overlay }]).jpeg({ quality: 88, mozjpeg: true }).toFile(`public/og/${item.page}-${lang}.jpg`);
  }
} finally { await browser.close(); }
await writeFile('public/og/credits.json', JSON.stringify({ adaptations: 'Cropped, darkened and overlaid with localized text. Photo adaptations retain their source licences.', photos: ids.map((id) => ({ id, ...catalog[id].credit })) }, null, 2) + '\n');
console.log('Generated 93 OG images (1200 × 630 JPG) and source credits.');

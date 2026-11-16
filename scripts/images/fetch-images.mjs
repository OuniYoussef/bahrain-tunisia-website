#!/usr/bin/env node
/**
 * Bahrain x Tunisia - image pipeline
 * ----------------------------------
 * Resolves every photo id in src/content/images.manifest.json to a freely licensed photo
 * (Wikimedia Commons / Wikipedia, Openverse as fallback), downloads it, converts it to
 * responsive WebP sizes, and writes credits + a typed manifest the app reads.
 *
 * Usage (from the project root, Node >= 20):
 *   IMAGES_CONTACT="you@example.org" node scripts/images/fetch-images.mjs
 *   ... --only=tn-dest-el-djem,bh-dest-qalat   resolve/convert only these ids
 *   ... --group=tunisia                        only one group (united|tunisia|bahrain|common)
 *   ... --refresh                              ignore selection.lock.json and pick again
 *   ... --force                                re-encode WebP even if outputs exist
 *   ... --dry-run                              resolve and report, no downloads
 *   ... --concurrency=3                        parallel workers (keep it small, be polite)
 *   ... --selftest                             offline test of the whole pipeline (mocked APIs)
 *
 * Outputs:
 *   public/images/photos/<group>/<id>-<width>.webp
 *   src/content/generated/images.generated.json   (widths, size, LQIP, colour, focal, credit)
 *   public/images/photos/CREDITS.md               (human-readable attributions)
 *   scripts/images/selection.lock.json            (chosen file per id -> reproducible; commit it)
 *   scripts/images/report.html                    (contact sheet to review picks; gitignored)
 *
 * Swap a pick: add  "the-id": "File:Exact file name.jpg"  (or {"file": "...", "focal": "50% 30%"})
 * to scripts/images/overrides.json and re-run with --only=the-id.
 * Use your own photo: put it in scripts/images/own/ and add
 *   "the-id": { "local": "own/the-id.jpg", "author": "Name", "license": "CC BY 4.0", "focal": "50% 40%" }
 *
 * Licences accepted: CC0, Public Domain, CC BY, CC BY-SA (any version). Never NC/ND, never fair use.
 * EXIF (including GPS) is stripped by re-encoding.
 */
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
let ROOT = path.resolve(HERE, '../..');
const P = () => ({
  manifest: path.join(ROOT, 'src/content/images.manifest.json'),
  overrides: path.join(ROOT, 'scripts/images/overrides.json'),
  lock: path.join(ROOT, 'scripts/images/selection.lock.json'),
  outDir: path.join(ROOT, 'public/images/photos'),
  generated: path.join(ROOT, 'src/content/generated/images.generated.json'),
  credits: path.join(ROOT, 'public/images/photos/CREDITS.md'),
  report: path.join(ROOT, 'scripts/images/report.html'),
  cache: path.join(ROOT, 'scripts/images/.cache'),
});

// ------------------------------------------------------------------ CLI
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }),
);
const CONCURRENCY = Math.max(1, Math.min(4, Number(args.concurrency ?? 2)));
const CONTACT = process.env.IMAGES_CONTACT || 'contact-not-set';
const UA = `BahrainTunisiaSite/1.0 (IEEE student exchange website; ${CONTACT}) image-pipeline`;

// ------------------------------------------------------------------ constants
const QUALITY = {
  'Category:Featured pictures on Wikimedia Commons': 60,
  'Category:Quality images': 40,
  'Category:Valued images': 25,
};
const QUALITY_SEARCH = 'incategory:"Quality_images|Featured_pictures_on_Wikimedia_Commons|Valued_images"';
const OK_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/tiff']);
const OK_LICENSE = /^(cc0|cc[- ]zero|public domain|pd\b|pd-|no restrictions|cc[- ]by(-sa)?[- ]\d(\.\d)?)/i;
const BAD_LICENSE = /(\bnc\b|non-?commercial|\bnd\b|no-?deriv|fair use|non-free|all rights reserved)/i;
const BAD_TITLE = /\b(map|karte|carte|locator|location[_ ]map|logo|flag[_ ]of|drapeau[_ ]d|coat[_ ]of[_ ]arms|emblem|seal[_ ]of|diagram|schema|plan[_ ]of|stamp|timbre|banknote|billet|poster|affiche|icon|chart|graph|montage|collage|screenshot|cover)\b/i;
const STEPS = [960, 1280, 1920, 3840]; // Wikimedia standard thumbnail widths
const ASPECT = { landscape: [1.15, 2.2, 1.5], portrait: [0.55, 0.95, 0.75], any: [0.55, 2.3, 1.33] };

// ------------------------------------------------------------------ utils
let fetchImpl = (...a) => fetch(...a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(...a);
export const stripHtml = (s = '') =>
  String(s).replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/\s+/g, ' ').trim();
const readJSON = async (p, fallback) => (existsSync(p) ? JSON.parse(await fs.readFile(p, 'utf8')) : fallback);
const writeJSON = async (p, data) => {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(data, null, 2) + '\n');
};
const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

let lastApi = 0;
async function request(url, { json = true, tries = 6 } = {}) {
  for (let attempt = 1; attempt <= tries; attempt++) {
    const wait = Math.max(0, lastApi + 150 - Date.now());
    if (wait) await sleep(wait);
    lastApi = Date.now();
    let res;
    try {
      res = await fetchImpl(String(url), { headers: { 'User-Agent': UA, 'Api-User-Agent': UA, Accept: json ? 'application/json' : '*/*' } });
    } catch (err) {
      if (attempt === tries) throw err;
      await sleep(1000 * attempt);
      continue;
    }
    if (res.status === 429 || res.status >= 500) {
      const ra = Number(res.headers.get('retry-after')) || 2 ** attempt;
      log(`  … ${res.status} from ${new URL(String(url)).host}, retrying in ${ra}s`);
      await sleep(ra * 1000);
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return json ? res.json() : Buffer.from(await res.arrayBuffer());
  }
  throw new Error(`Gave up on ${url}`);
}

function mwApi(host, params) {
  const url = new URL(`https://${host}/w/api.php`);
  for (const [k, v] of Object.entries({ action: 'query', format: 'json', formatversion: '2', ...params })) url.searchParams.set(k, String(v));
  return request(url);
}

const imageProps = (w) => ({
  prop: 'imageinfo|categories',
  iiprop: 'url|size|mime|extmetadata',
  iiurlwidth: w,
  iiextmetadatafilter: 'LicenseShortName|LicenseUrl|Artist|Credit|AttributionRequired|ImageDescription',
  clcategories: Object.keys(QUALITY).join('|'),
  cllimit: 'max',
});

// ------------------------------------------------------------------ candidates
export function toCandidate(page, origin) {
  const ii = page?.imageinfo?.[0];
  if (!ii) return null;
  const m = ii.extmetadata || {};
  const v = (k) => m[k]?.value ?? '';
  const quality = (page.categories || []).reduce((acc, c) => Math.max(acc, QUALITY[c.title] || 0), 0);
  return {
    title: page.title,
    repo: page.imagerepository || 'local',
    rank: Number.isFinite(page.index) ? page.index : 50,
    width: ii.width,
    height: ii.height,
    mime: ii.mime,
    url: ii.url,
    thumburl: ii.thumburl,
    thumbwidth: ii.thumbwidth,
    sourceUrl: ii.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
    license: stripHtml(v('LicenseShortName')),
    licenseUrl: stripHtml(v('LicenseUrl')),
    author: stripHtml(v('Artist')) || stripHtml(v('Credit')) || 'Unknown author',
    attributionRequired: v('AttributionRequired') !== 'false',
    description: stripHtml(v('ImageDescription')).slice(0, 240),
    quality,
    origin,
    lead: false,
  };
}

export function eligible(c, entry, minWidth) {
  if (!c) return false;
  if (!OK_MIME.has(c.mime)) return false;
  if (c.origin === 'wikipedia' && c.repo !== 'shared') return false; // local enwiki files may be non-free
  if (!c.license || !OK_LICENSE.test(c.license) || BAD_LICENSE.test(c.license)) return false;
  if (BAD_TITLE.test(c.title.replace(/[_-]/g, ' '))) return false;
  if (!c.width || c.width < minWidth * 0.7) return false;
  const [lo, hi] = ASPECT[entry.orientation] || ASPECT.any;
  const ar = c.width / c.height;
  return ar >= lo && ar <= hi;
}

export function score(c, entry, minWidth) {
  const target = (ASPECT[entry.orientation] || ASPECT.any)[2];
  const ar = c.width / c.height;
  let s = c.quality;
  if (c.lead) s += 30;
  s += Math.min(25, 6 * Math.log2(c.width / 1000 + 1));
  if (c.width < minWidth) s -= 20;
  s += 15 - Math.min(15, (15 * Math.abs(ar - target)) / target);
  s -= Math.min(30, c.rank * 1.5);
  if (/^File:(IMG|DSC|DSCN|P\d{6,}|_MG)[_ ]?\d+/i.test(c.title)) s -= 4;
  return Math.round(s * 10) / 10;
}

export function pickStep(width, target) {
  const step = STEPS.find((s) => s >= target) ?? STEPS.at(-1);
  return width <= step * 1.15 ? null : step; // null -> use the original file
}

async function commonsSearch(q, limit = 24) {
  const data = await mwApi('commons.wikimedia.org', {
    generator: 'search', gsrsearch: `${q} filetype:bitmap`, gsrnamespace: 6, gsrlimit: limit, ...imageProps(1920),
  });
  if (data.error) throw new Error(data.error.info);
  return (data.query?.pages || []).map((p) => toCandidate(p, 'commons')).filter(Boolean);
}

async function fromCategory(cat) {
  const tries = [`deepcat:"${cat}" ${QUALITY_SEARCH}`, `deepcat:"${cat}"`];
  const all = [];
  for (const q of tries) {
    try {
      all.push(...(await commonsSearch(q, 40)));
    } catch {
      /* deepcat can time out on huge trees */
    }
    if (all.length) break;
  }
  if (!all.length) {
    const data = await mwApi('commons.wikimedia.org', {
      generator: 'categorymembers', gcmtitle: `Category:${cat}`, gcmtype: 'file', gcmlimit: 50, ...imageProps(1920),
    });
    all.push(...(data.query?.pages || []).map((p) => toCandidate(p, 'commons')).filter(Boolean));
  }
  return all;
}

async function fromQuery(q) {
  const boosted = await commonsSearch(`${q} ${QUALITY_SEARCH}`, 16).catch(() => []);
  const plain = await commonsSearch(q, 24).catch(() => []);
  const seen = new Set();
  return [...boosted, ...plain].filter((c) => (seen.has(c.title) ? false : seen.add(c.title)));
}

async function fromWikipedia(lang, title) {
  const host = `${lang}.wikipedia.org`;
  const lead = await mwApi(host, { titles: title, redirects: 1, prop: 'pageimages', piprop: 'name' });
  const leadName = lead.query?.pages?.[0]?.pageimage;
  const data = await mwApi(host, { titles: title, redirects: 1, generator: 'images', gimlimit: 'max', ...imageProps(1920) });
  const cands = (data.query?.pages || []).map((p) => toCandidate(p, 'wikipedia')).filter(Boolean);
  for (const c of cands) {
    if (leadName && c.title.replace(/^File:/, '').replace(/ /g, '_') === leadName.replace(/ /g, '_')) c.lead = true;
    c.rank = c.lead ? 0 : 6;
  }
  return cands;
}

async function fromFile(fileTitle, w = 1920) {
  const t = fileTitle.startsWith('File:') ? fileTitle : `File:${fileTitle}`;
  const data = await mwApi('commons.wikimedia.org', { titles: t, ...imageProps(w) });
  const c = toCandidate(data.query?.pages?.[0], 'commons');
  if (c) c.rank = 0;
  return c ? [c] : [];
}

async function fromOpenverse(q) {
  const url = new URL('https://api.openverse.org/v1/images/');
  url.search = new URLSearchParams({ q, license: 'by,by-sa,cc0,pdm', size: 'large', mature: 'false', page_size: '20' });
  const data = await request(url).catch(() => ({ results: [] }));
  return (data.results || []).map((r, i) => ({
    title: r.title || r.id,
    repo: 'openverse',
    rank: i,
    width: r.width,
    height: r.height,
    mime: /\.png($|\?)/i.test(r.url) ? 'image/png' : 'image/jpeg',
    url: r.url,
    sourceUrl: r.foreign_landing_url,
    license: `${r.license === 'cc0' ? 'CC0' : r.license === 'pdm' ? 'Public domain' : `CC ${String(r.license).toUpperCase()}`} ${r.license_version || ''}`.trim(),
    licenseUrl: r.license_url,
    author: r.creator || 'Unknown author',
    attributionRequired: !['cc0', 'pdm'].includes(r.license),
    description: '',
    quality: 0,
    origin: 'openverse',
    lead: false,
  })).filter((c) => c.width && c.height);
}

async function resolveSource(src) {
  const i = src.indexOf(':');
  const kind = src.slice(0, i);
  const value = src.slice(i + 1).trim();
  if (kind === 'cat') return fromCategory(value);
  if (kind === 'q') return fromQuery(value);
  if (kind === 'wp') return fromWikipedia('en', value);
  if (kind.startsWith('wp-')) return fromWikipedia(kind.slice(3), value);
  if (kind === 'file') return fromFile(value);
  throw new Error(`Unknown source "${src}"`);
}

// ------------------------------------------------------------------ pipeline
async function selectFor(id, entry, ctx) {
  const minWidth = ctx.manifest.minWidth[entry.use] ?? 1000;
  const ov = ctx.overrides[id];
  if (ov && typeof ov === 'object' && ov.local) {
    const file = path.join(ROOT, 'scripts/images', ov.local);
    if (!existsSync(file)) throw new Error(`local override not found: ${ov.local}`);
    return {
      chosen: { title: path.basename(ov.local), origin: 'team', localFile: file, width: 0, height: 0, mime: 'image/jpeg',
        author: ov.author || 'Bahrain × Tunisia team', license: ov.license || 'All rights reserved (used with permission)',
        licenseUrl: ov.licenseUrl || '', sourceUrl: ov.sourceUrl || '', url: '' },
      alternatives: [], via: 'local',
    };
  }
  const pinned = typeof ov === 'string' ? ov : ov?.file;
  if (pinned) {
    const [c] = await fromFile(pinned);
    if (c) return { chosen: c, alternatives: [], via: 'override' };
    log(`  ! override for ${id} not found: ${pinned}`);
  }
  if (!args.refresh && ctx.lock[id]?.title && !['openverse', 'team'].includes(ctx.lock[id].origin)) {
    const [c] = await fromFile(ctx.lock[id].title);
    if (c) return { chosen: c, alternatives: [], via: 'lock' };
  }
  if (!args.refresh && ctx.lock[id]?.origin === 'openverse' && ctx.lock[id].candidate) {
    return { chosen: ctx.lock[id].candidate, alternatives: [], via: 'lock' };
  }
  for (const src of entry.sources) {
    let cands = [];
    try {
      cands = await resolveSource(src);
    } catch (err) {
      log(`  ! ${id}: ${src} failed (${err.message})`);
    }
    const ok = cands
      .filter((c) => eligible(c, entry, minWidth) && !ctx.used.has(c.title))
      .map((c) => ({ ...c, score: score(c, entry, minWidth) }))
      .sort((a, b) => b.score - a.score);
    if (ok.length) {
      ctx.used.add(ok[0].title);
      return { chosen: ok[0], alternatives: ok.slice(1, 5), via: src };
    }
  }
  const text = entry.sources.map((s) => s.slice(s.indexOf(':') + 1)).find(Boolean);
  const ov2 = (await fromOpenverse(text)).filter((c) => eligible(c, entry, minWidth) && !ctx.used.has(c.title))
    .map((c) => ({ ...c, score: score(c, entry, minWidth) })).sort((a, b) => b.score - a.score);
  if (ov2.length) {
    ctx.used.add(ov2[0].title);
    return { chosen: ov2[0], alternatives: ov2.slice(1, 4), via: 'openverse' };
  }
  return null;
}

async function downloadOriginal(id, entry, c, ctx) {
  if (c.localFile) return fs.readFile(c.localFile);
  const target = Math.max(...ctx.manifest.widths[entry.use]);
  let url = c.url;
  if (c.origin !== 'openverse') {
    const step = pickStep(c.width, target);
    if (step) {
      const [withThumb] = await fromFile(c.title, step);
      if (withThumb?.thumburl) url = withThumb.thumburl;
    }
  }
  const ext = (url.match(/\.(jpe?g|png|webp|tiff?)(?:$|\?)/i)?.[1] || 'jpg').toLowerCase();
  const file = path.join(P().cache, `${id}.${ext}`);
  if (existsSync(file) && !args.refresh) return fs.readFile(file);
  const buf = await request(url, { json: false });
  await fs.mkdir(P().cache, { recursive: true });
  await fs.writeFile(file, buf);
  return buf;
}

async function convert(id, entry, buf, ctx) {
  const { default: sharp } = await import('sharp');
  const dir = path.join(P().outDir, entry.group);
  await fs.mkdir(dir, { recursive: true });
  const base = sharp(buf, { failOn: 'none' }).rotate();
  const meta = await base.metadata();
  const srcW = meta.autoOrient?.width ?? meta.width;
  let widths = ctx.manifest.widths[entry.use].filter((w) => w <= srcW);
  if (!widths.length) widths = [srcW];
  const written = [];
  let outW = 0, outH = 0;
  for (const w of widths) {
    const file = path.join(dir, `${id}-${w}.webp`);
    if (!existsSync(file) || args.force) {
      const info = await sharp(buf, { failOn: 'none' }).rotate().resize({ width: w, withoutEnlargement: true })
        .toColorspace('srgb').webp({ quality: entry.use === 'hero' ? 80 : 78, effort: 5, smartSubsample: true }).toFile(file);
      outW = info.width; outH = info.height;
    } else {
      const m = await sharp(file).metadata();
      outW = m.width; outH = m.height;
    }
    written.push(w);
  }
  const lqip = await sharp(buf, { failOn: 'none' }).rotate().resize(24).webp({ quality: 40 }).toBuffer();
  const { dominant } = await sharp(buf, { failOn: 'none' }).stats();
  const hex = '#' + [dominant.r, dominant.g, dominant.b].map((n) => n.toString(16).padStart(2, '0')).join('');
  return { widths: written, width: outW, height: outH, lqip: `data:image/webp;base64,${lqip.toString('base64')}`, color: hex };
}

function creditOf(c) {
  return {
    title: c.title.replace(/^File:/, ''),
    author: c.author.slice(0, 160),
    license: c.license,
    licenseUrl: c.licenseUrl || '',
    sourceUrl: c.sourceUrl,
    origin: c.origin,
  };
}

async function writeCredits(generated) {
  const rows = Object.entries(generated.images).sort(([a], [b]) => a.localeCompare(b)).map(([id, g]) =>
    `| \`${id}\` | [${g.credit.title.replace(/\|/g, '\\|')}](${g.credit.sourceUrl}) | ${g.credit.author.replace(/\|/g, '\\|')} | ${g.credit.licenseUrl ? `[${g.credit.license}](${g.credit.licenseUrl})` : g.credit.license} |`);
  const md = `# Photo credits\n\nGenerated by \`scripts/images/fetch-images.mjs\` on ${generated.generatedAt}. Photos were resized and converted to WebP (that is the only modification).\n\nMap boundaries: Natural Earth (public domain) and (c) OpenStreetMap contributors (ODbL). Flags: country-flag-icons (MIT).\n\n| Image id | Source file | Author | Licence |\n|---|---|---|---|\n${rows.join('\n')}\n`;
  await fs.mkdir(path.dirname(P().credits), { recursive: true });
  await fs.writeFile(P().credits, md);
}

async function writeReport(results, generated) {
  const cards = results.map((r) => {
    const g = generated.images[r.id];
    const thumb = g ? `../../public/images/photos/${g.group}/${r.id}-${g.widths[0]}.webp` : '';
    const alts = (r.alternatives || []).map((a) => `<li><a href="${esc(a.sourceUrl)}" target="_blank">${esc(a.title)}</a> <small>${a.width}×${a.height} · ${esc(a.license)} · score ${a.score}</small></li>`).join('');
    return `<article class="${r.status}"><div class="img">${thumb ? `<img loading="lazy" src="${thumb}" alt="">` : '<span>missing</span>'}</div>
<h3>${esc(r.id)}</h3><p>${r.chosen ? `<a href="${esc(r.chosen.sourceUrl)}" target="_blank">${esc(r.chosen.title)}</a><br><small>${r.chosen.width}×${r.chosen.height} · ${esc(r.chosen.license)} · via ${esc(r.via)}${r.chosen.score != null ? ` · score ${r.chosen.score}` : ''}</small>` : '<b>No eligible image found.</b> Add an override.'}</p>
${alts ? `<details><summary>Alternatives</summary><ul>${alts}</ul></details>` : ''}</article>`;
  }).join('\n');
  const html = `<!doctype html><meta charset="utf-8"><title>Image picks</title><style>body{font:14px system-ui;margin:24px;background:#f6f2ea}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}article{background:#fff;border-radius:12px;padding:10px;box-shadow:0 1px 3px #0002}article.missing{outline:3px solid #c8102e}.img{aspect-ratio:3/2;background:#ddd;border-radius:8px;overflow:hidden;display:grid;place-items:center}img{width:100%;height:100%;object-fit:cover}h3{font-size:13px;margin:8px 0 4px}p{margin:0}small{color:#555}</style>
<h1>Image picks (${results.length})</h1><p>To swap a pick, copy a file name into <code>scripts/images/overrides.json</code> as <code>"id": "File:Name.jpg"</code> and run <code>npm run images:fetch -- --only=id</code>.</p><main>${cards}</main>`;
  await fs.writeFile(P().report, html);
}

async function pool(items, n, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
    }
  }));
  return out;
}

export async function run() {
  const manifest = await readJSON(P().manifest);
  if (!manifest) throw new Error(`Missing ${P().manifest}`);
  const overrides = await readJSON(P().overrides, {});
  const lock = await readJSON(P().lock, {});
  const generated = await readJSON(P().generated, { generatedAt: '', images: {} });
  if (CONTACT === 'contact-not-set' && !args.selftest) log('⚠  Set IMAGES_CONTACT="your email or project URL" (Wikimedia asks every client to identify itself).');

  const only = typeof args.only === 'string' ? new Set(args.only.split(',')) : null;
  const entries = Object.entries(manifest.images).filter(([id, e]) => (!only || only.has(id)) && (!args.group || e.group === args.group));
  const ctx = { manifest, overrides, lock, used: new Set(Object.entries(lock).filter(([id]) => !entries.some(([e]) => e === id)).map(([, l]) => l.title)) };
  log(`Resolving ${entries.length} images with ${CONCURRENCY} worker(s)${args['dry-run'] ? ' (dry run)' : ''}…`);

  const results = await pool(entries, CONCURRENCY, async ([id, entry], i) => {
    const tag = `[${String(i + 1).padStart(3)}/${entries.length}] ${id}`;
    try {
      const sel = await selectFor(id, entry, ctx);
      if (!sel) {
        log(`${tag}  ✗ nothing eligible`);
        return { id, status: 'missing' };
      }
      const { chosen, alternatives, via } = sel;
      ctx.used.add(chosen.title);
      lock[id] = { title: chosen.title, origin: chosen.origin, ...(chosen.origin === 'openverse' ? { candidate: chosen } : {}) };
      if (args['dry-run']) {
        log(`${tag}  → ${chosen.title} (${chosen.width}×${chosen.height}, ${chosen.license}, via ${via})`);
        return { id, status: 'ok', chosen, alternatives, via };
      }
      const buf = await downloadOriginal(id, entry, chosen, ctx);
      const out = await convert(id, entry, buf, ctx);
      const ov = overrides[id];
      generated.images[id] = {
        group: entry.group,
        src: `/images/photos/${entry.group}/${id}`,
        ...out,
        focal: (typeof ov === 'object' && ov?.focal) || generated.images[id]?.focal || '50% 50%',
        credit: creditOf(chosen),
      };
      log(`${tag}  ✓ ${chosen.title} → ${out.widths.join('/')}w (${chosen.license})`);
      return { id, status: 'ok', chosen, alternatives, via };
    } catch (err) {
      log(`${tag}  ✗ ${err.message}`);
      return { id, status: 'missing', error: err.message };
    }
  });

  generated.generatedAt = new Date().toISOString();
  generated.images = Object.fromEntries(Object.entries(generated.images).filter(([id]) => manifest.images[id]).sort(([a], [b]) => a.localeCompare(b)));
  await writeJSON(P().lock, Object.fromEntries(Object.entries(lock).sort(([a], [b]) => a.localeCompare(b))));
  if (!args['dry-run']) {
    await writeJSON(P().generated, generated);
    await writeCredits(generated);
  }
  await writeReport(results, generated);
  const missing = results.filter((r) => r.status !== 'ok').map((r) => r.id);
  log(`\nDone: ${results.length - missing.length} ok, ${missing.length} missing.`);
  if (missing.length) log(`Missing (add overrides or new sources): ${missing.join(', ')}`);
  log(`Review the picks: ${path.relative(ROOT, P().report)}`);
  return { results, missing, generated };
}

// ------------------------------------------------------------------ offline self-test
async function selftest() {
  const assert = (cond, msg) => { if (!cond) throw new Error(`selftest: ${msg}`); };
  const entry = { orientation: 'landscape', use: 'card' };
  const base = { title: 'File:El Djem.jpg', width: 4000, height: 2667, mime: 'image/jpeg', license: 'CC BY-SA 4.0', origin: 'commons', repo: 'local', rank: 0, quality: 0 };
  assert(eligible(base, entry, 1000), 'basic eligible');
  assert(!eligible({ ...base, license: 'CC BY-NC 2.0' }, entry, 1000), 'NC rejected');
  assert(!eligible({ ...base, license: 'Fair use' }, entry, 1000), 'fair use rejected');
  assert(!eligible({ ...base, title: 'File:Tunisia location map.jpg' }, entry, 1000), 'map rejected');
  assert(!eligible({ ...base, title: 'File:Tunis montage 2020.jpg' }, entry, 1000), 'montage rejected');
  assert(!eligible({ ...base, origin: 'wikipedia', repo: 'local' }, entry, 1000), 'local wiki file rejected');
  assert(!eligible({ ...base, width: 600, height: 400 }, entry, 1000), 'too small rejected');
  assert(!eligible({ ...base, width: 1000, height: 2000 }, entry, 1000), 'wrong orientation rejected');
  assert(eligible({ ...base, license: 'Public domain' }, entry, 1000) && eligible({ ...base, license: 'CC0' }, entry, 1000), 'PD/CC0 accepted');
  assert(score({ ...base, quality: 40 }, entry, 1000) > score(base, entry, 1000), 'quality boosts score');
  assert(pickStep(1800, 1440) === null && pickStep(5000, 1440) === 1920 && pickStep(6000, 2560) === 3840, 'pickStep');
  assert(stripHtml('<a href="x">Jane &amp; Co</a>') === 'Jane & Co', 'stripHtml');

  // end-to-end with mocked APIs + generated JPEGs
  const { default: sharp } = await import('sharp');
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'imgtest-'));
  ROOT = tmp;
  await writeJSON(P().manifest, {
    widths: { hero: [640, 1280, 1920, 2560], card: [480, 960, 1440], thumb: [320, 640], wide: [640, 1280, 1920] },
    minWidth: { hero: 1800, card: 1000, thumb: 600, wide: 1400 },
    images: {
      'tn-dest-el-djem': { group: 'tunisia', use: 'card', orientation: 'landscape', sources: ['cat:Amphitheatre of El Jem', 'wp:Amphitheatre of El Jem'] },
      'bh-dest-qalat': { group: 'bahrain', use: 'card', orientation: 'landscape', sources: ['wp:Qal\'at al-Bahrain'] },
      'un-hero-jasmine': { group: 'united', use: 'hero', orientation: 'any', sources: ['q:Jasminum grandiflorum flower'] },
      'tn-nothing': { group: 'tunisia', use: 'card', orientation: 'landscape', sources: ['q:zzzz'] },
      'cg-team': { group: 'common', use: 'card', orientation: 'any', sources: ['q:zzzz'] },
    },
  });
  await fs.mkdir(path.join(tmp, 'scripts/images/own'), { recursive: true });
  await sharp({ create: { width: 2000, height: 1500, channels: 3, background: { r: 30, g: 99, b: 181 } } }).jpeg().toFile(path.join(tmp, 'scripts/images/own/team.jpg'));
  await writeJSON(P().overrides, { 'cg-team': { local: 'own/team.jpg', author: 'Exchange team', license: 'CC BY 4.0', focal: '50% 40%' } });
  const jpeg = await sharp({ create: { width: 3000, height: 2000, channels: 3, background: { r: 190, g: 150, b: 100 } } }).jpeg().toBuffer();
  const page = (title, extra = {}) => ({
    title, index: 1, imagerepository: extra.repo || 'local',
    categories: extra.qi ? [{ ns: 14, title: 'Category:Quality images' }] : [],
    imageinfo: [{ width: extra.w || 3000, height: extra.h || 2000, mime: 'image/jpeg', url: `https://upload.example/${encodeURIComponent(title)}.jpg`, thumburl: `https://upload.example/thumb/${encodeURIComponent(title)}.jpg`, descriptionurl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(title)}`,
      extmetadata: { LicenseShortName: { value: extra.lic || 'CC BY-SA 4.0' }, LicenseUrl: { value: 'https://creativecommons.org/licenses/by-sa/4.0' }, Artist: { value: '<a href="#">Test Author</a>' } } }],
  });
  fetchImpl = async (url) => {
    const u = new URL(url);
    const ok = (body) => ({ ok: true, status: 200, headers: new Map(), json: async () => body, arrayBuffer: async () => jpeg });
    if (u.host === 'upload.example') return ok(null);
    if (u.host === 'api.openverse.org') return ok({ results: [] });
    const sp = u.searchParams;
    if (sp.get('prop') === 'pageimages') return ok({ query: { pages: [{ title: sp.get('titles'), pageimage: 'Qalat_lead.jpg' }] } });
    if (sp.get('generator') === 'images') return ok({ query: { pages: [page('File:Bahrain location map.jpg', { repo: 'shared' }), page('File:Qalat lead.jpg', { repo: 'shared' }), page('File:Other.jpg', { repo: 'shared', w: 5000, h: 3300 })] } });
    const q = sp.get('gsrsearch') || '';
    if (q.includes('zzzz')) return ok({ query: { pages: [] } });
    if (q.includes('El Jem')) return ok({ query: { pages: [page('File:El Jem QI.jpg', { qi: true }), page('File:El Jem NC.jpg', { lic: 'CC BY-NC-SA 2.0', w: 6000, h: 4000 })] } });
    if (q.includes('Jasminum')) return ok({ query: { pages: [page('File:Jasmine.jpg', { w: 4000, h: 4000 })] } });
    if (sp.get('titles')) return ok({ query: { pages: [page(sp.get('titles'))] } });
    return ok({ query: { pages: [] } });
  };
  const { missing, generated } = await run();
  assert(missing.length === 1 && missing[0] === 'tn-nothing', `missing should be tn-nothing, got ${missing}`);
  assert(generated.images['tn-dest-el-djem'].credit.title === 'El Jem QI.jpg', 'QI picked over NC');
  assert(generated.images['bh-dest-qalat'].credit.title === 'Qalat lead.jpg', 'wikipedia lead picked, map skipped');
  assert(generated.images['tn-dest-el-djem'].widths.join() === '480,960,1440', 'card widths');
  assert(generated.images['un-hero-jasmine'].widths.join() === '640,1280,1920,2560', 'hero widths');
  assert(generated.images['bh-dest-qalat'].lqip.startsWith('data:image/webp;base64,'), 'lqip');
  assert(existsSync(path.join(tmp, 'public/images/photos/tunisia/tn-dest-el-djem-960.webp')), 'webp written');
  assert(existsSync(P().credits) && existsSync(P().report) && existsSync(P().lock), 'credits/report/lock written');
  assert(generated.images['cg-team'].credit.author === 'Exchange team' && generated.images['cg-team'].focal === '50% 40%', 'local override');
  const lock = JSON.parse(await fs.readFile(P().lock, 'utf8'));
  assert(lock['tn-dest-el-djem'].title === 'File:El Jem QI.jpg', 'lock written');
  log('\nselftest passed ✔');
  await fs.rm(tmp, { recursive: true, force: true });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  (args.selftest ? selftest() : run()).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

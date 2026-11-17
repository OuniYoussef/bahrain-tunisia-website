import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { loadEnv } from 'vite';
import { locales, pagesFor, escape } from './seo-data.mjs';
import { writeHeaders, writeVercelOutput } from './write-headers.mjs';
const env = loadEnv(process.env.NODE_ENV === 'development' ? 'development' : 'production', process.cwd(), 'VITE_');
const base = `/${(env.VITE_BASE_PATH || '/').replace(/^\/+|\/+$/g, '')}`.replace(/\/?$/, '/');
const origin = env.VITE_SITE_URL || 'https://your-domain.example';
const out = process.argv[2] || 'dist';
const url = (path) => new URL(`${base}${path}`, origin).href;
const route = (lang, path) => `${lang}${path ? `/${path}` : ''}`;
const headers = await writeHeaders(env, out, base);
let template = await readFile(`${out}/index.html`, 'utf8');
if (base !== '/' || process.env.GITHUB_ACTIONS === 'true') {
  const csp = headers['Content-Security-Policy'].replace("; frame-ancestors 'none'", '').replace('; upgrade-insecure-requests', '');
  template = template.replace('<head>', `<head>\n<meta http-equiv="Content-Security-Policy" content="${escape(csp)}">`);
}
for (const [file, rel, type] of [['favicon.ico', 'icon', 'image/x-icon'], ['favicon.svg', 'icon', 'image/svg+xml'], ['apple-touch-icon.png', 'apple-touch-icon', 'image/png']]) {
  try { await access(`public/favicon/${file}`); template = template.replace('</head>', `<link rel="${rel}" type="${type}" href="${base}favicon/${file}"></head>`); } catch { /* Placeholder remains until official assets arrive. */ }
}
const tag = (name, value, property = false) => `<meta data-prerender ${property ? 'property' : 'name'}="${name}" content="${escape(value)}">`;
const alternates = (path, xml = false) => [...locales, 'x-default'].map((lang) => `<${xml ? 'xhtml:link' : 'link data-prerender'} rel="alternate" hreflang="${lang}" href="${escape(url(route(lang === 'x-default' ? 'en' : lang, path)))}"${xml ? ' /' : ''}>`).join('\n');
const entries = [];
for (const lang of locales) for (const page of await pagesFor(lang)) {
  const canonical = url(route(lang, page.path));
  const image = url(`og/${page.page}-${lang}.jpg`);
  await access(`public/og/${page.page}-${lang}.jpg`);
  const meta = [`<title data-prerender>${escape(page.title)}</title>`, tag('description', page.description), `<link data-prerender rel="canonical" href="${escape(canonical)}">`, alternates(page.path), ...Object.entries({ type: 'website', site_name: page.site.name, title: page.title, description: page.description, url: canonical, image, locale: { en: 'en_US', fr: 'fr_FR', ar: 'ar_TN' }[lang] }).map(([key, value]) => tag(`og:${key}`, value, true)), ...Object.entries({ card: 'summary_large_image', title: page.title, description: page.description, image }).map(([key, value]) => tag(`twitter:${key}`, value))].join('\n');
  const dir = `${out}/${route(lang, page.path)}`;
  await mkdir(dir, { recursive: true });
  await writeFile(`${dir}/index.html`, template.replace(/<html[^>]*>/, `<html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">`).replace('</head>', `${meta}\n</head>`));
  entries.push(`<url><loc>${escape(canonical)}</loc>${alternates(page.path, true)}</url>`);
}
await writeFile(`${out}/index.html`, template);
await writeFile(`${out}/404.html`, template.replace('</head>', `${tag('robots', 'noindex')}\n</head>`));
await writeFile(`${out}/sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries.join('\n')}</urlset>\n`);
await writeFile(`${out}/robots.txt`, `User-agent: *\nDisallow: /*/admin\nSitemap: ${url('sitemap.xml')}\n`);
if (process.env.VERCEL === '1') await writeVercelOutput(out, base, headers);
console.log(`Generated ${entries.length} localized pages, sitemap, robots, 404 and host headers.`);

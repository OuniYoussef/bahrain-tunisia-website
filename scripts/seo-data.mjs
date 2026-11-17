import { readFile } from 'node:fs/promises';
export const locales = ['en', 'fr', 'ar'];
export const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
export const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);
export async function pagesFor(lang) {
  const content = Object.fromEntries(await Promise.all(['common', 'united', 'tunisia', 'bahrain', 'matrix', 'vault'].map(async (ns) => [ns, await readJson(`src/content/locales/${lang}/${ns}.json`)])));
  const { site, contact, credits } = content.common;
  const pages = ['united', 'tunisia', 'bahrain', 'common-grounds', 'vault'].map((page) => ({ page, path: page === 'united' ? '' : page, ...content[page === 'common-grounds' ? 'matrix' : page].meta }));
  for (const [page, item] of Object.entries({ contact, credits })) pages.push({ page, path: page, title: item.metaTitle, description: item.metaDescription });
  for (const slide of content.matrix.slides) pages.push({ page: `common-grounds-${slide.id}`, path: `common-grounds/${slide.id}`, title: slide.title, description: slide.text });
  return pages.map((item) => ({ ...item, lang, site, title: item.page === 'united' ? site.defaultTitle : site.titleTemplate.replace('{page}', item.title) }));
}

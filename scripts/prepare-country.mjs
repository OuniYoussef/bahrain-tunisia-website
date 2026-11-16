import { mkdir, readFile, writeFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const { images } = JSON.parse(await readFile(new URL('src/content/generated/images.generated.json', root)));
const { tunisia, bahrain } = JSON.parse(await readFile(new URL('src/content/media.json', root)));
await writeFile(new URL('src/content/generated/country-media.generated.json', root), JSON.stringify({ tunisia: {welcome:tunisia.welcome,destinations:tunisia.destinations}, bahrain: {welcome:bahrain.welcome,destinations:bahrain.destinations} }, null, 2) + '\n');
const rejected = JSON.parse(await readFile(new URL('src/content/image-review.json', root)));
for (const [name, content] of [['hero', tunisia.welcome], ['destinations', tunisia.destinations]]) {
  const ids = new Set(JSON.stringify(content).match(/tn-[a-z-]+/g));
  const catalog = Object.fromEntries(Object.entries(images).filter(([id]) => ids.has(id) && !Object.hasOwn(rejected, id)));
  await writeFile(new URL(`src/content/generated/tunisia-${name}.generated.json`, root), JSON.stringify(catalog, null, 2) + '\n');
}
await mkdir(new URL('src/content/generated/country/', root), { recursive: true });
for (const locale of ['en', 'fr', 'ar']) {
  for (const country of ['tunisia', 'bahrain']) {
    const source = JSON.parse(await readFile(new URL(`src/content/locales/${locale}/${country}.json`, root)));
    const overview = Object.fromEntries(Object.entries(source).map(([key, value]) => [key,
      ['meta', 'sectionNav', 'welcome', 'destinations'].includes(key) ? value : { title: value.title },
    ]));
    await writeFile(new URL(`src/content/generated/country/${locale}-${country}.json`, root), JSON.stringify(overview, null, 2) + '\n');
  }
}

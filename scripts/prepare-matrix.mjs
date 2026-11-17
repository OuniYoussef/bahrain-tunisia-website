import { readFile, mkdir, writeFile } from 'node:fs/promises';
const read = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
const [media, generated] = await Promise.all([read('../src/content/media.json'), read('../src/content/generated/images.generated.json')]);
const output = new URL('../src/content/generated/matrix/', import.meta.url);
const rejected = await read('../src/content/image-review.json');
await mkdir(output, { recursive: true });
await writeFile(new URL('../matrix-media.generated.json', output), JSON.stringify(media.matrix.slides) + '\n');
const groups = Object.fromEntries(Object.entries(media.matrix.slides).map(([id, slide]) => [id, [...slide.media.tunisia, ...slide.media.bahrain, ...slide.media.shared]]));
groups.intro = ['welcome', 'sea', 'dates-sweets'].flatMap((id) => [media.matrix.slides[id].media.tunisia[0], media.matrix.slides[id].media.bahrain[0]]);
groups.index = Object.values(media.matrix.slides).map((slide) => slide.media.tunisia[0]);
// Keep stable navigation ids while deferring unrelated prose, index titles and image labels.
for (const lang of ['en', 'fr', 'ar']) {
  const [matrix, labels] = await Promise.all([read(`../src/content/locales/${lang}/matrix.json`), read(`../src/content/locales/${lang}/images.json`)]);
  const directory = new URL(`../matrix-views/${lang}/`, output);
  await mkdir(directory, { recursive: true });
  for (const selected of ['intro', ...matrix.slides.map((slide) => slide.id)]) {
    const index = matrix.slides.findIndex((slide) => slide.id === selected);
    const ids = selected === 'intro' ? groups.intro : matrix.slides.filter((_, i) => Math.abs(i - index) <= 1).flatMap((slide) => groups[slide.id]);
    const payload = { matrix: { ...matrix, slides: matrix.slides.map((slide) => slide.id === selected ? slide : { id: slide.id, kicker: slide.kicker, title: '', text: '', captions: { tunisia: '', bahrain: '' } }) }, images: Object.fromEntries(ids.map((id) => [id, labels[id]])) };
    payload.preloads = selected === 'intro' ? [] : [...new Set(matrix.slides.filter((_, i) => Math.abs(i - index) === 1).flatMap((slide) => groups[slide.id]))].filter((id) => generated.images[id] && !Object.hasOwn(rejected, id)).map((id) => ({ src: generated.images[id].src, widths: generated.images[id].widths }));
    await writeFile(new URL(`${selected}.json`, directory), JSON.stringify(payload) + '\n');
  }
}
await Promise.all(Object.entries(groups).map(([id, ids]) => writeFile(new URL(`${id}.json`, output), JSON.stringify(Object.fromEntries([...new Set(ids)].filter((id) => generated.images[id]).map((id) => [id, generated.images[id]]))) + '\n')));

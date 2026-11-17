import { readFile, writeFile } from 'node:fs/promises';
const root = new URL('../src/content/generated/', import.meta.url);
const generated = JSON.parse(await readFile(new URL('images.generated.json', root), 'utf8'));
const ids = new Set(['tn-sbs-blue-door', 'bh-craft-rawazin']);
const catalog = Object.fromEntries(Object.entries(generated.images).filter(([id]) => ids.has(id)));
await writeFile(new URL('contact.generated.json', root), JSON.stringify(catalog, null, 2) + '\n');

import { readFile, writeFile } from 'node:fs/promises';
const source = new URL('../src/content/media.json', import.meta.url);
const { united } = JSON.parse(await readFile(source, 'utf8'));
await writeFile(new URL('../src/content/generated/united-media.generated.json', import.meta.url), JSON.stringify(united) + '\n');

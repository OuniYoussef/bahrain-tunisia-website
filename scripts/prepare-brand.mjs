import { readdir, writeFile } from 'node:fs/promises';

const files = (await readdir('public/brand', { recursive: true }))
  .filter((file) => file.endsWith('.svg'))
  .map((file) => file.replaceAll('\\', '/'))
  .sort();
await writeFile('src/content/generated/brand.json', JSON.stringify(files, null, 2) + '\n');

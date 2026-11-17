import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const generated=JSON.parse(await readFile(new URL('src/content/generated/images.generated.json',root)));
const media=JSON.parse(await readFile(new URL('src/content/media.json',root))).vault;
const samples=await readFile(new URL('src/features/vault/api/samples.ts',root),'utf8');
const ids=new Set([...Object.values(media.hero),...Array.from(samples.matchAll(/sample_image_id: '([^']+)'/g),m=>m[1])]);
const catalog=Object.fromEntries(Object.entries(generated.images).filter(([id])=>ids.has(id)));
await writeFile(new URL('src/content/generated/vault.generated.json',root),JSON.stringify(catalog,null,2)+'\n');

import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const generated=JSON.parse(await readFile(new URL('src/content/generated/images.generated.json',root)));
const media=JSON.parse(await readFile(new URL('src/content/media.json',root))).vault;
const stories=JSON.parse(await readFile(new URL('src/content/vault/stories.json',root),'utf8'));
const ids=new Set([...Object.values(media.hero),...stories.flatMap(story=>story.image_ids)]);
const catalog=Object.fromEntries(Object.entries(generated.images).filter(([id])=>ids.has(id)));
await writeFile(new URL('src/content/generated/vault.generated.json',root),JSON.stringify(catalog,null,2)+'\n');

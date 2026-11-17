import type { ImageCatalog } from '@/components/media/ImageCatalog';
const loaders = import.meta.glob<{ default: ImageCatalog }>('/src/content/generated/matrix/*.json');
const cache = new Map<string, Promise<ImageCatalog>>();
const loaded: ImageCatalog = {};
export function loadMatrixCatalog(ids: string[]) {
  const key = ids.join(',');
  let result = cache.get(key);
  if (!result) {
    result = Promise.all(ids.map((id) => loaders[`/src/content/generated/matrix/${id}.json`]!())).then(
      (modules) => {
        for (const module of modules) Object.assign(loaded, module.default);
        return { ...loaded };
      },
    );
    cache.set(key, result);
  }
  return result;
}

import type { Content, Locale } from '@/i18n/content';
export type PreloadImage = { src: string; widths: number[] };
type View = Pick<Content, 'matrix' | 'images'> & { preloads: PreloadImage[] };
const loaders = import.meta.glob<{ default: View }>('/src/content/generated/matrix-views/*/*.json');
const cache = new Map<string, Promise<View>>();
export function loadMatrixView(locale: Locale, id: string) {
  const key = `/src/content/generated/matrix-views/${locale}/${id}.json`;
  let promise = cache.get(key);
  if (!promise) {
    const loader = loaders[key] ?? loaders[`/src/content/generated/matrix-views/${locale}/intro.json`]!;
    promise = loader().then((module) => module.default);
    cache.set(key, promise);
  }
  return promise;
}

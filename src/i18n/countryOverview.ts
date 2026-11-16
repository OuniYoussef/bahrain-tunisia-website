import type { Content } from '@/content/types';
import type { Locale } from './config';
export type CountryNamespace = 'tunisia' | 'bahrain';
type CompleteKeys = 'meta' | 'sectionNav' | 'welcome' | 'destinations';
/** Only titles are rendered for the later country sections at this stage. */
export type CountryOverview<N extends CountryNamespace> = Pick<Content[N], CompleteKeys> & {
  [K in Exclude<keyof Content[N], CompleteKeys>]: { title: string };
};
const loaders = import.meta.glob<{ default: CountryOverview<CountryNamespace> }>(
  '/src/content/generated/country/*.json',
);
const cache = new Map<string, Promise<CountryOverview<CountryNamespace>>>();
export function loadCountryOverview<N extends CountryNamespace>(
  locale: Locale,
  country: N,
): Promise<CountryOverview<N>> {
  const path = `/src/content/generated/country/${locale}-${country}.json`;
  let promise = cache.get(path);
  if (!promise) {
    const loader = loaders[path];
    if (!loader) throw new Error(`Unknown country overview: ${path}`);
    promise = loader().then((module) => module.default);
    cache.set(path, promise);
  }
  return promise as Promise<CountryOverview<N>>;
}

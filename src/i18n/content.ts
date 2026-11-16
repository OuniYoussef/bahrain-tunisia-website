import { createContext, use } from 'react';
import type { Content } from '@/content/types';
import type { Locale } from './config';
import { loadCountryOverview, type CountryNamespace, type CountryOverview } from './countryOverview';
export type { Content } from '@/content/types';
export type { Locale } from './config';

export type ContentContextValue = { locale: Locale; content: Partial<Content> };
const loaders = import.meta.glob<{ default: Content[keyof Content] }>('/src/content/locales/*/*.json');
const cache = new Map<string, Promise<Content[keyof Content]>>();
export function loadNamespace<N extends keyof Content>(locale: Locale, namespace: N): Promise<Content[N]> {
  const key = `/src/content/locales/${locale}/${namespace}.json`;
  let promise = cache.get(key);
  if (!promise) {
    const loader = loaders[key];
    if (!loader) throw new Error(`Unknown content namespace: ${key}`);
    promise = loader().then((module) => module.default);
    cache.set(key, promise);
  }
  return promise as Promise<Content[N]>;
}
export const ContentContext = createContext<ContentContextValue | null>(null);
export function useLocale() {
  const context = use(ContentContext);
  if (!context) throw new Error('ContentProvider is required');
  return context.locale;
}
export function useContent<N extends keyof Content>(
  namespace: N,
  view: 'overview',
): N extends CountryNamespace ? CountryOverview<N> : never;
export function useContent<N extends keyof Content>(namespace: N): Content[N];
export function useContent<N extends keyof Content>(
  namespace: N,
  view?: 'overview',
): Content[N] | CountryOverview<CountryNamespace> {
  const context = use(ContentContext);
  if (!context) throw new Error('LocaleProvider is required');
  if (view === 'overview' && (namespace === 'tunisia' || namespace === 'bahrain'))
    return context.content[namespace] ?? use(loadCountryOverview(context.locale, namespace));
  return context.content[namespace] ?? use(loadNamespace(context.locale, namespace));
}

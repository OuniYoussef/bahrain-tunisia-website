import { createContext, use } from 'react';
import type common from '@/content/locales/en/common.json';
import type tunisia from '@/content/locales/en/tunisia.json';
import type images from '@/content/locales/en/images.json';

export type Locale = 'en' | 'fr' | 'ar';
export type Content = { common: typeof common; tunisia: typeof tunisia; images: typeof images };
export type ContentContextValue = { locale: Locale; content: Partial<Content> };
export const ContentContext = createContext<ContentContextValue | null>(null);
export function useLocale() {
  const context = use(ContentContext);
  if (!context) throw new Error('ContentProvider is required');
  return context.locale;
}
export function useContent<N extends keyof Content>(namespace: N): Content[N] {
  const context = use(ContentContext);
  const content = context?.content[namespace];
  if (!content) throw new Error(`Content namespace is not loaded: ${namespace}`);
  return content;
}

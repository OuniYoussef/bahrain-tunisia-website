import type { Content, Locale } from '@/i18n/content';

const loaders = {
  en: () =>
    Promise.all([
      import('@/content/locales/en/common.json'),
      import('@/content/locales/en/tunisia.json'),
      import('@/content/locales/en/images.json'),
    ]),
  fr: () =>
    Promise.all([
      import('@/content/locales/fr/common.json'),
      import('@/content/locales/fr/tunisia.json'),
      import('@/content/locales/fr/images.json'),
    ]),
  ar: () =>
    Promise.all([
      import('@/content/locales/ar/common.json'),
      import('@/content/locales/ar/tunisia.json'),
      import('@/content/locales/ar/images.json'),
    ]),
};
export async function loadSpecimens(): Promise<
  Record<Locale, Pick<Content, 'common' | 'tunisia' | 'images'>>
> {
  const entries = await Promise.all(
    (['en', 'fr', 'ar'] as const).map(async (locale) => {
      const [common, tunisia, images] = await loaders[locale]();
      return [locale, { common: common.default, tunisia: tunisia.default, images: images.default }] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<Locale, Pick<Content, 'common' | 'tunisia' | 'images'>>;
}

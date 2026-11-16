export const LOCALES = ['en', 'fr', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_STORAGE_KEY = 'bt.locale';
export const intlTags = { en: 'en', fr: 'fr', ar: 'ar-u-nu-latn' } as const;
export const localeNames = { en: 'English', fr: 'Français', ar: 'العربية' } as const;
export const dir = (locale: Locale) => (locale === 'ar' ? 'rtl' : 'ltr');
export const isLocale = (value: unknown): value is Locale => LOCALES.some((locale) => locale === value);
export function savedLocale(): Locale {
  try {
    const value = localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(value) ? value : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}
export function localizePath(pathname: string, locale: Locale) {
  const parts = pathname.split('/');
  parts[1] = locale;
  return parts.join('/') || `/${locale}`;
}

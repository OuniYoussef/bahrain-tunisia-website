import { useLayoutEffect, type ReactNode } from 'react';
import { useParams } from 'react-router';
import { ContentProvider } from './ContentProvider';
import { DEFAULT_LOCALE, dir, isLocale, LOCALE_STORAGE_KEY } from './config';

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { lang } = useParams();
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  useLayoutEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir(locale);
    if (isLocale(lang)) {
      try {
        localStorage.setItem(LOCALE_STORAGE_KEY, locale);
      } catch {
        /* Storage can be disabled. */
      }
    }
  }, [locale, lang]);
  return (
    <ContentProvider locale={locale} content={{}}>
      {children}
    </ContentProvider>
  );
}

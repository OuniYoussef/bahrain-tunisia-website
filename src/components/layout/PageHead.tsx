import { useLocation } from 'react-router';
import { useContent, useLocale } from '@/i18n/content';
import { LOCALES, localizePath } from '@/i18n/config';
import { t } from '@/i18n/format';
import { env } from '@/lib/env';
export function PageHead({
  title,
  description,
  page = 'united',
  noindex = false,
}: {
  title?: string;
  description?: string;
  page?: string;
  noindex?: boolean;
}) {
  const { site } = useContent('common');
  const locale = useLocale();
  const { pathname } = useLocation();
  const fullTitle = title ? t(site.titleTemplate, { page: title }) : site.defaultTitle;
  const text = description ?? site.defaultDescription;
  const origin = env.VITE_SITE_URL ?? window.location.origin;
  const url = (path: string) => new URL(`${env.basePath.replace(/\/$/, '')}${path}`, origin).href;
  const canonical = url(pathname);
  const image = new URL(`${env.basePath}og/${page}-${locale}.jpg`, origin).href;
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={text} />
      <link rel="canonical" href={canonical} />
      {LOCALES.map((lang) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url(localizePath(pathname, lang))} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={url(localizePath(pathname, 'en'))} />
      <meta name="theme-color" content="#0B1B2B" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={site.name} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={text} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content={{ en: 'en_US', fr: 'fr_FR', ar: 'ar_TN' }[locale]} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={text} />
      <meta name="twitter:image" content={image} />
      {noindex && <meta name="robots" content="noindex" />}
    </>
  );
}

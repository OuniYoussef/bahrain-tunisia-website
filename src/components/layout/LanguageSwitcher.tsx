import { Link, useLocation } from 'react-router';
import { useContent, useLocale } from '@/i18n/content';
import { LOCALES, localeNames, localizePath } from '@/i18n/config';
export function LanguageSwitcher({ full = false, onNavigate }: { full?: boolean; onNavigate?: () => void }) {
  const { a11y } = useContent('common');
  const locale = useLocale();
  const location = useLocation();
  const links = (
    <nav aria-label={a11y.languageSwitcher} className="language-links">
      {LOCALES.map((lang) => (
        <Link
          key={lang}
          lang={lang}
          hrefLang={lang}
          aria-current={locale === lang ? 'true' : undefined}
          to={`${localizePath(location.pathname, lang)}${location.search}${location.hash}`}
          onClick={(event) => {
            event.currentTarget.closest('details')?.removeAttribute('open');
            onNavigate?.();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              const details = event.currentTarget.closest('details');
              details?.removeAttribute('open');
              details?.querySelector('summary')?.focus();
            }
          }}
        >
          {localeNames[lang]}
        </Link>
      ))}
    </nav>
  );
  return full ? (
    links
  ) : (
    <details className="language-switcher">
      <summary>
        <span className="sr-only">{a11y.languageSwitcher}: </span>
        <span lang="en" dir="ltr">
          EN · FR · <span lang="ar">ع</span>
        </span>
      </summary>
      <div className="language-popover">{links}</div>
    </details>
  );
}

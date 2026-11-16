import { Link } from 'react-router';
import { useContent, useLocale } from '@/i18n/content';
import { brandExists, brandUrl } from './brand';
export function SiteIdentifier() {
  const { site } = useContent('common');
  const locale = useLocale();
  return (
    <div className="site-identifier">
      <Link to={`/${locale}`}>
        {brandExists('site-identifier.svg') ? (
          <img
            src={brandUrl('site-identifier.svg')}
            width="200"
            height="52"
            alt={`${site.identifierLine1} ${site.identifierLine2}`}
          />
        ) : (
          <>
            <span className="identifier-ieee" lang="en">
              {site.identifierLine1}
            </span>
            <span>{site.identifierLine2}</span>
          </>
        )}
      </Link>
      <p className="sr-only">{site.purpose}</p>
    </div>
  );
}

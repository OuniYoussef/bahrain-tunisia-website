import { Link } from 'react-router';
import { useContent, useLocale } from '@/i18n/content';
import { ResponsiveImage } from '@/components/media/ResponsiveImage';
import { media } from '../media';

export function Teasers() {
  const { teasers } = useContent('united');
  const locale = useLocale();
  return (
    <div className="united-teasers ui-container">
      {(['commonGrounds', 'vault'] as const).map((key) => (
        <section
          key={key}
          className={`united-teaser teaser-${key} ${key === 'vault' ? 'tone-sand' : 'tone-ink'}`}
          aria-labelledby={`teaser-${key}`}
        >
          <div className="teaser-photo">
            <ResponsiveImage
              id={media('united.teasers', key).image}
              alt=""
              sizes="(min-width: 1440px) 640px, (min-width: 768px) 45vw, 90vw"
            />
          </div>
          <div className="teaser-copy">
            <p className="text-small">{teasers[key].eyebrow}</p>
            <h2 id={`teaser-${key}`} className="text-h2">
              {teasers[key].title}
            </h2>
            <p>{teasers[key].text}</p>
            <Link
              className="ui-button ui-button-primary"
              to={`/${locale}/${key === 'vault' ? 'vault' : 'common-grounds'}`}
            >
              {teasers[key].cta}
            </Link>
          </div>
        </section>
      ))}
    </div>
  );
}

import { ResponsiveImage } from '@/components/media/ResponsiveImage';
import { useLocale, type Content } from '@/i18n/content';
import { formatNumber } from '@/i18n/format';
import { media } from '../detail-media';

export function PearlHeritage({ content }: { content: Content['bahrain']['history']['pearl'] }) {
  const locale = useLocale();
  const image = media('bahrain.history.pearl').image;
  return (
    <section className="pearl-museum tone-ink" aria-labelledby="pearl-title">
      <div className="pearl-museum-intro">
        <div>
          <h3 className="text-h2" id="pearl-title">
            {content.title}
          </h3>
          <p className="text-body-lg">{content.intro}</p>
        </div>
        {image && <ResponsiveImage id={image} sizes="(min-width: 1024px) 40vw, 85vw" />}
      </div>
      <div className="pearl-labels">
        {content.groups.map((group, index) => (
          <article key={group.id} data-pearl-label={group.id}>
            <span className="pearl-number" aria-hidden="true">
              {formatNumber(index + 1, locale, { minimumIntegerDigits: 2 })}
            </span>
            <h4 className="text-h3">{group.title}</h4>
            <p>{group.text}</p>
            {group.id === 'types' && (
              <figure className="pearl-scale">
                <ol>
                  {content.scale.map((name, step) => (
                    <li key={name}>
                      <span
                        aria-hidden="true"
                        style={{ inlineSize: `${52 - step * 12}px`, blockSize: `${52 - step * 12}px` }}
                      />
                      <span>{name}</span>
                    </li>
                  ))}
                </ol>
                <figcaption>{content.scaleNote}</figcaption>
              </figure>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

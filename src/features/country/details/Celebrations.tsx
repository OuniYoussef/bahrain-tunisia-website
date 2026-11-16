import { Badge } from '@/components/ui/Badge';
import { Ornament } from '@/components/media/Ornament';
import type { CountryContent } from '../types';
import type { Country } from '../country.config';
import { media } from '../detail-media';
import { CardImage, InfoCard } from './InfoCard';

export function Celebrations({ country, content }: { country: Country; content: CountryContent['festive'] }) {
  return (
    <>
      {content.groups.map((group) => (
        <section className="celebration-group" key={group.id} aria-labelledby={`festive-${group.id}-title`}>
          <div className="celebration-heading">
            <h3 id={`festive-${group.id}-title`} className="text-h3">
              {group.title}
            </h3>
            {group.note && <Badge>{group.note}</Badge>}
          </div>
          <div
            className={group.id === 'national' ? 'holiday-calendar' : 'detail-card-grid'}
            data-festive-group={group.id}
          >
            {group.items.map((item) => {
              const picture = media(`${country}.festive.groups.${group.id}.items`, item.id);
              return group.id === 'national' ? (
                <article key={item.id} data-item-id={item.id} className="holiday">
                  {item.date && <p className="holiday-date">{item.date}</p>}
                  <h4 className="text-h4">{item.title}</h4>
                  {item.text && <p>{item.text}</p>}
                  {picture.image && <CardImage country={country} media={picture} />}
                </article>
              ) : item.id === 'gargeean-chant' ? (
                <article key={item.id} data-item-id={item.id} className="gargeean-quote">
                  <Ornament kind="razji" />
                  <h4 className="text-h4">{item.title}</h4>
                  <blockquote>{item.text}</blockquote>
                </article>
              ) : (
                <InfoCard
                  key={item.id}
                  id={`festive-${group.id}-${item.id}`}
                  item={item}
                  country={country}
                  media={picture}
                />
              );
            })}
          </div>
        </section>
      ))}
      <article className="wedding-feature">
        <CardImage
          country={country}
          media={media(`${country}.festive.weddings`)}
          sizes="(min-width: 768px) 44vw, 90vw"
        />
        <div>
          <h3 className="text-h2">{content.weddings.title}</h3>
          {content.weddings.text && <p>{content.weddings.text}</p>}
        </div>
      </article>
    </>
  );
}

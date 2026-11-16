import { MapPin, Users, Sun } from 'lucide-react';
import { ResponsiveImage } from '@/components/media/ResponsiveImage';
import type { Content } from '@/i18n/content';
import { CountrySectionHeader } from '../CountrySectionHeader';
import { media } from '../media';
const icons = { where: MapPin, about: Users, climate: Sun };
export function Spotlight({ content }: { content: Content['tunisia']['destinations']['spotlight'] }) {
  return (
    <section className="country-spotlight tone-ink" aria-labelledby="spotlight-title">
      <div className="ui-container">
        <CountrySectionHeader id="spotlight-title" eyebrow={content.eyebrow} title={content.title} />
        <div className="spotlight-layout">
          <div className="spotlight-facts">
            {content.facts.map((fact) => {
              const Icon = icons[fact.id as keyof typeof icons] ?? MapPin;
              return (
                <article key={fact.id}>
                  <Icon aria-hidden="true" size={28} />
                  <h3 className="text-h4">{fact.title}</h3>
                  <p>{fact.text}</p>
                </article>
              );
            })}
          </div>
          <section aria-labelledby="spotlight-places-title">
            <h3 id="spotlight-places-title" className="text-h3">
              {content.placesTitle}
            </h3>
            <div className="spotlight-grid">
              {content.places.map((place) => (
                <article key={place.id} data-place={place.id}>
                  <ResponsiveImage
                    id={media('tunisia.destinations.spotlight.places', place.id).image}
                    alt=""
                    sizes="(min-width: 1024px) 28vw, (min-width: 640px) 45vw, 90vw"
                  />
                  <div>
                    <h4 className="text-h4">{place.title}</h4>
                    <p>{place.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

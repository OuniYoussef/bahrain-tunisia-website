import type { CountryContent } from '../types';
import type { Country } from '../country.config';
import { media } from '../detail-media';
import { InfoCard } from './InfoCard';

export function Nature({ country, content }: { country: Country; content: CountryContent['nature'] }) {
  return content.groups.map((group) => (
    <div key={group.id} className={`nature-group nature-${group.id}`}>
      {group.title && (
        <h3 id={`nature-${group.id}-title`} className="text-h3">
          {group.title}
        </h3>
      )}
      {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Keyboard users need to scroll this native snap region. */}
      <section className="nature-row" tabIndex={0} aria-label={group.title || content.title}>
        {group.items.map((item) => (
          <InfoCard
            key={item.id}
            id={`nature-${group.id}-${item.id}`}
            item={item}
            country={country}
            media={media(`${country}.nature.groups.${group.id}.items`, item.id)}
          />
        ))}
      </section>
    </div>
  ));
}

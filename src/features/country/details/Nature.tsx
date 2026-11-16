import type { CountryContent } from '../types';
import type { Country } from '../country.config';
import { media } from '../detail-media';
import { InfoCard } from './InfoCard';

export function Nature({ country, content }: { country: Country; content: CountryContent['nature'] }) {
  if (country === 'bahrain') {
    const group = content.groups[0]!;
    const card = (item: (typeof group.items)[number]) => (
      <InfoCard
        key={item.id}
        id={`nature-${group.id}-${item.id}`}
        item={item}
        country={country}
        media={media(`${country}.nature.groups.${group.id}.items`, item.id)}
        headingLevel={3}
        sizes={item.id === 'tree-of-life' ? '(min-width: 1024px) 60vw, 90vw' : undefined}
      />
    );
    return (
      <div className={`nature-group nature-${group.id} nature-masonry`}>
        <div className="nature-lead">{group.items.slice(0, 2).map(card)}</div>
        <div className="nature-columns">{group.items.slice(2).map(card)}</div>
      </div>
    );
  }
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

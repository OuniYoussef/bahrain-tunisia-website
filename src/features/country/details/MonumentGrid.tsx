import { useState } from 'react';
import { useContent } from '@/i18n/content';
import type { CountryContent } from '../types';
import type { Country } from '../country.config';
import { media } from '../detail-media';
import { InfoCard } from './InfoCard';

export function MonumentGrid({
  country,
  content,
}: {
  country: Country;
  content: CountryContent['monuments'];
}) {
  const [unescoOnly, setUnescoOnly] = useState(false);
  const { ui } = useContent('common');
  const items = content.items
    .map((item) => ({ item, media: media(`${country}.monuments.items`, item.id) }))
    .filter((entry) => !unescoOnly || entry.media.unesco);
  return (
    <>
      <label className="monument-filter">
        <input
          type="checkbox"
          name="unescoOnly"
          checked={unescoOnly}
          onChange={(event) => setUnescoOnly(event.target.checked)}
        />
        {ui.unescoOnly}
      </label>
      <output className="sr-only" aria-live="polite">
        {items.length} / {content.items.length} {content.title}
      </output>
      <div className="detail-card-grid monument-grid">
        {items.map((entry) => (
          <InfoCard
            key={entry.item.id}
            id={`monument-${entry.item.id}`}
            item={entry.item}
            country={country}
            media={entry.media}
            headingLevel={3}
          />
        ))}
      </div>
    </>
  );
}

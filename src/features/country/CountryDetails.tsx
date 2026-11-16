import { use, useRef } from 'react';
import { useContent } from '@/i18n/content';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ImageCatalogContext, type ImageCatalog } from '@/components/media/ImageCatalog';
import type { Country } from './country.config';
import { Wear } from './details/Wear';
import { Nature } from './details/Nature';
import { Cities } from './details/Cities';
import { History } from './details/History';
import { Celebrations } from './details/Celebrations';
import { Food } from './details/Food';
import { MonumentGrid } from './details/MonumentGrid';
import { PlaceMapProvider } from './details/PlaceMap';
import { useDetailLayout } from './details/useDetailLayout';
import './details.css';
import './bahrain-details.css';

const catalogs: Partial<Record<Country, Promise<ImageCatalog>>> = {};
function loadCatalog(country: Country) {
  catalogs[country] ??= (
    country === 'tunisia'
      ? import('@/content/generated/tunisia-details.generated.json')
      : import('@/content/generated/bahrain-details.generated.json')
  ).then((module) => module.default);
  return catalogs[country];
}

export default function CountryDetails({ country }: { country: Country }) {
  const content = useContent(country);
  const catalog = use(loadCatalog(country));
  const root = useRef<HTMLDivElement>(null);
  useDetailLayout(root);
  const sections = [
    { id: 'wear', body: <Wear country={country} content={content.wear} /> },
    { id: 'nature', body: <Nature country={country} content={content.nature} /> },
    { id: 'cities', body: <Cities country={country} content={content.cities} /> },
    { id: 'history', body: <History country={country} content={content.history} /> },
    { id: 'festive', body: <Celebrations country={country} content={content.festive} /> },
    { id: 'food', body: <Food country={country} content={content.food} /> },
    { id: 'monuments', body: <MonumentGrid country={country} content={content.monuments} /> },
  ] as const;
  return (
    <div ref={root} className="country-details">
      <ImageCatalogContext value={catalog}>
        <PlaceMapProvider country={country}>
          {sections.map(({ id, body }) => {
            const section = content[id];
            return (
              <section
                key={id}
                id={id}
                tabIndex={-1}
                className={`country-detail-section country-${id}`}
                aria-labelledby={`${id}-title`}
              >
                <div className="ui-container">
                  <SectionHeader
                    id={`${id}-title`}
                    title={section.title}
                    eyebrow={section.eyebrow}
                    intro={id !== 'history' && 'intro' in section ? section.intro : undefined}
                  />
                  {body}
                </div>
              </section>
            );
          })}
        </PlaceMapProvider>
      </ImageCatalogContext>
    </div>
  );
}

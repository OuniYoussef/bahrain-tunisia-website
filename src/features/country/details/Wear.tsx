import { useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/Tabs';
import type { CountryContent } from '../types';
import type { Country } from '../country.config';
import { media } from '../detail-media';
import { InfoCard } from './InfoCard';
import { PlaceLink } from './PlaceMap';
import { useDesktop } from './useDesktop';

export function Wear({ country, content }: { country: Country; content: CountryContent['wear'] }) {
  const [active, setActive] = useState(content.groups[0]?.id ?? '');
  const desktop = useDesktop();
  const cards = (group: CountryContent['wear']['groups'][number]) => (
    <div className="detail-card-grid wear-grid" data-wear-group={group.id}>
      {group.items.map((item) => (
        <InfoCard
          key={item.id}
          id={`wear-${group.id}-${item.id}`}
          item={item}
          country={country}
          media={media(`${country}.wear.groups.${group.id}.items`, item.id)}
          portrait
        />
      ))}
    </div>
  );
  return (
    <>
      {desktop ? (
        <Tabs value={active} onValueChange={setActive}>
          <TabList aria-label={content.title}>
            {content.groups.map((group) => (
              <Tab key={group.id} value={group.id}>
                {group.title}
              </Tab>
            ))}
          </TabList>
          {content.groups.map((group) => (
            <TabPanel key={group.id} value={group.id}>
              <h3 className="sr-only">{group.title}</h3>
              {cards(group)}
            </TabPanel>
          ))}
        </Tabs>
      ) : (
        <div className="wear-accordions">
          {content.groups.map((group, index) => (
            <details key={group.id} open={index === 0}>
              <summary>
                <h3>{group.title}</h3>
                <ChevronDown aria-hidden="true" size={20} />
              </summary>
              {cards(group)}
            </details>
          ))}
        </div>
      )}
      {'regional' in content && (
        <aside className="wear-regional" aria-labelledby="regional-title">
          <h3 id="regional-title" className="text-h3">
            {content.regionalTitle}
          </h3>
          <div>
            {content.regional.map((text, index) => (
              <article key={text} id={`wear-region-${index}`} data-regional="">
                <MapPin aria-hidden="true" size={24} />
                <p>{text}</p>
                <PlaceLink
                  id={`wear-region-${index}`}
                  title={text}
                  media={media(`${country}.wear.regional`, String(index))}
                />
              </article>
            ))}
          </div>
        </aside>
      )}
    </>
  );
}

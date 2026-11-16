import { lazy, Suspense, useRef, useState } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { useContent } from '@/i18n/content';
import { useNearViewport } from '@/components/media/useNearViewport';
import { CountrySectionHeader } from '../CountrySectionHeader';
import { DestinationShowcase, type ShowcaseHandle } from '../destinations/DestinationShowcase';
import { DestinationCard } from '../destinations/DestinationCard';
import { Spotlight } from './Spotlight';
import { media } from '../media';
import type { Country } from '../country.config';
import type { CountryContent, Destination } from '../types';
const CountryMap = lazy(() => import('../destinations/CountryMap'));
const DestinationDialog = lazy(() =>
  import('../destinations/DestinationDialog').then((module) => ({ default: module.DestinationDialog })),
);
export function Destinations({
  country,
  content,
}: {
  country: Country;
  content: CountryContent['destinations'];
}) {
  const { ui } = useContent('common');
  const featured = content.featured.map((item) => ({
    ...item,
    media: media(`${country}.destinations.featured`, item.id),
  }));
  const more = content.more.map((item) => ({
    ...item,
    media: media(`${country}.destinations.more`, item.id),
  }));
  const all = [...featured, ...more];
  const [active, setActive] = useState(featured[0]?.id ?? '');
  const [dialog, setDialog] = useState<Destination | null>(null);
  const [expanded, setExpanded] = useState(false);
  const showcase = useRef<ShowcaseHandle>(null);
  const { root: mapRoot, near } = useNearViewport<HTMLDivElement>();
  const choose = (id: string) => {
    setActive(id);
    const index = featured.findIndex((item) => item.id === id);
    if (index >= 0) showcase.current?.select(index, true);
    else {
      const card = document.getElementById(`destination-${id}`);
      card?.scrollIntoView({ behavior: 'instant', block: 'center' });
      card?.querySelector('button')?.focus({ preventScroll: true });
    }
  };
  const showOnMap = (item: Destination) => {
    setDialog(null);
    setExpanded(true);
    requestAnimationFrame(() => {
      mapRoot.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
      requestAnimationFrame(() => {
        setActive(item.id);
        mapRoot.current
          ?.querySelector<HTMLButtonElement>(`[data-map-place="${item.media.place}"]`)
          ?.focus({ preventScroll: true });
      });
    });
  };
  return (
    <section
      id="destinations"
      tabIndex={-1}
      className="country-destinations"
      aria-labelledby="destinations-title"
    >
      <div className="ui-container">
        <CountrySectionHeader
          id="destinations-title"
          eyebrow={content.eyebrow}
          title={content.title}
          intro={content.intro}
        />
        <DestinationShowcase
          ref={showcase}
          items={featured}
          label={content.featuredTitle}
          activeId={active}
          onActive={setActive}
          onOpen={setDialog}
        >
          <div ref={mapRoot} className="destination-map-panel" data-expanded={expanded}>
            <button
              type="button"
              className="country-map-toggle"
              aria-expanded={expanded}
              aria-controls="destination-map-content"
              onClick={() => setExpanded((value) => !value)}
            >
              <MapPin size={18} aria-hidden="true" />
              {ui.viewOnMap}
              <ChevronDown size={18} aria-hidden="true" />
            </button>
            <div id="destination-map-content" className="destination-map-content">
              <Suspense fallback={<div className="country-map-loading" aria-label={ui.loading} />}>
                {near && (
                  <CountryMap
                    country={country}
                    label={content.mapLabel}
                    items={all}
                    activePlace={all.find((item) => item.id === active)?.media.place}
                    onSelect={choose}
                  />
                )}
              </Suspense>
            </div>
          </div>
        </DestinationShowcase>
        <section className="country-more" aria-labelledby="more-title">
          <h2 id="more-title" className="text-h3">
            {content.moreTitle}
          </h2>
          <div className="country-more-grid">
            {more.map((item) => (
              <DestinationCard key={item.id} item={item} onOpen={setDialog} />
            ))}
          </div>
        </section>
      </div>
      {'spotlight' in content && <Spotlight content={content.spotlight} />}
      <Suspense>
        {dialog && <DestinationDialog item={dialog} onClose={() => setDialog(null)} onMap={showOnMap} />}
      </Suspense>
    </section>
  );
}

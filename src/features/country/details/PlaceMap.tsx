import { createContext, lazy, Suspense, use, useState, type ReactNode } from 'react';
import { MapPin } from 'lucide-react';
import { useContent } from '@/i18n/content';
import type { Country } from '../country.config';
import type { CardMedia } from '../detail-media';

export type MappedPlace = { id: string; title: string; media: CardMedia };
const MapContext = createContext<((place: MappedPlace) => void) | null>(null);
const PlaceMapDialog = lazy(() => import('./PlaceMapDialog'));

export function PlaceMapProvider({ country, children }: { country: Country; children: ReactNode }) {
  const [place, setPlace] = useState<MappedPlace | null>(null);
  return (
    <MapContext value={setPlace}>
      {children}
      <Suspense>
        {place && <PlaceMapDialog country={country} place={place} onClose={() => setPlace(null)} />}
      </Suspense>
    </MapContext>
  );
}

export function PlaceLink(place: MappedPlace) {
  const show = use(MapContext);
  const { ui } = useContent('common');
  if (!place.media.place) return null;
  return (
    <button
      type="button"
      className="detail-map-link"
      aria-label={`${ui.viewOnMap}: ${place.title}`}
      onClick={() => show?.(place)}
    >
      <MapPin size={16} aria-hidden="true" />
      {ui.viewOnMap}
    </button>
  );
}

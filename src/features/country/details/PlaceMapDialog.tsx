import { Dialog } from '@/components/ui/Dialog';
import { useContent } from '@/i18n/content';
import CountryMap from '../destinations/CountryMap';
import type { Country } from '../country.config';
import type { MappedPlace } from './PlaceMap';

export default function PlaceMapDialog({
  country,
  place,
  onClose,
}: {
  country: Country;
  place: MappedPlace;
  onClose: () => void;
}) {
  const content = useContent(country);
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={place.title}
    >
      <CountryMap
        country={country}
        items={[place]}
        activePlace={place.media.place}
        label={content.destinations.mapLabel}
        onSelect={onClose}
        cardPrefix=""
      />
    </Dialog>
  );
}

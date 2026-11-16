import { SvgArtwork } from '@/components/media/SvgArtwork';
import mapRegion from '/images/svg/maps/map-region-tunisia-bahrain.svg?raw';
import { useLayoutEffect, type Dispatch, type SetStateAction } from 'react';
export default function JourneyArtwork({ onReady }: { onReady: Dispatch<SetStateAction<boolean>> }) {
  useLayoutEffect(() => {
    onReady(true);
  }, [onReady]);
  return <SvgArtwork source={mapRegion} />;
}

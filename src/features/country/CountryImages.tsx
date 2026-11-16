import { useEffect, useState, type ReactNode } from 'react';
import { ImageCatalogContext, type ImageCatalog } from '@/components/media/ImageCatalog';
import { useNearViewport } from '@/components/media/useNearViewport';
import type { Country } from './country.config';
const empty: ImageCatalog = {};
const catalogs: Partial<Record<Country, Promise<ImageCatalog>>> = {};
export function CountryImages({ children, country }: { children: ReactNode; country: Country }) {
  const { root, near } = useNearViewport<HTMLDivElement>();
  const [images, setImages] = useState(empty);
  useEffect(() => {
    if (!near) return;
    let mounted = true;
    catalogs[country] ??= (
      country === 'tunisia'
        ? import('@/content/generated/tunisia-destinations.generated.json')
        : import('@/content/generated/bahrain-destinations.generated.json')
    ).then((module) => module.default);
    void catalogs[country]
      .then((value) => {
        if (mounted) setImages(value);
      })
      .catch(() => {
        /* Keep labelled placeholders available offline. */
      });
    return () => {
      mounted = false;
    };
  }, [near, country]);
  return (
    <div ref={root}>
      <ImageCatalogContext value={images}>{children}</ImageCatalogContext>
    </div>
  );
}

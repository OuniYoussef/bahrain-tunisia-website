import { useEffect, useState, type ReactNode } from 'react';
import { ImageCatalogContext, type ImageCatalog } from '@/components/media/ImageCatalog';
import { useNearViewport } from '@/components/media/useNearViewport';
const empty: ImageCatalog = {};
let catalog: Promise<ImageCatalog> | undefined;
export function CountryImages({ children }: { children: ReactNode }) {
  const { root, near } = useNearViewport<HTMLDivElement>();
  const [images, setImages] = useState(empty);
  useEffect(() => {
    if (!near) return;
    let mounted = true;
    catalog ??= import('@/content/generated/tunisia-destinations.generated.json').then(
      (module) => module.default,
    );
    void catalog
      .then((value) => {
        if (mounted) setImages(value);
      })
      .catch(() => {
        /* Keep labelled placeholders available offline. */
      });
    return () => {
      mounted = false;
    };
  }, [near]);
  return (
    <div ref={root}>
      <ImageCatalogContext value={images}>{children}</ImageCatalogContext>
    </div>
  );
}

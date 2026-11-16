import { useEffect, useState, type ReactNode } from 'react';
import { ImageCatalogContext, type ImageCatalog } from '@/components/media/ImageCatalog';
import { useNearViewport } from '@/components/media/useNearViewport';
const empty: ImageCatalog = {};
let catalog: Promise<ImageCatalog> | undefined;
export function DeferredImages({ children }: { children: ReactNode }) {
  const { root, near } = useNearViewport<HTMLDivElement>();
  const [images, setImages] = useState(empty);
  useEffect(() => {
    if (!near) return;
    let active = true;
    catalog ??= import('@/content/generated/united.generated.json').then((module) => module.default);
    void catalog
      .then((value) => {
        if (active) setImages(value);
      })
      .catch(() => {
        /* Keep the labelled cards and placeholders available when the image catalog fails. */
      });
    return () => {
      active = false;
    };
  }, [near]);
  return (
    <div ref={root}>
      <ImageCatalogContext value={images}>{children}</ImageCatalogContext>
    </div>
  );
}

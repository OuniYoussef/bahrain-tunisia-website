import { createContext, use, useContext } from 'react';
import type { GeneratedImage, ImageId } from '@/lib/images';
import rejected from '@/content/image-review.json';

export type ImageCatalog = Partial<Record<ImageId, GeneratedImage>>;
export const ImageCatalogContext = createContext<ImageCatalog | null>(null);
let fullCatalog: Promise<ImageCatalog> | undefined;
function loadCatalog(): Promise<ImageCatalog> {
  return (fullCatalog ??= import('@/content/generated/images.generated.json').then(
    (module) => module.default.images,
  ));
}
/** Route-specific catalogs keep unrelated photo metadata out of the landing bundle. */
export function useImage(id: ImageId) {
  const provided = useContext(ImageCatalogContext);
  const images = provided ?? use(loadCatalog());
  const image = images[id];
  return !Object.hasOwn(rejected, id) && image?.widths.length ? image : undefined;
}

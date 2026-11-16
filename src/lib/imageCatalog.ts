import generated from '@/content/generated/images.generated.json';
import type { GeneratedImage, ImageId } from './images';
const images: Partial<Record<ImageId, GeneratedImage>> = generated.images;
export function getImage(id: ImageId): GeneratedImage | undefined {
  const image = images[id];
  return image?.widths.length ? image : undefined;
}

import type generated from '@/content/generated/images.generated.json';
import type manifest from '@/content/images.manifest.json';

export type ImageId = keyof typeof manifest.images;
export type GeneratedImage = (typeof generated.images)[keyof typeof generated.images];

export function assetUrl(path: string, base = import.meta.env.BASE_URL) {
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

export function buildSrcSet(image: Pick<GeneratedImage, 'src' | 'widths'>, base = import.meta.env.BASE_URL) {
  return [...new Set(image.widths)]
    .filter((width) => Number.isInteger(width) && width > 0)
    .sort((a, b) => a - b)
    .map((width) => `${assetUrl(`${image.src}-${width}.webp`, base)} ${width}w`)
    .join(', ');
}

export function imageSrc(image: GeneratedImage) {
  return assetUrl(`${image.src}-${Math.max(...image.widths)}.webp`);
}

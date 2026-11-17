import type { Content } from '@/i18n/content';
import matrixMedia from '@/content/generated/matrix-media.generated.json';
import type { ImageId } from '@/lib/images';

export type Slide = Content['matrix']['slides'][number];
export type Video =
  { provider: 'file'; src: string; poster: ImageId; captions?: string } | { provider: 'youtube'; id: string };
export type SlideMedia = {
  media: { layout: string; tunisia: ImageId[]; bahrain: ImageId[]; shared: ImageId[] };
  video: Video | null;
};
export function slideMedia(id: string): SlideMedia {
  return matrixMedia[id as keyof typeof matrixMedia] as SlideMedia;
}
export const motionQueries = {
  motion: '(prefers-reduced-motion: no-preference)',
  reduce: '(prefers-reduced-motion: reduce)',
};

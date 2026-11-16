import type { Content } from '@/i18n/content';
import type { ImageId } from '@/lib/images';
export type CountryContent = Content['tunisia'] | Content['bahrain'];
export type PlaceText = { id: string; title: string; text: string; tip?: string };
export type PlaceMedia = { image: ImageId; place?: string; unesco?: boolean };
export type Destination = PlaceText & { media: PlaceMedia };

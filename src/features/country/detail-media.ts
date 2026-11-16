import source from '@/content/generated/country-details-media.generated.json';
import type { ImageId } from '@/lib/images';
import type { Country } from './country.config';

export type CardMedia = { image?: ImageId; place?: string; unesco?: boolean; badgeYear?: string | number };
type GroupPath = `${Country}.${'wear' | 'nature' | 'festive' | 'food'}.groups.${string}.items`;
type ItemPath =
  `${Country}.${'cities' | 'monuments'}.items` | `${Country}.history.timeline` | `${Country}.wear.regional`;

export function media(path: GroupPath | ItemPath, id: string): CardMedia;
export function media(path: `${Country}.festive.weddings`): CardMedia;
export function media(path: `${Country}.food`): { productImages: ImageId[] };
export function media(path: 'bahrain.cities'): { nightlifeImage: ImageId };
export function media(path: 'bahrain.history.pearl' | 'bahrain.food.coffee'): CardMedia;
export function media(path: string, id?: string): unknown {
  let value: unknown = source;
  for (const key of [...path.split('.'), ...(id === undefined ? [] : [id])]) {
    // Some editorial items intentionally have no photograph or map pin.
    if (!value || typeof value !== 'object' || !Object.hasOwn(value, key)) return {};
    value = (value as Record<string, unknown>)[key];
  }
  return value;
}

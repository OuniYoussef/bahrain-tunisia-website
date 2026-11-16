import { tunisia, bahrain } from '@/content/generated/country-media.generated.json';
import type { media as lookup } from '@/lib/media';
import type { Country } from './country.config';
import type { PlaceMedia } from './types';
type WelcomePath = `${Country}.welcome`;
type PlacePath =
  | `${Country}.destinations.featured`
  | `${Country}.destinations.more`
  | 'tunisia.destinations.spotlight.places';
const source = { tunisia, bahrain };
export function media(path: WelcomePath): ReturnType<typeof lookup<'tunisia.welcome'>>;
export function media(path: PlacePath, id: string): PlaceMedia;
export function media(path: WelcomePath | PlacePath, id?: string): unknown {
  let value: unknown = source;
  for (const key of [...path.split('.'), ...(id === undefined ? [] : [id])]) {
    if (!value || typeof value !== 'object' || !Object.hasOwn(value, key))
      throw new Error(`Unknown country media: ${path}.${id ?? ''}`);
    value = (value as Record<string, unknown>)[key];
  }
  return value;
}

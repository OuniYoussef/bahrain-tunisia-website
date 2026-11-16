import source from '@/content/media.json';
import type { ImageId } from './images';

type TypedMedia<T> = {
  [K in keyof T]: K extends 'image'
    ? ImageId
    : K extends 'images'
      ? ImageId[]
      : T[K] extends readonly unknown[]
        ? T[K]
        : T[K] extends object
          ? TypedMedia<T[K]>
          : T[K];
};
type Media = TypedMedia<Omit<typeof source, '$comment'>>;
type Paths<T> = {
  [K in keyof T & string]: T[K] extends readonly unknown[]
    ? never
    : T[K] extends object
      ? K | `${K}.${Paths<T[K]>}`
      : never;
}[keyof T & string];
type At<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? At<T[K], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never;
export type MediaPath = Paths<Media>;

export function media<P extends MediaPath>(path: P): At<Media, P>;
export function media<P extends MediaPath, K extends keyof At<Media, P>>(path: P, id: K): At<Media, P>[K];
export function media(path: string, id?: PropertyKey): unknown {
  let value: unknown = source;
  for (const key of [...path.split('.'), ...(id === undefined ? [] : [id])]) {
    if (!value || typeof value !== 'object' || !Object.hasOwn(value, key)) {
      throw new Error(`Unknown media entry: ${path}${id === undefined ? '' : `.${String(id)}`}`);
    }
    value = (value as Record<PropertyKey, unknown>)[key];
  }
  return value;
}

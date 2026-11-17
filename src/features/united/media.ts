import united from '@/content/generated/united-media.generated.json';
import type { media as lookup } from '@/lib/media';
type Paths = 'united.hero' | 'united.journey' | 'united.connecting.items' | 'united.teasers';
type Values = {
  'united.hero': ReturnType<typeof lookup<'united.hero'>>;
  'united.journey': ReturnType<typeof lookup<'united.journey'>>;
  'united.connecting.items': ReturnType<typeof lookup<'united.connecting.items'>>;
  'united.teasers': ReturnType<typeof lookup<'united.teasers'>>;
};
/** Same media lookup contract, with a statically selected namespace for route splitting. */
export function media<P extends Paths>(path: P): Values[P];
export function media<P extends Paths, K extends keyof Values[P]>(path: P, id: K): Values[P][K];
export function media(path: Paths, id?: PropertyKey): unknown {
  let value: unknown = united;
  for (const key of [...path.split('.').slice(1), ...(id === undefined ? [] : [id])]) {
    if (!value || typeof value !== 'object' || !Object.hasOwn(value, key))
      throw new Error(`Unknown United media: ${path}`);
    value = (value as Record<PropertyKey, unknown>)[key];
  }
  return value;
}

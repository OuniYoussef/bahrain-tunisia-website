import { describe, expect, expectTypeOf, it } from 'vitest';
import { media } from './media';
import type { ImageId } from './images';
describe('language-neutral media', () => {
  it('looks up a typed item without duplicating metadata in locales', () => {
    const destination = media('tunisia.destinations.featured', 'el-djem');
    expect(destination).toEqual({ image: 'tn-dest-el-djem', place: 'el-djem', unesco: true });
    expectTypeOf(destination.image).toEqualTypeOf<ImageId>();
    expectTypeOf(destination.unesco).toEqualTypeOf<boolean>();
  });
  it('supports a full path and sections containing image arrays', () => {
    expect(media('tunisia.destinations.featured.el-djem')).toEqual(
      media('tunisia.destinations.featured', 'el-djem'),
    );
    expect(media('bahrain.welcome').images).toContain('bh-hero-manama-skyline');
    expectTypeOf(media('bahrain.welcome').images).toEqualTypeOf<ImageId[]>();
  });
  it('rejects missing entries and prototype traversal at runtime', () => {
    expect(() => media('tunisia.destinations.featured', 'unknown' as never)).toThrow('Unknown media entry');
    expect(() => media('__proto__' as never)).toThrow('Unknown media entry');
  });
});

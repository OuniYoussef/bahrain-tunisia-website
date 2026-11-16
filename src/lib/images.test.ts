import { describe, expect, it } from 'vitest';
import { assetUrl, buildSrcSet, getImage, imageSrc } from './images';
describe('responsive image sources', () => {
  it('builds candidates for the actual generated El Djem widths', () => {
    const image = getImage('tn-dest-el-djem')!;
    expect(buildSrcSet(image)).toBe(
      '/images/photos/tunisia/tn-dest-el-djem-480.webp 480w, /images/photos/tunisia/tn-dest-el-djem-960.webp 960w, /images/photos/tunisia/tn-dest-el-djem-1440.webp 1440w',
    );
    expect(imageSrc(image)).toBe('/images/photos/tunisia/tn-dest-el-djem-1440.webp');
  });
  it('deduplicates, sorts and ignores invalid widths without mutating generated data', () => {
    const image = { src: '/images/example', widths: [960, 480, 960, 0, -1, 1.5, NaN] };
    expect(buildSrcSet(image, '/exchange/')).toBe(
      '/exchange/images/example-480.webp 480w, /exchange/images/example-960.webp 960w',
    );
    expect(image.widths).toEqual([960, 480, 960, 0, -1, 1.5, NaN]);
  });
  it('handles empty candidates and missing generated photos', () => {
    expect(buildSrcSet({ src: '/image', widths: [] })).toBe('');
    expect(getImage('bh-wear-thobe')).toBeUndefined();
  });
  it('supports root, subpath and CDN Vite bases', () => {
    expect(assetUrl('/images/photo.webp', '/')).toBe('/images/photo.webp');
    expect(assetUrl('images/photo.webp', '/exchange/')).toBe('/exchange/images/photo.webp');
    expect(assetUrl('/images/photo.webp', 'https://cdn.example.org/assets/')).toBe(
      'https://cdn.example.org/assets/images/photo.webp',
    );
  });
});

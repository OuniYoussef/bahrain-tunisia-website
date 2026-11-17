import { describe, it, expect } from 'vitest';
import { fitSize } from './compress';
describe('upload sizing', () => {
  it.each([
    [4000, 3000, 1600, 1600, 1200],
    [3000, 4000, 1600, 1200, 1600],
    [320, 240, 1600, 320, 240],
    [4000, 3000, 480, 480, 360],
    [1, 10000, 480, 1, 480],
  ])('fits %s by %s to %s without upscaling', (w, h, max, width, height) => {
    expect(fitSize(w, h, max)).toEqual({ width, height });
  });
  it.each([0, -1, NaN, Infinity])('rejects invalid dimensions %s', (value) =>
    expect(() => fitSize(value, 100, 1600)).toThrow(),
  );
});

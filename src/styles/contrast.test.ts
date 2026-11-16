import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync(join(process.cwd(), 'src/styles/index.css'), 'utf8');

const palette = Object.fromEntries(
  [...css.matchAll(/--color-([\w-]+):\s*(#[a-f0-9]{6})/g)].map((match) => [match[1]!, match[2]!]),
);
function luminance(hex: string) {
  const rgb = [1, 3, 5]
    .map((start) => Number.parseInt(hex.slice(start, start + 2), 16) / 255)
    .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));
  return rgb[0]! * 0.2126 + rgb[1]! * 0.7152 + rgb[2]! * 0.0722;
}
function ratio(fg: string, bg: string) {
  const values = [luminance(palette[fg] ?? fg), luminance(palette[bg] ?? bg)].sort((a, b) => b - a);
  return (values[0]! + 0.05) / (values[1]! + 0.05);
}
describe('foundation contrast against the actual theme tokens', () => {
  for (const background of ['pearl', 'pearl-glow', 'sand-50', 'sand-100']) {
    for (const foreground of ['ink', 'ink-soft', 'muted', 'ieee', 'crimson', 'gold-deep']) {
      it(`${foreground} text on ${background} meets AA`, () => {
        expect(ratio(foreground, background)).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
  for (const foreground of ['pearl', 'sand-300', 'ieee-40', 'gold']) {
    it(`${foreground} text on ink meets AA`, () =>
      expect(ratio(foreground, 'ink')).toBeGreaterThanOrEqual(4.5));
  }
  for (const background of ['tn-blue', 'bh-teal', 'crimson']) {
    it(`white button text on ${background} meets AA`, () =>
      expect(ratio('#ffffff', background)).toBeGreaterThanOrEqual(4.5));
  }
  for (const background of ['pearl', 'pearl-glow', 'sand-50']) {
    it(`control borders and focus on ${background} meet non-text contrast`, () => {
      expect(ratio('muted', background)).toBeGreaterThanOrEqual(3);
      expect(ratio('ieee', background)).toBeGreaterThanOrEqual(3);
    });
  }
  it('gold on pearl is unsuitable for text (ornaments only)', () =>
    expect(ratio('gold', 'pearl')).toBeLessThan(3));
});

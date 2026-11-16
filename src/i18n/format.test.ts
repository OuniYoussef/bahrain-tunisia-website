import { describe, expect, it } from 'vitest';
import { formatDate, formatNumber, plural, t, type PluralForms } from './format';
describe('content formatting', () => {
  it('interpolates literal values without interpreting markup or replacement patterns', () => {
    expect(t('{name} / {name} / {missing}', { name: '<b>$&</b>' })).toBe('<b>$&</b> / <b>$&</b> / {missing}');
    expect(t('{count}', { count: 0 })).toBe('0');
    expect(t('{toString}')).toBe('{toString}');
  });
  const forms: PluralForms = {
    zero: 'zero {count}',
    one: 'one {count}',
    two: 'two {count}',
    few: 'few {count}',
    many: 'many {count}',
    other: 'other {count}',
  };
  it.each([
    [0, 'zero'],
    [1, 'one'],
    [2, 'two'],
    [3, 'few'],
    [11, 'many'],
    [100, 'other'],
  ] as const)('selects the Arabic category for %i', (count, category) => {
    expect(plural(forms, count, 'ar')).toBe(`${category} ${count}`);
  });
  it('uses locale rules and falls back to other', () => {
    expect(plural(forms, 0, 'fr')).toBe('one 0');
    expect(plural(forms, 0, 'en')).toBe('other 0');
    expect(plural({ other: '{count} items' }, 2, 'ar')).toBe('2 items');
  });
  it('formats western digits in Arabic numbers and dynamic dates', () => {
    expect(formatNumber(3970, 'ar')).toBe('3,970');
    const date = formatDate(new Date('2026-11-16T12:00:00Z'), 'ar', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'UTC',
    });
    expect(date).toContain('2026');
    expect(date).not.toMatch(/[٠-٩]/);
  });
});

import { expect, it } from 'vitest';
import { csv } from './csv';
it('escapes quotes, multiline text, and spreadsheet formulas', () => {
  expect(csv([['=1+1', '  @SUM(A1)', 'a"b', 'a\nb']])).toBe('\uFEFF"\'=1+1","\'  @SUM(A1)","a""b","a\nb"');
});

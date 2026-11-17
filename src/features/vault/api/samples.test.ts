import { execFileSync } from 'node:child_process';
import { expect, it } from 'vitest';
import { sampleStories } from './samples';
it('keeps the six neutral multilingual sample posts in sync with SQL', () => {
  execFileSync(process.execPath, ['scripts/seed-samples.mjs', '--check']);
  expect(sampleStories).toHaveLength(6);
  expect(new Set(sampleStories.map((s) => s.locale))).toEqual(new Set(['en', 'fr', 'ar']));
  expect(sampleStories.every((s) => s.is_sample && s.status === 'approved')).toBe(true);
});

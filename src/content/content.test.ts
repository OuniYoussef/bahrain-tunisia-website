import { execFileSync } from 'node:child_process';
import { expect, test } from 'vitest';

test('the supplied content passes the integrity checker', () => {
  const output = execFileSync(process.execPath, ['scripts/check-content.mjs'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    timeout: 15_000,
  });

  expect(output).toContain('Content OK');
});

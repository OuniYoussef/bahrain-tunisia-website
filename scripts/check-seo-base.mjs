import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
const original = await readFile('vercel.json');
const out = 'node_modules/.cache/seo-base';
const env = { ...process.env, VITE_BASE_PATH: '/exchange/', VITE_SITE_URL: 'https://exchange.example.test' };
try {
  for (const args of [['node_modules/vite/bin/vite.js', 'build', '--outDir', out], ['scripts/prerender-meta.mjs', out], ['scripts/check-seo.mjs', out, '--meta']]) {
    const result = spawnSync(process.execPath, args, { env, encoding: 'utf8', windowsHide: true });
    assert.equal(result.status, 0, result.stdout + result.stderr);
    console.log(args[0] + ': passed');
  }
} finally { await writeFile('vercel.json', original); }

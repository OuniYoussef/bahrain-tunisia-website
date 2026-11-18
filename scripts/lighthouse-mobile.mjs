import { chromium } from 'playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

// Supply the CLI from an isolated npm exec installation; no runtime dependency.
const [phase, cli, base = 'http://127.0.0.1:4173', singleRoute] = process.argv.slice(2);
if (!phase || !cli) throw new Error('Usage: node scripts/lighthouse-mobile.mjs before|after <lighthouse-cli>');
const directory = resolve('node_modules/.cache/motion-audit', phase);
await mkdir(directory, { recursive: true });
const rows = [];
for (const route of singleRoute === undefined ? ['', 'tunisia', 'bahrain', 'common-grounds', 'vault', 'contact'] : [singleRoute]) {
  const name = route.replace(/\/$/, '') || 'united';
  const output = resolve(directory, `${name}.json`);
  await new Promise((done, reject) => {
    const child = spawn(process.execPath, [cli, `${base}/en/${route}`,
      '--quiet', '--chrome-flags=--headless --no-sandbox', '--only-categories=performance,accessibility,best-practices,seo',
      '--output=json', `--output-path=${output}`], {
      env: { ...process.env, CHROME_PATH: chromium.executablePath() }, stdio: 'inherit', windowsHide: true,
    });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? done() : reject(new Error(`Lighthouse ${name}: ${code}`)));
  });
  const report = JSON.parse(await readFile(output, 'utf8'));
  const row = { page: name, version: report.lighthouseVersion,
    scores: Object.fromEntries(Object.entries(report.categories).map(([key, value]) => [key, Math.round(value.score * 100)])),
    cls: report.audits['cumulative-layout-shift'].numericValue,
    lcp: report.audits['largest-contentful-paint'].numericValue,
    tbt: report.audits['total-blocking-time'].numericValue,
    longTasks: report.audits['long-tasks'].details?.items?.map(({ duration }) => duration) ?? [],
  };
  rows.push(row);
  console.log(JSON.stringify(row));
  await writeFile(resolve(directory, 'summary.json'), JSON.stringify(rows, null, 2));
}

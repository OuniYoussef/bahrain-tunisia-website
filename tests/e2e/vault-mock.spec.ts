import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import sharp from 'sharp';
import { gzipSync } from 'node:zlib';

test('Vault initial JavaScript budget', async ({ page }) => {
  const responses: Promise<number>[] = [];
  page.on('response', (response) => {
    if (response.url().endsWith('.js') && response.status() === 200)
      responses.push(response.body().then((body) => gzipSync(body).length));
  });
  await page.goto('/ar/vault');
  await page.waitForLoadState('networkidle');
  expect((await Promise.all(responses)).reduce((sum, n) => sum + n, 0)).toBeLessThanOrEqual(180 * 1024);
});
test('Vault filters, detail, heart once, report, two-photo submission and newsletter', async ({
  page,
}, testInfo) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (['warning', 'error'].includes(m.type())) errors.push(m.text());
  });
  await page.goto('/en/vault');
  await page.locator('#wall').scrollIntoViewIfNeeded();
  await expect(page.locator('.story-card')).toHaveCount(6);
  await page.getByRole('button', { name: 'Bahrain', exact: true }).click();
  await expect(page).toHaveURL(/country=bahrain/);
  await expect(page.locator('.story-card')).toHaveCount(2);
  await page.locator('.story-open').first().click();
  const dialog = page.locator('dialog[open]');
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(/story=/);
  await dialog.getByRole('button', { name: /^Send a heart/ }).click();
  await expect(dialog.getByRole('button', { name: /^You sent a heart/ })).toBeDisabled();
  await expect(dialog.getByText('1 heart', { exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: 'Report this post', exact: true }).click();
  const report = page.locator('dialog[open]').last();
  await report.getByLabel('Spam, political or commercial content').check();
  await report.getByRole('button', { name: 'Send report' }).click();
  await expect(report.getByText('Thank you. Our team will review this post.')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await expect(page).not.toHaveURL(/story=/);
  await page.getByRole('button', { name: 'Share My Story', exact: true }).click();
  const sheet = page.locator('dialog[open]');
  await sheet.getByRole('button', { name: 'Share My Story', exact: true }).click();
  await expect(sheet.locator('[aria-invalid=true]').first()).toBeVisible();
  await sheet.getByLabel('Your name or nickname', { exact: true }).fill('Exchange visitor');
  await sheet.getByLabel('Title', { exact: true }).fill('An afternoon of shared stories');
  await sheet
    .getByLabel('Your story', { exact: true })
    .fill(
      'We shared tea and talked about the places that make us feel at home. A wonderful afternoon together.',
    );
  await sheet.getByRole('radio', { name: 'Photography', exact: true }).check();
  const buffer = await sharp({ create: { width: 2000, height: 1200, channels: 3, background: '#00727a' } })
    .png()
    .toBuffer();
  await sheet.locator('input[type=file]').setInputFiles([
    { name: 'one.png', mimeType: 'image/png', buffer },
    { name: 'two.png', mimeType: 'image/png', buffer },
  ]);
  await expect(sheet.locator('.photo-picker li')).toHaveCount(2);
  await sheet.getByLabel('Describe photo 1 (optional)').fill('A turquoise test photograph');
  await sheet.getByRole('checkbox').check();
  await page.waitForTimeout(4200);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await sheet.getByRole('button', { name: 'Share My Story', exact: true }).click();
  await expect(sheet.getByRole('heading', { name: 'Thank you!' })).toBeVisible();
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('bt.vault.pending.v1') ?? '[]').length),
  ).toBe(1);
  await sheet.getByRole('button', { name: 'Back to the wall' }).click();
  await expect(page.locator('.story-card')).toHaveCount(2);
  await page.locator('.site-footer').scrollIntoViewIfNeeded();
  await page.locator('#newsletter-email').fill('visitor@example.com');
  await page.locator('.newsletter-consent input').check();
  await page.locator('.newsletter-panel button[type=submit]').click();
  await expect(page.locator('#newsletter-status')).toHaveText('Thank you! You are on the list.');
  await page.screenshot({ path: testInfo.outputPath('vault.png'), fullPage: true });
  expect(errors).toEqual([]);
});
for (const locale of ['en', 'fr', 'ar'])
  for (const motion of ['reduce', 'no-preference'] as const)
    test(locale + ' ' + motion + ' responsive Vault', async ({ page }, testInfo) => {
      await page.emulateMedia({ reducedMotion: motion });
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto('/' + locale + '/vault');
      await page.locator('#wall').scrollIntoViewIfNeeded();
      await expect(page.locator('.story-card')).toHaveCount(6);
      await expect(page.locator('.story-card').last()).toHaveCSS('opacity', '1');
      await expect(page.locator('h1')).toHaveCount(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      await page.locator('.story-open').first().focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('dialog[open]')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.locator('.story-open').first()).toBeFocused();
      await page.locator('.vault-hero').screenshot({ path: testInfo.outputPath('hero.png') });
      expect(errors).toEqual([]);
    });

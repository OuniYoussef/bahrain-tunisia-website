import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
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
test('Vault filters and detail', async ({ page }, testInfo) => {
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
  await page.keyboard.press('Escape');
  await expect(page).not.toHaveURL(/story=/);
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

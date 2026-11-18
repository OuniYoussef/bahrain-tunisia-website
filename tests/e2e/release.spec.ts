import { expect, test } from '@playwright/test';

test('decorative motion can be paused and resumed by keyboard', async ({ page }) => {
  await page.goto('/en/common-grounds');
  const frame = page.locator('.matrix-sequence').first().locator(':scope > div').first();
  // The sequence holds each frame for four seconds; allow a complete cycle on a busy CI host.
  await expect
    .poll(() => frame.evaluate((node) => getComputedStyle(node).opacity), { timeout: 12000 })
    .not.toBe('1');
  const toggle = page.locator('.matrix-intro').getByRole('button', { name: 'Pause decorative motion' });
  await toggle.focus();
  await page.keyboard.press('Enter');
  const value = await frame.evaluate((node) => getComputedStyle(node).opacity);
  await page.waitForTimeout(1500);
  expect(await frame.evaluate((node) => getComputedStyle(node).opacity)).toBe(value);
  await page.keyboard.press('Enter');
  await expect.poll(() => frame.evaluate((node) => getComputedStyle(node).opacity)).not.toBe(value);
  await page.locator('.matrix-intro').getByRole('button', { name: 'Pause decorative motion' }).click();
  await page.getByRole('button', { name: 'Start the journey' }).click();
  await expect(page.locator('[data-active="true"]')).toHaveCSS('opacity', '1');
  await page.locator('.matrix-deck').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-active="true"]')).toHaveCSS('opacity', '1');
});

for (const locale of ['en', 'fr', 'ar']) {
  test(`${locale} narrow reflow`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const route of ['', '/tunisia', '/bahrain', '/common-grounds', '/vault', '/contact', '/credits']) {
      await page.goto(`/${locale}${route}`);
      await expect(page.locator('h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
}

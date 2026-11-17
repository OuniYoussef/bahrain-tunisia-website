import { expect, test } from '@playwright/test';

for (const locale of ['en', 'fr', 'ar']) {
  test(`${locale} pearl signature completes and live reduced motion restores final values`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/bahrain#history`);
    const museum = page.locator('.pearl-museum');
    await museum.scrollIntoViewIfNeeded();
    await expect(museum.locator('.pearl-number')).toHaveText(['01', '02', '03', '04', '05']);
    await expect(museum.locator('.pearl-grade-fill')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(museum.locator('.pearl-number')).toHaveText(['01', '02', '03', '04', '05']);
    await expect(museum.locator('.pearl-grade-fill')).toHaveCSS('transform', 'none');
    await expect(museum.locator('.pearl-scale li > span:first-child').first()).toHaveCSS('opacity', '1');
  });
}

test('ambient mosaic pauses off screen and reduced motion removes transforms', async ({ page }) => {
  await page.goto('/en/common-grounds');
  const frame = page.locator('.matrix-sequence').first().locator(':scope > div').first();
  await expect(frame).toBeVisible();
  // Observe a running fade first, so an unchanged initial frame cannot satisfy the pause check.
  await expect.poll(() => frame.evaluate((node) => getComputedStyle(node).opacity)).not.toBe('1');
  await page.locator('footer').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const paused = await frame.evaluate((node) => getComputedStyle(node).opacity);
  await page.waitForTimeout(1400);
  expect(await frame.evaluate((node) => getComputedStyle(node).opacity)).toBe(paused);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(frame).toHaveCSS('opacity', '1');
});

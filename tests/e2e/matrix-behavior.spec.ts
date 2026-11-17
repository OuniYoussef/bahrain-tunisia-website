import { expect, test } from '@playwright/test';

test('autoplay is opt-in, pauses for hover/focus/hidden tabs, and stops at the end', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  await page.goto('/en/common-grounds/independence');
  const deck = page.locator('.matrix-deck');
  await expect(deck).toBeVisible();
  await page.clock.fastForward(10000);
  await expect(page).toHaveURL(/independence$/);
  await page.getByRole('button', { name: 'Play slideshow', exact: true }).click();
  await page.clock.fastForward(10000);
  await expect(page).toHaveURL(/independence$/);
  await page.locator('main').focus();
  await page.mouse.move(0, 0);
  await page.clock.fastForward(9001);
  await expect(page).toHaveURL(/differences$/);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.clock.fastForward(10000);
  await expect(page).toHaveURL(/differences$/);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.clock.fastForward(9001);
  await expect(page).toHaveURL(/cta$/);
  await expect(page.getByRole('button', { name: 'Play slideshow', exact: true })).toBeDisabled();
});

for (const lang of ['en', 'ar']) {
  test(`${lang} horizontal touch navigation and Observer cleanup`, async ({ page, context }) => {
    await page.goto(`/${lang}/common-grounds/sea`);
    await expect(page.locator('.matrix-deck')).toBeVisible();
    const half = page.locator('[data-active="true"] .matrix-half').first();
    await half.scrollIntoViewIfNeeded();
    const bounds = await half.boundingBox();
    const client = await context.newCDPSession(page);
    const x = bounds!.x + bounds!.width * (lang === 'ar' ? 0.8 : 0.2);
    const y = Math.max(150, bounds!.y + 60);
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: x + (lang === 'ar' ? 90 : -90), y }],
    });
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect(page).toHaveURL(/ships-songs$/);
    await page.goto(`/${lang}/contact`);
    const before = page.url();
    await page.mouse.wheel(0, 200);
    await page.keyboard.press('ArrowRight');
    expect(page.url()).toBe(before);
  });
}

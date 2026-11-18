import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { gzipSync } from 'node:zlib';
const slides = [
  'families',
  'welcome-art',
  'sea',
  'palms',
  'faith',
  'dress',
  'jewellery',
  'dates-sweets',
  'crafts',
  'ships-songs',
  'civilizations',
  'language',
];

async function revealPage(page: Page) {
  for (const selector of ['#welcome', '#journey', '#glance', '#connecting', '.united-teasers', 'footer']) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
  }
  await page.waitForLoadState('networkidle');
}
for (const locale of ['en', 'fr', 'ar'] as const) {
  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    test.describe(`${locale} ${reducedMotion}`, () => {
      test.use({ reducedMotion });
      test('United content, geography, accessibility and responsive presentation', async ({
        page,
      }, testInfo) => {
        test.setTimeout(60_000);
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('console', (message) => {
          if (['error', 'warning'].includes(message.type())) errors.push(message.text());
        });
        await page.goto(`/${locale}`);
        await expect(page.locator('h1')).toHaveCount(1);
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('html')).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
        await expect(page.locator('.hero-photo img[fetchpriority="high"][loading="eager"]')).toHaveCount(2);
        const tn = await page.locator('.hero-photo-tn figure').boundingBox();
        const bh = await page.locator('.hero-photo-bh figure').boundingBox();
        if (page.viewportSize()!.width < 1024) expect(tn!.y).toBeLessThan(bh!.y);
        else expect(tn!.x).toBeLessThan(bh!.x);
        if (page.viewportSize()!.width >= 1024) {
          const west = await page.locator('.hero-country-tn').boundingBox();
          const east = await page.locator('.hero-country-bh').boundingBox();
          expect(west!.x).toBeLessThan(80);
          expect(east!.x).toBeGreaterThan(page.viewportSize()!.width - 100);
        }
        await expect(page.locator('table caption')).not.toBeEmpty();
        await expect(page.locator('table tbody th[scope="row"]')).toHaveCount(14);
        await expect(page.locator('.connecting-card')).toHaveCount(12);
        for (const [index, slide] of slides.entries())
          await expect(page.locator('.connecting-card').nth(index)).toHaveAttribute(
            'href',
            `/${locale}/common-grounds/${slide}`,
          );
        await revealPage(page);
        await expect(page.locator('.journey-map .rm-route')).toHaveCount(1);
        await expect(page.locator('.journey-distance [aria-hidden]')).toContainText(/3[,\s\u202f\u00a0]?970/);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
        for (const selector of ['.united-hero', '#journey', '#connecting']) {
          await page.locator(selector).scrollIntoViewIfNeeded();
          await page.waitForTimeout(reducedMotion === 'reduce' ? 50 : 1600);
          await page
            .locator(selector)
            .screenshot({ path: testInfo.outputPath(`${selector.replace(/[.#]/g, '')}.png`) });
        }
        expect(errors).toEqual([]);
      });
    });
  }
  test(`United keyboard navigation and CTAs (${locale})`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/${locale}`);
    await expect(page.locator('h1')).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(page.locator('.skip-link')).toBeFocused();
    await page.keyboard.press('Enter');
    const destinations = [
      `/${locale}/common-grounds`,
      `/${locale}/vault`,
      `/${locale}/tunisia`,
      `/${locale}/bahrain`,
    ];
    for (const [index, destination] of destinations.entries()) {
      await page.locator('h1').focus();
      for (let tab = 0; tab <= index; tab++) await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toHaveAttribute('href', destination);
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(destination);
      await expect(page.locator('h1')).toBeFocused();
      await page.goBack();
      await expect(page.locator('.united-hero')).toBeVisible();
    }
    await page.locator('.glance-scroll').focus();
    if (page.viewportSize()!.width < 640) {
      await page.keyboard.press(locale === 'ar' ? 'ArrowLeft' : 'ArrowRight');
      await expect
        .poll(() => page.locator('.glance-scroll').evaluate((node) => Math.abs(node.scrollLeft)))
        .toBeGreaterThan(0);
    }
    for (let index = 0; index < 12; index++) {
      await page.keyboard.press('Tab');
      await expect(page.locator('.connecting-card').nth(index)).toBeFocused();
    }
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(`/${locale}/common-grounds/language`);
  });
}

test('United live motion preferences revert hover and route drawing', async ({ page }) => {
  await page.goto('/en');
  await expect(page.locator('h1')).toBeVisible();
  await page.waitForTimeout(1800);
  if (page.viewportSize()!.width >= 1024) {
    await page.locator('.hero-country-tn').focus();
    await expect(page.locator('.hero-photo-tn')).toHaveCSS('clip-path', 'inset(0px 42% 0px 0px)');
  }
  await page.locator('#journey').scrollIntoViewIfNeeded();
  await expect(page.locator('.rm-route')).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.hero-photo-tn')).toHaveCSS('opacity', '1');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('.rm-route')).toHaveAttribute('stroke-dasharray', '2 10');
  await expect(page.locator('.journey-distance [aria-hidden]')).toHaveText('≈ 3,970 km apart');
});

test('United initial JavaScript budget', async ({ page }) => {
  const responses: Promise<number>[] = [];
  page.on('response', (response) => {
    if (response.url().endsWith('.js') && response.status() === 200)
      responses.push(response.body().then((body) => gzipSync(body).length));
  });
  await page.goto('/ar');
  await page.waitForLoadState('networkidle');
  const size = (await Promise.all(responses)).reduce((sum, bytes) => sum + bytes, 0);
  expect(size).toBeLessThanOrEqual(180 * 1024);
});

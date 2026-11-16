import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
const routes = [
  '',
  '/tunisia',
  '/bahrain',
  '/common-grounds',
  '/common-grounds/sea',
  '/vault?country=tunisia',
  '/contact',
  '/credits',
  '/admin',
  '/admin/queue',
  '/missing',
];
for (const locale of ['en', 'fr', 'ar'] as const) {
  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    test.describe(`${locale} ${reducedMotion}`, () => {
      test.use({ reducedMotion });
      test('all routes, metadata, shell accessibility and viewport', async ({ page }, testInfo) => {
        test.setTimeout(120_000);
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('console', (message) => {
          if (['error', 'warning'].includes(message.type())) errors.push(message.text());
        });
        for (const route of routes) {
          const response = await page.goto(`/${locale}${route}`);
          expect(response?.status()).toBe(200);
          await expect(page.locator('h1')).toHaveCount(1);
          await expect(page.locator('h1')).toBeVisible();
          await expect(page.locator('html')).toHaveAttribute('lang', locale);
          await expect(page.locator('html')).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
          await expect(page.locator('head title')).toHaveCount(1);
          await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
          await expect(page.locator('link[rel="alternate"]')).toHaveCount(4);
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
          if (route === '' || route === '/contact' || route === '/missing') {
            expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
          }
          if (!route) {
            await page.screenshot({ path: testInfo.outputPath(`shell-${locale}.png`), fullPage: true });
          }
        }
        expect(errors).toEqual([]);
      });
    });
  }
}
async function openLanguages(page: Page) {
  if (await page.locator('.menu-button').isVisible()) await page.locator('.menu-button').click();
  else await page.locator('.language-switcher summary').click();
}
test('language, menu, focus, history and hash navigation', async ({ page }) => {
  await page.goto('/en/common-grounds/sea?story=42#main');
  await expect(page.locator('h1')).toBeVisible();
  await openLanguages(page);
  await page.locator('.language-links a[lang="ar"]:visible').click();
  await expect(page).toHaveURL('/ar/common-grounds/sea?story=42#main');
  await expect(page.locator('h1')).toBeFocused();
  expect(await page.evaluate(() => localStorage.getItem('bt.locale'))).toBe('ar');
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  await page.goto('/');
  await expect(page).toHaveURL('/ar');
  if (await page.locator('.menu-button').isVisible()) {
    await page.locator('.menu-button').click();
    await expect(page.locator('dialog')).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.keyboard.press('Escape');
    await expect(page.locator('.menu-button')).toBeFocused();
  }
  await page.goto('/en/credits#tn-sbs-blue-door');
  const target = page.locator('#tn-sbs-blue-door');
  await expect(target).toBeInViewport();
  expect(await target.evaluate((element) => element.getBoundingClientRect().top)).toBeGreaterThan(64);
  await page.goto('/de/tunisia');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await page.goto('/en/common-grounds/unknown');
  await expect(page).toHaveURL('/en/common-grounds/welcome');
});

test('skip link, header motion, transition, history and live reduced motion', async ({ page }) => {
  await page.goto('/en');
  await expect(page.locator('h1')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await page.evaluate(() => window.scrollTo(0, 550));
  await expect(page.locator('.site-header')).toHaveClass(/is-solid/);
  await expect
    .poll(() =>
      page
        .locator('.site-header')
        .evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m42),
    )
    .toBeLessThan(-50);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect
    .poll(() =>
      page
        .locator('.site-header')
        .evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m42),
    )
    .toBe(0);
  await page.locator('.footer-links a[href="/en/tunisia"]').click();
  await expect(page).toHaveURL('/en/tunisia');
  await expect(page.locator('h1')).toBeFocused();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.locator('.footer-links a[href="/en/bahrain"]').click();
  await expect(page).toHaveURL('/en/bahrain');
  await expect(page.locator('h1')).toBeFocused();
  await expect(page.locator('.page-wipe')).toHaveCSS('clip-path', /100%/);
  await page.goBack();
  await expect(page).toHaveURL('/en/tunisia');
  await expect(page.locator('h1')).toBeFocused();
  if (await page.locator('.skyline-hotspots').isVisible()) {
    await page.locator('.skyline-hotspot button').first().focus();
    await expect(page.getByRole('tooltip')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('tooltip')).toHaveCount(0);
  }
});

test('route errors retain a localised recovery screen', async ({ page }) => {
  await page.route('**/assets/CountryPage-*.js', (route) => route.abort());
  await page.goto('/fr/tunisia');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.locator('main button')).toHaveCount(1);
  await expect(page.locator('main a')).toHaveAttribute('href', '/fr/contact');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
});

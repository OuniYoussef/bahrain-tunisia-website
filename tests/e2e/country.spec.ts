import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { gzipSync } from 'node:zlib';

async function openMap(page: Page) {
  const toggle = page.locator('.country-map-toggle');
  if ((await toggle.isVisible()) && (await toggle.getAttribute('aria-expanded')) !== 'true')
    await toggle.click();
  await expect(page.locator('.country-map-pin')).toHaveCount(12);
  await expect(page.locator('.country-map-pin').first()).toBeVisible();
}
for (const locale of ['en', 'fr', 'ar'] as const) {
  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    test.describe(`${locale} ${reducedMotion}`, () => {
      test.use({ reducedMotion });
      test('country content, map linking, dialog, keyboard and a11y', async ({ page }, testInfo) => {
        test.setTimeout(90_000);
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('console', (message) => {
          if (['error', 'warning'].includes(message.type())) errors.push(message.text());
        });
        await page.goto(`/${locale}/tunisia`);
        await expect(page.locator('h1')).toHaveCount(1);
        await expect(page.locator('html')).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
        await expect(
          page.locator('.country-hero-photo img[fetchpriority="high"][loading="eager"]'),
        ).toHaveCount(1);
        await expect(page.locator('.country-facts [data-fact="flag"] svg')).toHaveCount(1);
        await expect(page.locator('.country-words tbody [lang="ar"][dir="rtl"]')).toHaveCount(10);
        await expect(page.locator('.country-section-nav a')).toHaveCount(9);
        await expect(page.locator('.destination-card')).toHaveCount(12);
        await expect(page.locator('.destination-card .ui-badge-unesco')).toHaveCount(5);
        await expect(page.locator('.spotlight-grid article')).toHaveCount(7);
        await page.locator('.country-hero').screenshot({ path: testInfo.outputPath('hero.png') });

        const nav = page.locator('.country-section-nav');
        await nav.locator('a').first().focus();
        await page.keyboard.press(locale === 'ar' ? 'ArrowLeft' : 'ArrowRight');
        await expect(nav.locator('a[href$="#destinations"]')).toBeFocused();
        await page.keyboard.press('Enter');
        await expect(nav.locator('[aria-current]')).toHaveAttribute('href', /#destinations$/);
        const pinned = reducedMotion === 'no-preference' && page.viewportSize()!.width >= 1024;
        await expect(page.locator('.destination-showcase')).toHaveAttribute('data-pinned', String(pinned));
        await openMap(page);
        await page.locator('.country-map-pin[data-map-place="sidi-bou-said"]').click();
        if (pinned) {
          await page.evaluate(() => {
            const track = document.querySelector<HTMLElement>('.destination-track')!;
            const viewport = document.querySelector<HTMLElement>('.destination-viewport')!;
            window.scrollBy({
              top: ((track.scrollWidth - viewport.clientWidth) * 2) / 5,
              behavior: 'instant',
            });
          });
        } else {
          await page.locator('.destination-viewport').evaluate((viewport) => {
            const cards = viewport.querySelectorAll<HTMLElement>('article');
            viewport.scrollTo({ left: cards[2]!.offsetLeft - cards[0]!.offsetLeft, behavior: 'instant' });
          });
        }
        await expect(page.locator('.country-map-pin[data-map-place="bizerte"]')).toHaveAttribute(
          'aria-pressed',
          'true',
        );
        const elDjem = page.locator('.country-map-pin[data-map-place="el-djem"]');
        await elDjem.click();
        await expect(elDjem).toHaveAttribute('aria-pressed', 'true');
        const read = page.locator('#destination-el-djem button');
        await expect(read).toBeFocused();
        await page.keyboard.press('Enter');
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await expect(dialog.locator('h2')).toBeFocused();
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
        await page.keyboard.press('Shift+Tab');
        await expect(dialog.locator('button').last()).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(dialog.locator('button').first()).toBeFocused();
        await page.keyboard.press('Escape');
        await expect(dialog).toHaveCount(0);
        await expect(read).toBeFocused();
        await read.click();
        await dialog.locator('button').last().click();
        await expect(dialog).toHaveCount(0);
        await expect(elDjem).toBeFocused();
        await expect(elDjem).toHaveAttribute('aria-pressed', 'true');

        const moreRead = page.locator('#destination-carthage button');
        await moreRead.click();
        await dialog.locator('button').last().click();
        const carthage = page.locator('.country-map-pin[data-map-place="carthage"]');
        await expect(carthage).toBeFocused();
        await expect(carthage).toHaveAttribute('aria-pressed', 'true');
        await carthage.click();
        await expect(moreRead).toBeFocused();

        await page.locator('.destination-viewport').focus();
        await page.keyboard.press('Home');
        await expect(page.locator('.destination-controls p')).toHaveText(
          await page.locator('#destination-title-sidi-bou-said').innerText(),
        );
        await page.keyboard.press(locale === 'ar' ? 'ArrowLeft' : 'ArrowRight');
        await expect(page.locator('.destination-controls p')).toHaveText(
          await page.locator('#destination-title-el-djem').innerText(),
        );
        await page.keyboard.press('End');
        await expect(page.locator('.destination-controls p')).toHaveText(
          await page.locator('#destination-title-kairouan').innerText(),
        );
        await page.keyboard.press('Home');
        await openMap(page);
        await page.locator('.country-map-pin[data-map-place="sidi-bou-said"]').click();
        await page.locator('.destination-showcase').screenshot({ path: testInfo.outputPath('showcase.png') });

        await page.locator('.country-spotlight').scrollIntoViewIfNeeded();
        await page.waitForTimeout(reducedMotion === 'reduce' ? 100 : 1100);
        await page.locator('.country-spotlight').screenshot({ path: testInfo.outputPath('spotlight.png') });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
        await nav.locator('a[href$="#food"]').focus();
        await page.keyboard.press('Enter');
        await expect(nav.locator('[aria-current]')).toHaveAttribute('href', /#food$/);
        expect(errors).toEqual([]);
      });
    });
  }
}

test('country switches live motion, retains usable controls and cleans up on navigation', async ({
  page,
}) => {
  await page.goto('/ar/tunisia');
  await page.locator('.country-section-nav a[href$="#destinations"]').click();
  await openMap(page);
  await page.locator('.country-map-pin[data-map-place="kairouan"]').click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.destination-showcase')).toHaveAttribute('data-pinned', 'false');
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await page.locator('.destination-viewport').focus();
  await page.keyboard.press('End');
  await expect(page.locator('#destination-kairouan button')).toBeInViewport();
  await page.locator('.country-continue a').first().click();
  await expect(page).toHaveURL('/ar/bahrain');
  await expect(page.locator('[data-theme="bahrain"]')).toHaveCount(1);
  await expect(page.locator('.country-section-nav a')).toHaveCount(9);
  await expect(page.locator('.country-spotlight')).toHaveCount(0);
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
});

test('country touch desktops use the native carousel', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, hasTouch: true });
  const page = await context.newPage();
  await page.goto('/en/tunisia');
  await expect(page.locator('.destination-showcase')).toHaveAttribute('data-pinned', 'false');
  await openMap(page);
  await page.locator('.country-map-pin[data-map-place="monastir"]').click();
  await expect(page.locator('#destination-monastir button')).toBeFocused();
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await context.close();
});

test('country initial JavaScript stays within budget', async ({ page }) => {
  const responses: Promise<number>[] = [];
  page.on('response', (response) => {
    if (new URL(response.url()).pathname.endsWith('.js'))
      responses.push(response.body().then((body) => gzipSync(body).length));
  });
  await page.goto('/ar/tunisia');
  await expect(page.locator('h1')).toBeVisible();
  await page.waitForLoadState('networkidle');
  const bytes = (await Promise.all(responses)).reduce((sum, size) => sum + size, 0);
  expect(bytes).toBeLessThanOrEqual(180 * 1024);
});

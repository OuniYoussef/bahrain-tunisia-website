import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import en from '../../src/content/locales/en/common.json' with { type: 'json' };
import fr from '../../src/content/locales/fr/common.json' with { type: 'json' };
import ar from '../../src/content/locales/ar/common.json' with { type: 'json' };

test.use({ baseURL: 'http://127.0.0.1:5173' });
for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test.describe(reducedMotion, () => {
    test.use({ reducedMotion });
    for (const [locale, content, language] of [
      ['en', en, 'English'],
      ['fr', fr, 'Français'],
      ['ar', ar, 'العربية'],
    ] as const) {
      test(`${locale} foundation is accessible, responsive and keyboard operable`, async ({
        page,
      }, testInfo) => {
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('console', (message) => {
          if (['error', 'warning'].includes(message.type())) errors.push(message.text());
        });
        await page.goto('/dev/styleguide');
        await page.waitForLoadState('networkidle');
        await page.getByRole('radio', { name: language, exact: true }).focus();
        await page.keyboard.press('Space');
        await expect(page.locator('html')).toHaveAttribute('lang', locale);
        await expect(page.locator('html')).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
        await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
        await expect(page.locator('#type [lang="en"] .text-display-xl')).toHaveCSS('font-family', /Fraunces/);
        await expect(page.locator('#type [lang="fr"] .text-display-xl')).toHaveCSS('font-family', /Fraunces/);
        await expect(page.locator('#type [lang="ar"] .text-display-xl')).toHaveCSS('font-family', /Amiri/);
        await expect(page.locator('img[fetchpriority="high"]')).toHaveAttribute('loading', 'eager');
        await expect(page.locator('.ui-image-placeholder')).toHaveCount(1);
        const trigger = page.getByRole('button', { name: content.ui.readMore, exact: true }).first();
        await expect(trigger.locator('span[aria-hidden]').first()).toHaveCSS(
          'scale',
          locale === 'ar' ? '-1 1' : 'none',
        );
        await trigger.click();
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await expect(dialog.getByRole('heading')).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(dialog.getByRole('button', { name: content.ui.close }).first()).toBeFocused();
        await page.keyboard.press('Shift+Tab');
        await expect(dialog.getByRole('button', { name: content.ui.close }).last()).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(dialog.getByRole('button', { name: content.ui.close }).first()).toBeFocused();
        expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
        await page.keyboard.press('Escape');
        await expect(dialog).toHaveCount(0);
        await expect(trigger).toBeFocused();
        expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');

        const tabs = page.getByRole('tab');
        await tabs.first().focus();
        await page.keyboard.press(locale === 'ar' ? 'ArrowLeft' : 'ArrowRight');
        await expect(tabs.nth(1)).toBeFocused();
        await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
        await page.keyboard.press('End');
        await expect(tabs.last()).toBeFocused();
        await page.keyboard.press('Home');
        await expect(tabs.first()).toBeFocused();
        await page.locator('textarea').fill(content.nav.tunisia);
        await expect(page.locator('textarea')).toHaveValue(content.nav.tunisia);
        await page.getByRole('button', { name: content.ui.showMore, exact: true }).first().click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(page.getByRole('dialog')).toHaveCount(0);
        // Bring every lazy image and reveal into view before checking the complete specimen.
        await page.locator('#media').scrollIntoViewIfNeeded();
        await expect(page.locator('.ui-card').first().locator('..')).toHaveCSS('opacity', '1');
        await page.locator('#forms').scrollIntoViewIfNeeded();
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForFunction(() =>
          Array.from(document.images)
            .filter((image) => image.loading === 'eager')
            .every((image) => image.complete && image.naturalWidth > 0),
        );
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
          true,
        );
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
        if (reducedMotion === 'reduce') {
          expect(await page.locator('h1').evaluate((heading) => heading.querySelectorAll('div').length)).toBe(
            0,
          );
        }
        await page.screenshot({ path: testInfo.outputPath(`${locale}-${reducedMotion}.png`) });
        if (reducedMotion === 'reduce') {
          await page.locator('#forms').screenshot({ path: testInfo.outputPath(`${locale}-forms.png`) });
          await page.locator('#media').screenshot({ path: testInfo.outputPath(`${locale}-media.png`) });
        }
        expect(errors).toEqual([]);
      });
    }
  });
}

test('theme, direction and live reduced-motion changes preserve working controls', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) errors.push(message.text());
  });
  await page.goto('/dev/styleguide');
  await page.waitForLoadState('networkidle');
  for (const [theme, colour] of [
    ['tunisia', 'rgb(30, 99, 181)'],
    ['bahrain', 'rgb(0, 114, 122)'],
  ] as const) {
    const option = page
      .locator('main > .ui-container')
      .getByRole('radio', { name: en.nav[theme], exact: true });
    await option.locator('..').click();
    await expect(page.locator('main')).toHaveAttribute('data-theme', theme);
    await expect(page.locator('.ui-button-accent').first()).toHaveCSS('background-color', colour);
  }
  await page.getByRole('button', { name: 'dir=ltr' }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.getByRole('tab').first().focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('tab').nth(1)).toBeFocused();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('h1 div')).toHaveCount(0);
  await expect(page.locator('h1')).toHaveText(en.site.name);
  const image = page.locator('img[fetchpriority="high"]');
  await expect(image.locator('..').locator('[data-lqip]')).toHaveCSS('opacity', '0');
  await image.dispatchEvent('error', { bubbles: false });
  await expect(page.locator('.ui-image-placeholder')).toHaveCount(2);
  expect(
    await page.evaluate(() => {
      const ids = Array.from(document.querySelectorAll('[id]'), (element) => element.id);
      return ids.length === new Set(ids).size;
    }),
  ).toBe(true);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('h1 div').first()).toBeAttached();
  expect(errors).toEqual([]);
});

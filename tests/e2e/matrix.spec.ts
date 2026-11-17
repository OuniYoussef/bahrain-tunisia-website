import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import en from '../../src/content/locales/en/matrix.json' with { type: 'json' };
import fr from '../../src/content/locales/fr/matrix.json' with { type: 'json' };
import ar from '../../src/content/locales/ar/matrix.json' with { type: 'json' };

for (const [lang, content] of Object.entries({ en, fr, ar })) {
  for (const reducedMotion of ['reduce', 'no-preference'] as const) {
    test(`${lang} matrix keyboard, deep links, index and accessibility (${reducedMotion})`, async ({
      page,
    }) => {
      test.setTimeout(90_000);
      await page.emulateMedia({ reducedMotion });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => {
        if (['error', 'warning'].includes(message.type())) errors.push(message.text());
      });
      await page.goto(`/${lang}/common-grounds/sea`);
      const deck = page.locator('[aria-roledescription="carousel"]');
      await expect(deck).toBeVisible();
      await expect(page.locator('[data-active="true"] h2')).toHaveText(content.slides[5]!.title);
      await expect(page.locator('.matrix-counter')).toHaveText(
        content.ui.slideLabel.replace('{current}', '6').replace('{total}', '24'),
      );
      await deck.focus();
      await page.keyboard.press('Home');
      for (const [i, slide] of content.slides.entries()) {
        await expect(page).toHaveURL(new RegExp(`/common-grounds/${slide.id}$`));
        await expect(page.locator('[data-active="true"] h2')).toHaveText(slide.title);
        await expect(page.locator('[aria-roledescription="slide"]:not([inert])')).toHaveCount(1);
        if (i < 23) await page.keyboard.press(lang === 'ar' ? 'ArrowLeft' : 'ArrowRight');
      }
      await expect(page.locator('[data-active="true"] a')).toHaveAttribute('href', `/${lang}/vault?share=1`);
      await page.keyboard.press('Home');
      await page.getByRole('button', { name: content.ui.allSlides, exact: true }).click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(dialog.locator('.matrix-index-grid button')).toHaveCount(24);
      await dialog.getByRole('button', { name: new RegExp(content.slides[2]!.title) }).click();
      await expect(dialog).not.toBeVisible();
      await expect(page).toHaveURL(new RegExp('/common-grounds/language$'));
      await expect(page.locator('[data-active="true"] tbody tr')).toHaveCount(3);
      await page.getByRole('button', { name: content.ui.allSlides, exact: true }).click();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('button', { name: content.ui.allSlides, exact: true })).toBeFocused();
      expect((await new AxeBuilder({ page }).include('.matrix-deck').analyze()).violations).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({
        path: `test-results/matrix-${lang}-${reducedMotion}-${page.viewportSize()!.width}.png`,
        fullPage: true,
      });
      expect(errors).toEqual([]);
    });
  }
}

test('matrix intro, replace history, locale sync, wheel and cooldown', async ({ page }) => {
  await page.goto('/en/contact');
  await page.goto('/en/common-grounds');
  await page.getByRole('button', { name: en.intro.start }).click();
  await expect(page).toHaveURL(/common-grounds\/welcome$/);
  await expect(page.locator('[aria-roledescription="carousel"]')).toBeFocused();
  if (page.viewportSize()!.width >= 900) {
    await page.locator('[data-active="true"] .matrix-half').first().hover();
    await page.mouse.wheel(0, 100);
  } else await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/common-grounds\/families$/);
  if (page.viewportSize()!.width >= 900) await page.mouse.wheel(0, 100);
  await expect(page).toHaveURL(/common-grounds\/families$/);
  await page.goBack();
  await expect(page).toHaveURL(/en\/contact$/);
});

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import type { Content } from '../../src/content/types';

for (const country of ['tunisia', 'bahrain'] as const) {
  for (const locale of ['en', 'fr', 'ar'] as const) {
    for (const reducedMotion of ['no-preference', 'reduce'] as const) {
      test.describe(`${country} ${locale} details ${reducedMotion}`, () => {
        test.use({ reducedMotion });
        test('complete sections, responsive controls, map focus and accessibility', async ({
          page,
        }, info) => {
          test.setTimeout(120_000);
          const content = JSON.parse(
            await readFile(`src/content/locales/${locale}/${country}.json`, 'utf8'),
          ) as Content['tunisia'] | Content['bahrain'];
          const common = JSON.parse(
            await readFile(`src/content/locales/${locale}/common.json`, 'utf8'),
          ) as Content['common'];
          const errors: string[] = [];
          page.on('pageerror', (error) => errors.push(error.message));
          page.on('console', (message) => {
            if (['error', 'warning'].includes(message.type())) errors.push(message.text());
          });
          // A direct deep link must load and focus the section even when details are deferred.
          await page.goto(`/${locale}/${country}#wear`);
          await expect(page.locator('.wear-grid')).toHaveCount(content.wear.groups.length);
          await expect(page.locator('#wear')).toBeFocused();
          const mobile = page.viewportSize()!.width < 768;
          for (const group of content.wear.groups.filter((g) => !g.id.startsWith('crafts'))) {
            if (mobile) {
              const panel = page
                .locator('.wear-accordions details')
                .filter({ has: page.getByRole('heading', { name: group.title, exact: true }) });
              if (!(await panel.getAttribute('open'))) {
                // Empty open attributes are present; inspect the DOM property instead.
                if (!(await panel.evaluate((element) => (element as HTMLDetailsElement).open))) {
                  await panel.locator('summary').focus();
                  await page.keyboard.press('Enter');
                }
              }
            } else {
              const tab = page.getByRole('tab', { name: group.title, exact: true });
              await tab.focus();
              await page.keyboard.press('Enter');
              await expect(tab).toHaveAttribute('aria-selected', 'true');
            }
            const grid = page.locator(`[data-wear-group="${group.id}"]`);
            await expect(grid).toBeVisible();
            await expect(grid.locator('[data-item-id]')).toHaveCount(group.items.length);
          }
          if (!mobile) {
            const tabs = page.locator('#wear [role="tab"]');
            await tabs.first().focus();
            await page.keyboard.press(locale === 'ar' ? 'ArrowLeft' : 'ArrowRight');
            await expect(tabs.nth(1)).toBeFocused();
            await page.keyboard.press('Home');
            await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
          }
          await page.locator('#wear').screenshot({ path: info.outputPath('wear.png') });
          await expect(page.locator('[data-regional]')).toHaveCount(
            'regional' in content.wear ? content.wear.regional.length : 0,
          );
          await expect(page.locator(country === 'tunisia' ? '.nature-row' : '.nature-masonry')).toHaveCount(
            content.nature.groups.length,
          );
          for (const group of content.nature.groups)
            await expect(page.locator(`.nature-${group.id} [data-item-id]`)).toHaveCount(group.items.length);
          const mapLink = page.locator(
            country === 'tunisia' ? '#nature-parks-ichkeul button' : '#nature-all-hawar button',
          );
          await mapLink.focus();
          await page.keyboard.press('Enter');
          const dialog = page.getByRole('dialog');
          await expect(dialog).toBeVisible();
          await expect(dialog.locator('h2')).toBeFocused();
          await expect(
            dialog.locator(`[data-map-place="${country === 'tunisia' ? 'ichkeul' : 'hawar'}"]`),
          ).toHaveAttribute('aria-pressed', 'true');
          await expect(dialog.locator('.country-map-art')).toHaveAttribute('dir', 'ltr');
          expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
          await page.keyboard.press('Escape');
          await expect(mapLink).toBeFocused();
          await expect(page.locator('.city-row')).toHaveCount(content.cities.items.length);
          await page.locator('#cities').scrollIntoViewIfNeeded();
          await page.locator('.city-capital .ui-image').first().scrollIntoViewIfNeeded();
          await expect
            .poll(() =>
              page
                .locator('.city-capital img')
                .first()
                .evaluate((image: HTMLImageElement) => {
                  // naturalWidth is density-corrected; compare the selected file's pixels instead.
                  const pixels = Number(image.currentSrc.match(/-(\d+)\.webp$/)?.[1]);
                  const maximum = Math.max(
                    ...image.srcset
                      .split(',')
                      .map((candidate) => Number(candidate.trim().split(' ')[1]?.replace('w', ''))),
                  );
                  return (
                    image.complete &&
                    pixels >= Math.min(maximum, Math.floor(image.getBoundingClientRect().width))
                  );
                }),
            )
            .toBe(true);

          if (country === 'bahrain') {
            await expect(page.locator('.bahrain-crafts .wear-grid')).toHaveCount(2);
            await expect(page.locator('.city-nightlife figure')).toHaveCount(1);
            await expect(page.locator('[data-pearl-label]')).toHaveCount(5);
            await expect(page.locator('.pearl-scale li')).toHaveCount(4);
            await expect(page.locator('.gargeean-quote blockquote')).toBeVisible();
            await expect(page.locator('.coffee-etiquette')).toBeVisible();
            await page.locator('.pearl-museum').screenshot({ path: info.outputPath('pearl-museum.png') });
            await page.locator('.nature-masonry').screenshot({ path: info.outputPath('nature.png') });
            await page.locator('.coffee-feature').screenshot({ path: info.outputPath('coffee.png') });
          }
          await page.locator('#history').scrollIntoViewIfNeeded();
          await expect(page.locator('.timeline-track li:visible')).toHaveCount(10);
          const show = page.getByRole('button', { name: common.ui.showMore, exact: true });
          await show.focus();
          await page.keyboard.press('Enter');
          await expect(page.locator('.timeline-track li:visible')).toHaveCount(
            content.history.timeline.length,
          );
          await expect(page.locator('.timeline-photo')).toHaveCount(country === 'tunisia' ? 9 : 7);
          await expect(page.locator('.figure-grid article')).toHaveCount(content.history.figures.length);
          await page.getByRole('button', { name: common.ui.showLess, exact: true }).click();
          await expect(page.locator('.timeline-track li:visible')).toHaveCount(10);
          for (const group of content.festive.groups)
            await expect(page.locator(`[data-festive-group="${group.id}"] [data-item-id]`)).toHaveCount(
              group.items.length,
            );
          await expect(page.locator('.holiday [data-lqip]')).toHaveCount(1);
          await expect(page.locator('.wedding-feature')).toContainText(content.festive.weddings.text);
          await expect(page.locator('.national-dish')).toHaveCount(1);
          for (const group of content.food.groups)
            await expect(page.locator(`[data-food-group="${group.id}"] [data-item-id]`)).toHaveCount(
              group.items.length,
            );
          if (mobile && country === 'tunisia') {
            await page.getByRole('button', { name: content.food.groups[1]!.title, exact: true }).click();
            await expect(page.locator('[data-food-group="sweets"]')).toBeVisible();
            await expect(page.locator('[data-food-group="dishes"]')).toBeHidden();
            await page.getByRole('button', { name: common.ui.seeAll, exact: true }).click();
            await expect(page.locator('[data-food-group="dishes"]')).toBeVisible();
          }
          await page
            .locator('.food-group')
            .first()
            .screenshot({ path: info.outputPath('food.png') });
          await expect(page.locator('.monument-grid article')).toHaveCount(content.monuments.items.length);
          const filter = page.getByRole('checkbox', { name: common.ui.unescoOnly });
          await filter.focus();
          await page.keyboard.press('Space');
          await expect(page.locator('.monument-grid article')).toHaveCount(country === 'tunisia' ? 7 : 3);
          await expect(page.locator('#monuments output')).toContainText(
            country === 'tunisia' ? '7 / 18' : '3 / 14',
          );
          await page.keyboard.press('Space');
          await expect(page.locator('.monument-grid article')).toHaveCount(country === 'tunisia' ? 18 : 14);
          await page.locator('.country-section-nav a[href$="#history"]').click();
          await expect(page.locator('.country-section-nav [aria-current]')).toHaveAttribute(
            'href',
            /#history$/,
          );
          if (reducedMotion === 'reduce')
            expect(
              await page.locator('.timeline-line').evaluate((element) => getComputedStyle(element).transform),
            ).toBe('none');
          await page.locator('.country-timeline').screenshot({ path: info.outputPath('timeline.png') });
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
          expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
          expect(errors).toEqual([]);
        });
      });
    }
  }

  test(
    country + ' timeline responds to live motion changes and mobile/desktop resizing',
    async ({ page }) => {
      await page.goto(`/ar/${country}#history`);
      await expect(page.locator('.timeline-track li:visible')).toHaveCount(10);
      await page.locator('.timeline-track li').nth(7).scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          page
            .locator('.timeline-line')
            .evaluate((element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m22),
        )
        .toBeGreaterThan(0.2);
      expect(
        await page
          .locator('.timeline-line')
          .evaluate((element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m22),
      ).toBeLessThan(1);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect(page.locator('.timeline-line')).not.toHaveAttribute('style', /scaleY\(0/);
      expect(
        await page.locator('.timeline-line').evaluate((element) => getComputedStyle(element).transform),
      ).toBe('none');
      await page.setViewportSize({ width: 360, height: 900 });
      await expect(page.locator('.wear-accordions details')).toHaveCount(4);
      await page.setViewportSize({ width: 1280, height: 1080 });
      await expect(page.locator('#wear [role="tab"]')).toHaveCount(4);
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      const card = page.locator('.wear-grid .info-card').first();
      await card.hover();
      await expect
        .poll(() =>
          card.evaluate((element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42),
        )
        .toBeLessThan(-3);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect.poll(() => card.evaluate((element) => getComputedStyle(element).transform)).toBe('none');
      await page.goto(`/ar/${country}#monuments`);
      await expect(page.locator('.monument-grid article')).toHaveCount(country === 'tunisia' ? 18 : 14);
      await expect(page.locator('#monuments')).toBeFocused();
      await expect(page.locator('#monuments h2')).toBeInViewport();
      await page.locator('.country-continue a').last().click();
      await expect(page).toHaveURL('/ar/common-grounds');
      await expect(page.locator('.country-details')).toHaveCount(0);
    },
  );
}

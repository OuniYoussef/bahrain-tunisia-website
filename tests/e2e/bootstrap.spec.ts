import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test.describe(reducedMotion, () => {
    test.use({ reducedMotion });

    test('production entry loads accessibly without browser errors or overflow', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error' || message.type() === 'warning') errors.push(message.text());
      });

      const response = await page.goto('/');
      expect(response?.ok()).toBe(true);
      await page.waitForLoadState('networkidle');
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      expect(errors).toEqual([]);
    });
  });
}

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import en from '../../src/content/locales/en/admin.json' with { type: 'json' };
import fr from '../../src/content/locales/fr/admin.json' with { type: 'json' };
import ar from '../../src/content/locales/ar/admin.json' with { type: 'json' };
import { adminFixture } from './admin-fixture';
import { mkdir } from 'node:fs/promises';
for (const [lang, c] of Object.entries({ en, fr, ar })) {
  for (const reducedMotion of ['reduce', 'no-preference'] as const) {
    test(`${lang} ${reducedMotion} configured login and mock guard`, async ({ page }, testInfo) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => {
        if (m.type() === 'warning') errors.push(m.text());
      });
      await page.emulateMedia({ reducedMotion });
      let privilegedReads = 0;
      await page.route('https://admin-test.supabase.co/**', async (route) => {
        const url = route.request().url();
        if (/stories|reports|newsletter_subscribers|moderation_log|is_admin/.test(url)) privilegedReads++;
        if (url.includes('/auth/v1/token'))
          await route.fulfill({
            status: 400,
            json: { code: 'invalid_credentials', message: 'Invalid credentials' },
          });
        else await route.fulfill({ json: [] });
      });
      await page.goto(`http://127.0.0.1:5176/${lang}/admin/approved`);
      await expect(page.getByRole('heading', { level: 1, name: c.login.title })).toBeVisible();
      await expect(page.locator('.admin-auth').getByLabel(c.login.email, { exact: true })).toBeVisible();
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
      await expect(page.locator('html')).toHaveAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
      await page
        .locator('.admin-auth')
        .getByLabel(c.login.email, { exact: true })
        .fill('moderator@example.test');
      await page.getByLabel(c.login.password, { exact: true }).fill('incorrect-password');
      await page.getByRole('button', { name: c.login.submit, exact: true }).click();
      await expect(page.getByRole('alert').filter({ hasText: c.login.error })).toBeVisible();
      expect(privilegedReads).toBe(0);
      expect(await page.evaluate(() => Object.keys(localStorage).some((key) => key.startsWith('sb-')))).toBe(
        false,
      );
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      await page.screenshot({ path: testInfo.outputPath('admin-login.png'), fullPage: true });
      await page.goto(`http://127.0.0.1:5177/${lang}/admin`);
      await expect(page.getByText(c.ui.requiresSupabase)).toBeVisible();
      await expect(page.getByLabel(c.login.password, { exact: true })).toHaveCount(0);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(errors).toEqual([]);
    });
  }
}

for (const enrolled of [true, false]) {
  test(`MFA ${enrolled ? 'verify' : 'enrol'} gates dashboard actions and clears on sign out`, async ({
    page,
  }, testInfo) => {
    const backend = await adminFixture(page, enrolled);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('http://127.0.0.1:5176/en/admin');
    await page.locator('.admin-auth').getByLabel(en.login.email, { exact: true }).fill('mod@example.test');
    await page.getByLabel(en.login.password, { exact: true }).fill('test-password');
    await page.getByRole('button', { name: en.login.submit, exact: true }).click();
    if (!enrolled) {
      await page.getByRole('button', { name: en.mfa.enrollTitle, exact: true }).click();
      await expect(page.getByText('TESTONLYSECRET')).toBeVisible();
      await expect(page.getByRole('img', { name: en.mfa.enrollTitle })).toBeVisible();
    }
    await expect(page.getByLabel(en.mfa.code, { exact: true })).toBeVisible();
    expect(backend.reads()).toBe(0);
    await page.getByLabel(en.mfa.code, { exact: true }).fill('123456');
    await page.getByRole('button', { name: en.mfa.verify, exact: true }).click();
    await expect(page.getByRole('heading', { name: en.meta.title, exact: true })).toBeVisible();
    await expect(page.getByText('A shared afternoon')).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath('admin-dashboard.png'), fullPage: true });
    await page.getByRole('button', { name: en.ui.selectStory }).focus();
    await page.keyboard.press('r');
    await page.getByLabel(en.queue.rejectReason).fill('Private moderation note');
    await page.getByRole('button', { name: en.ui.confirm, exact: true }).click();
    await expect(page.locator('dialog[open]').getByText('Private moderation note')).toBeVisible();
    expect(backend.actions[0]).toMatchObject({ action: 'reject', note: 'Private moderation note' });
    await page.keyboard.press('Escape');
    await page.getByRole('link', { name: en.nav.alerts, exact: true }).click();
    await page
      .getByLabel(`${en.alerts.message} — ${en.languages.en}`, { exact: true })
      .fill('An English alert');
    await page.getByLabel(`${en.alerts.message} — ${en.languages.fr}`, { exact: true }).fill('Une alerte');
    await page.getByLabel(`${en.alerts.message} — ${en.languages.ar}`, { exact: true }).fill('تنبيه');
    await expect(page.locator('.admin-preview').first()).toContainText('An English alert');
    await page.getByRole('button', { name: en.alerts.save, exact: true }).click();
    await expect(page.locator('.admin-form output')).toHaveText(en.ui.saved);
    await page.getByRole('button', { name: en.nav.signOut, exact: true }).click();
    await expect(page.getByLabel(en.login.password, { exact: true })).toBeVisible();
    await expect(page.locator('.admin-layout')).toHaveCount(0);
    expect(await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('sb-')))).toEqual(
      [],
    );
  });
}

test('aal2 non-admin is denied; authenticated idle session expires', async ({ page }) => {
  await adminFixture(page, true, false);
  await page.goto('http://127.0.0.1:5176/en/admin');
  await page.locator('.admin-auth').getByLabel(en.login.email, { exact: true }).fill('mod@example.test');
  await page.getByLabel(en.login.password, { exact: true }).fill('test-password');
  await page.getByRole('button', { name: en.login.submit, exact: true }).click();
  await page.getByLabel(en.mfa.code, { exact: true }).fill('123456');
  await page.getByRole('button', { name: en.mfa.verify, exact: true }).click();
  await expect(page.getByText(en.ui.denied)).toBeVisible();
  await page.unrouteAll();
  await adminFixture(page);
  await page.locator('.admin-auth').getByLabel(en.login.email, { exact: true }).fill('mod@example.test');
  await page.getByLabel(en.login.password, { exact: true }).fill('test-password');
  await page.getByRole('button', { name: en.login.submit, exact: true }).click();
  await page.getByLabel(en.mfa.code, { exact: true }).fill('123456');
  await page.getByRole('button', { name: en.mfa.verify, exact: true }).click();
  await expect(page.locator('.admin-layout')).toBeVisible();
  await page.clock.install();
  await page.clock.fastForward(30 * 60 * 1000 + 1000);
  await expect(page.getByText(en.ui.idle)).toBeVisible();
  await expect(page.locator('.admin-layout')).toHaveCount(0);
});

for (const [lang, c] of Object.entries({ en, fr, ar })) {
  test(`${lang} dashboard navigation and RTL`, async ({ page }, testInfo) => {
    await adminFixture(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`http://127.0.0.1:5176/${lang}/admin`);
    await page.locator('.admin-auth').getByLabel(c.login.email, { exact: true }).fill('mod@example.test');
    await page.getByLabel(c.login.password, { exact: true }).fill('test-password');
    await page.getByRole('button', { name: c.login.submit, exact: true }).click();
    await page.getByLabel(c.mfa.code, { exact: true }).fill('123456');
    await page.getByRole('button', { name: c.mfa.verify, exact: true }).click();
    await expect(page.locator('.admin-layout')).toBeVisible();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (['warning', 'error'].includes(message.type())) errors.push(message.text());
    });
    await mkdir('test-results/screens', { recursive: true });
    for (const section of ['pending', 'approved', 'rejected', 'reports', 'alerts', 'newsletter'] as const) {
      await page.getByRole('link', { name: c.nav[section], exact: true }).click();
      await expect(page.locator('.admin-content > section > h2')).toBeVisible();
      await page.waitForLoadState('networkidle');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      await page.screenshot({
        path: `test-results/screens/${lang}-authenticated-admin-${section}-${page.viewportSize()!.width}.png`,
        fullPage: true,
      });
    }
    expect(errors).toEqual([]);
    await page.getByRole('link', { name: c.nav.pending, exact: true }).click();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath('dashboard-localised.png'), fullPage: true });
  });
}

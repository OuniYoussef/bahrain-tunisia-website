import { expect, it } from 'vitest';
import { loadNamespace } from './content';
import { dir, intlTags, localizePath, savedLocale } from './config';
it('deduplicates lazy namespace promises and separates locale caches', async () => {
  const en = loadNamespace('en', 'common');
  expect(loadNamespace('en', 'common')).toBe(en);
  const ar = loadNamespace('ar', 'common');
  expect(ar).not.toBe(en);
  expect((await ar).nav.united).not.toBe((await en).nav.united);
});
it('uses English when storage is empty or invalid, never browser language', () => {
  localStorage.removeItem('bt.locale');
  expect(savedLocale()).toBe('en');
  localStorage.setItem('bt.locale', 'de');
  expect(savedLocale()).toBe('en');
  localStorage.setItem('bt.locale', 'ar');
  expect(savedLocale()).toBe('ar');
  localStorage.removeItem('bt.locale');
  expect(dir('ar')).toBe('rtl');
  expect(dir('fr')).toBe('ltr');
  expect(intlTags.ar).toBe('ar-u-nu-latn');
  expect(localizePath('/fr/common-grounds/sea', 'ar')).toBe('/ar/common-grounds/sea');
});

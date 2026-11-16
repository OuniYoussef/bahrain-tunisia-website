import { DEFAULT_LOCALE, intlTags, type Locale } from './config';
export function t(template: string, vars: Record<string, string | number> = {}) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.hasOwn(vars, key) ? String(vars[key]) : match,
  );
}
export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };
export function plural(forms: PluralForms, count: number, locale: Locale = DEFAULT_LOCALE) {
  return t(forms[new Intl.PluralRules(locale).select(count)] ?? forms.other, {
    count: formatNumber(count, locale),
  });
}
export function formatNumber(
  value: number,
  locale: Locale = DEFAULT_LOCALE,
  options?: Intl.NumberFormatOptions,
) {
  return new Intl.NumberFormat(intlTags[locale], options).format(value);
}
export function formatDate(
  value: Date | number,
  locale: Locale = DEFAULT_LOCALE,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
) {
  return new Intl.DateTimeFormat(intlTags[locale], options).format(value);
}

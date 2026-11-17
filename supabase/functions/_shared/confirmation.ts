import en from '../../../src/content/locales/en/common.json' with { type: 'json' };
import fr from '../../../src/content/locales/fr/common.json' with { type: 'json' };
import ar from '../../../src/content/locales/ar/common.json' with { type: 'json' };
const escape = (s: string) =>
  s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
export function unsubscribeConfirmation() {
  return `<!doctype html><html lang="en"><meta charset="utf-8"><title>${escape(en.footer.newsletter.unsubscribed)}</title><p>${escape(en.footer.newsletter.unsubscribed)}</p><p lang="fr">${escape(fr.footer.newsletter.unsubscribed)}</p><p lang="ar" dir="rtl">${escape(ar.footer.newsletter.unsubscribed)}</p></html>`;
}

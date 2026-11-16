# Internationalisation and RTL

## Locales
| Code | Language | Dir | `Intl` tag | Display font | Body font |
|---|---|---|---|---|---|
| `en` (default) | English | ltr | `en` | Fraunces | Readex Pro |
| `fr` | Français | ltr | `fr` | Fraunces | Readex Pro |
| `ar` | العربية | rtl | `ar-u-nu-latn` (Western digits) | Amiri | Readex Pro (Arabic) |

- URL prefix is mandatory: `/en/...`, `/fr/...`, `/ar/...`. `/` redirects to the saved locale or `en`.
  Never infer the language from the browser (English must be the default).
- Language switcher shows native names (`English`, `Français`, `العربية`) as a constant (not translated),
  marks the current one with `aria-current="true"`, each link has `lang` and `hreflang`.
- On change: keep path + query + hash, save `localStorage['bt.locale']`, update `<html lang dir>`,
  move focus to `<h1>` after navigation, announce nothing else.
- `<link rel="alternate" hreflang>` for en/fr/ar + `x-default` (→ en) on every page (also prerendered).

## Content rules
- English JSON is the source. When you add or change a string: edit `en`, then `fr` and `ar` (same keys),
  run `npm run content:check`. Never leave English text inside FR/AR files.
- Interpolation: `{name}` placeholders; plural objects `{zero,one,two,few,many,other}` (Arabic uses all six).
- Proper nouns already localised (e.g. Sidi Bou Saïd / سيدي بوسعيد). Transliterations (`say`) stay Latin in
  every locale; the `script` field always shows Arabic script.
- Dates are written in the content (historical dates are free text like "c. 1100 BC"); do not reformat them.
  Use `Intl.DateTimeFormat` only for dynamic dates (Vault posts), with `dateStyle: 'medium'`.
- Arabic month names: Tunisia page uses Maghrebi names (جانفي، أفريل، جويلية، أوت), Bahrain page Gulf names
  (يناير، أبريل، يوليو، أغسطس). This is intentional (see DECISIONS D-011).
- IEEE fixed English strings (meta-nav labels, `© Copyright {year} IEEE – All rights reserved.`, IEEE
  descriptor) stay English in all locales, wrapped in `lang="en" dir="ltr"`.

## RTL implementation
- `dir="rtl"` on `<html>`; Tailwind 4 logical utilities: `ms-* me-* ps-* pe-* start-* end-* text-start text-end
  border-s border-e rounded-s-* rounded-e-*`. Use `rtl:` / `ltr:` variants only for exceptions.
- Icons that indicate direction (arrows, chevrons, "next/previous") flip with `rtl:-scale-x-100`.
  Icons that represent real objects (play, external link, heart, search) do not flip.
- Slide deck: "next" goes toward the reading end; arrow keys: in RTL `ArrowLeft` = next, `ArrowRight` = previous;
  swipe direction mirrors too. Progress bar fills from the start side.
- Horizontal scrollers: `scroll-snap` works natively in RTL; JS scroll positions use `scrollLeft` which is
  negative in RTL in modern browsers; prefer `element.scrollBy({ left: dirSign() * amount })`.
- Numbers, Latin words, emails, URLs inside Arabic text: wrap in `<bdi>` when user-generated (Vault) and use
  `dir="auto"` on user text blocks so mixed-language stories render correctly.
- **Not mirrored on purpose** (geography): United hero halves (Tunisia left/west, Bahrain right/east), maps,
  footer skyline, comparison table column order (Tunisia then Bahrain follows reading order — this one *does*
  follow the document direction like any table).
- Text alignment start, never justify (Arabic justification without kashida looks poor).

## Typography per script
- `:lang(ar) { --font-display: 'Amiri', serif; }` body size bump to 1.125rem, line-height 1.85, headings 1.3.
- No `uppercase`, no `letter-spacing`, no `font-style: italic` on Arabic (Fraunces italic emphasis words become
  colour emphasis in Arabic).
- French: content already uses narrow no-break spaces before `: ; ! ?`; keep `white-space` normal.
- Line length: max 70ch Latin; ~60ch Arabic.

## Testing
Playwright runs every route in all three locales and asserts: `html[lang][dir]` correct, no horizontal overflow
at 360px, no untranslated EN strings in FR/AR (check that `document.body.innerText` of FR/AR differs from EN),
icons flipped where expected, keyboard order follows visual order.

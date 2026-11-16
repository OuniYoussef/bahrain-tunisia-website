# Project brief

## Context
An IEEE student exchange between Tunisian and Bahraini universities. The website introduces each country
and celebrates the bond between them ("Two Nations. One Shared Spirit."). It is published as an IEEE
website, so it must follow the IEEE Global Page Elements and Branding Requirements (`IEEE_BRANDING.md`).
The client-approved copy for every page lives in `src/content/locales/en/*.json` (transcribed from the three
content briefs) with French and Arabic translations. Do not rewrite approved copy; only add UI micro-copy.

## Audience
Students and staff of both universities, IEEE members, visitors curious about Tunisia and Bahrain.
Mobile first (most traffic from phones), but the desktop experience must feel premium and editorial.

## Languages
English (default), French, Arabic (RTL). Language switch in the header on every page.

## Pages
| Route | Page | Spec |
|---|---|---|
| `/:lang` | **United** (landing): split hero (Tunisian jasmine left / Bahraini Al Razji right), journey map, Two Nations at a Glance table, Connecting Points grid, teasers to Common Grounds and Vault | `pages/united.md` |
| `/:lang/tunisia` | **Tunisia**: Welcome (facts, words, did you know), Destinations (6 featured + more + map + Bizerte spotlight), Traditional Wear, Nature, Cities, History (timeline + figures), Celebrations, Food, Monuments | `pages/country.md` |
| `/:lang/bahrain` | **Bahrain**: same frame + nicknames, pearl & maritime heritage, crafts, Ramadan traditions, Arabic coffee | `pages/country.md` |
| `/:lang/common-grounds/:slideId?` | **Common Grounds Media Matrix**: 24 cinematic slides comparing the countries (images now, optional video per slide later) | `pages/common-grounds.md` |
| `/:lang/vault` | **Community Experience Vault**: moderated wall of visitor stories/photos + share form | `pages/vault.md` |
| `/:lang/contact`, `/:lang/credits` | Contact (required by IEEE footer), photo credits (licences) | `pages/global-shell.md` |
| `/:lang/admin` | Moderation dashboard (not linked, noindex) | `pages/admin.md` |

## Features
- Trilingual content with full RTL support, per-script typography.
- Premium GSAP motion (scroll stories, split reveals, map route drawing, pinned destination showcase,
  timeline drawing, skyline rise, slide transitions), always with a reduced-motion fallback.
- Interactive SVG maps of Tunisia and Bahrain with pins linked to destination cards.
- Media Matrix with keyboard/swipe/wheel navigation, deep links, index, optional video slots.
- Vault backed by Supabase: visitors submit stories with up to 5 photos (compressed to WebP in the browser),
  every post is approved by an admin before it appears; hearts; report button; filters; infinite scroll.
- Admin dashboard with email+password + TOTP MFA, moderation queue, reports, site alerts, newsletter export.
- Newsletter sign-up stored in Supabase (consent recorded). Contact via email link.
- SEO: per-route meta, hreflang, sitemap, OG images; security headers; static hosting anywhere.

## Non-goals
No user accounts for visitors. No comments. No CMS. No dark-mode toggle (dark sections are part of the design).
No analytics or tracking cookies (IEEE cookie banner slot is prepared if IEEE requires it). No server rendering.

## Success criteria
Looks distinctive and professional (not template-like) · Lighthouse ≥ 90 on Performance, Accessibility,
Best Practices and SEO (mobile) · zero axe violations · all three languages complete · IEEE elements present ·
Vault is abuse-resistant and nothing appears publicly without approval.

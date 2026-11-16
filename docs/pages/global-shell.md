# Global shell (every page)

Order in `RootLayout`: `SkipLink` → `MetaNav` → `SiteHeader` → `AlertBanner` → `<main id="main" tabIndex={-1}>` →
`SiteFooter` → `CookieConsentSlot`. `PageTransition` wraps the outlet.

## SkipLink
First focusable element, visible on focus (top-start, ink pill). Text: `common.a11y.skipToContent`. Targets `#main`.

## MetaNav (IEEE) — see `IEEE_BRANDING.md §1`
36px ink bar, Open Sans 12.5px, English only, LTR always. Scrollable on mobile.

## SiteHeader
- Height 76px desktop / 64px mobile. Pearl background with 1px `--color-line` bottom border; on pages with a dark
  hero it starts **transparent over the hero with white text**, then becomes solid pearl after 24px scroll
  (class toggle, CSS transition 250ms). Sticky (`position: sticky; top: 0`), hides on scroll down after 400px and
  shows on scroll up (transform only; disabled with reduced motion → always visible).
- Layout (fixed positions per IEEE, all locales): start = `SiteIdentifier` (wordmark: "IEEE" small caps line +
  `common.site.identifierLine2`), centre = `MainNav`, end = `LanguageSwitcher` + `IeeeMasterBrand` (min 100×33px,
  smaller than identifier). On < lg: identifier, Master Brand, menu button (`common.a11y.openMenu`).
- `MainNav` items (from `common.nav`): United, Tunisia, Bahrain, Common Grounds, Experience Vault. Active item
  `aria-current="page"` with a 2px `--accent` underline that slides between items (CSS anchor or Flip).
- `MobileNav`: full-height `<dialog>` sheet from the end side (mirrors in RTL), large display-font links with
  index numbers 01–05, language switcher, social links, and the two country flags at the bottom; focus trapped;
  `Esc` closes; link click closes and navigates.

## LanguageSwitcher
Compact segmented control `EN · FR · ع` on desktop (full names in a popover list), full list in the mobile sheet.
`aria-label={common.a11y.languageSwitcher}`; each option is a link to the same path in the other locale, with
`lang`, `hreflang` and `aria-current`. Preserves query and hash.

## AlertBanner
Under the header. Shows active `site_alerts` (newest first, max 1 visible + "1 more" toggle). Message in current
locale, optional link, dismiss button (`common.alerts.dismiss`), level colours: info = ieee tint, warning = gold-deep
on sand-100, critical = crimson bg/white text with `role="alert"`. Cached 5 minutes; hidden when none.

## SiteFooter (ink background, full width)
1. **Skyline band**: inline `skyline-tunisia-bahrain.svg` coloured `--color-ink`, sitting on top of the footer so the
   landmarks rise from it (negative margin so the band overlaps the previous section's bottom by its height).
   Hover/focus on a landmark shows a small tooltip with `common.footer.skyline.landmarks[id]` (desktop only;
   the whole SVG is `aria-hidden`, a visually hidden list provides the names). Animations in `MOTION.md`.
2. **Newsletter panel** (pearl-on-ink card): `common.footer.newsletter.title/text`, email input + consent checkbox +
   Turnstile (managed, appears on focus) + submit. States: submitting, success, already, invalid, error, unavailable
   (no backend → shows `unavailable` text, form disabled). Calls `vaultApi.subscribe`.
3. **Link columns**: Quick Links (United Page, Discover Tunisia, Discover Bahrain), Explore (Common Grounds Media
   Matrix, Community Experience Vault), Connect (Contact, Follow us → social icons from env vars; hide missing ones).
4. **Organised by** line (`common.footer.organisedBy`) + slots for organising IEEE units' logos (from `public/brand/units/*.svg` if present).
5. **IEEE block** (separated by a hairline): required admin links in order (Home first) + Sitemap + Photo credits;
   then the exact copyright line and descriptor in English (`lang="en" dir="ltr"`); then `common.footer.projectLine`.
6. Back-to-top button (end side).

## Contact page (`/:lang/contact`)
Small editorial page: eyebrow + h1 (`common.contact`), text, big mailto button (`VITE_CONTACT_EMAIL`), social links,
response note, a decorative split image (`tn-sbs-blue-door` | `bh-craft-rawazin`, `alt=""`). Required by IEEE footer.

## Credits page (`/:lang/credits`)
h1 + intro (`common.credits`), map/flag/artwork line, then a responsive table (or cards on mobile) of every photo in
`images.generated.json`: thumbnail (thumb width), alt text (current locale), author, licence (linked), source link.
Anchors `#<imageId>`. Empty state if the generated file is empty.

## 404 page
Dark section with the round-arch motif framing a closed blue door photo (`tn-sbs-blue-door`), `common.notFound`
title/text, CTA to `/:lang`. `<meta name="robots" content="noindex">`.

## Head / SEO per page (React 19 metadata tags in components)
`<title>` = page `meta.title` through `common.site.titleTemplate` (United uses `common.site.defaultTitle`),
`<meta name="description">`, canonical (`VITE_SITE_URL` + path), hreflang alternates (en/fr/ar/x-default),
OG/Twitter tags (`og:image` → `/og/<page>-<lang>.jpg` generated in Prompt 12). `theme-color` `#0B1B2B`.

## Acceptance
Keyboard: Tab order SkipLink → meta-nav → header → main → footer. Header never covers focused elements
(`scroll-margin-top` on sections). Works at 360px with no horizontal scroll. In AR the nav order mirrors; IEEE
elements stay put; the footer reads RTL except the IEEE English lines.

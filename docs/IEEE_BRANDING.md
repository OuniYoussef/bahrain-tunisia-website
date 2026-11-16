# IEEE global page elements — implementation spec

Source: IEEE Brand Experience, "Global Page Elements and Branding Requirements"
(https://brand-experience.ieee.org/guidelines/digital/style-guide/global-page-element-and-branding-requirements/).
These are **requirements** for an IEEE website. Implement exactly; flag anything uncertain in DECISIONS.md.

## 1. Meta-navigation bar — `components/layout/MetaNav.tsx`
- Outside/above the site header, full width, height 36px (allowed 30–40), `bg-ink`, light text.
- `<nav aria-label="IEEE websites" lang="en" dir="ltr">` — always English, always LTR, in every locale.
- Left, flush to the left edge, **in this order**, separated by a vertical bar `|` (`aria-hidden`):
  1. `IEEE.org` → https://www.ieee.org
  2. `IEEE <i>Xplore</i>®` → https://ieeexplore.ieee.org (italic "Xplore" + ® symbol)
  3. `IEEE Standards` → https://standards.ieee.org
  4. `IEEE Spectrum` → https://spectrum.ieee.org
  5. `More Sites` → https://www.ieee.org/sitemap
- Right: `Join IEEE` → https://www.ieee.org/join, then `Donate` → https://www.ieee.org/give.
- Open Sans, ≥ 12px (use 12.5px), underline on hover/focus only, **visited colour identical** to normal.
- Mobile (< 640px): single row, horizontally scrollable with fading edges; keep all links reachable.
  Links open in the same window (they are IEEE network links).

## 2. IEEE Master Brand — `components/layout/IeeeMasterBrand.tsx`
- Required on every page, **upper-right of the header**, within the top third of the screen.
- Black or white version only (header on light → black; on dark/hero overlay → white). Blue is reserved for IEEE.org.
- Minimum 100 × 33 px and **smaller than the site identifier**. Clear space ≥ half the height of the letters.
- `alt="IEEE"`, links to `https://www.ieee.org`, same window. No shadows, no effects, never as background/watermark,
  no white box behind the diamond.
- Files: `public/brand/ieee-master-brand-white.svg` / `-black.svg`. Until added, fall back to the
  `*.PLACEHOLDER.svg` files (component checks existence at build time via `import.meta.glob`).

## 3. Site identifier — `components/layout/SiteIdentifier.tsx`
- Upper-left of the header, links to the site home (`/:lang`).
- Brand-aligned **wordmark** (not a custom logo): line 1 `IEEE` (uppercase, may be 75% height on its own line),
  line 2 `Bahrain × Tunisia` (localised name from `common.site.identifierLine2`). 1–3 lines, IEEE blue / black /
  white text only, at most two accent colours from the IEEE palette.
- IEEE specifies **Formata Medium** for wordmarks (commercial font). Until IEEE supplies an approved wordmark
  (`public/brand/site-identifier.svg`, request via exd-team@ieee.org), render text in Open Sans 600 as a
  placeholder and keep it larger than the Master Brand. Replace with the SVG when available.
- Site purpose must be clear: the hero headline + `common.site.purpose` (visually hidden `<p>` under the
  identifier for screen readers, visible in the footer "about" line).

## 4. Footer — `components/layout/SiteFooter.tsx`
- Visually separated (different background: ink) and full width.
- Required administrative links (labels localised from `common.footer.ieeeLinks`, URLs fixed), **Home first**:
  1. Home → `/:lang` 2. Contact → `/:lang/contact` 3. Accessibility → https://www.ieee.org/accessibility_statement.html
  4. Nondiscrimination Policy → https://www.ieee.org/about/corporate/governance/p9-26.html
  5. IEEE Ethics Reporting → http://www.ieee-ethics-reporting.org 6. Terms & Disclosures →
  https://www.ieee.org/about/help/site_terms_conditions.html 7. IEEE Privacy Policy → https://privacy.ieee.org/policies
  8. (optional) Sitemap → `/sitemap.xml` · Photo credits → `/:lang/credits`
- Required text, **exact wording, English, `lang="en" dir="ltr"`**:
  - `© Copyright {currentYear} IEEE – All rights reserved.` (en dash; year computed at runtime → "2026" now)
  - `A public charity, IEEE is the world's largest technical professional organization dedicated to advancing technology for the benefit of humanity.`
- Do not write our own privacy policy; link to IEEE's. The Vault privacy note links to the IEEE Privacy Policy.
- The brief's project line ("2026 Bahrain × Tunisia") is shown as `common.footer.projectLine` (no second
  "All rights reserved"; the IEEE line is the copyright statement). See DECISIONS D-007.

## 5. Privacy & cookies
- The site sets **no tracking/analytics cookies**. Storage used: `localStorage` for language preference, Vault
  device id (one heart per post), admin session (Supabase Auth), Cloudflare Turnstile (security). All strictly necessary.
- IEEE requires a cookie banner via the **IEEE Cookie Script Governance Program**. `CookieConsentSlot` loads
  `VITE_IEEE_COOKIE_SCRIPT_URL` (async, once) when provided; add its host to the CSP. Request it before launch.

## 6. Search
Not used (optional per IEEE). If added later: label + "Search" button text, magnifier labelled "search".

## 7. Favicon
Use the IEEE favicon file set (https://brand-experience.ieee.org/download/ieee-favicon-2/?wpdmdl=8949):
`.ico`, iOS/Android touch icons → `public/favicon/` and link tags in `index.html`. Placeholder until downloaded.

## 8. Home page layout
- Key content near the top; clear hierarchy; short paragraphs.
- **Emergency alerts area**: `AlertBanner` directly under the header on every page, driven by Supabase
  `site_alerts` (admin can post/remove instantly) or empty in mock mode. Levels info/warning/critical,
  dismissible (remember per alert id in `sessionStorage`), `role="region"` + `aria-label`, critical uses `role="alert"`.
- **Carousels**: user-controlled. The Media Matrix never auto-advances by default; if the visitor presses Play,
  each slide stays ≥ 8 s, with Pause/Play visible, and videos have mute controls. Controls meet contrast.

## 9. Reviews & registration (team actions, not code)
New IEEE sites are reviewed by the IEEE Experience Design team at **wireframe**, **visual design** and
**pre-launch beta URL** stages (website review request form), and should be registered via the Website and Social
Media Site Registration Form. Contact: exd-team@ieee.org. Plan these into the schedule.

## RTL note
IEEE positions (identifier upper-left, Master Brand upper-right, meta-nav links left) are kept identical in Arabic
for brand consistency; navigation items between them follow RTL order. Recorded as DECISIONS D-006 — confirm with IEEE at review.

## Colours
IEEE Blue `#00629B` (PMS 3015 C) with approved tints 80% `#007DAF`, 60% `#5B9CC3`, 40% `#95BCD6`, 20% `#CADCEA`.
The site uses IEEE blue for brand chrome (identifier, links, focus) and the expanded-palette principle
("cultural distinction is warranted") for the Tunisia/Bahrain accents.

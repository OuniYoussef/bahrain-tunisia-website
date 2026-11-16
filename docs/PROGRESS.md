# Progress

> Codex: read this first in every session. Update it at the end of every prompt: tick boxes, fill "Notes",
> move unfinished items to "Known issues / follow-ups", and set "Next prompt".

## Current state
- P0 bootstrap implemented: Vite/React/TypeScript app, tooling, 15 project skills, folder skeleton, environment
  example and content safety net. Supplied content, scripts, SVGs and brand assets are preserved.
- P1 foundation implemented: design tokens, script-specific fonts, UI/media/motion primitives and a
  development-only `/dev/styleguide`.
- P2 implemented: lazy trilingual routing, IEEE header/footer, animated skyline, metadata, Contact/Credits/404,
  locale formatting and validated optional environment settings. Feature pages intentionally contain only their h1.
- P3 implemented: United split hero, editorial welcome, scroll-drawn journey map, comparison table,
  twelve connecting cards and two feature teasers, with trilingual content and reduced-motion support.
- Next prompt: **P4 — Country frame + Tunisia part 1**

## Checklist
### P0 — Bootstrap & tooling
- [x] git repo, Vite React TS scaffold merged without overwriting kit files
- [x] dependencies installed (runtime + dev), versions recorded below
- [x] agent skills installed in `.agents/skills/` (frontend-design, web-design-guidelines, vercel-react-best-practices, vercel-composition-patterns, gsap-*, supabase, supabase-postgres-best-practices, webapp-testing)
- [x] Tailwind 4 + font packages + path alias `@/` + strict TS + oxlint + Prettier configured (font imports/subsets in P1)
- [x] npm scripts: dev, build, preview, typecheck, lint, format, format:check, test, test:e2e, content:check, images:fetch, audit, verify
- [x] `.env.example`, `.gitignore`, folder skeleton per ARCHITECTURE.md
- [x] images fetched; `report.html` previews checked and spot-reviewed (editorial follow-ups below)
- [x] `npm run verify` green; first commit
Notes:
- 2026-11-16: Node 24.21.0, npm 12.2.0; initialized `main` and merged create-vite 9.3.4 without replacing kit files.
- `npm run verify` and `npm run format:check` pass; content checker validates 8 namespaces × 3 locales,
  183 image ids and 58 referenced map pins. Vitest executes that checker as a child process.
- Offline image selftest passes, including its intentionally missing fixture; no selftest photos enter the repository.
- All 15 skills confirmed with `npx skills list`, including all 8 upstream GSAP skills. Skill files and lock are tracked.
- Upstream skill Markdown is preserved verbatim, including its whitespace; `git diff --check` is clean outside
  `.agents/` (which contains upstream trailing spaces and Markdown hard breaks).
- Oxlint warnings fail the command; strict TS also checks tooling and tests. A temporary invalid lint probe was rejected.
- `.env.example` separates the four social variables into valid assignments (D-021). Latest jsdom requires a newer
  Node minor than the project's requested engine floor (D-023).
- Production Chromium smoke/axe checks pass at 360/768/1280/1920px with both normal and reduced motion (8 tests),
  with no browser warnings/errors or horizontal overflow. The bootstrap has no interactive controls yet;
  full EN/FR/AR route, keyboard and RTL coverage starts with the app shell in P2.
- `npx playwright install chromium` completed: Chromium and headless shell 159.0.8154.6 (build 1255),
  plus FFmpeg build 1013. Playwright uses the installed Chromium channel.
- Production entry JavaScript is 68.62 kB gzip, below the 180 kB budget. Default and subpath Vite bases verified.
- Image run used `IMAGES_CONTACT=changeme@ieee.tn`: **170/183 resolved, 13 missing**, producing 503 WebPs
  (53.5 MiB), attribution credits and `selection.lock.json`. All 170 contact-sheet previews load successfully.
  The report remains at `scripts/images/report.html` (gitignored). Resolution does not establish subject suitability.

Missing image ids:
```text
tn-sweet-samsa
bh-dest-bahrain-wtc
bh-wear-thobe
bh-wear-bisht
bh-wear-thobe-nashal
bh-craft-bani-jamra
bh-craft-rawazin
bh-nature-palm-groves
bh-hist-hidaya-school
bh-mon-ain-umm-al-sujur
bh-mon-bu-maher
bh-food-muhammar
bh-food-mumawash
```

### P1 — Design system & primitives
- [x] tokens in `@theme`, fonts per script, base styles, focus ring, logical utilities
- [x] ui primitives (Button, Container, Section, SectionHeader, Eyebrow, Badge, Card, Dialog, Tabs, fields, VisuallyHidden, LiveRegion)
- [x] media components (ResponsiveImage + placeholder, ArchFrame, Flag, Pattern, Ornament, InlineSvg)
- [x] `src/lib/gsap.ts`, `motion/` helpers (SplitHeading, Reveal, Parallax)
- [x] `/dev/styleguide` route (dev only) showing everything in EN/FR/AR
- [x] typed image/srcset and media helpers; image/media/Dialog focus tests and contrast checks
Notes:
- 2026-11-16: All design-system colour, type, font, radius and shadow tokens are implemented. Fonts use
  only Latin, Latin Extended and Arabic subsets; the initial Latin display/body files are preloaded.
- Added ButtonLink, Sheet, compound Tabs, SegmentedControl/Pill, labelled form fields with hints/errors,
  textarea counter, UNESCO badges, Spinner/Skeleton, native dialog focus wrapping and nested scroll locks.
- Small `ContentProvider` + typed `useContent`/`useLocale` support P1; the full loader, locale URL handling,
  persistence and app shell were completed in P2. Styleguide samples use existing common/tunisia/images strings.
- ResponsiveImage uses the generated width candidates, intrinsic dimensions, focal points, lazy/priority
  loading, GSAP LQIP fade, localised alt text, credits and a patterned fallback for missing/failed images.
  El Djem was visually checked in the styleguide. The wider P0 photo-curation follow-up remains open.
- SVGs use a fixed raw-import registry and React nodes (no HTML injection); instance-prefixed ids preserve
  skyline masks, and original path ids remain in `data-svg-id` for scoped DrawSVG use.
- `npm run verify` and formatting checks pass: 46 unit/content/contrast tests. All 36 browser tests pass, covering
  EN/FR/AR at 360/768/1280/1920px, both motion preferences, axe, dialog/sheet keyboard paths, RTL arrows,
  screenshots, theme/direction changes, live motion changes and failed-image recovery.
- Production remains a minimal content-backed entry: 71.23 kB initial JS gzip; no styleguide route/code
  in its bundle. This was the P1 baseline before the P2 shell.
- Contrast: ink/pearl 16.00:1; muted/sand-100 4.60:1; gold-deep/pearl-glow 6.08:1;
  IEEE-40/ink focus 8.66:1. Form borders use muted (5.60:1 on pearl-glow), because decorative line is only
  1.39:1. Spec clarifications and the GSAP-only LQIP fade are recorded in D-024–D-027.

### P2 — i18n, routing & app shell
- [x] locale config, LocaleProvider, content loader, useContent, format utils (+ tests)
- [x] router with lazy routes, LocaleRedirect, NotFound, RouteError, ScrollRestoration
- [x] MetaNav, SiteHeader (identifier, nav, switcher, Master Brand), MobileNav, SkipLink
- [x] SiteFooter (skyline, newsletter UI, columns, IEEE block), AlertBanner (mock data), CookieConsentSlot
- [x] Contact + Credits pages; per-page head/meta + hreflang; PageTransition
Notes:
- 2026-11-16: Namespace promises are lazy and cached; React 19 `use()` reads EN-inferred content types.
  URL locales set html lang/dir and persist `bt.locale`; root redirect never infers browser language.
  Number/date formatting uses Western Arabic digits; tests cover Arabic plural counts 0, 1, 2, 3, 11 and 100.
- All architecture routes are lazy, including admin descendants and optional Matrix slide ids. Unknown slide ids
  replace to welcome; invalid locales render the English 404. Navigation preserves query/hash, restores scroll,
  offsets anchors and focuses h1. The arch transition covers before committing navigation and uncovers afterward.
- IEEE meta-navigation and the identifier/Master Brand retain physical positions in RTL; site navigation mirrors.
  Header overlay becomes solid after 24px, hides below 400px while scrolling down, and stays visible for keyboard
  focus or reduced motion. Mobile dialog is lazy, mirrors its end side, traps focus and closes with Escape.
- Skyline is inline trusted SVG with localised desktop hover/focus tooltips and a hidden landmark list.
  Landmarks rise palm-first, turbines pause off-screen/when the tab is hidden, and reduced motion stays static.
- Newsletter form stays disabled until P9, including with backend credentials. Alerts use a typed empty mock
  with a five-minute cache; rendering/dismissal/levels are ready for P9. Optional cookie script loads once.
- Contact hides unconfigured email/social links and explains unavailable contact details. Credits render all
  170 generated entries as responsive cards with attribution/source links and stable image-id anchors.
- React 19 metadata supplies title/description, canonical, four language alternatives, OG/Twitter and theme colour;
  admin, 404 and error screens are noindex. Actual OG files and the optional sitemap link remain P12.
- `npm run verify` passes: 62 unit/content/contrast tests. The existing 64-test browser suite passes across
  EN/FR/AR, 360/768/1280/1920px and both motion preferences. Added eight checks for header/live motion,
  keyboard skip navigation, transition/history, skyline tooltip dismissal and localised route-error recovery;
  all 12 focused navigation/error checks pass. The final 24-test route/axe sweep also passes (264 route
  visits), with no browser errors/warnings or horizontal overflow. There are now 72 browser tests in total.
- `node scripts/check-shell-base.mjs` passes an isolated `/exchange/` production build, checking redirects,
  translated navigation, canonical URLs, brand/photo assets, configured contact/social links and one-time
  cookie-script injection. The script keeps its generated build under ignored `node_modules/.cache/`.
- Measured Arabic landing request set: approximately **177 kB total initial JavaScript gzip** (including lazy
  shell/content/GSAP chunks), within 180 kB. Zod Mini validates optional settings; unused maps, images, motion
  plugins and the mobile dialog stay outside the initial route. Query provider/hooks are deferred until P9.
- Visual review covered the complete EN mobile and AR desktop shell; the skyline remains west-to-east.
  Spec clarifications are recorded in D-028–D-031.

### P3 — United page
- [x] split hero, welcome, journey map, glance table, connecting grid, teasers
Notes:
- 2026-11-16: Both flower photos load eagerly with high priority; mobile candidates stop at 1280px.
  Tunisia stays west/left (above on mobile), Bahrain east/right (below), including in Arabic. Desktop
  pointer/focus widening uses clipping and a translated seam; physical country arrows stay at the edges.
- Both ornaments draw, headings reveal by lines (Arabic never splits words), the regional route scrubs,
  halos pulse once and the distance counts to the content-backed 3,970 km. Reduced motion restores the
  complete route and final number. All motion uses scoped useGSAP/matchMedia with cleanup.
- Welcome uses the supplied first sentence and full paragraph. The 14-row table retains its caption,
  column/row headers and a keyboard-scrollable region with sticky topic cells. All twelve cards link to
  the specified Matrix slides; hero sharing preserves `?share=1`; teaser links use the requested routes.
- Pinned and visually reviewed four replacement photos (Razji, Tunisian tea, Bahraini majlis, luqaimat),
  with regenerated responsive files and credits. Seven card halves use graceful ornament placeholders:
  two missing photos (`bh-wear-bisht`, `bh-nature-palm-groves`) and five held in `src/content/image-review.json`.
- Landing JavaScript is approximately 176 KiB gzip (all initial requests, Arabic), below the 180 KiB
  automated budget. Hero metadata is immediate; other United photo metadata, map artwork and footer
  skyline load near the viewport. Build-time public environment validation retains the tested schema
  while excluding Zod from the browser. Subpath/configuration checks pass.
- `npm run verify` passes (62 unit/content/contrast tests). Playwright adds 44 United checks across
  EN/FR/AR, 360/768/1280/1920px, normal/reduced motion, axe, geography, keyboard CTAs/cards, table semantics,
  screenshots, live motion changes and the initial JS budget. The full regression run passed 112 cases;
  four styleguide selectors needed adaptation to the new picture wrapper. The final focused run passed
  all 48 United/styleguide cases, completing coverage of all 116 cases without browser errors/warnings.
  `npm run format:check`, `git diff --check` and the configured `/exchange/` base-path check also pass.
- Source-art and motion/layout decisions are documented in D-032–D-035. Hosted 4G LCP measurement remains
  part of P13; the local preview and bundle checks do not establish field LCP.

### P4 — Country frame + Tunisia part 1
- [ ] CountryPage frame + config + theming + SectionNav
- [ ] Welcome (hero, intro, facts, words, did you know)
- [ ] Destinations (map, pinned showcase/carousel, dialogs, more places, Bizerte spotlight)
Notes:

### P5 — Tunisia part 2
- [ ] Wear (tabs, regional), Nature (3 rows), Cities, History (timeline + figures), Celebrations, Food (+ products), Monuments
Notes:

### P6 — Bahrain
- [ ] Bahrain page with nicknames, crafts, jewellery note, pearl heritage, Ramadan traditions + chant, coffee, serrated/Sadu motifs
Notes:

### P7 — Common Grounds Media Matrix
- [ ] intro, deck, 4 layouts, navigation (keys/wheel/touch/buttons), URL sync, index, autoplay, video slot, a11y
Notes:

### P8 — Supabase backend
- [ ] migrations 0001–0003, seed, config.toml, storage buckets/policies
- [ ] Edge Functions: submit-story, react, report-post, subscribe, moderate (+ _shared, tests)
- [ ] SQL security tests; advisors clean; types generated; BACKEND setup notes verified
Notes:

### P9 — Vault frontend (+ newsletter & alerts wiring)
- [ ] vaultApi (supabase + mock), hooks, wall + filters + infinite + dialog + hearts + report
- [ ] share form + PhotoPicker + compression + Turnstile + success/error states
- [ ] newsletter + alerts wired to API
Notes:

### P10 — Admin dashboard
- [ ] login, MFA enrol/verify, guard, queue, approved/rejected, reports, alerts CRUD, newsletter export, idle logout
Notes:

### P11 — Motion & polish
- [ ] signature animations per MOTION.md, page transitions, micro-interactions, reduced-motion audit, perf pass
Notes:

### P12 — SEO, headers & hosting
- [ ] prerender-meta script (route HTML, sitemap, 404), OG images, robots, security headers, vercel.json/_redirects/_headers, GitHub Pages fallback
Notes:

### P13 — QA & hardening
- [ ] web-design-guidelines review, axe e2e, RTL/visual screenshots, Lighthouse ≥ 90, security checklist, bug fixes
Notes:

### P14 — Deployment & handover
- [ ] README, DEPLOYMENT.md verified end-to-end, IEEE review checklist, final cleanup
Notes:

## Installed versions

Recorded 2026-11-16 from the installed lockfile (Node 24.21.0; npm 12.2.0).

| Package | Installed version | Kind |
| --- | --- | --- |
| @fontsource-variable/fraunces | 5.3.0 | Runtime |
| @fontsource-variable/open-sans | 5.3.0 | Runtime |
| @fontsource-variable/readex-pro | 5.3.0 | Runtime |
| @fontsource-variable/reem-kufi | 5.3.0 | Runtime |
| @fontsource/amiri | 5.3.0 | Runtime |
| @gsap/react | 2.1.2 | Runtime |
| @hookform/resolvers | 7.0.6 | Runtime |
| @marsidev/react-turnstile | 1.6.3 | Runtime |
| @supabase/supabase-js | 2.119.0 | Runtime |
| @tanstack/react-query | 5.107.1 | Runtime |
| gsap | 3.15.1 | Runtime |
| lucide-react | 1.73.0 | Runtime |
| react | 19.3.1 | Runtime |
| react-dom | 19.3.1 | Runtime |
| react-hook-form | 7.92.0 | Runtime |
| react-router | 8.5.1 | Runtime |
| zod | 4.6.7 | Runtime |
| @axe-core/playwright | 4.14.0 | Development |
| @playwright/test | 1.65.1 | Development |
| @tailwindcss/vite | 4.3.5 | Development |
| @testing-library/jest-dom | 7.0.1 | Development |
| @testing-library/react | 16.3.3 | Development |
| @testing-library/user-event | 14.6.12 | Development |
| @types/node | 26.6.6 | Development |
| @types/react | 19.3.0 | Development |
| @types/react-dom | 19.3.0 | Development |
| @vitejs/plugin-react | 6.3.0 | Development |
| @vitest/coverage-v8 | 5.1.0 | Development |
| jsdom | 31.0.1 | Development |
| oxlint | 1.94.0 | Development |
| prettier | 3.10.1 | Development |
| prettier-plugin-tailwindcss | 0.8.1 | Development |
| sharp | 0.35.5 | Development |
| supabase | 3.1.0 | Development |
| tailwindcss | 4.3.5 | Development |
| typescript | 7.0.2 | Development |
| vite | 8.3.8 | Development |
| vitest | 5.1.0 | Development |

## Known issues / follow-ups
- **Review photo subjects before using them in pages.** The supplied resolver finds eligible licences but can rank
  unrelated subjects highly. P3 corrected `un-hero-razji`, `tn-drink-mint-tea`, `bh-fest-majlis` and
  `bh-food-luqaimat`. Source-title inspection still flags `tn-mon-sbeitla` (moth), `tn-food-lablabi` (bird),
  `bh-craft-sadu` (Berlin courthouse), `bh-nature-springs` (Beijing Olympics), `bh-nature-beach` (Swedish parliament),
  `bh-mon-saar` (Spanish river), `bh-fest-national-day` (Singapore fireworks), `bh-food-harees` (hare),
  `bh-product-dates` (Georgian lake) and `cg-oud` (bridge). These examples are not an exhaustive review.
  Review the complete local contact sheet, then curate `scripts/images/overrides.json` and rerun affected ids;
  the supplied scripts, manifest and overrides were preserved byte-for-byte in P0. The 13 missing ids above
  also need curated sources; ResponsiveImage's P1 fallback must handle them.
- United's five withheld selections need suitable replacements: `bh-hist-pearl-divers`,
  `tn-wear-silver-jewellery`, `bh-wear-pearls`, `bh-craft-aali-pottery`, `bh-fest-fijiri`.
  Remove their `image-review.json` holds only after reviewing replacement subjects. Nabeul's current
  image is a painting of pottery; prefer a workshop/wares photograph in the broader editorial pass.
- Use Node 22.22.2+, 24.15.0+ or 26+ for tests; the requested `>=22.12` engine alone does not cover latest jsdom.
- Official IEEE files needed: Master Brand (white/black), favicon set, approved site identifier wordmark, cookie script (if required).
- Organising IEEE units' names/logos for the footer "Organised by" strip.
- Real Vault stories from exchange participants to replace the 6 sample posts before launch.
- Optional: real videos for Common Grounds slides (see pages/common-grounds.md production notes).

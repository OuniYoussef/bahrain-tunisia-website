# Progress

> Codex: read this first in every session. Update it at the end of every prompt: tick boxes, fill "Notes",
> move unfinished items to "Known issues / follow-ups", and set "Next prompt".

## Current state
- P0 bootstrap implemented: Vite/React/TypeScript app, tooling, 15 project skills, folder skeleton, environment
  example and content safety net. Supplied content, scripts, SVGs and brand assets are preserved.
- P1 foundation implemented: design tokens, script-specific fonts, UI/media/motion primitives and a
  development-only `/dev/styleguide`.
- P2 implemented: lazy trilingual routing, IEEE header/footer, animated skyline, metadata, Contact/Credits/404,
  locale formatting and validated optional environment settings. Feature pages initially contained only their h1.
- P3 implemented: United split hero, editorial welcome, scroll-drawn journey map, comparison table,
  twelve connecting cards and two feature teasers, with trilingual content and reduced-motion support.
- P4 implemented: reusable country frame, Tunisia welcome, linked map and destination showcase, accessible
  dialogs, more places and the Bizerte spotlight.
- P5 implemented: Tunisia's remaining seven sections and onward journey band, with reusable country components,
  complete EN/FR/AR content, responsive controls, map dialogs and a scroll-drawn timeline.
- P6 implemented: complete Bahrain page using the shared country components, with teal/gold museum labels,
  crafts, pearl heritage, Ramadan traditions, Arabic coffee and serrated/Sadu motifs in EN/FR/AR.
- P7 implemented: 24-slide Common Grounds deck, translated layouts, gestures, index, autoplay and optional video slots.
- P8 implemented and verified: Supabase schema/RLS/Storage, five Edge Functions, sample seed, generated types,
  configured browser client, SQL/Deno tests and real local Auth/Storage integration.
- P9 implemented: trilingual community wall, sharing/reporting, browser compression, newsletter and alerts.
- P10 implemented: lazy moderation dashboard with TOTP MFA, protected queues, reports, alerts and newsletter export.
- Next prompt: **P11 — Motion & polish**

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

Missing image ids at P0 (see Known issues for the current list):
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
- [x] CountryPage frame + config + theming + SectionNav
- [x] Welcome (hero, intro, facts, words, did you know)
- [x] Destinations (map, pinned showcase/carousel, dialogs, more places, Bizerte spotlight)
Notes:
- 2026-11-16: Shared country configuration and theme, nine stable anchors, sticky scrollspy navigation,
  RTL-aware arrow/Home/End keys, router-backed hash links and onward country/Common Grounds links.
  Bahrain receives the shared frame; its detailed sections remain P6. Seven Tunisia placeholders show
  only their supplied titles, ready for P5.
- Tunisia has the priority sea hero and Sahara arch, two-column introduction, capital-led facts with Flag,
  semantic three-column word table (Arabic lang/dir and leading script column in Arabic UI), and six facts.
- Twelve destination cards share media-backed UNESCO badges and full-text dialogs. Featured cards scrub
  horizontally on fine-pointer desktops and use native snap scrolling on mobile, touch, reduced motion
  and windows shorter than 700px. Map callouts retain the real SVG geography while providing 44px targets;
  both card groups link to the map and back, with focus transfer, active pin sync and keyboard controls.
- Bizerte uses accent-deep, lucide fact icons and seven bento tiles. Reviewed all twenty photos; corrected
  four sources and five sets of image alts, regenerated WebPs/credits and removed one obsolete derivative.
- Country overview payloads, media and photo catalogs are generated by `scripts/prepare-content.mjs`.
  **P5:** load its full section data with the normal content hook or extend the projection; the current
  overview intentionally supplies only titles for wear/nature/cities/history/festive/food/monuments.
- `npm run verify` passes (62 unit/content/contrast tests). The full Playwright regression passes all 152 cases,
  including 36 new country checks across EN/FR/AR, 360/768/1280/1920px, normal/reduced motion, touch fallback,
  scroll-to-pin synchronisation, map/card links, dialog axe/focus/Escape, carousel keys, RTL and live cleanup.
  Browser checks report no errors/warnings, accessibility violations or horizontal overflow. Mobile/desktop
  screenshots were visually reviewed. Formatting, `git diff --check` and the `/exchange/` base-path check pass.
- Initial country JavaScript totals 181,080 bytes gzip (approximately 177 KiB, Arabic), below the 180 KiB budget.
  Map-target, motion-fallback, content-loading and photo decisions are recorded in D-036–D-039.

### P5 — Tunisia part 2
- [x] Wear (tabs, regional), Nature (3 rows), Cities, History (timeline + figures), Celebrations, Food (+ products), Monuments
Notes:
- 2026-11-16: Reusable InfoCard, Timeline, FigureGrid, DishGrid, ProductStrip and MonumentGrid compose the
  completed sections. All 15 wear items, three regional callouts, 15 nature places, nine cities, 25 timeline
  events, 13 figures, 20 celebrations, 22 food items and 18 monuments render from canonical locale content.
- Wear uses keyboard/RTL tabs at 768px and up and native accordions below; nature has three native snap rows.
  The capital leads alternating city rows; celebrations use date chips, lunar notes and a wedding feature.
  Food includes the two-column national dish, mobile filters and three circular product images. Seven monuments
  pass the optional UNESCO filter. Empty descriptions produce no empty paragraphs.
- Timeline starts with ten events (country spec and prompt), expands to all 25, and has nine media thumbnails.
  Its line scrubs, dots enter once and images drift slightly. Scoped GSAP/matchMedia cleanup also reverts hover
  transforms when reduced motion is enabled. Layout changes refresh ScrollTrigger; content stays visible.
- Nature, city, regional and monument map controls open a focused, dismissible map dialog at the exact media pin,
  including places absent from the destination showcase. Geography stays LTR; closing restores the initiating control.
- The complete namespace, section code and photo catalog load before the lower sections enter view; direct
  section hashes load immediately and restore focus/position. Initial country JavaScript is approximately
  **177 KiB gzip**, below the 180 KiB budget. The Bahrain frame remains ready for P6.
- Reviewed all Tunisia detail photo selections. Replaced nine unsuitable/weak selections and supplied the
  previously missing samsa photo, with pinned sources, regenerated WebPs and credits. Removed the silver-jewellery
  hold after reviewing Tunisian ornaments; corrected 18 EN/FR/AR image descriptions. No Tunisia photo ids remain missing.
- `npm run verify` passes (65 tests), including three CountryPage renders that compare every section's item ids,
  counts and text against each locale JSON, expand the timeline and verify filtering. Formatting, whitespace and
  configured `/exchange/` base-path checks pass. All 180 browser regression cases pass across EN/FR/AR at
  360/768/1280/1920px with normal/reduced motion, axe, keyboard paths and no browser errors/warnings or overflow.
  Four additional live-motion checks verify timeline progress, hover reversion and a direct monuments hash.
  Visual review covered the wear, nature, capital, history, celebrations, food and monument layouts; corrected
  large-feature responsive image sizes after spotting an undersized capital image candidate.
  The final 28-case country-details run passes after that correction, with an added check of selected photo
  resolution against rendered width (accounting for available candidates and parallax scale).
- Decisions and spec precedence are documented in D-040–D-042.

### P6 — Bahrain
- [x] Bahrain page with nicknames, crafts, jewellery note, pearl heritage, Ramadan traditions + chant, coffee, serrated/Sadu motifs
Notes:
- 2026-11-16: Reused P4/P5's country frame, destination controls/dialogs, tabs, cards, timeline, figures,
  food/product and monument components. Bahrain adds the skyline/dhow hero with serrated edge, five nickname
  museum labels, the sweet/salt waters pull-quote, four wear tabs and a separate two-group Crafts subsection
  divided by a Sadu band. The jewellery note stays with its tab/accordion.
- All 31 wear/craft items, nine nature places, seven cities, 17 timeline events, 14 figures, 19 celebrations
  plus weddings, 12 dishes and 14 monuments render from the canonical content. Nature uses asymmetric masonry
  with a large Tree of Life; Manama includes an Adliya inset. History adds a dark-teal museum wall with five
  gold-numbered labels and a translated, illustrative Danah-to-Yakka pearl scale. Gargee'an has a chant quote
  card; Arabic coffee has its own photo/etiquette feature. UNESCO badges show 2005, 2012 and 2019.
- Six featured and four additional destinations use the full, unmirrored Bahrain map. Its responsive height is
  capped at 550px, keeping Hawar's actual southern position visible without an inset; map controls retain 44px
  targets. Bahrain has no spotlight. National dates remain 16 and 17 December.
- Generated hero/destination/detail image catalogs now support each country separately. Full content and detail
  images remain deferred; measured Bahrain entry JavaScript is approximately **177 KiB gzip**, below 180 KiB.
  Global ScrollTrigger refreshes now preserve pinned-panel focus, including refreshes caused by lower sections.
  The onward journey band reserves the footer skyline's height so the last link stays clickable.
- Reviewed all Bahrain photo selections. Pinned/replaced 17 image ids, including five previously missing photos,
  and corrected 23 image descriptions in each language. Removed the pearl-diver and Fijiri holds after reviewing
  their replacements; credits and responsive WebPs are regenerated. Seven unresolved and eleven withheld image
  ids still use patterned placeholders, including the Adliya inset; the source follow-ups are listed below.
- `npm run verify` passes (68 unit tests), including complete content/count checks for both countries in all
  three languages. Formatting, whitespace and configured `/exchange/` base-path checks pass. The full browser
  run passed 243/244 cases; the final failure exposed a footer skyline overlap. After correcting it, all eight
  affected country navigation checks pass at 360/768/1280/1920px with an explicit overlap assertion.
  The suite now covers Bahrain with the same EN/FR/AR, normal/reduced motion, axe, keyboard, touch, map/dialog,
  image-resolution and overflow checks as Tunisia, with no browser console errors/warnings in passing cases.
  Visual review covered the English desktop and Arabic mobile hero, nicknames, crafts, masonry, capital,
  pearl museum and coffee feature. Decisions and editorial follow-ups are documented in D-043–D-045.

### P7 — Common Grounds Media Matrix
- [x] intro, deck, 4 layouts, navigation (keys/wheel/touch/buttons), URL sync, index, autoplay, video slot, a11y
Notes:
- 2026-11-17: Cinematic six-tile intro and all 24 canonical slides, with country flags/captions, Ken Burns,
  thumbnail crossfades, shared circular insets, split-merge timelines, the translated word board and Vault CTA.
- Replace navigation preserves deep links, queries, language-switch links and metadata without adding history
  entries. Keyboard arrows mirror in Arabic; Home/End, PageUp/PageDown, Space, buttons, index dialog and
  fullscreen are supported. Mobile vertical scrolling preserves long text; horizontal swipes mirror in RTL.
- Autoplay is opt-in, advances every nine seconds, pauses for hover/focus/hidden tabs and stops at the end.
  Scoped GSAP timelines/Observer clean up on unmount; ambient imagery pauses offscreen and in hidden tabs.
  Reduced motion skips transitions/Ken Burns and leaves content visible. Only the active slide is accessible.
- File and privacy-enhanced YouTube video slots have muted loops, sound controls, captions support and inactive
  cleanup. YouTube is click-to-load; reduced-motion file video requires explicit playback. No real videos added.
- Generated per-slide locale/photo projections avoid full catalog loading; adjacent photo URLs preload.
  The index, intro and video player load separately. Reviewed shared photos and withheld the unrelated
  cg-oud bridge photo; existing missing/held photos retain graceful placeholders.
- npm run verify passes (71 unit/content tests). All 40 Matrix browser cases and four language/focus
  regressions pass across EN/FR/AR, 360/768/1280/1920px and both motion preferences. The 32 remaining
  shell checks passed in the broader run; the final eight intro/language checks pass after loading polish.
  Checks cover all 24 slides, deep links, index/escape/focus, RTL touch, wheel cooldown, autoplay, axe,
  overflow and no browser errors/warnings. Shared-image, mobile and desktop screenshots were reviewed.
- Formatting, whitespace and the configured /exchange/ base-path check pass. Matrix entry bundles stay
  below 180 KiB gzip; actual deployed LCP and video-provider playback with real media remain release QA.
- Decisions D-046–D-048 document responsive navigation, loading/video contracts and photo safeguards.

### P8 — Supabase backend
- [x] migrations 0001–0003, seed, config.toml, storage buckets/policies
- [x] Edge Functions: submit-story, react, report-post, subscribe, moderate (+ _shared, tests)
- [x] SQL security tests; advisors clean; types generated; BACKEND setup notes verified
Notes:
- 2026-11-17: Initialized Supabase without replacing existing files; local signups disabled, TOTP enabled,
  password minimum 12, visitor function JWT checks disabled and moderation JWT checking retained.
- Official `@supabase/server@1.9.2` helpers and new publishable/secret-key documentation verified. Shared
  handlers implement exact CORS, streamed payload bounds, validation/normalization, Turnstile, salted
  hashes, separate rate windows, WebP header/metadata checks, generic errors and cleanup. Moderation
  reserves records across Storage moves and retains failed work for recovery (D-049–D-051).
- Six 60–90-word neutral sample notes in EN/FR/AR are mirrored exactly into generated seed SQL. Browser
  client stays absent when unconfigured/in mock mode. Unsubscribe confirmation uses canonical locale text.
- `npm run verify` passes: 75 frontend/content tests and production build. Eleven Deno tests and Deno checks
  pass, including streamed limits and moderation copy failure/order. `npm run audit`: zero vulnerabilities.
- Full local Supabase (Postgres 17) starts and resets successfully; 70 pgTAP access assertions pass,
  db lint on public/private is clean, and types were regenerated from the real local stack (not a stub).
  CLI security/performance advisors have no warnings/errors after D-052's consolidated alert
  policies and four moderator-FK indexes. Expected INFOs: fresh unused indexes and service-only reactions.
- All 22 curl integration requests pass with Turnstile test keys: real WebP submission and bucket moves,
  invited-style local user provisioning and TOTP enrolment, aal1 denial/aal2 permission, every moderation
  action, unique hearts, three-reporter auto-hide, subscribe/already/unsubscribe and CORS/input/honeypot checks.
  Test users, subscriber rows, stories, logs and uploaded files are cleaned up. Rate events remain for cron/reset.
- Docker image downloads were slow; an isolated Postgres 16 harness additionally verified SQL and the
  unavailable-pg_cron guard while waiting. Local stack excluded Studio, analytics, realtime, image proxy
  and pooler services unused by these tests. Windows filesystem watcher restarts caused transient 502s
  during edits; the final stable run passed. Production code contains no test-key bypass.
- BACKEND includes exact local/cloud CLI 3 commands, real-key deployment notes and failure recovery
  instructions. No cloud project was modified. P8 adds no visible Vault UI; responsive UI work remains P9.

### P9 — Vault frontend (+ newsletter & alerts wiring)
- [x] vaultApi (supabase + mock), hooks, wall + filters + infinite + dialog + hearts + report
- [x] share form + PhotoPicker + compression + Turnstile + success/error states
- [x] newsletter + alerts wired to API
Notes:
- 2026-11-17: Typed lazy adapters use approved-only RPCs, multipart/JSON Edge Function calls and public
  error codes. Mock mode includes latency, pagination, validation, rate windows, idempotent hearts,
  subscriptions and a browser-local pending receipt list; pending stories never enter public reads.
- URL filters, prefetched story dialogs, photo carousel, reporting, optimistic hearts with rollback,
  masonry/Flip transitions, infinite sentinel plus keyboard Load more, skeletons and empty/error states.
  Query-only navigation preserves focus so closing dialogs returns to the initiating control.
- Share sheet uses RHF/Zod, translated errors/counters/guidelines, session text drafts, category cards,
  consent, honeypot/start time, Turnstile token reset and success/unavailable states. Native file input
  supports dropped files; photos have accessible reorder/remove controls and optional descriptions.
- Browser re-encoding strips metadata, preserves orientation and bounds full WebPs to 1600px/900 KiB
  and thumbnails to 480px/150 KiB. Oversize/decode/type failures are rejected; object URLs are revoked.
  Newsletter requires consent/Turnstile; announcements use the real adapter and five-minute cache.
- npm run verify passes (107 unit/content tests). Adapter tests cover RPC cursor arguments, FormData,
  error codes and alerts; mock tests cover pending isolation, pagination and unique hearts. Browser checks
  cover filtering, dialogs, hearts, reporting, validation, two-photo submission, newsletter, EN/FR/AR,
  all four widths, normal/reduced motion, axe, keyboard focus, screenshots and console errors/warnings.
  The combined Vault/shell run passed 68 tests; the subsequent explicit-mock Vault run passed 32 tests.
- Vault photo metadata is projected from the canonical catalog. Wall/query/Flip code and footer newsletter
  are deferred until needed; explicit story/share deep links load immediately. Vault initial JavaScript
  passes the 180 KiB budget; all four United budget regressions also pass. Desktop/mobile hero and wall
  screenshots were reviewed.
- D-053–D-055 record explicit-mode behavior, dynamic user media, mock limits, and loading/focus choices.
  Production Turnstile/domain and deployed Supabase end-to-end checks remain release QA; this prompt
  tests the adapter contract and mock UI, and does not claim a new hosted backend deployment.

### P10 — Admin dashboard
- [x] login, MFA enrol/verify, guard, queue, approved/rejected, reports, alerts CRUD, newsletter export, idle logout
Notes:
- 2026-11-17: Admin remains lazy and noindexed at `/:lang/admin/*`, with an explicit translated Supabase-required
  screen in mock mode. Password login, TOTP QR/manual-secret enrolment and verification precede the aal2 and
  `is_admin` gate. Sessions and protected queries stay in memory; sign-out clears the admin cache and unmounts
  sensitive views. Idle expiry checks elapsed time (including background tabs), without resetting on token refresh.
- Pending stories use oldest-first pages of 20, five-minute signed photo URLs refreshed before expiry, zoom,
  expandable bodies, word counts, private rejection notes and focused-card A/R/J/K shortcuts. All moderation
  writes use `moderate`, require confirmation and open the last-50-entry log drawer after success.
- Approved search/hide/delete, rejected delete, grouped reports with hide/restore/resolve, trilingual alert CRUD
  and preview, active-subscriber count and paged CSV export are implemented. Exports warn about personal data,
  neutralise spreadsheet formulas and stop if the screen unmounts. Direct alert writes retain existing RLS.
- `npm run verify` passes (114 unit/content tests); local `supabase test db` passes all 70 access assertions.
  `npm run test:admin` runs isolated mock/configured servers with controlled Auth/API responses. It covers login,
  MFA enrol/verify, non-admin denial, rejection/logging, alert creation, sign-out and idle expiry, plus EN/FR/AR,
  360/768/1280/1920px, reduced motion and axe. Hosted provisioning/deployment is unchanged and not claimed tested.
- The final complete admin browser run passes all 44 cases. The public United/Vault
  JavaScript-budget checks pass. United now uses a generated media namespace to avoid loading unrelated route
  metadata; its content and motion are unchanged. Auth SDK/query code is deferred in mock mode, and dashboard
  modules load only after authorisation. Decisions are recorded in D-056–D-059.

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
- **Photo sourcing remains unfinished:** 176/183 ids are resolved. The seven missing Bahrain ids are
  `bh-wear-thobe`, `bh-wear-bisht`, `bh-craft-bani-jamra`, `bh-craft-rawazin`, `bh-mon-ain-umm-al-sujur`,
  `bh-food-muhammar` and `bh-food-mumawash`. Twelve resolved but unsuitable selections are withheld in
  `src/content/image-review.json`: `bh-wear-pearls`, `bh-craft-aali-pottery`, `cg-gold-embroidery`, `cg-oud`,
  `bh-craft-oud-bakhoor`, `bh-nature-springs`, `bh-nature-desert-sakhir`, `bh-city-sitra`, `bh-city-adliya`,
  `bh-food-nakhi`, `bh-food-bajela` and `bh-fest-gargeean`. These render graceful patterned placeholders;
  all requested media ids remain wired. Remove holds only after reviewing suitable replacements.
- **Review new page photo subjects before use.** The resolver can rank unrelated subjects highly despite eligible
  licences; `cg-oud` is now withheld because it depicts a bridge and needs a suitable instrument photo. P6 corrected the other
  previously flagged Bahrain sources or withheld them, and restored United's pearl-diver/Fijiri cards.
  Pin curated sources in `scripts/images/overrides.json` and regenerate originals with `--refresh --force` when
  changing selections. Nabeul's image remains a painting of pottery; prefer a workshop/wares photo in a later pass.
- Use Node 22.22.2+, 24.15.0+ or 26+ for tests; the requested `>=22.12` engine alone does not cover latest jsdom.
- Official IEEE files needed: Master Brand (white/black), favicon set, approved site identifier wordmark, cookie script (if required).
- Organising IEEE units' names/logos for the footer "Organised by" strip.
- Real Vault stories from exchange participants to replace the 6 sample posts before launch.
- Optional: real videos for Common Grounds slides (see pages/common-grounds.md production notes).

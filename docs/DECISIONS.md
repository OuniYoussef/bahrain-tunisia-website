# Decisions log

Format: `D-NNN — Title` · Context → Decision → Consequences. Append new ones at the end (Codex: add yours here).

**D-001 — Static SPA + Supabase only for dynamic features.** The site is static (any host), but the Vault needs real
persistence, moderation and security → Supabase (Postgres/RLS, Storage, Edge Functions, Auth+MFA). Everything else is
bundled. A mock API keeps the UI fully functional without a backend.

**D-002 — Photos from free-licence sources via a reproducible pipeline.** The authoring environment could not download
images, so the kit ships a curated manifest + script (Wikimedia/Wikipedia first, Openverse fallback, CC0/PD/CC BY/
CC BY-SA only), converting to responsive WebP and generating credits. No portraits of real people (historical/public
figures are typographic cards; sport/poet slides use places).

**D-003 — Locale in the URL, English default.** `/en|fr|ar/...`, `/` → saved locale or `en`. No browser-language
detection (brief: default language English). Good for sharing, SEO (hreflang) and static prerendering.

**D-004 — Typed JSON content instead of an i18n library.** The content is structured data, not UI strings; typed JSON
per namespace + tiny `t()`/`plural()` helpers are simpler and type-safe. Media is language-neutral in `media.json` so
translators never touch image ids.

**D-005 — TypeScript 7 + oxlint.** The official Vite React-TS template ships TS 7 and oxlint; typescript-eslint does
not support TS 7 yet. Formatting with Prettier + `prettier-plugin-tailwindcss`.

**D-006 — IEEE header positions are not mirrored in Arabic.** Site identifier stays upper-left, Master Brand upper-right,
meta-nav LTR/English, per IEEE requirements. Navigation items between them follow RTL. To confirm at IEEE review.

**D-007 — One copyright statement.** IEEE's exact `© Copyright {year} IEEE – All rights reserved.` is the copyright
line; the brief's "2026 Bahrain x Tunisia" is kept as a project line without "All rights reserved".

**D-008 — Geography is never mirrored.** United hero halves (Tunisia west/left, Bahrain east/right), maps and the
footer skyline keep their orientation in RTL.

**D-009 — Native scrolling.** No ScrollSmoother/Lenis (accessibility, anchors, RTL). GSAP ScrollTrigger on native scroll.

**D-010 — Media Matrix uses cinematic images now, optional video per slide later.** No autoplay by default; Play gives
9 s per slide (IEEE 8–10 s rule) with Pause; videos muted with controls.

**D-011 — Regional Arabic month names.** Tunisia page uses Maghrebi month names, Bahrain page Gulf names (cultural accuracy).

**D-012 — Western digits in Arabic.** `ar-u-nu-latn` for Intl formatting; content already uses Western digits.

**D-013 — Visitors never write to tables.** All visitor writes go through Edge Functions with Turnstile, rate limits,
validation and WebP checks; anon has no table privileges; reads only through `get_stories`/`get_story`.

**D-014 — Admin requires MFA in the database.** `is_admin()` checks membership AND `aal2`; RLS and storage policies use it.

**D-015 — Sample posts are labelled and temporary.** Six `is_sample` travel-note posts (no fake personal testimonials)
show a "Sample" badge and must be deleted before launch.

**D-016 — Typography.** Fraunces (Latin display), Amiri (Arabic display), Readex Pro (body, Latin+Arabic), Reem Kufi
(Arabic accents), Open Sans (IEEE chrome, required). Self-hosted via @fontsource.

**D-017 — Host-agnostic deployment.** Hosting is undecided: ship `vercel.json`, `_redirects`/`_headers`
(Netlify, Cloudflare Pages) and a GitHub Pages path; post-build prerender writes per-route HTML for meta/OG and deep links.

**D-018 — Vault country filter is exact.** "Tunisia" shows only Tunisia stories; "Both" is its own filter (brief lists four filters).

**D-019 — Newsletter stored, not sent.** Subscriptions with consent + unsubscribe token in Supabase; admins export CSV
for whatever mailing tool the team uses. No email provider integration in scope.

**D-020 — Localised page names.** FR: "Ensemble" (United), "Points communs" (Common Grounds), "Coffre des expériences";
AR: "معاً"، "القواسم المشتركة"، "خزانة التجارب".

**D-021 — Parseable environment example.** ARCHITECTURE.md groups four social variables on one line;
dotenv would interpret the extra assignments as part of the Instagram value → `.env.example` places
each social variable on its own line, preserving every name and default. The supplied architecture
document remains unchanged.

**D-022 — Preserve the delivered kit during bootstrap.** The P0 request prohibits replacing kit files →
merge only absent template files, remove only template demo assets, and exclude the delivered content,
scripts, assets and docs from automatic formatting. Only progress/decision records and pipeline-generated
outputs may change as explicitly requested. The temporary `setup OK` heading is the P0 diagnostic requested
by the user; product copy, locale routing, font imports/subsets and branding follow in P1/P2.

**D-023 — Latest test tools have a higher Node minimum.** P0 requests the latest stable dependencies and
`engines.node >=22.12`; jsdom 31.0.1 requires `^22.22.2 || ^24.15.0 || >=26.0.0` → retain both requested
settings and document the stricter test-tool requirement. Bootstrap is verified on Node 24.21.0; use
Node 22.22.2+ or 24.15.0+ (or 26+) for the complete test suite.

**D-024 — P1 content prerequisite without product routing.** The P1 components require localised labels
through `useContent`, while the full locale infrastructure is scheduled for P2. Introduce a small typed
ContentProvider with explicitly loaded namespaces; the dev route loads existing common/tunisia/images
content for EN/FR/AR. Locale persistence, URL redirects, interpolation/plurals, branded chrome and product
routes remain P2. Technical token names/direction values in the styleguide are specimen metadata; native
language names follow I18N_RTL.md. No new translated copy is invented.

**D-025 — Explicit variable-font subsets.** Installed Fontsource variable packages expose whole-family
CSS, not subset-specific CSS entry points. Declare only their Latin/Latin Extended/Arabic WOFF2 faces
in fonts.css using package file URLs and the supplied unicode ranges; import Amiri's Arabic 400/700 CSS
directly. Keep swap and the requested weight ranges, Fraunces optical sizing/SOFT axes, and preload the
Latin Fraunces/Readex files through Vite-resolved HTML links. No Vietnamese or Cyrillic faces are loaded.

**D-026 — Control contrast takes precedence over decorative borders.** DESIGN_SYSTEM.md specifies line
for input borders, but line against pearl-glow measures 1.39:1, below the 3:1 non-text contrast needed to
identify an unfilled control. Use muted (5.60:1) on inputs/selects/textareas, radio cards and pills; retain
line for decorative separators and card outlines. Text pairs are checked against the actual theme tokens
and rendered components with axe. The lowest used small-text pair is muted/sand-100 at 4.60:1.

**D-027 — One motion system and trusted inline SVGs.** ASSETS.md suggests a CSS LQIP transition, while
AGENTS.md requires GSAP-only motion. Fade the separate LQIP/colour layer with GSAP, and remove it instantly
under reduced motion; keep image dimensions/crops stable. All helpers use scoped useGSAP and matchMedia
cleanup. InlineSvg accepts only bundled registry keys, parses approved shape attributes into React nodes,
and prefixes ids/references per instance. Localised titles are text nodes; no user HTML is injected.

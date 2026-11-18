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

**D-028 — P2 budget applies to the whole initial request set.** Measuring only the entry chunk misses lazy
shell dependencies. Measure all scripts requested by the landing route (about 177 kB gzip in Arabic).
Use the installed Zod 4 Mini API for optional environment validation, split the trusted SVG renderer from
the map registry, and load the mobile dialog on demand. Core GSAP/ScrollTrigger/useGSAP stay registered in
lib/gsap.ts; extra plugins register once in lib/gsap-plugins.ts when a feature imports them. This refines
MOTION.md's eager registration example without changing the animation library or P1 primitive behavior.
P2 alerts are explicitly an empty mock: defer the ARCHITECTURE.md QueryClientProvider and query hooks to P9,
when real data is introduced, retaining the dependency and a typed five-minute alerts cache meanwhile.

**D-029 — Optional configuration fails closed.** Invalid/blank optional environment values are treated as
absent. Explicit supabase mode without both public credentials resolves to mock, so missing setup cannot
crash the shell. Newsletter remains unavailable throughout P2. Add localised missing-contact text and
announcement expansion labels in all three common namespaces. With no canonical domain configured,
use the current origin plus the configured base path. OG URL conventions are emitted now; files and the
optional sitemap link wait for P12 instead of introducing a broken visible sitemap link.

**D-030 — IEEE geometry and responsive navigation.** IEEE_BRANDING.md requires a 36px meta-bar, which cannot
also contain 44px-high targets. Keep its mandated 36px links and accessible horizontal keyboard scrolling;
all ordinary shell controls retain 44px targets. Use the mobile sheet until 1280px, rather than the generic
lg breakpoint, because the fixed brand positions plus all French links/language controls do not fit at
1024px. The identifier remains at physical left and the Master Brand at physical right in Arabic.

**D-031 — Motion, focus and skyline integration.** AGENTS.md's GSAP-only rule wins over global-shell.md's
CSS-transition suggestion: animate header surface opacity and hide/show transforms with scoped useGSAP.
The 0.5-second arch transition uses a 0.25-second cover before route commit and a 0.25-second uncover;
reduced motion bypasses both. Focus h1 after client navigation; initial document loads keep the skip link
first in the keyboard order. Hash anchors retain header clearance and ScrollRestoration owns history scroll.
An absolutely positioned skyline overlaps the preceding section while its ground touches the ink footer;
this avoids negative-margin collapse painting ink behind the silhouette. Focusable HTML hotspots outside
the aria-hidden SVG provide tooltips; the hidden landmark list stays within bounds in RTL. Ordinary feature
pages retain only their localised h1 until their planned prompts, with dark surfaces exercising overlay chrome.

**D-032 — United geography and compositor-only widening.** MOTION.md suggests flex-grow for the hero,
but its transform/opacity/clip-path rule and AGENTS.md prohibit animating layout dimensions. Keep photo
frames at 58% and animate their clipping boundary plus the gold seam transform. The geographic photo,
ornament and country-arrow layers explicitly use LTR geometry in every locale; only text follows the
reading direction. Below 1024px the photographs stack, with two ornaments above the headline and a
separate translated above/below caption. Vertical edge-label writing mode belongs to the text span,
not its positioned link, so logical offsets continue to refer to the physical horizontal axis.

**D-033 — United media suitability and safe fallbacks.** The P0 resolver's licence eligibility does not
establish subject relevance. Pin reviewed Wikimedia files for Razji (Jasminum sambac), Tunisian tea,
Bahraini majlis and luqaimat in overrides.json; regenerate with both `--refresh` and `--force`, since
`--force` alone re-encodes the cached old original. Retain the source attributions in generated credits.
Withhold five unsuitable or unverified selections via image-review.json: a Japanese diver, Moroccan
diadem, satellite image, A'ali's pottery roundabout monument and an unverified Fijiri photo. The latter
two do not support their supplied subject descriptions. Together with two missing images, these use
the established graceful placeholder while retaining the specified media ids. The current Nabeul
painting depicts pottery but remains an editorial follow-up for photographic consistency.

**D-034 — Keep the initial landing request set within budget.** A direct implementation loaded unrelated
maps and all 170 photo records. Import flower SVGs directly; use a typed, statically selected United
media lookup; generate hero/United photo catalogs from the canonical manifest during predev/prebuild
and after image fetching. Load the remaining catalog, regional SVG and footer skyline near the viewport
with reserved geometry. The footer waits for the route skeleton to disappear before observing, avoiding
an early request caused by temporary short content. Register only used extra GSAP plugins. Move the same
allowlisted Zod public-environment schema to Vite startup/build, injecting its parsed output; schema unit
tests and the configured subpath browser check verify equivalent behavior. This supersedes D-028's
runtime Zod Mini choice. Measure gzip for every initial JS response, with a 180 × 1024-byte ceiling.
United's background and card photographs are decorative alongside the visible caption/theme/country
copy, so they use empty alt text; other ResponsiveImage callers still read alt text from images.json.

**D-035 — Stable counters and rendered-state accessibility checks.** Store the approximate distance
value in media.united.journey and interpolate `{distance}` in the three locale labels. Animate only an
aria-hidden visual count; assistive technology always receives the complete final distance. Preserve
the native comparison table inside a labelled, focusable scroll section, including in RTL. Accessibility
scans wait for the hero CTA opacity to reach one so they assess the settled interface rather than a
transient fade. Dedicated checks cover live reduced-motion changes, keyboard navigation and physical
country-edge positions in all four viewport sizes.

**D-036 — Country maps preserve geography and usable targets.** The supplied map pins cluster around
Tunis and cannot each have a non-overlapping 44px target at the showcase's size. Keep the original inline
SVG and its geographic dots, and connect twelve spaced HTML pin buttons to the corresponding points.
Buttons take their accessible names from destination content, expose pressed state and card relationships,
and show dismissible name labels on hover/focus. The controlled `activePlace`/`onSelect` interface links
featured and more-place cards in both directions. Map geometry stays LTR in the Arabic page.

**D-037 — Country browsing and focus.** Pin only at width >=1024px, height >=700px, with a fine hover
pointer, no coarse touch pointer and no reduced-motion preference. The additional height condition keeps
the map, text and controls accessible on short desktop windows. All other cases use the native snap
carousel and collapsible map. Arrow keys follow reading direction; Home/End, previous/next buttons and
ordinary Tab paths work in both modes. Absolute carousel positions prevent duplicate focus/scroll events
from advancing twice. Preserve focused controls during image/font-triggered ScrollTrigger refreshes without
reselecting their cards and overriding the user's scroll position.
SectionNav uses router Links to avoid native hash-history warnings from the existing navigation blocker;
same-page anchors focus their sections without a page wipe, while route changes still focus the h1.
The skip link focuses/scrolls main directly without adding a native hash-history entry.

**D-038 — Country content and asset payloads.** `useContent(country, 'overview')` loads a deterministic
projection of the canonical locale namespace: complete meta/navigation/welcome/destinations and only the
real titles of later sections. It does not rewrite or discard the original P5/P6 content; the normal
`useContent(country)` still returns that complete namespace. `scripts/prepare-content.mjs` generates
these projections, country media and scoped image catalogs before dev/build and after fetching photos.
P5 must add its section content explicitly instead of reading bodies from the title-only overview.
Header animation, maps, destination photo metadata and dialogs load when needed. Visible destination
titles/descriptions and the hero's Mediterranean/Sahara copy describe their adjacent decorative photos;
dialogs retain the detailed localised image alts. This keeps all initial country JS requests below 180 KiB.
Bahrain uses the shared theme/navigation/title frame, with its detailed content still scheduled for P6.

**D-039 — P4 photo corrections.** Reviewed all twenty distinct Tunisia welcome/destination/spotlight
selections. Replaced the satellite image with `SAHARA DOUZ.jpg`, the Errimel shipwreck with
`Coco Beach Sidi Ali el Makki.jpg`, Ain Damous with `Cap Serrat plage.jpg`, and La Galite lightning with
`Vieux port by night.JPG`. Pinned sources and licences remain in overrides, selection.lock and credits;
regenerated originals and WebPs with `--refresh --force`. Removed the obsolete 2560px dunes derivative
because the replacement supports up to 1920px. Corrected five EN/FR/AR alt descriptions to match the
actual amphitheatre passage, mosque interior, camel festival and coastal scenes. Added translated third
column labels for Arabic script and a distinct featured-carousel label; canonical locale shapes stay equal.

**D-040 — Complete country content with deferred delivery.** Keep P4's overview projection for the hero and
destinations. Load the complete namespace with `useContent(country)` in a separate country-details chunk
when the remaining sections approach within 1,600px, or immediately for their section hash. Real section
titles remain anchor targets while loading; the completed section restores hash focus/position on mount.
Image dimensions and aspect ratios reserve frames, and all detail photos stay lazy. Generated detail media
and image catalogs use the canonical media file, including shared `cg-*` images. This keeps the ordinary
Tunisia entry below 180 KiB while allowing every item to render. Shared components accept content/media and
country theme; P6 supplies Bahrain-specific compositions and its image catalog.

**D-041 — Country interactions and spec precedence.** Show ten timeline events initially, as required by
the country spec and P5 prompt, overriding the generic design-system example of eight. All 25 entries remain
in source order; the disclosure toggles their visibility and refreshes scroll measurements. GSAP implements
hover lift/zoom as well as timeline line/dot/thumbnail motion, following AGENTS.md's GSAP-only rule rather than
the older CSS-hover suggestion. Preference-context cleanup reverts active interaction tweens on live changes.
Wear uses one rendered set of cards, tabs at >=768px and native disclosure groups below. Mobile food filters
default to all groups; a resize restores all desktop groups. Filter counts use a live output.
Nature, monument, city and regional map controls open the existing native dialog with one highlighted map
pin. This covers pins outside the destination showcase without overcrowding its twelve controls; selecting
the callout or closing returns focus to the original control. Regional pin annotations live in media.json.

**D-042 — P5 image review and corrections.** Reviewed every distinct photo used by Tunisia's new sections.
Replaced the moth and bird selected for Sbeitla and lablabi; replaced the sweet mesfouf image for the national
couscous dish, bird closeups for Ichkeul/Boukornine landscapes, Moroccan jewellery for Tunisian silver ornaments,
Algerian packaged dates for Tunisian Deglet Nour, a ruins view for olive oil, and Kolkata jalebi for Béja zlebia.
Added the previously missing samsa image. All ten sources are pinned in overrides/selection.lock and credited;
responsive images were regenerated and visually reviewed. The silver-jewellery hold is removed, also improving
United's shared card. Updated eighteen image descriptions in all three languages to describe the actual subject,
including the historic café, tapped palm, kafteji sandwich, Houmt Souk tomb, Sousse vault and festival drummers.
No generated photo or invented cultural scene is used. Image-free editorial items still use the khatam panel.

**D-043 — Bahrain composition and geography.** Reuse the P4/P5 country components and defer each country's
detail image catalog separately. Add only Bahrain's nickname museum labels/two-waters quote, four clothing
tabs plus two separate Crafts groups, asymmetric nature masonry, Adliya inset, pearl museum wall, Gargee'an
quote and Arabic coffee feature. Keep the full map, including Hawar at its true southern coordinates, within
a responsive 550px height; this avoids needing an inset while retaining the shared accessible callouts.
Geography never mirrors in RTL. History initially shows ten of 17 entries, following the country spec.
The Danah-to-Yakka graphic illustrates relative size only; its translated note explicitly disclaims physical
measurements. Omit the mobile food filter when only one group exists. UNESCO years accept the canonical
media's string values as well as numeric values, preserving the exact 2005/2012/2019 labels.

**D-044 — Bahrain editorial image safeguards.** Pinned 17 reviewed image selections, adding the previously
missing World Trade Center, thobe nashal, palm grove, Hidaya School and Bu Maher images, and replacing twelve
incorrect or weak selections. Refresh originals as well as derivatives when changing a source: `--force`
alone reuses the id-keyed cached original; use `--refresh --force`. Updated source locks, credits and WebPs,
removed obsolete oversized derivatives, and corrected 23 image alts in all three languages to describe the
actual subjects. Regional illustrative images disclose their location where relevant (including Fijiri in
Qatar, coffee dallahs in Damascus and palm craft in India). Restore the pearl-diver and Fijiri cards after
review. Seven missing and eleven unsuitable image ids remain placeholders under the project's graceful
fallback rule; their exact ids and sourcing needs are in PROGRESS and image-review.json. In particular,
the required Adliya inset is implemented but still awaits a suitable nightlife photo. Do not display the
resolver's unrelated architecture, events or dishes to imply the requested Bahraini subject.

**D-045 — Refresh focus and country footer clearance.** ScrollTrigger can temporarily reparent a pinned
panel during any global refresh, including a refresh from the deferred details' ResizeObserver. Preserve
focus through global refreshInit/refresh listeners and suppress card selection while restoring it; remove
listeners on cleanup. Country journey bands reserve the footer skyline's full responsive height in addition
to their normal bottom spacing, preventing skyline controls from intercepting the last onward link. Browser
regressions exercise live motion preference changes, pin focus, navigation cleanup and explicit skyline/link
separation for both countries at all four supported widths.

**D-046 — Matrix navigation and responsive reading.** Slide changes use React Router's replace navigation
(which calls history.replaceState), preserving router state, language-switch links and canonical metadata.
Same-locale Matrix transitions skip the global page wipe and focus reset; Start focuses the keyboard region,
deep links and language changes focus the h1, and the index restores its trigger. Desktop wheel input has an 850 ms cooldown; mobile
vertical gestures scroll the stacked slide and horizontal swipes navigate with mirrored Arabic direction.
This resolves the full-screen/long-copy conflict without hiding captions or the word board. Progress uses
scaleX, rather than the width tween mentioned in MOTION, to follow that document's transform-only rule.
Reserve the footer skyline's height below the deck so its hotspots cannot overlap navigation.

**D-047 — Matrix loading and optional video.** Generate current-slide locale projections and photo catalogs
from canonical matrix/image/media JSON; retain the 24 stable ids for navigation, load complete index titles
only when requested, and preload adjacent photo URLs without downloading their attribution/LQIP metadata.
Generated views are verified against every canonical slide in all three languages. The index, intro and
video player have separate code chunks; Observer is registered independently of unrelated GSAP plugins.
File video and privacy-enhanced YouTube are supported as requested; the page spec's incidental Vimeo mention
does not define a Vimeo contract and is not implemented. There are no real videos. Reduced motion requires
explicit file playback; YouTube always requires activation. Ambient timelines pause offscreen/when hidden.

**D-048 — Matrix photo safeguard.** Reviewed the shared-image contact sheet. Preserve the table's image ids,
but withhold `cg-oud`: its selected source is the Fergusonbrug bridge in Oud-Zevenaar, not a musical instrument.
It joins the existing embroidery and Bahrain photo holds and renders the established patterned placeholder.
Regional illustrative shared photographs retain their source-specific alt descriptions and attribution.

**D-049 — Current Supabase auth and local tooling.** P8 uses the verified official `@supabase/server@1.9.2`
helpers, exact CORS allowlists and generic errors. Public endpoints disable gateway JWT checking;
moderation retains it and checks `is_admin()` through the user's client before using privileged access.
Publishable keys stay in the browser; platform-managed secret key maps stay in the Edge runtime.
CLI 3 defaults DB commands to local, so BACKEND's old linked commands are replaced with explicit `--remote`.
The three numbered migration stages use CLI-generated timestamp filenames. No hosted deployment is performed.

**D-050 — Storage failure recovery within the supplied schema.** Storage and table writes cannot be one
transaction. Moderation uses the existing updated_at/moderation_note fields to reserve work and prevent
overlapping transitions, hides the feed record before moving files, and logs before final visibility.
Failed operations remain hidden and reserved for reconciliation rather than automatically republishing
partial files. Logs record attempts if subsequent work fails. Private originals survive until publication
commits. Cleanup failure after commit can leave private duplicates; BACKEND records the recovery procedure
and the limit of immutable public caches. This adds no visitor grants or schema columns.

**D-051 — Backend validation and content exceptions.** Separate hourly/daily submission actions avoid
double-counting rate events. Bound actual streamed bytes as well as declared length; reject WebP animation,
EXIF/XMP and inconsistent headers. Token-based unsubscribe navigation is the sole no-Origin exception.
Its server-rendered confirmation reads/escapes canonical locale JSON because useContent is a React hook.
The explicitly requested neutral samples are the single authored source for generated seed SQL, with
word-count/parity tests. The specified admins_self policy exposes only one's own membership at aal1;
private operational data remains gated on aal2. Tests and BACKEND clarify that public reads remain public.

**D-052 — Advisor-required alert policy consolidation.** Supabase's performance advisor reported
multiple_permissive_policies for authenticated SELECT on site_alerts: alerts_public, alerts_admin_read
and the SELECT part of alerts_admin_write overlapped. Migration 0002 and the BACKEND SQL now use one
SELECT policy per role and separate admin INSERT/UPDATE/DELETE policies. Public active/time-window
visibility and MFA-gated administration are unchanged. Its INFO scan also identified four uncovered
moderator foreign keys; migration 0001 adds covering indexes on stories.moderated_by, reports.resolved_by,
site_alerts.created_by and moderation_log.admin_id. These are the only changes to the supplied SQL blocks.
Unused-index INFO findings on a fresh seed are expected; story_reactions intentionally has RLS with no
visitor policies because only the service role writes reactions.

**D-053 — Explicit backend mode and mock boundaries.** An explicit VITE_VAULT_MODE=supabase now remains
Supabase mode when credentials are missing, allowing the specified unavailable screen rather than
silently accepting mock submissions. Auto mode still chooses the local mock when unconfigured.
Mock uses the same limits, public-feed separation and operation shapes, with local rate windows and
idempotency. It cannot simulate independent IPs, real moderation or Cloudflare verification: its local
token never reaches the real adapter, and its pending list stores text/metadata rather than full image
blobs. Real Turnstile uses the configured site key; the documented test key is a development-only fallback.
The Supabase changelog and official JavaScript RPC/functions-invoke references were checked.

**D-054 — User media and compression.** Static hero/sample photos retain ResponsiveImage and a generated
Vault-only catalog. Uploaded photos and temporary picker previews have no build-time manifest id, so
StoryPhoto/PhotoPicker render bounded native images with intrinsic dimensions and author-provided alt
text; this is a narrow exception to the static-manifest image rule. Public URLs are constructed only
from the configured Supabase origin and encoded vault-public paths; pending URLs are never public.
Canvas/OffscreenCanvas re-encoding follows BACKEND's sizes and retries, and rejects an output still above
900 KiB (full) or 150 KiB (thumb). It never sends an oversize best-effort result.

**D-055 — Vault loading, focus and presentation.** The light sand hero requires the solid IEEE header.
Its two decorative polaroids keep Tunisia physically west and Bahrain east in Arabic. Wall/query/Flip
code loads when the wall enters view, or immediately for story/share links; reserved space and an anchor
keep browsing usable. Newsletter code loads near the footer, with skeleton-aware observation. Query-only
URL changes no longer move focus to h1, allowing native dialog focus restoration. shareCategory selects
the form category independently of the wall's category filter. A separate translated browser-local
pending section avoids presenting unapproved mock submissions as community stories.

**D-056 — Admin sessions and authorisation.** The shared browser Supabase client disables session persistence
and automatic URL session detection: credentials never enter localStorage, and a full reload requires sign-in.
Provisioned moderators must already have a password, as specified in BACKEND; invitation/password setup remains
the project owner's provisioning flow. Admin data mounts only after session, aal2 and `is_admin` checks succeed.
An isolated ephemeral QueryClient is cleared on sign-out and route unmount. The idle clock survives token-refresh
checks and compares wall time when the tab resumes. No migrations or backend privilege changes are needed.
The implementation follows the current [Supabase TOTP guide](https://supabase.com/docs/guides/auth/auth-mfa/totp)
and [assurance-level reference](https://supabase.com/docs/reference/javascript/auth-mfa-getauthenticatorassurancelevel).

**D-057 — Moderation interaction and private media.** A/R/J/K shortcuts work only on the explicit story-selection
button, avoiding conflicts with forms, links, screen readers and ordinary browsing. All state changes receive a
confirmation; rejection requires a private reason. Signing photo URLs does not create public objects. Private
uploaded photos and the provider's QR code use bounded native images because they have no static manifest id,
extending the narrow user-media exception in D-054. QR SVG is an image source, never injected markup.
Enrolment is explicitly started by a button to avoid duplicate factors from React development effect replay;
stale unverified TOTP factors are removed before retrying enrolment. Verified factors are never removed.

**D-058 — Admin data and browser checks.** Report batches are combined before grouping/paginating by story,
so counts are not split at API page boundaries. Subscriber export reads batches without retaining email rows in
the query cache, quotes CSV fields, neutralises formula prefixes and uses the actual subscribe function URL for
unsubscribe links. Tests use a separate `playwright.admin.config.ts` and `npm run test:admin` so mock and configured
login states are deterministic without production credentials. Controlled API browser tests complement the real
local RLS suite; they do not assert hosted Auth provisioning or a new hosted deployment.

**D-059 — Route payload isolation after adding admin.** The public United budget check exceeded 180 KiB by
less than 0.5 KiB after the chunk graph changed. Inspection showed that its named import from the canonical media
JSON also pulled unrelated route metadata into the initial request set. `prepare-united-media.mjs` now derives a
United-only JSON payload during the existing content preparation step, keeping the same media lookup contract
and canonical source. Both public budget tests pass without changing their thresholds. Mock admin loads no Auth
SDK/query implementation; the dashboard module is deferred until the guard succeeds. No public motion changes
are included.

**D-060 — Motion signatures and numeric prose.** P11 keeps the established geographic orientation of
United's halves, connecting-card photographs, maps and skyline. Reading-direction icon translation now
uses dirSign on an unmirrored wrapper; the icon itself mirrors separately. Measured nav coordinates are
converted to reading-direction space and back once. Bahrain's gold museum ordinals count up with Intl,
and a decorative scaleX grade line accompanies the existing labelled illustrative pearls. Fact paragraphs
contain dates, mixed units and currency denominations, not structured numeric metrics; these stay static
instead of parsing and temporarily changing historical dates or prices. The journey distance remains the
structured numeric counter. Page wipes now take the specified 0.5 seconds for each leg.

**D-061 — Motion lifecycle and loading.** Font/image/deferred-layout refresh requests coalesce for 120ms;
destination pin refreshes retain their existing focus protection. Country detail headers now share the
deferred header signature. United headers, connecting interactions, timelines and parallax initialize
near the viewport; the pearl sequence is created on entry. Ambient mosaic/slide/spinner work shares an
off-screen/hidden-tab pause helper. Heart particles complete independently of request latency. Matrix
view/catalog/intro loading runs in parallel, and wheel cooldown restarts when the slide commits so slow
loading cannot consume the transition's cooldown. Reduced motion restores final content and removes
interaction transforms; progress and grade bars animate scale rather than layout width (the transform-only
rule takes precedence over MOTION's progress-width wording). GSAP handles all animated interactions,
including the hovers that the motion table describes as CSS.

**D-062 — Layout and image performance.** Priority photos render directly without the additional LQIP fade;
lazy photos retain it. Static missing-photo ornaments use the original SVG as CSS masks, keeping the same
motif without repeated SVG DOM trees. Contact receives a generated two-id catalog rather than the full
photo catalog. Route loading reserves one viewport so a prematurely visible footer does not shift; IEEE
meta-navigation reserves link slots and the shell preloads its Open Sans font. Existing Latin display/body
preloads and script subsets remain. Bahrain's skyline focal point is 76% 50%, selected after comparing the
mobile crop with the original, and is persisted through overrides and the normal image pipeline.

**D-063 — Performance evidence and remaining target.** Before/after measurements use the same pinned
Lighthouse 12.8.2/Chromium 159 setup and default simulated mobile throttling against the production preview.
The intermediate run concurrent with Playwright is excluded; the final run is uncontended. All six final
navigation audits measure CLS 0, but startup long tasks and LCP remain above the requested targets. Preserve
the full results, including regressions, in PROGRESS rather than equating lifecycle tests or low TBT with
zero long tasks. Hosted/other-locale/interaction measurements remain follow-ups. Matrix mosaic sizes now
match its actual two-column mobile and three-column desktop frames; its existing animation is retained
because the measured LCP element was text, not a cycling photo.

**D-064 — Static metadata ownership.** United remains at `/:lang`, matching the router, rather than
inventing `/united`. All 24 Matrix slides receive their own localized metadata and OG image. Build tags
carry `data-prerender` and are removed at module startup before React owns the head, preventing stale
canonical/description tags on client navigation. Missing SITE_URL uses the existing documented example
domain; deployment must supply the actual canonical origin.

**D-065 — Host differences and security.** Cloudflare proxy rules can replace static responses, so the
spec's blanket `_redirects` rewrite is narrowed to admin routes. Unknown URLs receive the host's 404.html;
Vercel keeps the specified SPA fallback (HTTP 200 with a client-rendered noindex 404). GitHub Pages serves
dynamic admin routes with HTTP 404 while the SPA still boots. CSP meta omits frame-ancestors and
upgrade-insecure-requests, which are not enforced via meta; Pages cannot supply anti-framing, HSTS or
the other HTTP headers. HTML and immutable asset cache patterns do not overlap in `_headers`.
Vercel reads project configuration before building, so its build also emits `.vercel/output` with current
environment-derived headers and explicit static route mappings. The generated vercel.json remains
reviewable. References: https://developers.cloudflare.com/pages/configuration/redirects/ and
https://vercel.com/docs/build-output-api . Production host behavior must still be checked after deployment.

**D-066 — Portable OG typography.** Sharp composites and encodes the JPGs; Chromium rasterizes the SVG
text overlays with embedded @fontsource Fraunces/Amiri WOFF2 data, avoiding platform font substitution
and preserving Arabic shaping. Photo adaptations and source licences are recorded in public/og/credits.json.
OG generation is explicit (npm run og:generate); ordinary offline builds consume committed images and
fail if a required image is absent. No synthetic IEEE logo is used; the favicon placeholder is a neutral arch.

**D-067 — P13 interface review scope and exceptions.** Reviewed the complete application UI (shell,
country, United, Matrix, Vault, admin, miscellaneous and development specimens), shared controls,
styles and motion against Web Interface Guidelines and the React performance skill. Fixed input
metadata, icon semantics, hover states, safe-area spacing, touch targets, loading-region semantics,
Arabic map-label positioning, localized alert summaries and untranslated Bahrain conversation hints.
Native reload/close protection covers dirty story and alert forms; Vault's existing session draft
also preserves text. Decorative motion now has a keyboard-operable pause/resume control; pausing
does not prevent navigation transitions from revealing a new slide. Native video controls provide
pause as well as mute. Offscreen credit cards skip rendering until needed.

Project-specific exceptions: required IEEE English wording and brand/proper names remain unchanged
and language-tagged; EN remains the default. Editorial cultural prose is not mechanically rewritten
for generic title-case/punctuation preferences. Geographic art remains LTR; Arabic text inside it
uses isolated RTL runs. Project-approved clip-path/DrawSVG motion remains. User-uploaded photos,
brand assets and MFA QR codes retain their dedicated rendering paths rather than the static photo
catalog. Main routes, slide position and Vault filters are URL-addressable; ephemeral dialog/control
state need not all become URL parameters. Vault's incremental cards retain Flip-compatible DOM;
windowing requires a separate measured design for focus and back-navigation restoration. No speculative
CDN preconnects or framework-specific Next.js changes were added to this self-hosted Vite application.

**D-068 — Route startup and typography.** Static localized HTML now preloads only its own startup
module graph and hero photos, retaining route/admin splitting. Vite preview resolves localized
directory HTML for extensionless URLs, matching the generated production host routes. Fulfilled
locale resources are read synchronously after loaders finish instead of resuspending on resolved
promises. Fraunces is subset to the axes actually used (SOFT 40, WONK 1, weights 400–700, optical
size retained); the OFL is included and optional FontTools regeneration is documented in the script.
Brand discovery generates filenames without importing public assets through Vite. These changes
improve delivery but do not establish the Lighthouse ≥90 performance release gate; measured results
and remaining work are recorded in PROGRESS. A broad rendering-architecture replacement is not
represented as a verified QA fix.

**D-069 — Release evidence boundaries.** The old literal secret grep cannot be empty: legitimate
Edge Function variable names, SQL role names and documentation contain its patterns. Review those
references and scan credential formats/tracked environment files with scripts/check-secrets.mjs;
never print matched secret values. This scan is a heuristic, not proof against arbitrary credentials.
Local generated-header/CSP checks do not replace deployed HTTP/header review. No linked hosted
Supabase project is configured, so hosted advisors, production keys, MFA membership, backups and
sample cleanup remain operator checks. Automated axe and screenshots do not substitute for a
human screen-reader session or official IEEE approval.

Screenshot review includes every route/locale/width through contact sheets, with native PNGs retained.
Long pages use stitched viewport captures to avoid Chromium full-page texture limits and offscreen
rendering omissions. Original photographer attribution metadata and participant stories retain their
source language; translated interface labels surround them. These are not untranslated interface copy.

**D-070 — v1.0.0 handover versus public launch.** Mark implementation/handover complete and
tag the reviewed local code as requested, while retaining unmet P13 performance and
human/hosted gates. The release tag does not assert IEEE approval, production deployment,
official assets, native-speaker review or a passing Lighthouse performance target.
Deployment commands were checked against CLI 3.1.0 help and the official v3 changelog;
remote database commands explicitly use --remote. Generated hosting artifacts replace
the obsolete static public/_headers and public/_redirects references. Node 24.15.0+ is
the handover prerequisite because the package engine floor alone does not satisfy jsdom.

**D-071 — Conservative final cleanup.** Remove empty P0 scaffold modules and confirmed
unused compatibility/plugin exports. Keep the dev styleguide behind its existing
import.meta.env.DEV guard; inspect production output rather than deleting useful dev
coverage. Knip's CLI, Deno and dynamic font-path findings are reviewed false positives:
Supabase and Fraunces remain required. Do not hand-prune regeneration-owned database types.
GitHub Pages accepts all documented public settings, including contact/social/Vault mode.

**D-072 — Document actual onboarding and video limits.** The admin app has password/TOTP
login but no invitation/recovery completion UI. Correct the provisioning instructions
to require owner-managed password provisioning or a separately tested completion flow.
The file video API accepts one shared caption URL; record localized tracks as a follow-up
before publishing spoken file media, instead of claiming trilingual captions already work.

**D-073 — Audit settled Matrix contrast.** The final browser run exposed FR/AR
normal-motion contrast failures while axe sampled a partially faded-in slide. Wait for
the active slide and copy to reach opacity 1 before the contrast audit, using retrying
CSS assertions rather than a fixed delay or disabling a rule. Keep the motion tests
and reduced-motion checks intact.

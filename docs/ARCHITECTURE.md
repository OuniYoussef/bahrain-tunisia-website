# Architecture

Static SPA (Vite build → `dist/`) that can be hosted on any static host. Dynamic data (Vault stories,
alerts, newsletter, moderation) comes from Supabase. Everything else is bundled content.

## Folder layout (target)
```
src/
  main.tsx                      createRoot + <App/>
  app/
    App.tsx                     providers: QueryClientProvider > LocaleProvider > RouterProvider
    router.tsx                  route table (lazy routes), loaders for locale + namespaces
    RootLayout.tsx              PageShell: SkipLink, MetaNav, AlertBanner, SiteHeader, <Outlet/>, SiteFooter, CookieConsentSlot, ScrollRestoration
    RouteError.tsx              error element
  content/
    locales/{en,fr,ar}/{common,united,tunisia,bahrain,matrix,vault,admin,images}.json   (provided)
    media.json                  language-neutral media per item id (provided)
    images.manifest.json        photo ids + sources (provided; consumed by script + types)
    generated/images.generated.json  written by `npm run images:fetch` (widths, w/h, lqip, color, focal, credit)
    types.ts                    Content types inferred from EN JSON (see below)
  i18n/
    config.ts                   LOCALES = ['en','fr','ar'] as const; DEFAULT_LOCALE='en'; dir(); intl tags
    LocaleProvider.tsx          current locale from URL param, sets <html lang dir>, persists preference
    content.ts                  loadNamespace(locale, ns) via import.meta.glob (lazy JSON chunks), cache
    useContent.ts               useContent('tunisia') → typed content for current locale (Suspense-ready)
    format.ts                   t(template, vars), plural(forms, count), formatNumber, formatDate (latn digits)
  lib/
    gsap.ts                     registers plugins once, exports gsap + helpers (dirSign(), mm presets)
    media.ts                    media(path, id?) → { image?, images?, place?, unesco?, badgeYear?, ... }
    images.ts                   getImage(id) → generated data | null ; srcset builder
    env.ts                      typed, validated import.meta.env (zod) + feature flags
    supabase.ts                 browser client (publishable key) — only created if configured
    compress.ts                 browser image → WebP full (1600px) + thumb (480px), EXIF stripped
    cn.ts                       class joiner (clsx-like, tiny) — no tailwind-merge needed
  components/
    layout/   MetaNav, SiteHeader, SiteIdentifier, IeeeMasterBrand, MainNav, MobileNav, LanguageSwitcher,
              SiteFooter, NewsletterForm, Skyline, AlertBanner, SkipLink, CookieConsentSlot, PageTransition
    ui/       Button, ButtonLink, Container, Section, SectionHeader, Eyebrow, Badge, Card, Dialog, Sheet,
              Tabs, Pill, VisuallyHidden, Spinner, Toast/LiveRegion, Field components (Input, Textarea, Select, Checkbox)
    media/    ResponsiveImage, ArchFrame, Flag, CountryMap, RegionMap, VideoSlot, Lightbox, Ornament, Pattern
    content/  FactList, WordTable, DidYouKnow, SectionNav (scrollspy), CardGrid, InfoCard, DestinationShowcase,
              Spotlight, Timeline, FigureGrid, DateList (holidays), DishGrid, MonumentGrid, ComparisonTable,
              ConnectingGrid, ProductStrip, UnescoBadge
    motion/   SplitHeading, Reveal, Parallax, useReducedMotion
  features/
    united/          UnitedPage.tsx + sections/
    country/         CountryPage.tsx (shared frame), sections/, country.config.ts (theme, map, nav order)
    common-grounds/  CommonGroundsPage.tsx, SlideDeck.tsx, slides/*, SlideIndex.tsx, useDeckNavigation.ts
    vault/           VaultPage.tsx, StoryWall.tsx, StoryCard.tsx, StoryDialog.tsx, StoryFilters.tsx,
                     ShareStoryForm.tsx, PhotoPicker.tsx, api/{types.ts,supabaseApi.ts,mockApi.ts,index.ts}, hooks.ts
    admin/           AdminApp.tsx (lazy), auth/, queue/, reports/, alerts/, newsletter/, api.ts
    misc/            ContactPage.tsx, CreditsPage.tsx, NotFoundPage.tsx
  styles/
    index.css        @import "tailwindcss"; @theme tokens; base; components; utilities (see DESIGN_SYSTEM.md)
    fonts.css        @fontsource imports
supabase/            config.toml, migrations/*.sql, functions/{_shared,submit-story,react,report-post,subscribe,moderate}, seed.sql
scripts/             images/fetch-images.mjs (+ overrides.json, selection.lock.json), check-content.mjs, prerender-meta.mjs
tests/e2e/           Playwright specs (smoke, a11y, rtl, vault-mock, screenshots)
public/              images/svg/**, images/photos/** (generated), brand/**, media/video/** (optional), robots.txt, _headers, _redirects
```

## Routing
React Router data router (`createBrowserRouter`, `basename` from `VITE_BASE_PATH`). All routes are lazy.

| Path | Element | Notes |
|---|---|---|
| `/` | `<LocaleRedirect/>` | → `/{saved locale or 'en'}` (`localStorage['bt.locale']`). Never auto-detect from the browser: English is the default. |
| `/:lang` | RootLayout → UnitedPage | `lang` must be `en|fr|ar`, otherwise NotFound |
| `/:lang/tunisia` | CountryPage country="tunisia" | |
| `/:lang/bahrain` | CountryPage country="bahrain" | |
| `/:lang/common-grounds/:slideId?` | CommonGroundsPage | `slideId` = slide id from matrix.json (`welcome` … `cta`); invalid → first slide |
| `/:lang/vault` | VaultPage | query: `country`, `category`, `story` (opens StoryDialog), `share=1` (opens form) |
| `/:lang/contact` | ContactPage | |
| `/:lang/credits` | CreditsPage | reads `images.generated.json` credits |
| `/:lang/admin/*` | AdminApp | lazy chunk, `<meta name="robots" content="noindex">` |
| `*` | NotFoundPage | |

The route loader for `/:lang` preloads `common` + the page namespace(s) so pages render without spinners.
Switching language keeps the same path (`/fr/tunisia` → `/ar/tunisia`) and the same `slideId`/query.
`ScrollRestoration` + hash links to section ids (`/en/tunisia#food`). Section ids are stable English ids.

## i18n and content loading
- `import.meta.glob('/src/content/locales/*/*.json')` → one lazy chunk per locale+namespace.
- `loadNamespace(locale, ns)` caches the promise; `useContent(ns)` uses React 19 `use()` on it (Suspense).
- Types: `type Content = { common: typeof import('./locales/en/common.json'); … }` and
  `useContent<N extends keyof Content>(ns: N): Content[N]`. FR/AR are guaranteed to have the same shape
  by `npm run content:check` (also add a Vitest test that runs the same comparison).
- `t('Slide {current} of {total}', { current, total })` simple interpolation; `plural(forms, n, locale)`
  uses `Intl.PluralRules(locale).select(n)`, falls back to `other`, then interpolates `{count}`.
- Numbers/dates: `Intl.NumberFormat(tag)` with tag `en`, `fr`, `ar-u-nu-latn` (Western digits everywhere,
  because the content itself uses Western digits). See `I18N_RTL.md`.
- `<html lang dir>` updated by LocaleProvider. Fonts switch by `:lang(ar)` in CSS.

## Media resolution
`media.json` mirrors the locale structure but only holds language-neutral data, keyed by item `id`:
```ts
media('tunisia.destinations.featured', 'el-djem') // → { image: 'tn-dest-el-djem', place: 'el-djem', unesco: true }
media('tunisia.welcome')                           // → { images: ['tn-hero-sidi-bou-said-sea','tn-hero-sahara-dunes'] }
media('matrix.slides', 'sea')                       // → { media: { layout:'split', tunisia:[…], bahrain:[…], shared:[…] }, video: null }
```
Implement `media(path, id?)` with a typed path union generated from the JSON (or a light runtime getter
with a narrow return type). Components receive `item` (text) and `m = media(path, item.id)` (media).

## Images
`<ResponsiveImage id sizes priority? className fit? focal? alt?>` (see `ASSETS.md`):
reads `images.generated.json[id]` → `srcset` of `/images/photos/<group>/<id>-<w>.webp`, `width/height`,
blurred LQIP background (`lqip` data URI) + dominant `color`, `object-position` from `focal`.
Alt defaults to `useContent('images')[id]`; pass `alt=""` when purely decorative next to a heading with the same text.
If the id is missing in the generated file (photos not fetched yet), render an elegant placeholder
(gradient in the group colour + khatam pattern) so layouts still work.

## Data (static edition)
- This branch has no backend, visitor writes or authenticated routes. Earlier architecture diagrams
  describe main; the static edition scope here supersedes their data and admin references.
- `src/content/vault/stories.json` contains language-neutral editorial records, including six samples.
  `features/vault/stories.ts` lists stories with country/category filters and 12-item pages, and gets by id.
  React state controls pagination; URL parameters retain filters and story deep links. No data requests.
- `src/content/alerts.json` contains trilingual alerts with optional start/expiry dates and links.
  The banner filters dates on load, focus and every five minutes; dismissals last for the browser session.
- Content checks validate both JSON files. Photos use the existing manifest, locale alts and pipeline.

## Environment variables (`.env.example`)
```
VITE_SITE_URL=https://your-domain.example      # canonical URLs, sitemap, OG
VITE_BASE_PATH=/                                # '/<repo>/' on GitHub Pages
VITE_CONTACT_EMAIL=                             # shown on Contact page (mailto)
VITE_SOCIAL_INSTAGRAM=  VITE_SOCIAL_FACEBOOK=  VITE_SOCIAL_LINKEDIN=  VITE_SOCIAL_YOUTUBE=
VITE_IEEE_COOKIE_SCRIPT_URL=                    # only if IEEE provides a cookie banner script
IMAGES_CONTACT=                                 # email/URL sent in the image script User-Agent
```
`src/lib/env.ts` uses build-time public settings validated with zod and never throws for optional values (features degrade gracefully).

## Error handling & loading
Route `errorElement` with friendly message (common.error). Suspense fallbacks are skeletons, not spinners,
for page namespaces. Network errors in the Vault show retry UI. Global `window.onunhandledrejection` logs in dev only.

## Testing
Vitest: format utils (plural/interpolate), media(), locale parity, compress() sizing logic, zod schemas.
Playwright: every route × 3 locales loads without console errors; axe has no violations; RTL `dir` set;
Vault mock flow (filter, open story, heart, submit); keyboard navigation in the slide deck; screenshots at 4 widths.

## Build & hosting
`vite build` → `dist/`. `scripts/prerender-meta.mjs` (post-build) writes `dist/<lang>/<route>/index.html`
copies with route-specific `<title>`, description, canonical, hreflang and OG tags, plus `404.html`, `sitemap.xml`.
Host configs: `vercel.json`, `public/_redirects` + `public/_headers` (Netlify & Cloudflare Pages), GitHub Pages
via `404.html` fallback. See `DEPLOYMENT.md` and `SECURITY.md`.

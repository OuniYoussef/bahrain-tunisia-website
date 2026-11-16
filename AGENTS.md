# AGENTS.md — Bahrain × Tunisia (IEEE student exchange website)

You are building a premium, trilingual (EN default, FR, AR/RTL) cultural website that celebrates Tunisia,
Bahrain and what connects them. Pages: United (landing), Tunisia, Bahrain, Common Grounds Media Matrix
(24 slides), Community Experience Vault (stories wall + moderated uploads), plus Contact, Credits, Admin.

## Session protocol (do this every time)
1. Read `docs/PROGRESS.md` first (current state, what is done, what is next).
2. Read ONLY the docs the prompt lists. `docs/INDEX.md` says which doc answers what. Do not open the
   big locale JSON files whole; open the slice you need (`jq`, `rg`, or read the section).
3. Work in small verified steps. After the task: run `npm run verify`, fix everything, update
   `docs/PROGRESS.md` (tick items, add notes/known issues), log new decisions in `docs/DECISIONS.md`,
   then commit: `git add -A && git commit -m "<type>(<scope>): <summary>"` (Conventional Commits).
4. If something in the docs is wrong or impossible, choose the safest option, write it in DECISIONS.md
   and mention it in your final message. Never silently diverge.

## Stack (keep these; latest stable within the major)
TypeScript 7 (strict) · React 19 · Vite 8 · Tailwind CSS 4 (`@tailwindcss/vite`, CSS-first `@theme`) ·
GSAP 3 + `@gsap/react` (all plugins are free: ScrollTrigger, SplitText, Flip, Observer, DrawSVGPlugin) ·
React Router 8 (data router, `createBrowserRouter`) · TanStack Query 5 · Supabase (Postgres + RLS,
Storage, Edge Functions, Auth with TOTP MFA) · Cloudflare Turnstile · react-hook-form + zod 4 ·
lucide-react · Vitest + Testing Library · Playwright + @axe-core/playwright · oxlint + Prettier.
Fonts are self-hosted via @fontsource. No other UI kit (no shadcn/MUI/Bootstrap). No jQuery. No CSS-in-JS.

## Commands
| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | type-check (`tsc -b`) + production build |
| `npm run verify` | typecheck + lint + content check + unit tests + build (offline; must pass before every commit) |
| `npm run audit` | `npm audit --omit=dev --audit-level=high` (needs network; QA and releases) |
| `npm run content:check` | locale parity, placeholders, image ids, map pins (`scripts/check-content.mjs`) |
| `npm run images:fetch` | resolve/download/convert photos to WebP (`scripts/images/fetch-images.mjs`) |
| `npm run test:e2e` | Playwright (a11y + smoke + screenshots) |
| `npx supabase ...` | Supabase CLI (migrations in `supabase/migrations`, functions in `supabase/functions`) |

## Golden rules
- **No hard-coded user-facing text.** Every string comes from `src/content/locales/<lang>/<ns>.json`
  through `useContent(ns)`. English is the source of truth; FR and AR must keep the same shape
  (`npm run content:check`). Plural strings are objects `{zero,one,two,few,many,other}` → `plural()`.
- **Media is language-neutral.** Image ids, map pins, UNESCO flags and slide layouts live in
  `src/content/media.json`, keyed by namespace > section > item id. Use the `media()` helper.
- **Images only through `<ResponsiveImage id="…">`** (srcset/sizes, width/height, LQIP, focal point, alt
  from `images.json`). Never `<img src="/images/photos/…">` by hand. Missing photo → graceful placeholder.
- **RTL first-class.** Logical properties only (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`,
  `text-start`). Never `ml-/mr-/pl-/pr-/left-/right-` for layout. Geographic visuals (hero halves:
  Tunisia west/left, Bahrain east/right; maps; skyline) are NOT mirrored. See `docs/I18N_RTL.md`.
- **Motion with GSAP only**, via `src/lib/gsap.ts` + `useGSAP({ scope })`, always inside
  `gsap.matchMedia()` with a `prefers-reduced-motion: reduce` branch (no motion, content visible).
  Animate transform/opacity/clip-path only. See `docs/MOTION.md`.
- **Accessibility is a requirement**: semantic landmarks, one h1 per page, visible focus, keyboard paths,
  44px targets, WCAG AA contrast, `prefers-reduced-motion`, captions/alt, live regions for async UI.
- **IEEE branding is mandatory** (meta-nav, Master Brand upper-right, site identifier upper-left,
  required footer links + exact copyright/descriptor text). See `docs/IEEE_BRANDING.md`. Never redraw
  the IEEE logo; use files in `public/brand/` (placeholders until the official files are added).
- **Security**: browser only gets the Supabase *publishable* key. All writes from visitors go through
  Edge Functions (Turnstile + rate limit + validation). RLS on every table. Never log or expose secrets.
  Treat all user content as untrusted text (never `dangerouslySetInnerHTML`). See `docs/BACKEND.md`, `docs/SECURITY.md`.
- **Performance budget**: route-level code splitting; initial JS ≤ 180 KB gz; LCP image `fetchpriority="high"`;
  everything else lazy; fonts subset + `font-display: swap`; no layout shift (always width/height/aspect-ratio).
- **TypeScript**: strict, no `any`, no `@ts-ignore` (use `@ts-expect-error` with a reason if unavoidable).
  `erasableSyntaxOnly` is on → no enums/namespaces; use `as const` objects and union types.
- Keep components small (< ~200 lines). Co-locate feature code under `src/features/<feature>/`.
- Scripts and file operations must be cross-platform (the team may use Windows): prefer Node scripts/`npx` over
  bash-only tools (`rsync`, `sed -i`, `cp -r`); npm scripts must not rely on POSIX env syntax.

## Where things are
```
AGENTS.md            ← you are here      docs/            ← specs (see docs/INDEX.md)
src/content/         ← locales/<en|fr|ar>/*.json, media.json, images.manifest.json, generated/
src/features/        ← united, country, common-grounds, vault, admin, misc
src/components/      ← layout, ui, media, content, motion
src/lib/             ← gsap, media, images, supabase, env, compression, utils
supabase/            ← migrations, functions, seed.sql, config.toml
scripts/             ← images/fetch-images.mjs, check-content.mjs, prerender-meta.mjs
public/              ← images/svg (maps, skyline, patterns, ornaments, flags), images/photos (generated), brand/
```

## Skills installed for you (`.agents/skills/`)
Use them explicitly when relevant: `$frontend-design` (visual quality, distinctive UI),
`$web-design-guidelines` (UI/a11y review), `$vercel-react-best-practices` (React perf),
`$vercel-composition-patterns` (component APIs), `$gsap-core` `$gsap-react` `$gsap-scrolltrigger`
`$gsap-timeline` `$gsap-plugins` `$gsap-performance` (animation), `$supabase` and
`$supabase-postgres-best-practices` (backend), `$webapp-testing` (Playwright checks).
The design direction in `docs/DESIGN_SYSTEM.md` wins over generic skill advice when they conflict.

## Definition of done (every task)
- Works in EN, FR and AR (RTL) at 360px, 768px, 1280px and 1920px widths, keyboard-only and with reduced motion.
- No console errors/warnings. `npm run verify` passes. Docs updated. Committed.

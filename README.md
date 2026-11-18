# Bahrain × Tunisia

A trilingual cultural website for an IEEE student exchange: explore Tunisia and Bahrain,
compare their shared heritage in a 24-slide Common Grounds presentation, and contribute
stories and photos to the moderated Community Experience Vault. English is the default;
French and Arabic have equivalent content and routes, including RTL navigation.

The v1.0.0 code handover is complete. Public launch still depends on the performance,
editorial, IEEE and hosted-service gates in [PROGRESS](docs/PROGRESS.md).

## Stack

React 19, TypeScript 7 (strict), Vite 8, Tailwind CSS 4, React Router 8, GSAP 3,
TanStack Query 5, react-hook-form and Zod 4. Supabase provides Postgres/RLS, Storage,
Auth with TOTP MFA and Edge Functions; Cloudflare Turnstile protects visitor writes.
Fonts are self-hosted. Vitest, Testing Library, Playwright/axe, oxlint and Prettier
provide checks. package-lock.json records exact versions.

## Quick start: mock mode

Use Node **24.15.0+** (24.21.0 was used for handover) and npm. From the repository root:

```sh
npm ci
node -e "require('node:fs').copyFileSync('.env.example', '.env.local')"
npm run dev
```

Set VITE_VAULT_MODE=mock in .env.local. Open the URL printed by Vite (normally
http://localhost:5173), then /en, /fr or /ar. The default auto mode also uses mocks
when backend settings are absent. Mock submissions/reactions are browser-local,
not shared production data; clear site storage to reset them. Admin requires Supabase.
The development server includes /dev/styleguide; production excludes that route/code.

## Full Supabase setup

For local development, install and start Docker, then:

```sh
npx supabase start
npx supabase db reset
node -e "require('node:fs').copyFileSync('supabase/functions/.env.example', 'supabase/functions/.env')"
```

The reset destroys/recreates the **local** database and inserts six sample posts.
Set a fresh random IP_HASH_SALT in supabase/functions/.env. The example provides
local Vite origins and a development-only Turnstile test secret. Generate a salt with:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

In .env.local set VITE_VAULT_MODE=supabase, VITE_SUPABASE_URL and
VITE_SUPABASE_PUBLISHABLE_KEY from the local status output (npx supabase status),
and VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA.
Run the following in separate terminals; restart Vite after environment changes:

```sh
npx supabase functions serve --env-file supabase/functions/.env
npm run dev
```

Never put secret/service keys in VITE_* variables: they are public. Keep JWT verification
enabled for moderate; do not serve all functions with --no-verify-jwt.
Provision moderators as below. For a hosted backend, follow the exact
[production sequence](docs/DEPLOYMENT.md#supabase-production).
[BACKEND](docs/BACKEND.md) covers SQL/Deno tests, local integration smoke tests,
generated types and recovery. Local Auth configuration does not configure hosted Auth.

## Commands

| Command                                     | Purpose                                                                    |
| ------------------------------------------- | -------------------------------------------------------------------------- |
| npm run dev                                 | Generate content projections and start Vite                                |
| npm run build                               | Prepare content, typecheck, bundle and generate metadata/hosting artifacts |
| npm run preview                             | Preview the existing dist build                                            |
| npm run verify                              | Typecheck, lint, content checks, unit tests and production build           |
| npm run typecheck / npm run lint / npm test | Individual checks                                                          |
| npm run format:check / npm run format       | Check formatting / rewrite it                                              |
| npm run content:check                       | Locale parity, placeholders, image and map references                      |
| npm run images:fetch -- --only=ID           | Resolve/download/convert selected photos; needs network                    |
| npm run og:generate                         | Regenerate social cards; needs Chromium                                    |
| npm run test:e2e -- --workers=2             | Browser suite against production preview and dev styleguide                |
| npm run test:seo                            | Static heads, deep links and generated CSP after build                     |
| npm run test:admin                          | Admin browser suite with intercepted backend responses                     |
| npm run test:vault                          | Vault checks including an isolated configured build                        |
| npm run audit                               | Network-dependent production dependency advisory check                     |

Install the browser once with npx playwright install chromium. Build before test:e2e;
its config starts preview on 4173 and Vite on 5173. Keep those ports free.
The suite covers EN/FR/AR, 360/768/1280/1920px, keyboard, reduced motion and axe.
Backend integration and human/hosted checks are separate.

## Edit content and photos

Edit src/content/locales/en/NAMESPACE.json first, then matching fr and ar files.
Preserve ids, key shape, interpolation tokens and plural forms. Components use
useContent(namespace). Run content:check and verify. Do not edit generated projections
under src/content/generated by hand; dev/build regenerate them.

Language-neutral photo ids, map pins, UNESCO flags and slide layouts belong in
src/content/media.json. Photo source/size definitions belong in
src/content/images.manifest.json; alt text belongs in each locale's images.json.
Render photos through ResponsiveImage.

To replace a photo, pin its Commons filename in scripts/images/overrides.json, or
add an owned photo under scripts/images/own with author/license metadata.
Set IMAGES_CONTACT in the process environment: the image tool does not load .env.local.
In PowerShell use Set-Item Env:IMAGES_CONTACT 'team@example.org'; in POSIX shells use
export IMAGES_CONTACT='team@example.org'. Then:

```sh
npm run images:fetch -- --only=tn-dest-el-djem --refresh --force
```

Review scripts/images/report.html for subject accuracy, license and credits. Commit
changed sources/overrides, scripts/images/selection.lock.json, generated catalog/credits
and public/images/photos WebPs. New ids also need manifest entries, three alt texts and
a media reference. src/content/image-review.json withholds unsuitable selections;
remove holds only after reviewing replacements. Missing/withheld images show placeholders.
Photo URLs cache for one year: use new ids or purge the host cache for replacements;
existing browser copies may persist. Regenerate public/og with og:generate after title/photo changes.

## Add a video to a slide

Find the id under matrix.slides in src/content/media.json and replace its video: null
(keep the existing media object). For a self-hosted file:

```json
{
  "provider": "file",
  "src": "/videos/ships-songs.mp4",
  "poster": "tn-fest-mezoued",
  "captions": "/videos/ships-songs.vtt"
}
```

Place licensed compressed media and WebVTT captions in public/videos. Paths use the
configured site base; the poster must be an existing photo id. The current file API
supports **one shared caption track**, labelled with the active locale. Use a
language-neutral clip or extend the API for EN/FR/AR tracks before publishing speech.
Alternatively use a captioned YouTube upload:

```json
{ "provider": "youtube", "id": "YOUR_VIDEO_ID" }
```

YouTube loads its privacy-enhanced player after Play. Files play muted while active,
pause offscreen, and require Play with reduced motion. Vimeo is not implemented.
External file hosts require a CSP change in scripts/write-headers.mjs.
Run verification, then test the slide in every locale, keyboard and reduced-motion mode,
including captions, mute controls and pause on navigation.

## Moderate

The project owner disables public Auth signups, enables TOTP, invites moderators and
adds their Auth user ids to public.admins (SQL example in BACKEND).
The site has no invitation/password-reset completion screen: the owner must provision
a password using trusted Auth administration (Dashboard/Admin API), or supply a separate
configured completion flow. Do not point an invitation at the login page and assume it
sets a password. Complete password setup, then visit
/en/admin, /fr/admin or /ar/admin. Protected queues require TOTP verification.

Review pending stories/private photos for consent, identifying details, relevance and
rights. Approve publishes the post/photos; reject removes pending photos. Hide withdraws
publication; restore republishes; delete permanently removes the story and stored photos.
Review and resolve reports; three open reports automatically hide a story by default.
Delete all sample-labelled posts before launch. The dashboard also manages multilingual
alerts and newsletter CSV export; treat exports as personal data.
Removing a photo cannot recall downloaded/cached copies. Failed moderation transitions
need the reservation/storage recovery procedure in BACKEND before retrying.

## Documentation

- [INDEX](docs/INDEX.md): specification and page-brief map.
- [PROGRESS](docs/PROGRESS.md): completed work, evidence and open launch gates.
- [DEPLOYMENT](docs/DEPLOYMENT.md): hosting, production setup, launch checklist and rollback.
- [BACKEND](docs/BACKEND.md), [SECURITY](docs/SECURITY.md): data contracts and operations.
- [IEEE_BRANDING](docs/IEEE_BRANDING.md): official assets, review and registration.
- [DESIGN_SYSTEM](docs/DESIGN_SYSTEM.md), [I18N_RTL](docs/I18N_RTL.md), [MOTION](docs/MOTION.md): UI conventions.
- [DECISIONS](docs/DECISIONS.md): decisions; [AGENTS](AGENTS.md): contributor workflow.

Before committing, run verification and relevant browser checks, update PROGRESS and
record new decisions. Public launch requires the remaining checklist to be signed off.

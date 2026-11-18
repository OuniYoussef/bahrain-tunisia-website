# Bahrain × Tunisia — static edition

A trilingual IEEE student exchange website: United, Tunisia, Bahrain, the 24-slide Common Grounds
Media Matrix, Community Experience Vault, Contact and Credits. EN is the default; FR and AR/RTL,
design, motion, maps, IEEE elements and localized SEO remain.

This `static-site` branch differs from `main`: no Supabase/database, admin/moderation dashboard,
submissions, uploads, hearts, reports, Turnstile or newsletter. The Vault is a read-only JSON wall;
announcements are JSON too. Sharing links lead to the Vault or Contact so visitors can email the team.

## Run locally

Use Node 24.15.0+ and npm:

```sh
npm ci
npm run dev
npm run build
npm run preview
```

Run dev for editing, or build then preview the production output. Routes start at /en, /fr and /ar.
The development-only /dev/styleguide remains. No service credentials or Docker are needed.

## Configuration

Copy .env.example to .env.local if needed. Public settings are validated at build time:

| Variable                                                                               | Purpose                                                        |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| VITE_SITE_URL                                                                          | Canonical HTTPS origin; replace the example before deploying   |
| VITE_BASE_PATH                                                                         | / by default; /repository/ for a subpath                       |
| VITE_CONTACT_EMAIL                                                                     | Team mailto link, including stories sent by visitors           |
| VITE_SOCIAL_INSTAGRAM, VITE_SOCIAL_FACEBOOK, VITE_SOCIAL_LINKEDIN, VITE_SOCIAL_YOUTUBE | Optional social links                                          |
| VITE_IEEE_COOKIE_SCRIPT_URL                                                            | Optional IEEE-provided script                                  |
| IMAGES_CONTACT                                                                         | Image-fetch User-Agent contact; set in the process environment |

No VITE_* value is secret. Rebuild after changes. Zod remains for build-time environment validation.

## Stories and alerts

Add records to [stories.json](src/content/vault/stories.json). Copy an existing shape, use a unique id,
author_name, country (tunisia/bahrain/both/other), category (story/photo/diary/anecdote), title, body,
locale (en/fr/ar), place_year (text or null), approved_at (fixed ISO timestamp), is_sample and image_ids.
Set is_sample=false for a reviewed real story. The six existing examples stay labelled. Array order
controls the wall; the first image is the cover. Text is language-neutral editorial data, not translated
UI copy. Review publication consent and rights; never add private email addresses. Visitors cannot write.

Photos must be manifest ids, not URLs. Add them through the image pipeline below; multiple image_ids
appear in the dialog carousel. Build preparation regenerates the Vault catalog automatically.
Country/category URL filters, 12-item pagination and ?story=ID deep links remain.

Edit [alerts.json](src/content/alerts.json), initially []. Each alert has a unique id, level
(info/warning/critical), message_en, message_fr and message_ar. Optional link_url accepts HTTPS/HTTP
or a local path (include the deployment base). Optional starts_at/expires_at use ISO timestamps with
timezone. Omit dates for an always-active notice. Remove a record to withdraw it, then rebuild/deploy.
The banner checks dates on load, focus and every five minutes; dismissals last for that browser session.
Use a new id for a replacement announcement that should be shown again.

## Content and photos

Edit src/content/locales/en first, then matching fr/ar keys. Keep ids, placeholders and plural forms.
Media/layout/map references live in src/content/media.json. Do not hand-edit generated catalogs.
Add photo definitions in images.manifest.json, alt text in all three images.json files and a reference
in media.json. Pin suitable Commons sources in scripts/images/overrides.json, or add owned files and
author/license metadata under scripts/images/own. Set IMAGES_CONTACT in the process environment, then:

```sh
npm run images:fetch -- --only=IMAGE_ID --refresh --force
npm run content:check
npm run verify
```

Review scripts/images/report.html for subject, license and credit accuracy. Commit source/override
changes, selection.lock.json, generated metadata/credits and public/images/photos. Respect image-review.json
holds. Use a new id or purge host caches when replacing immutable photo URLs. Run npm run og:generate
after changing social-card titles/photos. See [Common Grounds](docs/pages/common-grounds.md) for video wiring.

## Deploy and maintain

Build and publish dist to a static host. Existing vercel.json supplies Vercel routing/headers;
generated _headers/_redirects support Netlify and Cloudflare Pages. The GitHub Pages workflow runs
on static-site and supports a repository subpath. Other hosts should serve generated route folders
and 404.html. GitHub Pages has meta CSP but cannot send custom HTTP security headers.
See [deployment](docs/DEPLOYMENT.md), [security](docs/SECURITY.md) and [progress](docs/PROGRESS.md).
Official IEEE assets/review, editorial review and the existing performance target remain launch gates.

Before committing run npm run verify (typecheck, lint, content, unit tests and production build).
Existing browser specs remain available; install Chromium with npx playwright install chromium.
The branch conversion uses only the existing bootstrap smoke on one desktop project.

Bring later changes from main by reviewing and cherry-picking **content-only commits**:

```sh
git switch static-site
git cherry-pick CONTENT_COMMIT
npm run verify
```

Never merge backend code from main. Review content shape changes against the static model before
cherry-picking. Keep a previous deployment artifact for rollback.

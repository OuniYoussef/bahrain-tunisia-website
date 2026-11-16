# Deployment (host-agnostic) — finalised in P14

## 0. Before the first deploy
1. Photos fetched and committed (`public/images/photos/**`, `scripts/images/selection.lock.json`, `src/content/generated/images.generated.json`).
2. Official IEEE files in `public/brand/` and `public/favicon/` (see `public/brand/README.md`).
3. Supabase production project ready (section 2). Production Turnstile widget created for your domain(s).
4. `npm run verify` and `npm run test:e2e` green.

## 1. Frontend hosting (pick one)
Build command `npm run build` (runs `vite build` + `scripts/prerender-meta.mjs`) · output `dist/` · Node 22 LTS or newer.
Environment variables: everything in `.env.example` that starts with `VITE_`.

| Host | Steps | Notes |
|---|---|---|
| **Vercel** (recommended) | Import the Git repo → framework "Vite" → set env vars → deploy. `vercel.json` holds rewrites (`/(en|fr|ar)/(.*)` → prerendered file or `/index.html`) and headers. | Preview deployments per branch are handy for IEEE reviews. Add the preview domain to `ALLOWED_ORIGINS` only for staging projects. |
| **Netlify** | New site from Git → build `npm run build`, publish `dist` → env vars. `public/_redirects` (`/* /index.html 200` after specific rules) and `public/_headers` are copied to `dist`. | Same `_headers` syntax as Cloudflare Pages. |
| **Cloudflare Pages** | Create project from Git → build `npm run build`, output `dist` → env vars (Production + Preview). Uses `_redirects` and `_headers`. | Turnstile and Pages are both Cloudflare: simple domain setup. |
| **GitHub Pages** | Set `VITE_BASE_PATH=/<repo>/` (or `/` with a custom domain), GitHub Action builds and uploads `dist` (workflow in `.github/workflows/pages.yml`). Prerendered route folders make deep links work; `404.html` (copy of `index.html`) catches dynamic routes. | No custom headers → CSP via `<meta>` fallback (no `frame-ancestors`). Prefer the other hosts if possible. |

Custom domain: add DNS records as the host instructs, enforce HTTPS, then update `VITE_SITE_URL`, Supabase
`ALLOWED_ORIGINS`, Auth "Site URL" + redirect URLs, Turnstile allowed hostnames, and re-deploy.

## 2. Supabase production
1. Create the project (region close to users, e.g. Europe/Middle East). Enable PITR/backups according to the plan.
2. `npx supabase link --project-ref <ref>` → `npx supabase db push` (migrations) → do **not** run the seed in production
   unless you want sample posts for review (then delete them before launch).
3. Storage buckets are created by migration 0002 — verify `vault-pending` is private and `vault-public` is public.
4. Secrets: `npx supabase secrets set TURNSTILE_SECRET_KEY=… IP_HASH_SALT=$(openssl rand -hex 32) ALLOWED_ORIGINS=https://your-domain AUTO_HIDE_THRESHOLD=3`.
5. Deploy functions: `npx supabase functions deploy submit-story react report-post subscribe moderate`.
6. Auth: disable sign-ups, TOTP MFA on, invite moderators, insert them into `public.admins` (BACKEND.md).
7. Optional `pg_cron` maintenance jobs (migration 0003). Run Security & Performance Advisors → 0 errors.
8. Copy the project URL and **publishable** key into the host's env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`).

## 3. After deploy
- Smoke test every route in 3 languages; submit a test story, approve it in `/en/admin`, see it on the wall, delete it.
- Check headers (`curl -I https://your-domain/en`), CSP console errors, Lighthouse.
- Submit the site to the IEEE website review (wireframe → visual → beta URL) and register it (IEEE_BRANDING.md §9).
- Delete sample posts before the public launch.

## 4. Updating content later
Edit the locale JSON (EN → FR → AR), `npm run content:check`, commit; the host rebuilds automatically.
New photo: manifest + alt texts + media.json + `npm run images:fetch -- --only=<id>`.

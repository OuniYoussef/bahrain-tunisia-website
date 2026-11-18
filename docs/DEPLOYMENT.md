# Deployment and launch

Run commands from the repository root after npm ci. Use Node 24.15.0+ (handover tested
on 24.21.0). This guide describes deployment; no hosted deployment or IEEE review was
performed during local handover. PROGRESS.md records the outstanding launch gates.

## Prepare the build

1. Commit reviewed photos, scripts/images/selection.lock.json, generated image metadata
   and credits. Resolve or explicitly accept missing/withheld photos in PROGRESS.
2. Obtain official public/brand/ieee-master-brand-white.svg,
   public/brand/ieee-master-brand-black.svg, public/brand/site-identifier.svg and the
   official favicon set under public/favicon. Builds detect favicon.ico, favicon.svg
   and apple-touch-icon.png; placeholders are not launch approval.
3. Configure host build variables from .env.example: VITE_SITE_URL is the HTTPS canonical
   origin; VITE_BASE_PATH is / (or /repository/ for a mounted site). Set
   VITE_VAULT_MODE=supabase, production Supabase URL/publishable key, Turnstile site key,
   contact/social settings and the IEEE-provided cookie script URL. Never expose secrets.
4. Install Chromium once, then validate:

~~~sh
npx playwright install chromium
npm run verify
npm run test:e2e -- --workers=2
npm run test:seo
npm run audit
~~~

Build runs content preparation, tsc -b, Vite and scripts/prerender-meta.mjs. It produces
dist with 93 localized route HTML files, sitemap.xml, robots.txt, 404.html, _headers and
_redirects, and regenerates root vercel.json. Static HTML contains metadata, not fully
server-rendered page bodies. Missing SITE_URL falls back to your-domain.example; never
launch with that value. Public environment changes require rebuilding.
Run npm run og:generate after changing titles/photos and commit public/og (including
credits.json); this needs installed Chromium. Ordinary builds do not.

## Frontend hosting

| Host | Setup | Routing and headers |
| --- | --- | --- |
| Vercel | Import as Vite; build npm run build, output dist; set build variables | vercel.json supplies rewrites/headers. VERCEL=1 also emits .vercel/output/config.json and static files using current build variables. Static paths have explicit mappings; other routes use the shell with HTTP 200 and client noindex. |
| Netlify | Build npm run build, publish dist; set build variables | Generated dist/_headers and dist/_redirects; only admin paths rewrite to the shell. Other missing paths use 404.html with HTTP 404. |
| Cloudflare Pages | Build npm run build, output dist; set Production and Preview variables | Same generated headers/redirects as Netlify. Do not add a catch-all 200 rewrite that replaces static heads. |
| GitHub Pages | Settings → Pages → GitHub Actions; .github/workflows/pages.yml | Static route folders return 200; dynamic routes boot via 404.html with HTTP 404. No custom HTTP security headers; CSP meta omits frame-ancestors and upgrade-insecure-requests. |

The GitHub workflow accepts the VITE_* repository variables from .env.example.
Its default base is /repository-name/ and origin https://owner.github.io; use / for
account sites/custom domains. Other hosts above are documented for root mounts.
Validate custom base builds locally using node scripts/check-seo-base.mjs and
node scripts/check-shell-base.mjs. Edit scripts/write-headers.mjs rather than generated files.

Configure DNS/HTTPS through the host. Synchronize VITE_SITE_URL, function ALLOWED_ORIGINS
(origins only, no paths), hosted Auth Site URL/redirect allowlist, and Turnstile hostnames.
Rebuild after changes. Use a separate staging project/widget for preview domains.
The cookie script origin is automatically included in generated CSP; check its actual
requests and explicitly configure any additional required origins.

## Supabase production

Use the lockfile CLI 3.1.0 (npx supabase --version). CLI 3 database commands default
to local; the remote flag is required. See the
[CLI v3 change notice](https://supabase.com/changelog/supabase-cli-v3).

1. Create team-owned production and staging projects. Configure backups/PITR appropriate
   to the plan and test a restore before launch.
2. Set a scoped SUPABASE_ACCESS_TOKEN in the process environment. Replace PROJECT_REF:

~~~sh
npx supabase link --project-ref PROJECT_REF
npx supabase db push --remote --dry-run
npx supabase db push --remote
~~~

Review the dry run before pushing. Do not use --include-seed or reset production.
Migrations in supabase/migrations create the schema and buckets (0002): verify
vault-pending is private and vault-public is public. Migration 0003 schedules retention
when pg_cron is available; otherwise arrange a trusted job for its four retention
statements (see BACKEND.md).

3. Create ignored supabase/functions/.env.production with real TURNSTILE_SECRET_KEY,
   fresh random IP_HASH_SALT, comma-separated exact production ALLOWED_ORIGINS and
   AUTO_HIDE_THRESHOLD=3. Generate a salt locally with:

~~~sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
~~~

Do not override platform-managed Supabase URL/key/JWKS variables. Deploy:

~~~sh
npx supabase secrets set --env-file supabase/functions/.env.production
npx supabase functions deploy submit-story react report-post subscribe moderate --use-api
npx supabase db lint --remote --schema public,private --fail-on warning
npx supabase db advisors --remote --type all --fail-on error
node scripts/backend-types.mjs --remote
~~~

Review generated type changes, verify and commit intentional differences.
Hosted changes request confirmation; --yes is for authorized pipelines only.
Keep verify_jwt=true for moderate in supabase/config.toml.
Run npx supabase test db --remote with **staging** linked; verify the linked ref again
before production operations. SQL test transactions roll back.

4. In hosted Auth enable email/TOTP, disable public signups, set the password policy
   (minimum 12), Site URL and invitation/recovery redirects. Invite moderators, complete
   password setup, then add their ids to public.admins using BACKEND.md's provisioning
   example. The site has no invitation/password-reset completion screen: provision
   passwords using trusted Dashboard/Admin API administration or a separate configured
   completion flow, and test onboarding before sending invitations.
   Confirm /en/admin TOTP enrollment/login and denial of protected data to
   non-admin/aal1 sessions. Local config does not update hosted Auth. Review
   npx supabase config diff before config push: local URLs and unrelated settings exist.
5. Set frontend VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, the production
   VITE_TURNSTILE_SITE_KEY and VITE_VAULT_MODE=supabase. Rebuild.

## After deployment

- Smoke every public route, direct Matrix slide links, Admin and unknown routes in
  EN/FR/AR. Check RTL/mobile, keyboard, screen reader and real 200% browser zoom.
- Submit a real story/photo, approve with MFA, check public visibility, report/hide and
  delete it. Test newsletter/alerts and clean up test data. Check rejection of invalid
  Turnstile tokens and disallowed origins. Browser mocks do not establish these properties.
- Inspect curl -I https://YOUR_DOMAIN/en, static heads, CSP console/network errors,
  securityheaders.com and mobile Lighthouse. Local test:seo checks generated headers,
  not provider behavior. Resolve the P13 performance gate (six routes currently below 90).

## Launch day

- [ ] Official black/white IEEE Master Brand, approved identifier and favicon files are
  present and visually checked; placeholders are not rendered.
- [ ] IEEE cookie governance integration and organizing units' names/logos are confirmed.
- [ ] IEEE Experience Design review is booked: wireframe, visual design and pre-launch
  beta stages are accounted for; pre-launch approval is received before public launch.
  Arrange via the website review request form / exd-team@ieee.org. Complete Website
  and Social Media Site Registration (IEEE_BRANDING.md §9). Record team owner and dates.
- [ ] Delete all sample-labelled posts and smoke-test submissions through Admin, checking
  all statuses. Real participant stories have publication permission.
- [ ] Production URL, publishable key, Turnstile site/secret keys, random salt, origins
  and Auth redirects are set; mock mode/test keys/example URLs are absent.
- [ ] TOTP moderation works, signups are disabled, advisors are clear, private storage,
  RLS, retention, backups/restore and an incident owner are confirmed.
- [ ] Release checks pass; hosted headers/CSP, accessibility, native-speaker/photo review
  and performance gates have signed-off evidence recorded in PROGRESS.
- [ ] Domain/HTTPS, contact details, social cards and sitemap use the final domain.

## Updates and recovery

Edit locale JSON EN → FR → AR, run npm run content:check and npm run verify, then commit
for rebuilding. README.md covers photos/videos. Immutable photo URLs need a new id or
CDN purge when replaced; browsers may retain old copies.

Keep the previous successful frontend deployment for rollback, with its matching
environment; first check API compatibility. Database migrations are forward changes:
do not reset or blindly roll back production. Restore a tested backup or apply a
reviewed corrective migration. Failed moderation can leave hidden reservations/files
in both buckets: follow BACKEND.md reconciliation before retrying.

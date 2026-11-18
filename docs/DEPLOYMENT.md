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
   contact/social settings and the IEEE-provided cookie script URL. No data service is required.
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
| Netlify | Build npm run build, publish dist; set build variables | Generated dist/_headers and dist/_redirects; public routes use generated HTML. Missing paths use 404.html with HTTP 404. |
| Cloudflare Pages | Build npm run build, output dist; set Production and Preview variables | Same generated headers/redirects as Netlify. Do not add a catch-all 200 rewrite that replaces static heads. |
| GitHub Pages | Settings → Pages → GitHub Actions; .github/workflows/pages.yml | Static route folders return 200; dynamic routes boot via 404.html with HTTP 404. No custom HTTP security headers; CSP meta omits frame-ancestors and upgrade-insecure-requests. |

The GitHub workflow accepts the VITE_* repository variables from .env.example.
Its default base is /repository-name/ and origin https://owner.github.io; use / for
account sites/custom domains. Other hosts above are documented for root mounts.
Validate custom base builds locally using node scripts/check-seo-base.mjs and
node scripts/check-shell-base.mjs. Edit scripts/write-headers.mjs rather than generated files.

Configure DNS/HTTPS through the host and rebuild after changing VITE_SITE_URL. The optional
cookie script origin is included in script-src; connect-src remains self. Review its actual requests.
The GitHub Pages workflow runs from static-site or by manual dispatch.

## After deployment

- Smoke every public route, direct Matrix slide links, Vault story links and unknown routes in
  EN/FR/AR. Check RTL/mobile, keyboard, screen reader and real 200% browser zoom.
- Check Vault filters, dialogs and Contact links. Publish/remove announcements by editing
  src/content/alerts.json and rebuilding; dates control runtime visibility.
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
- [ ] Review the six labelled sample records and replace them with consented participant stories
  when ready. Set the final contact email so visitors can send stories to the team.
- [ ] Release checks pass; hosted headers/CSP, accessibility, native-speaker/photo review
  and performance gates have signed-off evidence recorded in PROGRESS.
- [ ] Domain/HTTPS, contact details, social cards and sitemap use the final domain.

## Updates and recovery

Edit locale JSON EN → FR → AR, run npm run content:check and npm run verify, then commit
for rebuilding. README.md covers photos/videos. Immutable photo URLs need a new id or
CDN purge when replaced; browsers may retain old copies.

Keep the previous successful static deployment and matching environment for rollback. Restore that
artifact or revert the content commit and rebuild. There is no database state to migrate.

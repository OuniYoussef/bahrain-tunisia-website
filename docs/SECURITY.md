# Security

## Threat model (what we defend against)
| Threat | Mitigation |
|---|---|
| Spam/bot submissions, floods | Turnstile (server-verified), honeypot + min fill time, per-IP-hash rate limits, payload/size limits, admin approval before publication |
| Malicious files (polyglots, huge images, EXIF GPS leaks) | Browser re-encodes to WebP (EXIF stripped); server checks WebP magic bytes + dimensions + size; buckets accept only `image/webp` ≤ 1 MB; pending bucket is private |
| XSS through stories | Stored as plain text; rendered as text nodes only (React escapes); `dir="auto"`; no `dangerouslySetInnerHTML`, no markdown/HTML rendering; strict CSP |
| Data scraping of unpublished content | anon has no table privileges; only `get_stories`/`get_story` (approved only) |
| Privilege escalation | RLS on all tables; no visitor write policies; admin needs `admins` membership **and** aal2 (TOTP); signups disabled |
| Secret leakage | Only `VITE_*` vars reach the browser (publishable key, Turnstile site key). Secret keys only in Edge Function secrets. `.env*` gitignored; CI never prints env |
| Clickjacking | `frame-ancestors 'none'` + `X-Frame-Options: DENY` |
| Abuse via reports (mass hiding) | Reports need Turnstile + rate limit + unique per reporter; auto-hide only at threshold, reversible by admin |
| Personal data | Minimal: chosen display name, story, photos. IPs stored only as salted SHA-256 and purged (cron). Newsletter emails with consent + unsubscribe token. No analytics |
| Supply chain | Lockfile committed, `npm run audit` (fails on high) in QA/release, pinned major versions, skills reviewed before use |

## HTTP security headers (production)
Generated at build by `scripts/prerender-meta.mjs` (or a small `scripts/write-headers.mjs`) into `dist/_headers`
(Netlify, Cloudflare Pages) and `vercel.json` (Vercel), with the real Supabase origin substituted:
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://challenges.cloudflare.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://<ref>.supabase.co;
  font-src 'self';
  connect-src 'self' https://<ref>.supabase.co https://challenges.cloudflare.com;
  frame-src https://challenges.cloudflare.com https://www.youtube-nocookie.com https://player.vimeo.com;
  media-src 'self' https://<ref>.supabase.co;
  object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()
Cross-Origin-Opener-Policy: same-origin
```
Add the IEEE cookie script host to `script-src`/`connect-src` only if `VITE_IEEE_COOKIE_SCRIPT_URL` is set.
`style-src 'unsafe-inline'` is required for style attributes set by libraries; scripts remain strict (no inline JS:
move any inline script from `index.html` into a module). GitHub Pages cannot send headers: add a `<meta http-equiv="Content-Security-Policy">`
fallback (frame-ancestors is ignored there; document the limitation).
Cache headers: `/assets/*` and `/images/photos/*` → `public, max-age=31536000, immutable`; HTML → `no-cache`.

## Frontend rules
- Never render user content as HTML. Links in stories are shown as plain text (no auto-linking).
- External links: `rel="noopener noreferrer"` when `target="_blank"` (IEEE links open in the same window).
- Validate every form with zod on the client (UX) **and** on the server (security). Same limits as the DB.
- `localStorage` contains no personal data (only locale, device id for hearts, dismissed alerts).
- Admin chunk is lazy-loaded and noindexed; admin routes check session + aal2 + `is_admin()` before rendering data.
  Idle sign-out after 30 minutes. Never cache admin data in persistent storage.
- Turnstile widget: render explicitly in the form/report dialog, `action` names `submit-story`, `report-post`, `subscribe`.

## Release checklist
- [x] P13 `npm run audit`: zero vulnerabilities.
- [x] P13 tracked credential/environment scan (`node scripts/check-secrets.mjs`) passes; references from
      `git grep -nE "sb_secret_|service_role|TURNSTILE_SECRET"` reviewed as variable/role names and documentation.
      Literal grep cannot be empty in this repository; see D-069. This heuristic does not certify arbitrary secrets absent.
- [ ] Supabase Security Advisor: 0 errors; RLS enabled on all tables; signups disabled; MFA on for every admin.
- [ ] Production Turnstile keys; `ALLOWED_ORIGINS` = production domain(s) only.
- [ ] Headers verified with `curl -I` and securityheaders.com (A or better). [ ] CSP has no violations in the console.
- [x] Local generated-header harness: 93 static heads / 30 EN/FR/AR deep links, zero CSP violations.
- [ ] Sample posts deleted. [ ] Backups/PITR as per plan; export of subscribers restricted to admins.

P13 has no linked hosted Supabase project. Advisor results, production Auth/Turnstile/origin settings,
deployed headers, backup policy and sample removal require the production operator; local mock tests
and generated configuration do not verify them. Re-run checked items against each release artifact.

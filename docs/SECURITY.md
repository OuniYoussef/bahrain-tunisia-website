# Security — static edition

The site has no visitor submissions, authentication, uploads or remote data API. Story and alert
changes require reviewed repository commits and a new deployment. Everything in their JSON files
is public. Do not include private contact information or secrets in source or VITE_* settings.

Stories render as escaped text with dir=auto; never use dangerouslySetInnerHTML. Images use the
manifest pipeline and reviewed source/rights metadata. Content checks validate ids, categories,
dates, image references and trilingual alert messages. Alert links accept HTTP(S) or local paths.
External links using target=_blank must include rel=noopener noreferrer.

## Production headers

scripts/write-headers.mjs generates dist/_headers and vercel.json during build:

```text
default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:; font-src 'self'; connect-src 'self';
frame-src https://www.youtube-nocookie.com https://player.vimeo.com;
media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';
frame-ancestors 'none'; upgrade-insecure-requests
```

Only the optional IEEE cookie script origin is added to script-src. connect-src remains self.
Style attributes support GSAP; inline scripts remain blocked. HSTS, nosniff, DENY framing,
strict-origin-when-cross-origin referrers, restricted Permissions-Policy and same-origin COOP remain.
HTML uses no-cache; assets/photos use a one-year immutable cache.

GitHub Pages uses the generated meta CSP and cannot supply custom HTTP headers; its meta policy
omits frame-ancestors and upgrade-insecure-requests. Review actual hosted headers before launch.

Local preferences contain locale/motion choices; dismissed alert ids use sessionStorage. No story
submissions or personal data are stored by the application. Optional external players/cookie code
need operator review. Keep package-lock.json committed and run npm run audit for releases.

## Release checks

- Verify the deployed HTTPS headers, CSP console/network behavior and optional cookie script.
- Review story/photo rights, native-language content and any identifying details before publication.
- Complete IEEE, human accessibility and performance gates recorded in PROGRESS.md.
- Run verification and the tracked-secret heuristic; local checks do not certify hosted behavior.

# QA checklist (run in P13 and before every release)

## Functional
- [ ] All routes × EN/FR/AR load; deep links (`/ar/common-grounds/sea`, `/fr/vault?story=…`, `/en/tunisia#food`) work on a cold load.
- [ ] Language switch keeps path/query/hash; preference remembered; `/` redirects correctly.
- [ ] Every content section renders; no missing images (or graceful placeholders); no raw keys or English left in FR/AR.
- [ ] Media Matrix: keys, swipe, wheel, buttons, index, autoplay/pause, URL sync, video slot (test with one sample video).
- [ ] Vault (mock and Supabase): filters, infinite scroll, dialog, hearts (once per device), report, submit with 0/1/5 photos,
      oversized/invalid file errors, rate limit message, offline message, success state; post invisible until approved.
- [ ] Admin: login, MFA enrol + verify, guard without aal2, approve/reject/hide/restore/delete, reports, alerts (3 languages), CSV export.
- [ ] Newsletter: subscribe, already subscribed, invalid email, unsubscribe link.

## Accessibility (WCAG 2.2 AA)
- [ ] axe: 0 violations on every route in 3 locales (Playwright). [ ] `$web-design-guidelines` review findings fixed.
- [ ] Keyboard only: all interactive elements reachable, visible focus, no traps (dialogs trap intentionally and release).
- [ ] Screen reader smoke test (NVDA/VoiceOver): landmarks, headings order, slide announcements, form errors.
- [ ] `prefers-reduced-motion`: no movement, nothing hidden. [ ] 200% zoom and 320px width: no loss of content.
- [ ] Contrast AA everywhere (including text over photos). [ ] Targets ≥ 44px on touch. [ ] `lang` on mixed-language snippets.

## RTL / i18n
- [ ] `html[dir=rtl]` in AR; layout mirrored except geographic visuals; icons flipped correctly; numbers Western digits.
- [ ] Arabic typography (Amiri headings, no letter-spacing/uppercase); French spacing before `:;!?` intact.

## Performance (mobile, 4G throttling)
- [ ] Lighthouse ≥ 90 on Performance/Accessibility/Best Practices/SEO for United, Tunisia, Common Grounds, Vault.
- [ ] LCP < 2.5 s, CLS < 0.05, INP < 200 ms. [ ] Initial JS ≤ 180 KB gz; routes split; admin chunk separate.
- [ ] Images: correct `sizes`, no oversize downloads, LQIP visible, `fetchpriority` only on LCP image.

## Visual
- [ ] Screenshots at 360/768/1280/1920 for each route × locale reviewed (no overflow, no orphan headings, balanced crops).
- [ ] Header transparent→solid transitions, sticky behaviour, mobile sheet.

## IEEE
- [ ] Meta-nav links/order/styling; Master Brand placement/size/colour; site identifier; footer links (Home first) + exact texts.
- [ ] Favicon set; cookie banner script (if provided); alerts area works; carousel controls; review stages booked.

## Security
- [ ] `docs/SECURITY.md` release checklist complete. [ ] Supabase advisors clean. [ ] CSP without violations.

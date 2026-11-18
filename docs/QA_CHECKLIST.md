# QA checklist (run in P13 and before every release)

## Functional
- [x] All routes × EN/FR/AR load; deep links (`/ar/common-grounds/sea`, `/fr/vault?story=…`, `/en/tunisia#food`) work on a cold load.
- [x] Language switch keeps path/query/hash; preference remembered; `/` redirects correctly.
- [x] Every content section renders; missing/withheld images have graceful placeholders; no raw keys or untranslated interface sentences in FR/AR (required IEEE English, proper names and participant stories excepted).
- [ ] Media Matrix: keys, swipe, wheel, buttons, index, autoplay/pause, URL sync, video slot (test with one sample video).
- [ ] Vault (mock and Supabase): filters, infinite scroll, dialog, hearts (once per device), report, submit with 0/1/5 photos,
      oversized/invalid file errors, rate limit message, offline message, success state; post invisible until approved.
- [ ] Admin: login, MFA enrol + verify, guard without aal2, approve/reject/hide/restore/delete, reports, alerts (3 languages), CSV export.
- [ ] Newsletter: subscribe, already subscribed, invalid email, unsubscribe link.

P13 verified Matrix keys/swipe/wheel/buttons/index/autoplay/pause/history; a real sample video remains pending.
Mock Vault filters/detail/hearts/report/two-photo submission and newsletter success passed. Complete
0/1/5-photo, offline/rate-limit, unsubscribe and live Supabase acceptance remain release checks.
Admin mock tests cover login, MFA enrol/verify, non-admin denial, idle logout, rejection, trilingual
alerts and all dashboard routes; live destructive moderation/CSV acceptance remains an operator task.

## Accessibility (WCAG 2.2 AA)
- [x] axe: 0 violations on every route in 3 locales (Playwright), including authenticated mock admin screens.
- [x] `$web-design-guidelines` full UI review findings fixed or justified in D-067–D-069.
- [x] Keyboard journeys: header/mobile navigation, slide deck/index, Vault share/report dialogs, country dialogs and admin; focus traps release and restore focus.
- [ ] Screen reader smoke test (NVDA/VoiceOver): landmarks, headings order, slide announcements, form errors.
- [x] `prefers-reduced-motion`: no movement, nothing hidden; live preference changes tested.
- [x] 320px reflow on main public routes in all locales. [ ] Human 200% browser-zoom session.
- [ ] Contrast AA everywhere (including text over photos). [ ] Targets ≥ 44px on touch. [ ] `lang` on mixed-language snippets.

## RTL / i18n
- [x] `html[dir=rtl]` in AR; layout mirrored except geographic visuals; icons flipped correctly; numbers Western digits.
- [x] Arabic heading typography and French source punctuation reviewed; native-speaker editorial sign-off remains human work.

## Performance (mobile, 4G throttling)
- [ ] Lighthouse ≥ 90 on Performance/Accessibility/Best Practices/SEO for United, Tunisia, Common Grounds, Vault.
- [ ] LCP < 2.5 s, CLS < 0.05, INP < 200 ms. [ ] Initial JS ≤ 180 KB gz; routes split; admin chunk separate.
- [x] Local navigation CLS = 0; initial JS budget tests pass; route/admin splitting retained. Field INP and LCP targets remain open.
- [ ] Images: correct `sizes`, no oversize downloads, LQIP visible, `fetchpriority` only on LCP image.

## Visual
- [x] Screenshots at 360/768/1280/1920 for each route × locale reviewed with the image viewer; no remaining layout overflow. Existing missing/withheld photo subjects remain listed in PROGRESS.
- [x] Header transitions, sticky behaviour, mobile sheet and live reduced-motion behavior verified by browser tests.

## IEEE
- [ ] Meta-nav links/order/styling; Master Brand placement/size/colour; site identifier; footer links (Home first) + exact texts.
- [ ] Favicon set; cookie banner script (if provided); alerts area works; carousel controls; review stages booked.

## Security
- [ ] `docs/SECURITY.md` release checklist complete. [ ] Supabase advisors clean. [ ] CSP without violations.
- [x] Local dependency/credential scans and generated-header CSP browser checks pass. Hosted checks remain unchecked in SECURITY.md.

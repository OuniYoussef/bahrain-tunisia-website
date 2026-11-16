# Community Experience Vault (`/:lang/vault`)

Namespace `vault`; data through `vaultApi` (Supabase or mock — see `ARCHITECTURE.md`, `BACKEND.md`).

## 1. Hero
Sand background with khatam texture. Start side: eyebrow `hero.eyebrow`, h1 `hero.headline`, sub `hero.subheadline`
(display italic), intro `hero.intro`, buttons `hero.ctaShare` (opens form) and `hero.ctaBrowse` (scrolls to wall).
End side: two tilted polaroid photos (`media.vault.hero.image`, `imageSecondary`, `alt=""`) with flag stamps.

## 2. What can you share? (`categories`)
Four cards (story, photo, diary, anecdote) with icon (lucide: `feather`, `camera`, `map`, `messages-square`), title,
text and the prompt in italic quotes. Clicking a card opens the form with that category preselected.

## 3. Wall (`wall`)
- **Filters** (`wall.filtersLabel`): two segmented controls — Country (`country.*`: all/tunisia/bahrain/both) and Type
  (`category.*`). State in the URL query. Result count via `plural(wall.resultsCount, n)` when known (mock), else hidden.
- **Grid**: CSS columns masonry (1/2/3/4 columns) or CSS grid with `grid-template-rows: masonry` progressive
  enhancement. Cards appear with Flip on filter change.
- **StoryCard**: white polaroid frame; cover image (thumb, `width/height` known) or, without photo, a sand card with a
  large opening quote mark and the excerpt; title (h3), author `t(wall.by,{name})`, flag + country label, category pill,
  date (`Intl.DateTimeFormat`), heart button with count (`plural(wall.hearts)`), "Sample" badge when `is_sample`
  (+ `wall.sampleNote` tooltip). The whole card is a link/button opening the StoryDialog (`?story=<id>`).
  Prefetch `getStory` on hover/focus.
- **Infinite loading**: 12 per page; IntersectionObserver sentinel + visible `wall.loadMore` button (keyboard
  accessible fallback); `wall.end` at the end; skeleton cards while loading; `wall.error` + retry.
- **Empty states**: `wall.empty` (no stories at all) with the jasmine/razji ornament + share CTA; `wall.emptyFiltered`
  + `wall.clearFilters`.
- User text is rendered as text with `dir="auto"` and `white-space: pre-line`.

## 4. StoryDialog
Large dialog (sheet on mobile). Photo carousel (full images, keyboard arrows, `wall.previousPhoto/nextPhoto`, counter),
title, meta line (author, country, category, place/year, date), full body, heart button, report button
(`report.button`). `Esc` closes and restores focus and URL. Deep link `?story=<id>` opens it on load.

## 5. Report flow
Small dialog: `report.title`, `report.intro`, radio group `report.reasons.*`, optional details (max 500), Turnstile,
submit → `report.thanks` (live region) or `report.error`.

## 6. Share form (`form`) — `ShareStoryForm` in a large Sheet (`?share=1`)
Two-column on desktop: form start, side panel end with `guidelines` (title + 6 bullets) and `privacy.note` +
`privacy.policyLink` (IEEE Privacy Policy). Fields (react-hook-form + zod, same limits as DB):
| Field | Control | Rules |
|---|---|---|
| `name` | text | required, 1–60 |
| `country` | radio cards | required: tunisia/bahrain/both/other |
| `category` | radio cards | required: story/photo/diary/anecdote |
| `title` | text + counter `{count}/{max}` | required, 3–80 |
| `body` | textarea + counter | required, 20–1500 |
| `placeYear` | text | optional ≤ 80, hint example |
| `photos` | `PhotoPicker` | 0–5 (≥ 1 when category = photo); JPG/PNG/WEBP; drag & drop; compressed in browser to WebP full (1600px) + thumb (480px) with a progress state `photos.processing`; per-photo optional alt (`photos.altLabel`); reorder by drag or buttons; remove (`photos.remove`) |
| `consent` | checkbox | must be checked (`form.errors.consent`) |
| honeypot `website` | visually hidden text input, `tabIndex=-1`, `autocomplete=off`, label `fields.honeypot.label` | must stay empty |
| Turnstile | managed widget (`captchaLabel`) | token required |
Hidden: `locale` (current), `startedAt` (timestamp when the form opened).
Submit → `submitting` state, then success screen (`success.title`, `success.text`, buttons `success.another`,
`success.back`). Errors map to `form.errors.*` (upload, captcha, rateLimited, offline, generic). Draft text is kept in
`sessionStorage` until success. All errors are announced via `aria-live` and fields get `aria-invalid` + `aria-describedby`.
If `vaultMode` is mock: everything works locally (the new post shows as "pending" only to this browser, never in the public wall).
If Supabase is not configured and mode is `supabase`: show `unavailable.title/text` instead of the form.

## Acceptance
Nothing appears on the wall before approval; uploads are WebP ≤ 900 KB; forms fully keyboard/screen-reader usable;
RTL layout correct (Arabic stories render RTL automatically, English stories LTR in the Arabic UI); hearts are
optimistic and rate-limited server-side; filters + deep links work; Lighthouse a11y 100.

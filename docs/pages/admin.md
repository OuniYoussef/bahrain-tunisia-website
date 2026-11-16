# Admin — moderation dashboard (`/:lang/admin/*`)

Lazy-loaded chunk. `noindex`. Not linked anywhere. Uses `admin` namespace (trilingual, RTL-ready).
Visual: calm utility UI on pearl, ink sidebar, same tokens; dense tables; no decorative motion.

## Auth flow
1. **Login** (`login.*`): email + password → `supabase.auth.signInWithPassword`. Generic error message, small delay on
   failure, disable button while pending. Supabase's own rate limits apply (`login.locked` on 429).
2. **MFA**: `auth.mfa.listFactors()`.
   - No verified TOTP factor → **Enrol** (`mfa.enrollTitle/intro`): `auth.mfa.enroll({ factorType: 'totp' })`, show QR (SVG
     from Supabase, render as `<img src="data:image/svg+xml…">`) + secret (`mfa.secretLabel`), 6-digit input, `challenge` + `verify`.
   - Has factor → **Verify** (`mfa.verifyTitle/intro`): `challengeAndVerify`.
   - Check `auth.mfa.getAuthenticatorAssuranceLevel()` → must be `aal2`.
3. **Authorisation**: `rpc('is_admin')` must return true, otherwise sign out and show a neutral "not authorised" message.
4. Idle timeout 30 min → sign out. Sign out button in the sidebar (`nav.signOut`).

## Screens
| Route | Content |
|---|---|
| `admin/` (Pending) | Queue of `pending` stories (oldest first), 20 per page. Each row/card: title, author, country, category, locale, submitted date (`queue.submitted`), body (expand), photos via signed URLs (5-min) with zoom, word counts. Actions: **Approve**, **Reject** (with private reason `queue.rejectReason`), keyboard shortcuts `A` / `R` / `J`/`K` to move. Calls `moderate`. Toasts `queue.approved/rejected/error`. Empty: `queue.empty`. |
| `admin/approved` | Approved list (search by title/author), actions **Hide**, **Delete permanently** (`queue.confirmDelete` confirm dialog), sample badge (`queue.markSample`). |
| `admin/rejected` | Rejected list (read-only + delete). |
| `admin/reports` | Open reports grouped by story with counts (`plural(reports.count)`), reasons, details; actions: **View post**, **Hide**, **Resolve** (`reports.resolve`). Hidden-by-auto stories flagged. |
| `admin/alerts` | CRUD for `site_alerts`: message in EN/FR/AR (all required), level select, optional https link, expires date, active toggle, preview of the banner in the three languages, save/remove. Direct table writes (RLS admin). |
| `admin/newsletter` | Count of active subscribers (`plural(newsletter.count)`) + **Export CSV** (email, locale, consented_at, unsubscribe link `${SITE}/…/subscribe?unsubscribe=<token>` via the function URL). Export happens client-side from an admin-only select; warn that the file contains personal data. |

## Data rules
- Lists use RLS-protected selects (admin + aal2). State changes go only through the `moderate` function.
- Every action shows the moderation log entry it created (last 50 in a side drawer).
- Never store admin data in `localStorage`; TanStack Query cache cleared on sign out.

## Acceptance
A non-admin or an admin without MFA cannot see any data (verify with the Supabase SQL tests and manually).
All actions are reflected on the public wall within one refresh. Fully keyboard operable.

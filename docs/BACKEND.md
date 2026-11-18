# Backend — Supabase (Vault, alerts, newsletter, moderation)

## Overview
```
Browser (publishable key)                                   Supabase
  ├─ rpc get_stories / get_story  ───────────────► Postgres (SECURITY DEFINER read functions, approved only)
  ├─ select site_alerts (RLS: active only) ──────► Postgres
  ├─ functions: submit-story, react, report-post, subscribe ─► Edge Functions (Turnstile + rate limit + zod + WebP check)
  │                                                     └─► secret key → tables + Storage (vault-pending, private)
  └─ Admin (email+password + TOTP → aal2 JWT)
       ├─ select queue/reports/subscribers/log (RLS: is_admin() requires aal2)
       ├─ signed URLs for pending photos (storage policy: is_admin())
       └─ functions: moderate ─► approve (copy photos pending→public), reject, hide, restore, delete, resolve-report
```
Principles: **anon has no table privileges** (reads only via two read functions + alerts), **visitors never write
directly** (Edge Functions only), **RLS everywhere**, **admin actions need MFA (aal2)**, **nothing is public before
approval** (pending photos live in a private bucket), **minimal personal data** (salted IP hashes, no emails on posts).

Supabase API keys: use the new **publishable** key in the browser (`sb_publishable_…`) and the **secret** key only
inside Edge Functions (`SUPABASE_SECRET_KEYS` env, or the `@supabase/server` helpers). Legacy anon/service_role keys
are being retired; do not use them.

## Migration 0001 — schema (`supabase/migrations/<timestamp>_vault_schema.sql`)
```sql
create extension if not exists citext with schema extensions;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- Supabase grants broad default privileges on public; take them back and grant explicitly below.
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

create type public.story_status   as enum ('pending','approved','rejected','hidden');
create type public.story_country  as enum ('tunisia','bahrain','both','other');
create type public.story_category as enum ('story','photo','diary','anecdote');
create type public.report_reason  as enum ('not-owner','offensive','private','spam','other');
create type public.alert_level    as enum ('info','warning','critical');

create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.stories (
  id uuid primary key default gen_random_uuid(),
  status public.story_status not null default 'pending',
  author_name text not null check (char_length(author_name) between 1 and 60),
  country public.story_country not null,
  category public.story_category not null,
  title text not null check (char_length(title) between 3 and 80),
  body text not null check (char_length(body) between 20 and 1500),
  excerpt text generated always as (left(body, 220)) stored,
  place_year text check (place_year is null or char_length(place_year) <= 80),
  locale text not null default 'en' check (locale in ('en','fr','ar')),
  photo_count smallint not null default 0 check (photo_count between 0 and 5),
  heart_count integer not null default 0 check (heart_count >= 0),
  is_sample boolean not null default false,
  sample_image_id text check (sample_image_id is null or is_sample),
  ip_hash text,
  moderation_note text check (moderation_note is null or char_length(moderation_note) <= 500),
  moderated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz
);
create index stories_feed_idx     on public.stories (approved_at desc, id desc)           where status = 'approved';
create index stories_country_idx  on public.stories (country, approved_at desc, id desc)  where status = 'approved';
create index stories_category_idx on public.stories (category, approved_at desc, id desc) where status = 'approved';
create index stories_queue_idx    on public.stories (status, created_at);
create index stories_moderated_by_idx on public.stories (moderated_by);

create table public.story_photos (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  position smallint not null check (position between 0 and 4),
  bucket text not null check (bucket in ('vault-pending','vault-public')),
  path_full text not null,
  path_thumb text not null,
  width integer not null check (width between 1 and 4000),
  height integer not null check (height between 1 and 4000),
  alt text check (alt is null or char_length(alt) <= 200),
  created_at timestamptz not null default now(),
  unique (story_id, position)
);

create table public.story_reactions (
  story_id uuid not null references public.stories(id) on delete cascade,
  voter_hash text not null,
  created_at timestamptz not null default now(),
  primary key (story_id, voter_hash)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  reason public.report_reason not null,
  details text check (details is null or char_length(details) <= 500),
  reporter_hash text not null,
  status text not null default 'open' check (status in ('open','resolved')),
  created_at timestamptz not null default now(),
  resolved_by uuid references auth.users(id) on delete set null,
  resolved_at timestamptz,
  unique (story_id, reporter_hash)
);
create index reports_open_idx on public.reports (story_id) where status = 'open';
create index reports_resolved_by_idx on public.reports (resolved_by);

create table public.site_alerts (
  id uuid primary key default gen_random_uuid(),
  level public.alert_level not null default 'info',
  message_en text not null check (char_length(message_en) between 1 and 280),
  message_fr text not null check (char_length(message_fr) between 1 and 280),
  message_ar text not null check (char_length(message_ar) between 1 and 280),
  link_url text check (link_url is null or link_url ~ '^https://'),
  active boolean not null default true,
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index site_alerts_created_by_idx on public.site_alerts (created_by);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email extensions.citext not null unique check (char_length(email) <= 254),
  locale text not null default 'en' check (locale in ('en','fr','ar')),
  status text not null default 'active' check (status in ('active','unsubscribed')),
  consent_version text not null default 'v1',
  consented_at timestamptz not null default now(),
  unsubscribe_token uuid not null default gen_random_uuid() unique,
  ip_hash text,
  created_at timestamptz not null default now()
);

create table public.moderation_log (
  id bigint generated always as identity primary key,
  admin_id uuid references auth.users(id) on delete set null,
  action text not null,            -- approve | reject | hide | restore | delete | resolve-report | auto-hide
  story_id uuid, report_id uuid, note text,
  created_at timestamptz not null default now()
);

create index moderation_log_admin_id_idx on public.moderation_log (admin_id);

create table private.rate_events (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  action text not null,
  created_at timestamptz not null default now()
);
create index rate_events_lookup_idx on private.rate_events (ip_hash, action, created_at desc);

-- Triggers
create function public.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end $$;
create trigger stories_touch before update on public.stories for each row execute function public.touch_updated_at();

create function public.bump_heart_count() returns trigger language plpgsql security definer set search_path = '' as $$
begin update public.stories set heart_count = heart_count + 1 where id = new.story_id; return new; end $$;
create trigger story_reactions_bump after insert on public.story_reactions for each row execute function public.bump_heart_count();
```

## Migration 0002 — functions, grants, RLS, storage
```sql
-- Admin check: membership AND multi-factor session (aal2)
create function public.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins a where a.user_id = (select auth.uid()))
     and coalesce((select auth.jwt() ->> 'aal'), 'aal1') = 'aal2';
$$;

-- Rate limiting (service role only). Advisory lock avoids double-pass races per (ip, action).
create function public.hit_rate_limit(p_ip_hash text, p_action text, p_max integer, p_window interval)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_count integer;
begin
  perform pg_advisory_xact_lock(hashtext(p_ip_hash || ':' || p_action));
  select count(*) into v_count from private.rate_events
   where ip_hash = p_ip_hash and action = p_action and created_at > now() - p_window;
  if v_count >= p_max then return false; end if;
  insert into private.rate_events (ip_hash, action) values (p_ip_hash, p_action);
  return true;
end $$;

-- Public read API (approved only). Keyset pagination on (approved_at, id).
create function public.get_stories(
  p_country public.story_country default null,
  p_category public.story_category default null,
  p_before_approved_at timestamptz default null,
  p_before_id uuid default null,
  p_limit integer default 12
) returns table (
  id uuid, author_name text, country public.story_country, category public.story_category,
  title text, excerpt text, place_year text, photo_count smallint, heart_count integer,
  is_sample boolean, sample_image_id text, approved_at timestamptz,
  cover_path text, cover_width integer, cover_height integer, cover_alt text
) language sql stable security definer set search_path = '' as $$
  select s.id, s.author_name, s.country, s.category, s.title, s.excerpt, s.place_year, s.photo_count,
         s.heart_count, s.is_sample, s.sample_image_id, s.approved_at,
         p.path_thumb, p.width, p.height, p.alt
  from public.stories s
  left join lateral (
    select sp.path_thumb, sp.width, sp.height, sp.alt from public.story_photos sp
     where sp.story_id = s.id and sp.bucket = 'vault-public' order by sp.position limit 1
  ) p on true
  where s.status = 'approved'
    and (p_country  is null or s.country  = p_country)
    and (p_category is null or s.category = p_category)
    and (p_before_approved_at is null or (s.approved_at, s.id) < (p_before_approved_at, p_before_id))
  order by s.approved_at desc, s.id desc
  limit least(greatest(coalesce(p_limit, 12), 1), 24);
$$;

create function public.get_story(p_id uuid) returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'id', s.id, 'author_name', s.author_name, 'country', s.country, 'category', s.category,
    'title', s.title, 'body', s.body, 'place_year', s.place_year, 'heart_count', s.heart_count,
    'is_sample', s.is_sample, 'sample_image_id', s.sample_image_id, 'approved_at', s.approved_at,
    'photos', coalesce((select jsonb_agg(jsonb_build_object(
        'path_full', p.path_full, 'path_thumb', p.path_thumb, 'width', p.width, 'height', p.height, 'alt', p.alt)
        order by p.position) from public.story_photos p where p.story_id = s.id and p.bucket = 'vault-public'), '[]'::jsonb))
  from public.stories s where s.id = p_id and s.status = 'approved';
$$;

-- Privileges (explicit, least privilege)
revoke all on all tables in schema public from anon, authenticated;
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.get_stories(public.story_country, public.story_category, timestamptz, uuid, integer) to anon, authenticated;
grant execute on function public.get_story(uuid) to anon, authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.hit_rate_limit(text, text, integer, interval) to service_role;
grant select on public.site_alerts to anon, authenticated;
grant insert, update, delete on public.site_alerts to authenticated;          -- still gated by RLS (admin)
grant select on public.stories, public.story_photos, public.reports, public.newsletter_subscribers,
               public.moderation_log, public.admins to authenticated;          -- gated by RLS (admin)

-- RLS
alter table public.admins                 enable row level security;
alter table public.stories                enable row level security;
alter table public.story_photos           enable row level security;
alter table public.story_reactions        enable row level security;   -- no policies: service role only
alter table public.reports                enable row level security;
alter table public.site_alerts            enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.moderation_log         enable row level security;

create policy admins_self   on public.admins  for select to authenticated using (user_id = (select auth.uid()));
create policy stories_admin on public.stories for select to authenticated using ((select public.is_admin()));
create policy photos_admin  on public.story_photos for select to authenticated using ((select public.is_admin()));
create policy reports_admin on public.reports for select to authenticated using ((select public.is_admin()));
create policy subs_admin    on public.newsletter_subscribers for select to authenticated using ((select public.is_admin()));
create policy modlog_admin  on public.moderation_log for select to authenticated using ((select public.is_admin()));
create policy alerts_public on public.site_alerts for select to anon
  using (active and starts_at <= now() and (expires_at is null or expires_at > now()));
create policy alerts_authenticated on public.site_alerts for select to authenticated
  using ((active and starts_at <= now() and (expires_at is null or expires_at > now())) or (select public.is_admin()));
create policy alerts_admin_insert on public.site_alerts for insert to authenticated
  with check ((select public.is_admin()));
create policy alerts_admin_update on public.site_alerts for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy alerts_admin_delete on public.site_alerts for delete to authenticated
  using ((select public.is_admin()));
-- Stories/photos/reports have NO update/insert/delete policies: every state change goes through the
-- `moderate` Edge Function (service role) so photos move correctly and moderation_log is always written.

-- Storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('vault-pending', 'vault-pending', false, 1048576, array['image/webp']),
  ('vault-public',  'vault-public',  true,  1048576, array['image/webp'])
on conflict (id) do nothing;
create policy vault_pending_admin_read on storage.objects for select to authenticated
  using (bucket_id = 'vault-pending' and (select public.is_admin()));
-- No insert/update/delete policies for anon/authenticated on either bucket.
```

## Migration 0003 — maintenance (optional, needs `pg_cron`)
Purge `private.rate_events` older than 7 days (daily); delete `rejected` stories older than 30 days; null `ip_hash`
on stories approved more than 30 days ago; mark subscribers' `ip_hash` null after 30 days. Schedule with `cron.schedule`.

## Seed — `supabase/seed.sql` (sample posts, clearly labelled)
Six approved posts with `is_sample = true`, author `IEEE Exchange Team`, `sample_image_id` pointing to site photos
(rendered from `/images/photos/...` instead of Storage), so the wall never looks empty during development and review.
They are travel notes, not invented personal testimonials, and display a "Sample" badge. **Delete them before launch**
(`delete from public.stories where is_sample;`) once real exchange participants have shared stories.

| title | country | category | sample_image_id | locale |
|---|---|---|---|---|
| Tea above the domes of the Medina | tunisia | story | tn-dest-medina-tunis | en |
| Morning light on the Pearling Path | bahrain | photo | bh-dest-pearling-path | en |
| Une journée à Sidi Bou Saïd, pas à pas | tunisia | diary | tn-dest-sidi-bou-said | fr |
| من المقروض إلى اللقيمات | both | anecdote | tn-sweet-makroudh | ar |
| The Tree of Life at sunset | bahrain | photo | bh-dest-tree-of-life | en |
| Barcha, wayed: one word, two accents | both | anecdote | cg-calligraphy | en |
Bodies (60–90 words each) are written as neutral travel notes in the listed language, e.g.:
"Rooftop terraces around the Zitouna Mosque serve mint tea with pine nuts above a sea of domes and minarets.
Go late in the afternoon, when the white walls turn gold and the call to prayer drifts over the souks."
The same six posts power the mock API (`src/features/vault/api/samples.ts`) — keep them in sync.

## Edge Functions (`supabase/functions/*`, Deno + TypeScript)
Shared code in `supabase/functions/_shared/`: `cors.ts` (allowlist from `ALLOWED_ORIGINS`, handles OPTIONS, `Vary: Origin`),
`turnstile.ts` (POST `https://challenges.cloudflare.com/turnstile/v0/siteverify` with secret, token, remoteip,
idempotency key; require `success`), `ip.ts` (client IP from `x-forwarded-for` first hop → `sha256(IP_HASH_SALT + ip)`),
`schemas.ts` (zod, same limits as the DB), `text.ts` (NFC normalise, strip control chars except `\n`, collapse
3+ newlines, trim, count URLs), `webp.ts` (magic bytes `RIFF....WEBP` + dimensions from VP8/VP8L/VP8X header),
`respond.ts` (JSON helpers with generic error codes: `invalid_input`, `captcha_failed`, `rate_limited`,
`payload_too_large`, `not_found`, `forbidden`, `server_error`; never leak internals).
Use the official Supabase server helpers (`npm:@supabase/server@1.9.2` → `withSupabase({ auth: 'none' | 'user' })`,
`ctx.supabaseAdmin` for privileged work). The helpers read the platform-managed key maps; no legacy key fallback is used.

`supabase/config.toml`: `verify_jwt = false` for `submit-story`, `react`, `report-post`, `subscribe` (public, protected
by Turnstile/rate limits/validation); `verify_jwt = true` for `moderate`.

| Function | Input | Checks | Effect | Response |
|---|---|---|---|---|
| `submit-story` | `multipart/form-data`: `name, country, category, title, body, placeYear?, locale, consent=true, startedAt, website(honeypot), turnstileToken`, `photo_{i}_full` (webp ≤ 900 KB, ≤ 1600 px), `photo_{i}_thumb` (webp ≤ 150 KB, ≤ 480 px), `photo_{i}_alt?` for i < 5 | origin allowlist; method POST; `Content-Length` ≤ 6 MB; honeypot empty and `now - startedAt ≥ 4s` (else **silently 200**); zod; text normalised; ≤ 2 URLs in body; category `photo` ⇒ ≥ 1 photo; Turnstile; rate limit `submit` 3/hour and 10/day; WebP magic + dimensions | insert story (`pending`, `ip_hash`), upload to `vault-pending/{storyId}/{i}-full.webp` / `-thumb.webp` (`contentType: image/webp`, `upsert: false`), insert `story_photos`, set `photo_count`. On any failure after insert: delete uploaded files + row | `201 {ok:true}` |
| `react` | JSON `{storyId, deviceId}` (`deviceId` = random UUID kept in localStorage) | origin; uuid formats; rate limit `react` 60/hour; story is approved | insert `story_reactions (story_id, voter_hash = sha256(salt + deviceId + ipHash))` on conflict do nothing (trigger bumps count) | `{hearts, reacted:true}` |
| `report-post` | JSON `{storyId, reason, details?, turnstileToken}` | origin; zod; Turnstile; rate limit `report` 10/hour | insert report (unique per reporter); if open reports ≥ `AUTO_HIDE_THRESHOLD` (3) → hide (move photos to pending, status `hidden`, log `auto-hide`) | `{ok:true}` |
| `subscribe` | JSON `{email, locale, consent:true, turnstileToken}` ; GET `?unsubscribe=<token>` | origin; zod email; Turnstile; rate limit `subscribe` 5/hour | upsert subscriber (already active → `{status:'already'}`); unsubscribe sets status | `{status:'subscribed'|'already'}` / tiny HTML confirmation |
| `moderate` | JSON `{action, storyId?, reportId?, note?}` with user JWT | user signed in; `rpc('is_admin')` with the **user's** client must be true (enforces aal2) | `approve`: copy each photo pending→public (same path, `cacheControl: '31536000'`), delete pending copy, set `bucket`, status `approved`, `approved_at`, `moderated_by`; `reject`: delete pending photos + rows, status `rejected`; `hide`: move public→pending, status `hidden`; `restore`: hidden→approved (move back); `delete`: remove files (both buckets) + row; `resolve-report`. Always insert `moderation_log` | updated record |

Public photo URLs: `${SUPABASE_URL}/storage/v1/object/public/vault-public/{path}` (immutable, cache forever).
Pending photos in admin: `createSignedUrl(path, 300)` (5 min) via the admin's session.

## Frontend contract (`features/vault/api`)
- `listStories` → `rpc('get_stories', { p_country, p_category, p_before_approved_at, p_before_id, p_limit: 12 })`;
  next cursor = last row's `(approved_at, id)`.
- `getStory` → `rpc('get_story', { p_id })`. `getAlerts` → `from('site_alerts').select('id,level,message_en,message_fr,message_ar,link_url').order('starts_at', {ascending:false}).limit(3)`.
- Writes → `supabase.functions.invoke(name, { body })` (FormData for submit-story). Map error codes to `vault.form.errors.*`.
- Image compression before upload (`src/lib/compress.ts`): `createImageBitmap(file, { imageOrientation: 'from-image' })`
  → canvas (OffscreenCanvas when available) → full: long edge 1600 px, `toBlob('image/webp', 0.82)`, retry at 0.72 if > 900 KB;
  thumb: 480 px at 0.75. Reject non-images, > 15 MB originals, or decode failures with `vault.form.errors.upload`.
  Canvas re-encoding strips EXIF/GPS.

## Admin provisioning (project owner, once)
1. Auth → Providers → Email: enable; **disable "Allow new users to sign up"**. Auth → MFA: TOTP enabled.
2. Provision each moderator with a password (min 12 characters) using trusted Auth
   administration (Dashboard/Admin API), or invite them through a separately configured
   invitation/password completion flow. The website implements password login and TOTP,
   **not** an invitation/recovery callback screen; an invite redirected to its login page
   does not itself let the moderator set a password. Test onboarding before sending invites.
3. SQL editor: `insert into public.admins (user_id) select id from auth.users where email in ('mod1@…','mod2@…');`
4. First login in `/en/admin` forces TOTP enrolment; afterwards every session must verify the code (aal2).

## Local development
- With Docker: `npx supabase start` → local stack; `npx supabase db reset` applies migrations + seed;
  `npx supabase functions serve --env-file supabase/functions/.env`.
- Without Docker: use the CLI v3 cloud commands below. Database commands default to **local**, not the linked project.
- Types: `node scripts/backend-types.mjs` (local), or `node scripts/backend-types.mjs --remote` (linked).
  This preserves the existing file on failure and writes UTF-8 consistently on Windows.
- Turnstile **test keys** for development: site `1x00000000000000000000AA` (always passes),
  secret `1x0000000000000000000000000000000AA`. Never use them in production.
- `VITE_VAULT_MODE=mock` runs the entire Vault UI without Supabase.

## Verification (must pass before Prompt 8 is done)
- `npx supabase db lint` clean; Supabase **Security Advisor** and **Performance Advisor**: no errors.
- pgTAP or SQL tests (`supabase/tests/*.sql`) prove: anon cannot select from any table except `site_alerts`;
  anon cannot insert anywhere; `get_stories` never returns non-approved rows; authenticated non-admin sees nothing;
  admin without aal2 sees nothing; `hit_rate_limit` blocks after the limit.
- Function tests (Deno test) for validation, honeypot, WebP check, error mapping.

## P8 implementation notes (2026-11-17)

Current references checked before implementation:
[Edge Function auth helpers](https://supabase.com/docs/guides/functions/auth),
[publishable/secret keys](https://supabase.com/docs/guides/getting-started/api-keys),
[CLI v3 changes](https://supabase.com/changelog/supabase-cli-v3).
`withSupabase` uses `none` for visitor endpoints and `user` for moderation. Its built-in CORS is disabled;
the project wrapper applies exact allowed origins, bounded streamed bodies and generic errors, including
helper failures. Keep `verify_jwt=true` on moderate; never serve all functions with `--no-verify-jwt`.
The platform supplies `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEYS`, `SUPABASE_SECRET_KEYS`, and `SUPABASE_JWKS`.
The browser client is initialized only when backend mode and both public settings are configured.

- Submission counters use separate `submit-hour` and `submit-day` actions so each submission counts once
  per window. Denied attempts can consume a slot in the first window; limits fail closed.
- The server validates RIFF chunk boundaries, image headers/dimensions and size, and rejects animated,
  EXIF and XMP chunks. This is header validation, not a full image decoder. It bounds streamed JSON to
  16 KiB and multipart data to 6 MiB even without a Content-Length header.
- Unsubscribe navigations may omit Origin; the unguessable UUID token authorizes that one operation.
  Supplied origins must still be allowed. Confirmation text comes from `common.footer.newsletter.unsubscribed`
  in the three locale files, escaped into a fixed HTML shell (there is no React hook on the server).
- `admins_self` intentionally lets an authenticated moderator read their own membership before MFA.
  The “aal1 sees nothing” assertion applies to queues, photos, reports, subscribers and logs; public
  approved RPC reads and active alerts remain public for every role. All privileged data requires aal2.
- Moderation reserves a story using `updated_at` compare-and-swap and a server-only
  `[vault-operation:<uuid>] <action>` marker in `moderation_note`, hiding it from the public feed first.
  Another moderator cannot start work while the marker exists. Each operation writes its log before
  committing its final visibility. Storage and Postgres cannot share a transaction: logs can describe an
  attempted operation if later Storage/DB work fails. A failed transition stays hidden/reserved. Approved
  files are copied before originals are removed; private originals remain until the DB result is saved.
  A private-copy cleanup failure after successful publication leaves the logged approved result intact.
- Recovery after a failed moderation operation: inspect the log, story and both buckets using the
  service/admin tooling; reconcile `story_photos.bucket` with the surviving files; remove any unintended
  public copies; then clear the reservation via SQL and restore the appropriate status. Never clear a
  reservation while the original worker is still running. Submission cleanup removes uploaded paths
  before deleting its row; if Storage itself is unavailable, retain the row for operator cleanup.
- Public URLs use the specified immutable one-year cache. Hiding/deleting removes the origin object
  and feed entry, but cannot recall copies already downloaded or cached by browsers/CDNs.
- `0003` skips scheduling with a notice when pg_cron is unavailable, unprivileged or not preloaded.
  In that case schedule the four retention statements from that migration with an external trusted job.
  No Storage files are removed by SQL retention: rejected stories have already had their files removed.
- Generate samples with `node scripts/seed-samples.mjs`; verify exact SQL/mock parity with `--check`.
  All six bodies are 60–90 words. The sample photo category uses `sample_image_id`, not uploaded files.

### Repeatable local checks

Verified on 2026-11-17 with CLI 3.1.0, local Postgres 17.11 and Edge Runtime 1.78.1:
clean start/reset, 70 pgTAP assertions, clean public/private lint, no advisor warnings/errors,
11 Deno tests, full function typechecks, 22 curl integration requests and `npm run verify` (75 tests).
Slow first-time downloads can be reduced with
`npx supabase start --exclude realtime,imgproxy,studio,logflare,vector,supavisor`.
Let the functions watcher settle after file edits before running the smoke script; a runtime restart
can interrupt requests with a transient gateway 502. Do not retry failed writes blindly.

```sh
npx supabase start
npx supabase db reset
npx supabase test db
npx supabase db lint --schema public,private --fail-on warning
npx supabase db advisors --type all --fail-on error
npx deno check --config supabase/functions/deno.json supabase/functions/*/index.ts
npx deno test --config supabase/functions/deno.json --allow-env supabase/functions/_shared
node scripts/backend-types.mjs
```

Copy `supabase/functions/.env.example` to `.env`, set a fresh random local salt, and keep the documented
Turnstile test secret only for local development. Start the functions in a second terminal:

```sh
npx supabase functions serve --env-file supabase/functions/.env
node scripts/backend-smoke.mjs
```

The smoke script refuses non-local API URLs. It uses curl, creates a temporary moderator, enrolls TOTP,
exercises aal1/aal2, submits a real WebP, runs all moderation actions and auto-hide, checks reaction
deduplication and subscription/unsubscribe, and removes its records and files. Credentials stay in memory
and curl auth headers travel through stdin. Rate-limit events remain until retention/reset.

### Exact cloud deployment commands (CLI 3)

Use a scoped access token in `SUPABASE_ACCESS_TOKEN` and a project owned by the team. Replace the ref
placeholder; prepare an ignored `.env.production` file under `supabase/functions` containing real
`TURNSTILE_SECRET_KEY`, a long random `IP_HASH_SALT`, production-only `ALLOWED_ORIGINS`, and
`AUTO_HIDE_THRESHOLD=3`. Do not put Supabase secret keys in Vite variables or manually override the
platform-managed Supabase environment variables.

```sh
npx supabase link --project-ref <project-ref>
npx supabase db push --remote --dry-run
npx supabase db push --remote
npx supabase secrets set --env-file supabase/functions/.env.production
npx supabase functions deploy submit-story react report-post subscribe moderate --use-api
npx supabase db lint --remote --schema public,private --fail-on warning
npx supabase db advisors --remote --type all --fail-on error
node scripts/backend-types.mjs --remote
```

Hosted mutations ask for confirmation in CLI 3; use `--yes` only in an authorized deployment pipeline.
Do not add `--include-seed` in production. Configure hosted Auth signups/MFA/password policy as described
under provisioning; local config alone does not update hosted Auth. Review `npx supabase config diff`
before `npx supabase config push` because the generated local config also contains local URLs and unrelated
service settings. SQL access tests run in a transaction and roll back; run `npx supabase test db --remote`
against a staging project before release. No cloud deployment is implicit in local verification.

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

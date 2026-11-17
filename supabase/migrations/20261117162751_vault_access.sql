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

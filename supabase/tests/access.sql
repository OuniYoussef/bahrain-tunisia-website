begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;
select no_plan();
insert into auth.users (id) values ('10000000-0000-4000-8000-000000000001'), ('10000000-0000-4000-8000-000000000002');
insert into public.admins (user_id) values ('10000000-0000-4000-8000-000000000001');
insert into public.stories (id, author_name, country, category, title, body, status, approved_at)
select ('20000000-0000-4000-8000-00000000000' || n)::uuid, 'Test', 'both', 'story', 'Test story', 'This is a sufficiently long test story.', s::public.story_status, now()
from (values (1, 'pending'), (2, 'approved'), (3, 'hidden'), (4, 'rejected')) as statuses(n,s);
insert into public.site_alerts (message_en,message_fr,message_ar,active) values ('visible','visible','visible',true), ('hidden','hidden','hidden',false);
insert into public.reports (story_id,reason,reporter_hash) values ('20000000-0000-4000-8000-000000000002','spam','test');
insert into public.newsletter_subscribers (email) values ('test@example.com');
insert into public.moderation_log (action) values ('test');
insert into public.story_photos (story_id,position,bucket,path_full,path_thumb,width,height) values ('20000000-0000-4000-8000-000000000001',0,'vault-pending','private-full.webp','private-thumb.webp',1,1);
insert into storage.objects (bucket_id,name) values ('vault-pending','private-full.webp');
insert into public.story_photos (story_id,position,bucket,path_full,path_thumb,width,height) values ('20000000-0000-4000-8000-000000000002',0,'vault-pending','unpublished-full.webp','unpublished-thumb.webp',1,1);
insert into public.site_alerts (message_en,message_fr,message_ar,starts_at,expires_at) values ('future','future','future',now()+interval '1 day',null), ('expired','expired','expired',now()-interval '2 days',now()-interval '1 day');

select ok(c.relrowsecurity, 'RLS enabled: ' || n.nspname || '.' || c.relname)
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relkind='r';
select ok(not has_table_privilege('anon', 'public.' || tablename, 'SELECT'), 'anon cannot select ' || tablename)
from pg_tables where schemaname='public' and tablename <> 'site_alerts';
select ok(not has_table_privilege('anon', 'public.' || tablename, 'INSERT'), 'anon cannot insert ' || tablename)
from pg_tables where schemaname='public';
select ok(not has_function_privilege('anon', 'public.hit_rate_limit(text,text,integer,interval)', 'EXECUTE'), 'anon cannot call rate limiter');
select ok(not has_function_privilege('authenticated', 'public.hit_rate_limit(text,text,integer,interval)', 'EXECUTE'), 'authenticated cannot call rate limiter');

set local role anon;
select throws_ok('select * from public.stories', '42501', null, 'anon raw story reads denied');
select throws_ok($$insert into public.site_alerts(message_en,message_fr,message_ar) values ('x','x','x')$$, '42501', null, 'anon writes denied');
select is((select count(*) from public.site_alerts where message_en='hidden'), 0::bigint, 'inactive alerts hidden');
select is((select count(*) from public.site_alerts where message_en='visible'), 1::bigint, 'active alerts visible');
select is((select count(*) from public.site_alerts where message_en in ('future','expired')), 0::bigint, 'alert time windows enforced');
select is((select count(*) from public.get_stories() where id in ('20000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000004')), 0::bigint, 'feed excludes all unpublished statuses');
select is((select count(*) from public.get_stories() where id='20000000-0000-4000-8000-000000000002'), 1::bigint, 'feed includes approved');
select is(public.get_story('20000000-0000-4000-8000-000000000001'), null::jsonb, 'detail excludes pending');
select is(public.get_story('20000000-0000-4000-8000-000000000003'), null::jsonb, 'detail excludes hidden');
select is(public.get_story('20000000-0000-4000-8000-000000000004'), null::jsonb, 'detail excludes rejected');
select is(jsonb_array_length(public.get_story('20000000-0000-4000-8000-000000000002')->'photos'), 0, 'detail never exposes pending photo paths');
select is((select cover_path from public.get_stories() where id='20000000-0000-4000-8000-000000000002'), null::text, 'feed never exposes pending cover path');
select is((select count(*) from storage.objects where bucket_id='vault-pending'), 0::bigint, 'anon cannot read pending object');
select throws_ok($$insert into storage.objects(bucket_id,name) values ('vault-public','forbidden.webp')$$, '42501', null, 'anon cannot upload');
reset role;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000002","aal":"aal2","role":"authenticated"}', true);
select is(public.is_admin(), false, 'non-admin aal2 denied');
select is((select count(*) from public.stories), 0::bigint, 'non-admin sees no stories');
select is((select count(*) from public.story_photos), 0::bigint, 'non-admin sees no photos');
select is((select count(*) from public.reports), 0::bigint, 'non-admin sees no reports');
select is((select count(*) from public.newsletter_subscribers), 0::bigint, 'non-admin sees no subscribers');
select is((select count(*) from public.moderation_log), 0::bigint, 'non-admin sees no logs');
select is((select count(*) from public.admins), 0::bigint, 'non-admin sees no admins');
select is((select count(*) from storage.objects where bucket_id='vault-pending'), 0::bigint, 'non-admin cannot sign pending object');
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000001","aal":"aal1","role":"authenticated"}', true);
select is(public.is_admin(), false, 'admin aal1 denied');
select is((select count(*) from public.stories), 0::bigint, 'aal1 sees no stories');
select is((select count(*) from public.story_photos), 0::bigint, 'aal1 sees no photos');
select is((select count(*) from public.reports), 0::bigint, 'aal1 sees no reports');
select is((select count(*) from public.newsletter_subscribers), 0::bigint, 'aal1 sees no subscribers');
select is((select count(*) from public.moderation_log), 0::bigint, 'aal1 sees no logs');
select is((select count(*) from storage.objects where bucket_id='vault-pending'), 0::bigint, 'aal1 sees no pending objects');
select throws_ok($$insert into public.site_alerts(message_en,message_fr,message_ar) values ('x','x','x')$$, '42501', null, 'aal1 cannot manage alerts');
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000001","aal":"aal2","role":"authenticated"}', true);
select is(public.is_admin(), true, 'admin aal2 allowed');
select is((select count(*) from public.site_alerts where message_en in ('hidden','future','expired')), 3::bigint, 'aal2 sees all alert states');
with written as (insert into public.site_alerts(message_en,message_fr,message_ar) values ('admin-write','admin-write','admin-write') returning id)
select is((select count(*) from written),1::bigint,'aal2 creates alert');
with written as (update public.site_alerts set active=false where message_en='admin-write' returning id)
select is((select count(*) from written),1::bigint,'aal2 updates alert');
with written as (delete from public.site_alerts where message_en='admin-write' returning id)
select is((select count(*) from written),1::bigint,'aal2 deletes alert');
select ok((select count(*) from public.stories) >= 4, 'aal2 reads queue');
select is((select count(*) from storage.objects where bucket_id='vault-pending'), 1::bigint, 'aal2 can sign pending object');
select throws_ok($$update public.stories set status='approved'$$, '42501', null, 'even aal2 cannot bypass moderation');
select throws_ok($$insert into storage.objects(bucket_id,name) values ('vault-public','forbidden.webp')$$, '42501', null, 'even aal2 cannot upload directly');
reset role;

set local role service_role;
select is(public.hit_rate_limit('test-ip','test',2,interval '1 hour'), true, 'first event allowed');
select is(public.hit_rate_limit('test-ip','test',2,interval '1 hour'), true, 'second event allowed');
select is(public.hit_rate_limit('test-ip','test',2,interval '1 hour'), false, 'third event blocked');
select is(public.hit_rate_limit('test-ip','other',2,interval '1 hour'), true, 'actions independent');
select is(public.hit_rate_limit('other-ip','test',2,interval '1 hour'), true, 'IP hashes independent');
reset role;
update private.rate_events set created_at=now()-interval '2 hours' where ip_hash='test-ip' and action='test';
set local role service_role;
select is(public.hit_rate_limit('test-ip','test',2,interval '1 hour'), true, 'expired events no longer consume window');
reset role;
select * from finish();
rollback;

-- Optional: managed instances may not offer or preload pg_cron.
do $maintenance$
begin
  if not exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    raise notice 'pg_cron unavailable; run the documented retention SQL externally';
    return;
  end if;
  begin
    create extension if not exists pg_cron;
    perform cron.schedule('vault-retention', '17 3 * * *', $job$
      delete from private.rate_events where created_at < now() - interval '7 days';
      delete from public.stories where status = 'rejected' and updated_at < now() - interval '30 days';
      update public.stories set ip_hash = null where status = 'approved' and approved_at < now() - interval '30 days' and ip_hash is not null;
      update public.newsletter_subscribers set ip_hash = null where consented_at < now() - interval '30 days' and ip_hash is not null;
    $job$);
  exception
    when undefined_file or feature_not_supported or insufficient_privilege or object_not_in_prerequisite_state or internal_error then
      raise notice 'pg_cron could not be enabled; configure external retention scheduling';
  end;
end
$maintenance$;

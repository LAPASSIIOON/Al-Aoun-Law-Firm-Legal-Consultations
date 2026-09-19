-- The public table has no direct INSERT policy. Only the server's service_role
-- may call this RPC; rate limiting and validation run in one database operation.
begin;

create or replace function public.subscribe_newsletter(
  p_email text,
  p_locale text,
  p_ip_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_email text := lower(btrim(p_email));
begin
  if p_ip_hash is null or p_ip_hash !~ '^[0-9a-f]{32}$' then
    return jsonb_build_object('ok', false, 'error', 'server_error');
  end if;

  if not ops.check_rate_limit('newsletter:' || p_ip_hash, 8, 3600) then
    return jsonb_build_object('ok', false, 'error', 'rate_limited');
  end if;

  if v_email is null or length(v_email) > 254
     or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' then
    return jsonb_build_object('ok', false, 'error', 'invalid_email');
  end if;

  insert into public.newsletter_subscribers(email, locale)
  values (v_email, case when p_locale = 'en' then 'en' else 'ar' end)
  on conflict (email) do nothing;

  -- Existing and new subscribers receive the same response.
  return jsonb_build_object('ok', true);
exception when others then
  return jsonb_build_object('ok', false, 'error', 'server_error');
end;
$function$;

revoke all on function public.subscribe_newsletter(text, text, text) from public, anon, authenticated;
grant execute on function public.subscribe_newsletter(text, text, text) to service_role;

commit;

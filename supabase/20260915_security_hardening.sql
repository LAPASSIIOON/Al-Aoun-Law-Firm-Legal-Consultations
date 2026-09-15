-- AL OUN — production security hardening
-- Apply once in Supabase Dashboard > SQL Editor after reviewing this file.
--
-- Public forms call these functions through Next.js Server Actions using
-- SUPABASE_SERVICE_ROLE_KEY. Removing browser-role execution means Turnstile,
-- IP hashing, validation, and rate limits cannot be bypassed through /rest/v1/rpc.

revoke execute on function public.submit_consultation(text, text, text, text, text, text, uuid, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.submit_consultation(text, text, text, text, text, text, uuid, text, text, text, text, text) to service_role;

revoke execute on function public.submit_referral(text, text, text, text, text, uuid, uuid, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.submit_referral(text, text, text, text, text, uuid, uuid, text, text, text, text, text) to service_role;

revoke execute on function public.submit_partnership_application(text, text, text, text, text, text, uuid, text, uuid[], text[], text, text, text) from public, anon, authenticated;
grant execute on function public.submit_partnership_application(text, text, text, text, text, text, uuid, text, uuid[], text[], text, text, text) to service_role;

-- These helpers only serve a signed-in member. Removing PUBLIC/anon access is
-- defense in depth; the authenticated portal flow keeps its required grant.
revoke execute on function public.get_my_member() from public, anon;
grant execute on function public.get_my_member() to authenticated, service_role;
revoke execute on function public.my_consultations() from public, anon;
grant execute on function public.my_consultations() to authenticated, service_role;
revoke execute on function public.my_referrals() from public, anon;
grant execute on function public.my_referrals() to authenticated, service_role;
revoke execute on function public.my_partnerships() from public, anon;
grant execute on function public.my_partnerships() to authenticated, service_role;

-- Trigger functions are not RPC endpoints.
revoke execute on function public.enforce_article_legal_gate() from public, anon, authenticated;
revoke execute on function public.enforce_practice_area_legal_gate() from public, anon, authenticated;

-- Enforce the final-active-admin safeguard where it matters: the database.
create or replace function public.admin_set_member(p_member_id uuid, p_role text, p_is_active boolean)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_is_active_admin boolean;
begin
  if not portal.is_portal_admin() then
    return jsonb_build_object('ok', false, 'error', 'forbidden');
  end if;

  if p_role not in ('member', 'admin') then
    return jsonb_build_object('ok', false, 'error', 'invalid_role');
  end if;

  select role = 'admin' and is_active
    into v_is_active_admin
  from portal.members
  where id = p_member_id;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if v_is_active_admin
     and (p_role <> 'admin' or not p_is_active)
     and not exists (
       select 1
       from portal.members
       where role = 'admin'
         and is_active = true
         and id <> p_member_id
     )
  then
    return jsonb_build_object('ok', false, 'error', 'last_active_admin');
  end if;

  update portal.members
  set role = p_role::portal.portal_role,
      is_active = p_is_active
  where id = p_member_id;

  insert into ops.audit_log(action, entity, entity_id, detail)
  values (
    'member.role_updated',
    'portal_members',
    p_member_id::text,
    jsonb_build_object('role', p_role, 'is_active', p_is_active, 'by', auth.uid())
  );

  return jsonb_build_object('ok', true);
exception when others then
  return jsonb_build_object('ok', false, 'error', 'server_error');
end;
$$;

revoke execute on function public.admin_set_member(uuid, text, boolean) from public, anon;
grant execute on function public.admin_set_member(uuid, text, boolean) to authenticated, service_role;

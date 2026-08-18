-- AL OUN - self-service profile update RPC
-- Run once in Supabase Dashboard > SQL Editor (save as: update_my_member).
-- Lets a logged-in member update ONLY their own editable fields.
-- Matched to the member row by the verified auth email (same pattern as my_* RPCs).
-- email + member_type + role + is_active are intentionally NOT editable here
-- (identity / admin-controlled).

create or replace function public.update_my_member(
  p_display_name text,
  p_phone text,
  p_organization_name text,
  p_license_number text
)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_email text;
  v_id uuid;
begin
  select email into v_email from auth.users where id = auth.uid();
  if v_email is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  update portal.members set
    display_name = case
      when nullif(btrim(coalesce(p_display_name, '')), '') is not null
      then btrim(p_display_name) else display_name end,
    phone             = nullif(btrim(coalesce(p_phone, '')), ''),
    organization_name = nullif(btrim(coalesce(p_organization_name, '')), ''),
    license_number    = nullif(btrim(coalesce(p_license_number, '')), '')
  where lower(email) = lower(v_email)
  returning id into v_id;

  if v_id is null then
    return jsonb_build_object('ok', false, 'error', 'member_not_found');
  end if;

  insert into ops.audit_log(action, entity, entity_id, detail)
  values ('member.self_updated', 'portal_members', v_id::text,
          jsonb_build_object('by', auth.uid()));

  return jsonb_build_object('ok', true);
exception when others then
  return jsonb_build_object('ok', false, 'error', 'server_error');
end;
$function$;

-- Members are logged-in users (authenticated). Never anon.
revoke execute on function public.update_my_member(text, text, text, text) from anon;
grant execute on function public.update_my_member(text, text, text, text) to authenticated;

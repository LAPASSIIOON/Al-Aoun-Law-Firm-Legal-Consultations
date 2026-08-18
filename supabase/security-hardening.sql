-- AL OUN — security hardening (defense-in-depth)
-- Run once in Supabase Dashboard > SQL Editor.
-- Revokes EXECUTE from the anonymous role on admin-only RPCs.
-- The 'authenticated' grant is intentionally kept: admins are logged-in users,
-- and each admin_* function already gates internally on portal.is_portal_admin().
revoke execute on function public.admin_list_audit_log(integer) from anon;
revoke execute on function public.admin_list_consultations() from anon;
revoke execute on function public.admin_list_members() from anon;
revoke execute on function public.admin_list_partnerships() from anon;
revoke execute on function public.admin_list_referrals() from anon;
revoke execute on function public.admin_set_member(uuid, text, boolean) from anon;
revoke execute on function public.admin_update_member_type(uuid, text) from anon;
revoke execute on function public.admin_update_notes(text, uuid, text) from anon;
revoke execute on function public.admin_update_stage(text, uuid, text) from anon;

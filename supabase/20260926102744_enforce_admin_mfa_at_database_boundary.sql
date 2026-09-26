-- Enforce the already-required administrator second factor at the database boundary.
-- A missing `aal` claim must return false, including inside PL/pgSQL IF guards.
-- Keep signatures, SECURITY DEFINER, and empty search_path unchanged.

create or replace function portal.is_portal_admin()
returns boolean
language sql
stable security definer
set search_path to ''
as $function$
  select coalesce((auth.jwt() ->> 'aal') = 'aal2', false)
    and exists (
      select 1 from portal.members
      where id = auth.uid() and role = 'admin' and is_active
    );
$function$;

-- Legacy content/RLS permissions use public.has_role instead of portal.members.
-- A real editor/reviewer/legal profile retains its existing access; an admin
-- cannot inherit those roles from an aal1 session.
create or replace function public.has_role(required public.app_role)
returns boolean
language sql
stable security definer
set search_path to ''
as $function$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
      and (p.role <> 'admin' or coalesce((auth.jwt() ->> 'aal') = 'aal2', false))
      and (
        p.role = required
        or (required = 'reviewer' and p.role in ('admin', 'editor', 'legal'))
        or (required = 'editor' and p.role in ('admin'))
        or (required = 'legal' and p.role in ('admin'))
      )
  );
$function$;

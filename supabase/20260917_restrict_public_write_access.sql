-- Restrict Data API writes to the permissions actually used by the site.
-- Newsletter subscriptions are inserted by the server with service_role.
drop policy if exists newsletter_public_insert on public.newsletter_subscribers;
revoke insert on public.newsletter_subscribers from anon, authenticated;

-- Members may edit only their own display name through the existing RLS policy.
-- The site manages administrative state through separate privileged RPCs.
revoke update on public.profiles from anon, authenticated;
grant update (full_name) on public.profiles to authenticated;

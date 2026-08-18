'use server';

import { createSupabaseServerClient } from '@/lib/supabase-auth-server.js';

/**
 * Update the current member's own editable profile fields.
 * @param {{ displayName?: string, phone?: string, organizationName?: string, licenseNumber?: string }} input
 */
export async function updateMyProfile(input) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('update_my_member', {
    p_display_name: input.displayName ?? null,
    p_phone: input.phone ?? null,
    p_organization_name: input.organizationName ?? null,
    p_license_number: input.licenseNumber ?? null,
  });
  if (error) return { ok: false, error: 'server_error' };
  return data || { ok: false, error: 'server_error' };
}

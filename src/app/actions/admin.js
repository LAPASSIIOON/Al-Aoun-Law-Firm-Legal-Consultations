'use server';

import { createSupabaseServerClient } from '@/lib/supabase-auth-server.js';

export async function listMembers() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('admin_list_members');
  if (error) return [];
  return data || [];
}

/** @param {{ memberId: string, role: string, isActive: boolean }} input */
export async function setMemberRole(input) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('admin_set_member', {
    p_member_id: input.memberId, p_role: input.role, p_is_active: input.isActive,
  });
  if (error) return { ok: false, error: 'server_error' };
  return data;
}

export async function listConsultations() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('admin_list_consultations');
  if (error) return [];
  return data || [];
}

export async function listReferrals() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('admin_list_referrals');
  if (error) return [];
  return data || [];
}

export async function listPartnerships() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('admin_list_partnerships');
  if (error) return [];
  return data || [];
}

/** @param {{ table: 'consultation'|'referral'|'partnership', id: string, stage: string }} input */
export async function updateStage(input) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('admin_update_stage', {
    p_table: input.table, p_id: input.id, p_stage: input.stage,
  });
  if (error) return { ok: false, error: 'server_error' };
  return data;
}

/** @param {{ table: 'consultation'|'referral'|'partnership', id: string, notes: string }} input */
export async function updateNotes(input) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('admin_update_notes', {
    p_table: input.table, p_id: input.id, p_notes: input.notes,
  });
  if (error) return { ok: false, error: 'server_error' };
  return data;
}

export async function listAuditLog() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('admin_list_audit_log', { p_limit: 150 });
  if (error) return [];
  return data || [];
}

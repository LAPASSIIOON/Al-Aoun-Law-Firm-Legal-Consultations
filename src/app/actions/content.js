'use server';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase-auth-server.js';

/** يبني slug من نص عربي/إنجليزي: يحوّل المسافات لشرطات، يشيل أي رمز غير آمن. */
function slugify(text) {
  return String(text || '')
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 80) || `item-${Date.now()}`;
}

/** صفة المستخدم الحالي في نظام إدارة المحتوى (profiles.role) — null لو لا يملك أي صفة. */
export async function getMyContentRole() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (!user) return { role: null, debug: `no user, err=${userErr?.message}` };
  const { data, error } = await supabase.from('profiles').select('role, is_active').eq('id', user.id).maybeSingle();
  if (error) return { role: null, debug: `query error: ${error.message} (uid=${user.id})` };
  if (!data) return { role: null, debug: `no profile row found for uid=${user.id}` };
  if (!data.is_active) return { role: null, debug: `profile inactive (uid=${user.id})` };
  return { role: data.role, debug: `ok uid=${user.id}` };
}

// ===== مجالات الممارسة =====

export async function listPracticeAreas() {
  const supabase = await createSupabaseServerClient();
  const { data: areas, error } = await supabase
    .from('practice_areas')
    .select('id, sort_order, is_active, practice_area_translations(id, locale, title, status, legal_approved, updated_at)')
    .order('sort_order');
  if (error) return [];
  return areas || [];
}

export async function getPracticeArea(id) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('practice_areas')
    .select('id, sort_order, is_active, practice_area_translations(*)')
    .eq('id', id).maybeSingle();
  if (error) return null;
  return data;
}

export async function createPracticeArea({ locale, title, summary, body }) {
  const supabase = await createSupabaseServerClient();
  const { data: area, error: e1 } = await supabase.from('practice_areas').insert({ sort_order: 999, is_active: false }).select('id').single();
  if (e1) return { error: e1.message };
  const slug = slugify(title);
  const { error: e2 } = await supabase.from('practice_area_translations').insert({
    practice_area_id: area.id, locale, title, summary, body, status: 'draft', legal_approved: false,
  });
  if (e2) return { error: e2.message };
  revalidatePath('/[locale]/admin/practice-areas', 'page');
  return { id: area.id };
}

/** إضافة ترجمة اللغة الناقصة لمجال ممارسة موجود (لا يوجد ترجمة آلية — يُكتب يدويًا). */
export async function addPracticeAreaTranslation({ practiceAreaId, locale, title, summary, body }) {
  const supabase = await createSupabaseServerClient();
  const slug = slugify(title);
  const { error } = await supabase.from('practice_area_translations').insert({
    practice_area_id: practiceAreaId, locale, title, summary, body, status: 'draft', legal_approved: false,
  });
  if (error) return { error: error.message };
  revalidatePath('/[locale]/admin/practice-areas/[id]', 'page');
  return { ok: true };
}

export async function updatePracticeAreaTranslation({ id, title, summary, body, status }) {
  const supabase = await createSupabaseServerClient();
  const patch = { title, summary, body };
  if (status) patch.status = status;
  const { error } = await supabase.from('practice_area_translations').update(patch).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/[locale]/admin/practice-areas/[id]', 'page');
  return { ok: true };
}

/** اعتماد قانوني ونشر — القاعدة نفسها (trigger) ترفض هذا الإجراء لو المنفِّذ لا يملك صفة legal/admin فعليًا. */
export async function approvePracticeAreaTranslation(id) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('practice_area_translations').update({ legal_approved: true, status: 'published' }).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/[locale]/admin/practice-areas/[id]', 'page');
  return { ok: true };
}

export async function setPracticeAreaActive({ id, isActive }) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('practice_areas').update({ is_active: isActive }).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/[locale]/admin/practice-areas', 'page');
  return { ok: true };
}

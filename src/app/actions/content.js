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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('role, is_active').eq('id', user.id).maybeSingle();
  if (!data || !data.is_active) return null;
  return data.role;
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
    practice_area_id: area.id, locale, slug, title, summary, body, status: 'draft', legal_approved: false,
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
    practice_area_id: practiceAreaId, locale, slug, title, summary, body, status: 'draft', legal_approved: false,
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

// ===== الرؤى القانونية (Insights) =====
// ملاحظة معمارية: النشر العام للرؤى يتطلب بوابتين معًا (بخلاف مجالات الممارسة):
// (١) الترجمة: status='published' AND legal_approved=true — نفس آلية مجالات الممارسة تمامًا.
// (٢) الجدول الأب articles: is_active=true AND published_at ليس فارغًا وفي الماضي.
// الاعتماد (approveArticleTranslation) يفتح البوابتين معًا في خطوة واحدة، بدل ما يترك المقال معتمَدًا لكن مخفيًا فعليًا لأن أحد الشرطين ناقص.

export async function listArticles() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('articles')
    .select('id, is_active, published_at, article_translations(id, locale, title, status, legal_approved, updated_at)')
    .order('created_at', { ascending: false });
  if (error) return [];
  return data || [];
}

export async function getArticle(id) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('articles')
    .select('id, is_active, published_at, article_translations(*)')
    .eq('id', id).maybeSingle();
  if (error) return null;
  return data;
}

export async function createArticle({ locale, title, excerpt, body }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: article, error: e1 } = await supabase.from('articles').insert({ author_id: user?.id || null, is_active: false, published_at: null }).select('id').single();
  if (e1) return { error: e1.message };
  const slug = slugify(title);
  const { error: e2 } = await supabase.from('article_translations').insert({
    article_id: article.id, locale, slug, title, excerpt, body, status: 'draft', legal_approved: false,
  });
  if (e2) return { error: e2.message };
  revalidatePath('/[locale]/admin/insights', 'page');
  return { id: article.id };
}

export async function addArticleTranslation({ articleId, locale, title, excerpt, body }) {
  const supabase = await createSupabaseServerClient();
  const slug = slugify(title);
  const { error } = await supabase.from('article_translations').insert({
    article_id: articleId, locale, slug, title, excerpt, body, status: 'draft', legal_approved: false,
  });
  if (error) return { error: error.message };
  revalidatePath('/[locale]/admin/insights/[id]', 'page');
  return { ok: true };
}

export async function updateArticleTranslation({ id, title, excerpt, body, status }) {
  const supabase = await createSupabaseServerClient();
  const patch = { title, excerpt, body };
  if (status) patch.status = status;
  const { error } = await supabase.from('article_translations').update(patch).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/[locale]/admin/insights/[id]', 'page');
  return { ok: true };
}

/** اعتماد + فتح بوابتَي النشر معًا (الترجمة والجدول الأب) — القاعدة نفسها ترفض الاعتماد بلا صفة legal/admin فعليًا. */
export async function approveArticleTranslation({ translationId, articleId }) {
  const supabase = await createSupabaseServerClient();
  const { error: e1 } = await supabase.from('article_translations').update({ legal_approved: true, status: 'published' }).eq('id', translationId);
  if (e1) return { error: e1.message };
  const { error: e2 } = await supabase.from('articles').update({ is_active: true, published_at: new Date().toISOString() }).eq('id', articleId);
  if (e2) return { error: e2.message };
  revalidatePath('/[locale]/admin/insights/[id]', 'page');
  return { ok: true };
}

export async function setArticleActive({ id, isActive }) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('articles').update({ is_active: isActive }).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/[locale]/admin/insights', 'page');
  return { ok: true };
}

// ===== الشبكة الدولية — الشركاء (network.partner_firms) =====
// ملاحظة معمارية: مخطَّط network غير معروض عبر REST مباشرة (postgrest يعرض public فقط) —
// كل الوصول هنا عبر دوال RPC أمنية (admin_*) بنفس نمط باقي لوحة التحكم المُتحقَّق من أمانه.
// صف الشريك لا يظهر علنًا إلا بـ public_visible=true AND consent_to_display=true معًا — موافقة صريحة، لا افتراض.

export async function listPartnerFirms() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('admin_list_partner_firms');
  if (error) return [];
  return data || [];
}

export async function getPartnerFirm(id) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('admin_get_partner_firm', { p_id: id });
  if (error) return null;
  return data;
}

export async function listActiveCountries() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('list_countries');
  if (error) return [];
  return data || [];
}

export async function createPartnerFirm(fields) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('admin_create_partner_firm', {
    p_legal_name: fields.legalName,
    p_display_name_ar: fields.displayNameAr || '',
    p_display_name_en: fields.displayNameEn || '',
    p_country_id: fields.countryId || null,
    p_city: fields.city || '',
    p_website: fields.website || '',
    p_relationship_status: fields.relationshipStatus || 'prospect',
    p_internal_notes: fields.internalNotes || '',
  });
  if (error) return { error: error.message };
  if (data && data.error) return { error: data.error };
  revalidatePath('/[locale]/admin/partner-firms', 'page');
  return { id: data.id };
}

export async function updatePartnerFirm({ id, ...fields }) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('admin_update_partner_firm', {
    p_id: id,
    p_legal_name: fields.legalName,
    p_display_name_ar: fields.displayNameAr || '',
    p_display_name_en: fields.displayNameEn || '',
    p_country_id: fields.countryId || null,
    p_city: fields.city || '',
    p_website: fields.website || '',
    p_relationship_status: fields.relationshipStatus,
    p_public_visible: !!fields.publicVisible,
    p_consent_to_display: !!fields.consentToDisplay,
    p_internal_notes: fields.internalNotes || '',
  });
  if (error) return { error: error.message };
  if (data && data.error) return { error: data.error };
  revalidatePath('/[locale]/admin/partner-firms/[id]', 'page');
  revalidatePath('/[locale]/admin/partner-firms', 'page');
  return { ok: true };
}

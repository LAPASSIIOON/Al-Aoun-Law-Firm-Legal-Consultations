'use server';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase-auth-server.js';

/** قائمة القضايا للأدمن (عبر RPC تُرجِع اسم العميل مدموجًا؛ فاضية تلقائيًا لغير الأدمن). */
export async function listMattersAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('admin_list_matters');
  if (error) return [];
  return data || [];
}

/** قضايا المستخدم الحالي فقط — لواجهة العميل، محكومة بـRLS (client_id = auth.uid()). */
export async function listMyMatters() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('matters')
    .select('id, title, reference, status, created_at')
    .order('created_at', { ascending: false });
  if (error) return [];
  return data || [];
}

async function getMatterFilesRaw(supabase, matterId) {
  const { data } = await supabase.from('matter_files')
    .select('id, file_name, storage_path, file_size, mime_type, created_at, uploaded_by')
    .eq('matter_id', matterId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function getMatterAdmin(id) {
  const supabase = await createSupabaseServerClient();
  const { data: rows } = await supabase.rpc('admin_list_matters');
  const matter = (rows || []).find((m) => m.id === id);
  if (!matter) return null;
  const files = await getMatterFilesRaw(supabase, id);
  return { ...matter, files };
}

/** لصفحة العميل: تعتمد على RLS فقط (لن تُرجع شيئًا لقضية ليست له). */
export async function getMyMatter(id) {
  const supabase = await createSupabaseServerClient();
  const { data: matter, error } = await supabase.from('matters')
    .select('id, title, reference, status, created_at, client_id')
    .eq('id', id).maybeSingle();
  if (error || !matter) return null;
  const files = await getMatterFilesRaw(supabase, id);
  return { ...matter, files };
}

export async function listClientMembers() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('admin_list_client_members');
  if (error) return [];
  return data || [];
}

export async function createMatter({ clientId, title, reference }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase.from('matters')
    .insert({ client_id: clientId, title, reference: reference || null, created_by: user?.id || null })
    .select('id').single();
  if (error) return { error: error.message };
  revalidatePath('/[locale]/admin/matters', 'page');
  return { id: data.id };
}

/** تسجيل بيانات ملف بعد رفعه فعليًا إلى Storage من جانب المتصفح — الرفع الثنائي نفسه لا يمر بالخادم. */
export async function recordMatterFile({ matterId, fileName, storagePath, fileSize, mimeType }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'not authenticated' };
  const { error } = await supabase.from('matter_files').insert({
    matter_id: matterId, uploaded_by: user.id, file_name: fileName, storage_path: storagePath, file_size: fileSize, mime_type: mimeType,
  });
  if (error) return { error: error.message };
  revalidatePath('/[locale]/admin/matters/[id]', 'page');
  revalidatePath('/[locale]/account/matters/[id]', 'page');
  return { ok: true };
}

/** رابط تنزيل مؤقت (٦٠ ثانية) — يُنشأ فقط لمن يملك صلاحية القراءة فعليًا وفق RLS. */
export async function getFileSignedUrl(storagePath) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.storage.from('matter-files').createSignedUrl(storagePath, 60);
  if (error) return null;
  return data?.signedUrl || null;
}

export async function getCurrentUserId() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

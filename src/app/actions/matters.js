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

/** الصيغ المعتمَدة (قرار منتج) — امتداد ⇄ نوع MIME. الاقتران إلزامي: لا يكفي أن يكون كلٌّ منهما مسموحًا منفردًا.
 *  تنبيه: هذا تحقّق من النوع المُعلَن فقط، وليس فحصًا لمحتوى الملف. لا يثبت أن الملف سليم أو خالٍ من البرمجيات الخبيثة. */
const ALLOWED_TYPES = {
  pdf: ['application/pdf'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  png: ['image/png'],
  heic: ['image/heic'],
  heif: ['image/heif'],
};

const MAX_FILE_BYTES = 25 * 1024 * 1024; // مطابق لحدّ الحاوية (26214400)
const MAX_STORED_NAME = 120;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * تحليل مُهيكل لمسار التخزين والتحقّق منه — لا نكتفي بـstartsWith.
 * الشكل المطلوب حصرًا: `<matterId>/<uuid>-<اسم آمن>.<امتداد معتمَد>`
 * @returns {{ ok: true, objectName: string, displayName: string, ext: string } | { ok: false }}
 */
function parseStoragePath(storagePath, matterId) {
  if (typeof storagePath !== 'string' || storagePath.length === 0 || storagePath.length > 300) return { ok: false };
  // الحماية من الاجتياز بنيوية لا نصّية: نرفض الشرطة العكسية والبادئة/اللاحقة المائلة ومحارف التحكّم،
  // ثم نفرض مقطعين اثنين بالضبط ونطابق المجلد بالمساواة. لا نحظر «..» كسلسلة نصّية لأنها قد ترد
  // ضمن اسم ملف مشروع (contract..final.pdf) — والحظر النصّي كان يرفضه بعد رفعه فيخلّف كائنًا يتيمًا.
  if (storagePath.includes('\\')) return { ok: false };
  if (storagePath.startsWith('/') || storagePath.endsWith('/')) return { ok: false };
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001F\u007F]/.test(storagePath)) return { ok: false };

  const parts = storagePath.split('/');
  if (parts.length !== 2) return { ok: false };          // مستوى مجلد واحد بالضبط — لا تعشيش
  // حراسة صريحة على مستوى المقطع: لا يكون أي مقطع بذاته «.» أو «..»
  if (parts.some((seg) => seg === '.' || seg === '..' || seg === '')) return { ok: false };

  const [folder, objectName] = parts;
  if (folder !== matterId) return { ok: false };          // مساواة صريحة، لا مجرّد بادئة

  // اسم الكائن: <uuid>-<اسم>.<امتداد>
  if (objectName.length < 38 || objectName.length > MAX_STORED_NAME + 37) return { ok: false };
  const uuidPart = objectName.slice(0, 36);
  if (!UUID_RE.test(uuidPart) || objectName[36] !== '-') return { ok: false };

  const displayName = objectName.slice(37);
  if (!displayName || displayName.length > MAX_STORED_NAME) return { ok: false };
  if (!/^[A-Za-z0-9\u0600-\u06FF._ -]+$/.test(displayName)) return { ok: false };

  const dot = displayName.lastIndexOf('.');
  if (dot <= 0 || dot === displayName.length - 1) return { ok: false };
  const ext = displayName.slice(dot + 1).toLowerCase();
  if (!Object.prototype.hasOwnProperty.call(ALLOWED_TYPES, ext)) return { ok: false };

  return { ok: true, objectName, displayName, ext };
}

/**
 * تسجيل ملف بعد رفعه من المتصفح إلى Storage.
 * عقد مُصغَّر عمدًا: لا نقبل من المتصفح اسمًا ولا حجمًا ولا نوعًا — تُشتقّ كلها من كائن Storage الفعلي.
 * يبقى كل شيء ضمن الجلسة المُصادَقة (RLS سارية) — بلا service_role وبلا تجاوز.
 */
export async function recordMatterFile({ matterId, storagePath }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'unauthorized' };

  // ١) هوية القضية: UUID قانوني قبل أي شيء آخر
  if (typeof matterId !== 'string' || !UUID_RE.test(matterId)) return { error: 'invalid_request' };

  // ٢) تحليل مُهيكل للمسار + ربطه بالقضية + امتداد معتمَد
  const parsed = parseStoragePath(storagePath, matterId);
  if (!parsed.ok) return { error: 'invalid_request' };

  // ٣) التحقّق من وجود الكائن فعليًا — عبر عميل الجلسة، فتُطبَّق سياسة القراءة على storage.objects
  const { data: listed, error: listErr } = await supabase.storage
    .from('matter-files')
    .list(matterId, { limit: 100, search: parsed.objectName });
  if (listErr) return { error: 'verification_failed' };
  const obj = (listed || []).find((o) => o.name === parsed.objectName); // مطابقة تامة، لا نتيجة بحث مشابهة
  if (!obj) return { error: 'object_not_found' };

  // ٤) الحجم من مصدر موثوق: قياس الخادم عند الاستلام، لا من المتصفح
  const size = obj.metadata?.size ?? obj.metadata?.contentLength;
  if (typeof size !== 'number' || size <= 0 || size > MAX_FILE_BYTES) return { error: 'invalid_file' };

  // ٥) النوع المسجَّل في Storage — أدقّ من وسيط ثانٍ من المتصفح، لكنه يظل مشتقًّا من Content-Type
  //    المُرسَل عند الرفع؛ فهو ليس إثباتًا لمحتوى الملف. نلزم اقتران الامتداد بالنوع.
  const mime = obj.metadata?.mimetype;
  if (typeof mime !== 'string' || !ALLOWED_TYPES[parsed.ext].includes(mime.toLowerCase())) {
    return { error: 'invalid_file_type' };
  }

  const { error } = await supabase.from('matter_files').insert({
    matter_id: matterId,
    uploaded_by: user.id,          // من الجلسة دائمًا، لا من مدخل العميل
    file_name: parsed.displayName, // مشتقّ من اسم الكائن المُتحقَّق منه
    storage_path: storagePath,
    file_size: size,
    mime_type: mime,
  });
  if (error) return { error: 'save_failed' };  // لا نكشف تفاصيل داخلية

  revalidatePath('/[locale]/admin/matters/[id]', 'page');
  revalidatePath('/[locale]/account/matters/[id]', 'page');
  return { ok: true, fileName: parsed.displayName, fileSize: size, mimeType: mime };
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

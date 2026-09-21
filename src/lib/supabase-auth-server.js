import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * عميل Supabase واعٍ بالجلسة — للمكوّنات والإجراءات الخادمية.
 * يقرأ/يكتب كوكيز التوثيق عبر next/headers.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // نُستدعى أحيانًا من مكوّن خادمي بلا صلاحية كتابة كوكيز — الميدل وير يتكفّل بالتحديث.
          }
        },
      },
    }
  );
}

/**
 * عميل الإدارة المقيّد بتحقّق خطوتين فعّال في الجلسة الحالية.
 * لا يكفي إخفاء واجهة لوحة الإدارة: كل إجراء خادمي إداري يستدعي هذا الحارس
 * أيضًا، حتى لا يستطيع طلب مباشر لإجراء الخادم تجاوز صفحة التحقق.
 */
export async function createSupabaseAdminMfaClient() {
  const supabase = await createSupabaseServerClient();
  const [{ data: { user } }, { data: assurance, error: assuranceError }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
  ]);
  if (!user || assuranceError || assurance?.currentLevel !== 'aal2') {
    throw new Error('admin_mfa_required');
  }
  const { data: member, error: memberError } = await supabase.rpc('get_my_member');
  if (memberError || !member || member.role !== 'admin' || !member.is_active) {
    throw new Error('admin_access_required');
  }
  return supabase;
}

/**
 * يعيد بيانات عضو portal.members الحالي (أو null) بعد التحقّق من الجلسة.
 */
export async function getCurrentMember() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.rpc('get_my_member');
  return data ? { ...data, authEmail: user.email } : null;
}

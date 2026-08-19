'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase-auth-server.js';

/**
 * تسجيل عضو جديد في البوابة — أفراد أو محامون أو جهات متعاونة.
 * الدور الافتراضي 'member' محدود دائمًا؛ الترقية لـ'admin' يدوية فقط (§أمان).
 * @param {{ email: string, password: string, fullName: string, memberType: string, locale: string }} input
 */
export async function signUp(input) {
  if (!input.email || !input.password || input.password.length < 8) {
    return { ok: false, error: 'invalid_input' };
  }
  if (!input.consent) {
    return { ok: false, error: 'consent_required' };
  }
  if (!input.phone) {
    return { ok: false, error: 'missing_required_field' };
  }
  const needsOrg = ['law_firm', 'company', 'institution'].includes(input.memberType);
  const needsLicense = ['lawyer', 'consultant'].includes(input.memberType);
  if (needsOrg && !input.organizationName) return { ok: false, error: 'missing_required_field' };
  if (needsLicense && !input.licenseNumber) return { ok: false, error: 'missing_required_field' };

  const supabase = await createSupabaseServerClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://al-aoun-law-firm-legal-consultation.vercel.app';
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName || input.email,
        member_type: input.memberType || 'client',
        phone: input.phone,
        organization_name: input.organizationName || '',
        license_number: input.licenseNumber || '',
        consent: true,
        consent_version: input.consentVersion || '',
      },
      captchaToken: input.turnstileToken || undefined,
      emailRedirectTo: `${siteUrl}/${input.locale || 'ar'}/account/sign-in`,
    },
  });
  if (error) {
    let code = 'server_error';
    if (error.message === 'User already registered' || error.code === 'user_already_exists') code = 'already_registered';
    else if (error.code === 'weak_password' || /password should contain/i.test(error.message || '')) code = 'weak_password';
    else if (error.code === 'over_email_send_rate_limit' || error.status === 429) code = 'rate_limited';
    return { ok: false, error: code };
  }
  return { ok: true, needsConfirmation: !data.session };
}

/** @param {{ email: string, password: string }} input */
export async function signIn(input) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
    options: { captchaToken: input.turnstileToken || undefined },
  });
  if (error) return { ok: false, error: 'invalid_credentials' };
  return { ok: true };
}

/** @param {string} locale */
export async function signOutAction(locale) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect(`/${locale}`);
}

/**
 * طلب رابط إعادة تعيين كلمة المرور. لا يكشف إن كان البريد مسجّلًا (منع تعداد الحسابات):
 * يُرجِع { ok: true } دائمًا طالما البريد صالح الشكل.
 * الرابط يمرّ عبر /[locale]/auth/callback الذي يبادل الرمز بجلسة ثم يوجّه لصفحة التعيين.
 * @param {{ email: string, locale: string }} input
 */
export async function requestPasswordReset(input) {
  const email = (input.email || '').trim();
  const locale = input.locale === 'en' ? 'en' : 'ar';
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: 'invalid_input' };

  const h = await headers();
  const proto = h.get('x-forwarded-proto') || 'https';
  const host = h.get('host') || '';
  const origin = host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL || '');
  const next = encodeURIComponent(`/${locale}/account/reset-password`);
  const redirectTo = `${origin}/${locale}/auth/callback?next=${next}`;

  const supabase = await createSupabaseServerClient();
  await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  return { ok: true };
}

/**
 * تعيين كلمة مرور جديدة للمستخدم داخل جلسة الاستعادة الحالية.
 * @param {{ password: string }} input
 */
export async function updatePassword(input) {
  const password = (input.password || '').toString();
  const strong =
    password.length >= 8 &&
    /[A-Z]/.test(password) && /[a-z]/.test(password) &&
    /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);
  if (!strong) return { ok: false, error: 'weak_password' };

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'no_session' };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, error: 'server_error' };
  return { ok: true };
}

'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase-auth-server.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STRONG_PASSWORD = (password) =>
  password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) &&
  /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);
const MEMBER_TYPES = new Set(['lawyer', 'consultant', 'law_firm', 'company', 'institution', 'client']);

/**
 * تسجيل عضو جديد في البوابة — أفراد أو محامون أو جهات متعاونة.
 * الدور الافتراضي 'member' محدود دائمًا؛ الترقية لـ'admin' يدوية فقط (§أمان).
 * @param {{ email: string, password: string, fullName: string, memberType: string, locale: string }} input
 */
export async function signUp(input) {
  const email = (input?.email || '').trim();
  const fullName = (input?.fullName || '').trim();
  const password = (input?.password || '').toString();
  if (fullName.length < 2) return { ok: false, error: 'invalid_name' };
  if (!EMAIL_PATTERN.test(email)) return { ok: false, error: 'invalid_email' };
  if (!STRONG_PASSWORD(password)) return { ok: false, error: 'weak_password' };
  if (!MEMBER_TYPES.has(input?.memberType)) {
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
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        member_type: input.memberType,
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
    if (error.message === 'User already registered' || error.code === 'user_already_exists' || error.code === 'email_exists') {
      // Keep registration results indistinguishable so an address cannot be enumerated.
      return { ok: true, needsConfirmation: true };
    }
    else if (error.code === 'weak_password' || /password should contain/i.test(error.message || '')) code = 'weak_password';
    else if (error.code === 'over_email_send_rate_limit' || error.status === 429) code = 'rate_limited';
    return { ok: false, error: code };
  }
  return { ok: true, needsConfirmation: !data.session };
}

/** @param {{ email: string, password: string }} input */
export async function signIn(input) {
  const email = (input?.email || '').trim();
  const password = (input?.password || '').toString();
  if (!EMAIL_PATTERN.test(email) || !password) return { ok: false, error: 'invalid_credentials' };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: { captchaToken: input.turnstileToken || undefined },
  });
  if (error) {
    if (error.code === 'captcha_failed') return { ok: false, error: 'captcha_failed' };
    if (error.status === 429 || error.code === 'over_request_rate_limit') {
      return { ok: false, error: 'rate_limited' };
    }
    if (error.code === 'invalid_credentials' || error.message === 'Invalid login credentials') {
      return { ok: false, error: 'invalid_credentials' };
    }
    return { ok: false, error: 'server_error' };
  }
  return { ok: true };
}

/** @param {string} locale */
export async function signOutAction(locale) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect(`/${locale}`);
}

/**
 * طلب رابط إعادة تعيين كلمة المرور.
 * ملاحظة: حماية الكابتشا في Supabase مفعّلة على مستوى المشروع لكل نداءات /recover و/token —
 * لذا turnstileToken إلزامي هنا فعليًا رغم أن استدعاءه في الواجهة قد يبدو اختياريًا.
 * لا نكشف صراحةً عدم وجود الحساب (Supabase نفسه يتكفّل بهذا داخليًا ولا يُرجِع خطأ مميِّزًا لبريد غير مسجَّل)،
 * لكن نُظهر أي خطأ تشغيلي حقيقي (كابتشا، حدّ معدّل) بدل التظاهر بالنجاح.
 * @param {{ email: string, locale: string, turnstileToken?: string }} input
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
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
    captchaToken: input.turnstileToken || undefined,
  });
  if (error) {
    if (error.code === 'captcha_failed') return { ok: false, error: 'captcha_failed' };
    if (error.status === 429 || error.code === 'over_email_send_rate_limit') return { ok: false, error: 'rate_limited' };
    return { ok: false, error: 'server_error' };
  }
  return { ok: true };
}

/**
 * تعيين كلمة مرور جديدة للمستخدم داخل جلسة الاستعادة الحالية.
 * @param {{ password: string }} input
 */
export async function updatePassword(input) {
  const password = (input.password || '').toString();
  if (!STRONG_PASSWORD(password)) return { ok: false, error: 'weak_password' };

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'no_session' };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, error: 'server_error' };

  // أبطِل رموز التجديد في الجلسات الأخرى بعد تغيير كلمة المرور. نُبقي جلسة
  // الاستعادة الحالية كي يصل المستخدم إلى رسالة النجاح ثم يسجل دخوله بكلمته الجديدة.
  const { error: revokeError } = await supabase.auth.signOut({ scope: 'others' });
  if (revokeError) {
    console.error('AUTH_SESSION_REVOKE_FAILED', revokeError.code || 'unknown');
    return { ok: false, error: 'server_error' };
  }
  return { ok: true };
}

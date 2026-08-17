'use server';

import { redirect } from 'next/navigation';
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

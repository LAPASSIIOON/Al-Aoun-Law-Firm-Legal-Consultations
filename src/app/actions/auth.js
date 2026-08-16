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
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { full_name: input.fullName || input.email, member_type: input.memberType || 'individual' },
    },
  });
  if (error) return { ok: false, error: error.message === 'User already registered' ? 'already_registered' : 'server_error' };
  return { ok: true, needsConfirmation: !data.session };
}

/** @param {{ email: string, password: string }} input */
export async function signIn(input) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email: input.email, password: input.password });
  if (error) return { ok: false, error: 'invalid_credentials' };
  return { ok: true };
}

/** @param {string} locale */
export async function signOutAction(locale) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect(`/${locale}`);
}

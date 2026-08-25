'use server';

import { createServerClient } from '@/lib/supabase-server.js';

/**
 * اشتراك حقيقي في قائمة المشتركين — يُخزَّن في جدول public.newsletter_subscribers
 * (قابل للتصدير لأي أداة بريدية عند جهوزية المكتب؛ Resend لا يزال بلا Audience ID مُهيَّأ).
 * التحقّق من صيغة البريد بسيط ومقصود — هذه قائمة اهتمام لا نموذج قانوني حسّاس.
 * @param {{ email: string, locale: string }} input
 */
export async function subscribeNewsletter({ email, locale }) {
  const trimmed = (email || '').trim().toLowerCase();
  const validFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  if (!validFormat) return { error: 'invalid_email' };

  const supabase = createServerClient();
  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email: trimmed, locale: locale === 'en' ? 'en' : 'ar' });

  if (error) {
    if (error.code === '23505') return { error: 'already_subscribed' }; // قيد التفرّد على البريد
    console.error('NEWSLETTER_SUBSCRIBE_FAILED', error.message);
    return { error: 'generic' };
  }
  return { ok: true };
}

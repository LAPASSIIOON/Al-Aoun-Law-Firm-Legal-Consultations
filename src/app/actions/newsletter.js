'use server';

import { createHash } from 'node:crypto';
import { headers } from 'next/headers';
import { createServerClient } from '@/lib/supabase-server.js';

function hashIp(ip) {
  const salt = process.env.IP_HASH_SALT;
  if (!salt) throw new Error('IP_HASH_SALT is not configured');
  return createHash('sha256').update(salt + ip).digest('hex').slice(0, 32);
}

/**
 * اشتراك حقيقي في قائمة المشتركين — يُخزَّن في جدول public.newsletter_subscribers
 * (قابل للتصدير لأي أداة بريدية عند جهوزية المكتب؛ Resend لا يزال بلا Audience ID مُهيَّأ).
 * التحقّق وحدّ المعدّل في دالة قاعدة بيانات مُقيّدة بمفتاح الخدمة؛ لا يُكشف وجود البريد مسبقًا.
 * @param {{ email: string, locale: string }} input
 */
export async function subscribeNewsletter({ email, locale }) {
  const trimmed = String(email || '').trim().toLowerCase();
  const validFormat = trimmed.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  if (!validFormat) return { error: 'invalid_email' };

  try {
    const h = await headers();
    const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim()
      || h.get('x-real-ip') || '0.0.0.0';
    const supabase = createServerClient();
    const { data, error } = await supabase.rpc('subscribe_newsletter', {
      p_email: trimmed,
      p_locale: locale === 'en' ? 'en' : 'ar',
      p_ip_hash: hashIp(ip),
    });
    if (error) {
      console.error('NEWSLETTER_SUBSCRIBE_FAILED', error.code);
      return { error: 'generic' };
    }
    if (data?.ok) return { ok: true };
    if (data?.error === 'invalid_email') return { error: 'invalid_email' };
    if (data?.error === 'rate_limited') return { error: 'rate_limited' };
  } catch (error) {
    console.error('NEWSLETTER_SUBSCRIBE_FAILED', error instanceof Error ? error.name : 'unknown');
    return { error: 'generic' };
  }
  return { error: 'generic' };
}

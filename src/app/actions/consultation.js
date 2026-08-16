'use server';

import { createHash } from 'node:crypto';
import { headers } from 'next/headers';
import { createServerClient } from '@/lib/supabase-server.js';

/**
 * تجزئة IP بملح ثابت — لحد المعدل دون تخزين IP خام (خصوصية §٥/CITRA).
 * @param {string} ip
 */
function hashIp(ip) {
  const salt = process.env.IP_HASH_SALT || 'al-aoun-default-salt';
  return createHash('sha256').update(salt + ip).digest('hex').slice(0, 32);
}

/**
 * التحقّق من رمز Turnstile عبر واجهة Cloudflare siteverify.
 * السرّ يُقرأ من متغيّر بيئة على الخادم فقط — لا يُكتب في الكود إطلاقًا.
 * @param {string|undefined} token
 * @param {string} remoteIp
 */
async function verifyTurnstile(token, remoteIp) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return false; // لو السرّ غير مُهيَّأ في البيئة، نرفض بأمان بدل تجاوز التحقّق
  if (!token) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: remoteIp }),
    });
    const data = await res.json();
    return !!data.success;
  } catch (e) {
    return false;
  }
}

/**
 * تقديم طلب استشارة عبر المسار الآمن (RPC مع حد معدل + تدقيق).
 * لا يجمع وقائع القضية (§٥). التحقق يتم على الخادم لا الواجهة فقط.
 *
 * @param {{
 *   fullName: string, clientType: string, preferredContact: string,
 *   preferredLocale?: string, phone?: string, email?: string,
 *   practiceAreaId?: string|null, routingNote?: string,
 *   turnstileToken?: string
 * }} input
 * @returns {Promise<{ ok: boolean, reference?: string, error?: string }>}
 */
export async function submitConsultation(input) {
  const h = await headers();
  const ip =
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    '0.0.0.0';
  const userAgent = h.get('user-agent') || '';

  if (!input?.fullName || input.fullName.trim().length < 2) {
    return { ok: false, error: 'invalid_name' };
  }
  if (!input.phone && !input.email) {
    return { ok: false, error: 'no_contact' };
  }

  const captchaOk = await verifyTurnstile(input.turnstileToken, ip);
  if (!captchaOk) return { ok: false, error: 'captcha_failed' };

  const supabase = createServerClient();
  const { data, error } = await supabase.rpc('submit_consultation', {
    p_full_name: input.fullName,
    p_client_type: input.clientType,
    p_preferred_contact: input.preferredContact,
    p_preferred_locale: input.preferredLocale || 'ar',
    p_phone: input.phone || null,
    p_email: input.email || null,
    p_practice_area_id: input.practiceAreaId || null,
    p_routing_note: input.routingNote || null,
    p_ip_hash: hashIp(ip),
    p_user_agent: userAgent,
  });

  if (error) {
    return { ok: false, error: 'server_error' };
  }
  return data;
}

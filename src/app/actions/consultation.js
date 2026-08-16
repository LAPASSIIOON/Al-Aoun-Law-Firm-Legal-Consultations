'use server';

import { createHash } from 'node:crypto';
import { headers } from 'next/headers';
import { createServerClient } from '@/lib/supabase-server.js';
import { verifyTurnstile } from '@/lib/turnstile.js';

/**
 * تجزئة IP بملح ثابت — لحد المعدل دون تخزين IP خام (خصوصية §٥/CITRA).
 * @param {string} ip
 */
function hashIp(ip) {
  const salt = process.env.IP_HASH_SALT || 'al-aoun-default-salt';
  return createHash('sha256').update(salt + ip).digest('hex').slice(0, 32);
}

/**
 * إرسال إشعار بريدي فوري للمكتب عند وصول طلب استشارة جديد.
 * عبر REST مباشرة (fetch) بلا حزمة npm جديدة — يحافظ على ميزانية الاعتماديات.
 * فشل الإرسال لا يوقف نجاح الطلب نفسه (تدهور رشيق — السجل في القاعدة هو المرجع).
 * المُرسِل الافتراضي لـResend (onboarding@resend.dev) لأنه إشعار داخلي، لا بريد موجّه لعميل.
 * @param {{ reference: string, fullName: string, clientType: string, preferredContact: string,
 *   phone?: string, email?: string, routingNote?: string, preferredLocale?: string }} d
 */
async function notifyNewConsultation(d) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return; // غير مُهيَّأ بعد — لا نكسر تدفّق الطلب لهذا السبب
  const typeLabel = { individual: 'فرد', company: 'شركة', investor: 'مستثمر' }[d.clientType] || d.clientType;
  const contactLabel = { phone: 'هاتف', email: 'بريد إلكتروني' }[d.preferredContact] || d.preferredContact;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.8;color:#14213A">
      <h2 style="margin:0 0 4px">طلب استشارة جديد — ${d.reference}</h2>
      <p style="color:#666;margin:0 0 20px">استلمناه الآن. فحص التعارض مطلوب قبل أي تواصل موضوعي.</p>
      <table style="border-collapse:collapse;width:100%;max-width:480px">
        <tr><td style="padding:6px 0;color:#666">الاسم</td><td style="padding:6px 0;font-weight:bold">${d.fullName}</td></tr>
        <tr><td style="padding:6px 0;color:#666">الصفة</td><td style="padding:6px 0">${typeLabel}</td></tr>
        <tr><td style="padding:6px 0;color:#666">طريقة التواصل المفضّلة</td><td style="padding:6px 0">${contactLabel}</td></tr>
        ${d.phone ? `<tr><td style="padding:6px 0;color:#666">الهاتف</td><td style="padding:6px 0" dir="ltr">${d.phone}</td></tr>` : ''}
        ${d.email ? `<tr><td style="padding:6px 0;color:#666">البريد</td><td style="padding:6px 0" dir="ltr">${d.email}</td></tr>` : ''}
        ${d.routingNote ? `<tr><td style="padding:6px 0;color:#666;vertical-align:top">ملاحظة</td><td style="padding:6px 0">${d.routingNote}</td></tr>` : ''}
      </table>
    </div>`;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: 'AL OUN — تنبيهات الموقع <onboarding@resend.dev>',
        to: ['karimssaleh52@gmail.com'], // ⚠️ Resend وضع اختباري — يسمح بإيميل صاحب الحساب فقط، انظر §تعليمات النطاق
        reply_to: d.email || undefined,
        subject: `طلب استشارة جديد — ${d.reference}`,
        html,
      }),
    });
    const body = await res.text();
    if (!res.ok) {
      console.error('RESEND_SEND_FAILED', res.status, body);
    } else {
      console.log('RESEND_SEND_OK', body);
    }
  } catch (e) {
    console.error('RESEND_SEND_EXCEPTION', String(e));
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

  if (data?.ok && data?.reference) {
    await notifyNewConsultation({
      reference: data.reference,
      fullName: input.fullName,
      clientType: input.clientType,
      preferredContact: input.preferredContact,
      phone: input.phone,
      email: input.email,
      routingNote: input.routingNote,
      preferredLocale: input.preferredLocale,
    });
  }

  return data;
}

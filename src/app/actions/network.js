'use server';

import { createHash } from 'node:crypto';
import { headers } from 'next/headers';
import { createServerClient } from '@/lib/supabase-server.js';
import { verifyTurnstile } from '@/lib/turnstile.js';

function hashIp(ip) {
  const salt = process.env.IP_HASH_SALT || 'al-aoun-default-salt';
  return createHash('sha256').update(salt + ip).digest('hex').slice(0, 32);
}

async function notify(subject, html) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: 'AL OUN — تنبيهات الموقع <onboarding@resend.dev>',
        to: ['Aloun.Law@gmail.com', 'karimssaleh52@gmail.com'],
        subject,
        html,
      }),
    });
    const body = await res.text();
    if (!res.ok) { console.error('RESEND_SEND_FAILED', res.status, body); }
    else { console.log('RESEND_SEND_OK', body); }
  } catch (e) { console.error('RESEND_SEND_EXCEPTION', String(e)); }
}

async function getClientMeta() {
  const h = await headers();
  const ip =
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') || '0.0.0.0';
  return { ip, ipHash: hashIp(ip), userAgent: h.get('user-agent') || '' };
}

/**
 * إحالة ملف من مكتب/محامٍ أجنبي إلى AL OUN (المسار العكسي §٠٨ من المخطط).
 * @param {{ referringFirmName?: string, contactName: string, email?: string, phone?: string,
 *   jurisdictionId?: string, practiceAreaId?: string, matterSummary?: string,
 *   urgency?: string, clientType?: string, turnstileToken?: string }} input
 */
export async function submitReferral(input) {
  const { ip, ipHash, userAgent } = await getClientMeta();

  if (!input?.contactName || input.contactName.trim().length < 2) {
    return { ok: false, error: 'invalid_name' };
  }
  if (!input.phone && !input.email) {
    return { ok: false, error: 'no_contact' };
  }

  const captchaOk = await verifyTurnstile(input.turnstileToken, ip);
  if (!captchaOk) return { ok: false, error: 'captcha_failed' };

  const supabase = createServerClient();
  const { data, error } = await supabase.rpc('submit_referral', {
    p_direction: 'inbound',
    p_referring_firm_name: input.referringFirmName || null,
    p_referring_contact_name: input.contactName,
    p_referring_contact_email: input.email || null,
    p_referring_contact_phone: input.phone || null,
    p_jurisdiction_id: input.jurisdictionId || null,
    p_practice_area_id: input.practiceAreaId || null,
    p_matter_summary: input.matterSummary || null,
    p_urgency: input.urgency || 'standard',
    p_client_type: input.clientType || null,
    p_ip_hash: ipHash,
    p_user_agent: userAgent,
  });

  if (error) return { ok: false, error: 'server_error' };

  if (data?.ok && data?.reference) {
    await notify(
      `إحالة جديدة من مكتب أجنبي — ${data.reference}`,
      `<div style="font-family:Arial,sans-serif;line-height:1.8;color:#14213A">
        <h2 style="margin:0 0 4px">إحالة ملف جديدة — ${data.reference}</h2>
        <p style="color:#666;margin:0 0 20px">وردت عبر المكتب الدولي. فحص التعارض مطلوب قبل أي تواصل موضوعي.</p>
        <table style="border-collapse:collapse;width:100%;max-width:480px">
          <tr><td style="padding:6px 0;color:#666">المكتب المُحيل</td><td style="padding:6px 0;font-weight:bold">${input.referringFirmName || '—'}</td></tr>
          <tr><td style="padding:6px 0;color:#666">جهة الاتصال</td><td style="padding:6px 0">${input.contactName}</td></tr>
          ${input.email ? `<tr><td style="padding:6px 0;color:#666">البريد</td><td style="padding:6px 0" dir="ltr">${input.email}</td></tr>` : ''}
          ${input.phone ? `<tr><td style="padding:6px 0;color:#666">الهاتف</td><td style="padding:6px 0" dir="ltr">${input.phone}</td></tr>` : ''}
          ${input.matterSummary ? `<tr><td style="padding:6px 0;color:#666;vertical-align:top">موجز</td><td style="padding:6px 0">${input.matterSummary}</td></tr>` : ''}
        </table>
      </div>`
    );
  }

  return data;
}

/**
 * طلب تعاون/شراكة من مكتب أو محامٍ أو جهة مهنية (§٠٤/٠٥ من المخطط).
 * @param {{ applicantType: string, firmName: string, contactName: string, email?: string,
 *   phone?: string, website?: string, countryId?: string, city?: string,
 *   practiceAreaIds?: string[], collaborationInterests?: string[], message?: string,
 *   turnstileToken?: string }} input
 */
export async function submitPartnershipApplication(input) {
  const { ip, ipHash, userAgent } = await getClientMeta();

  if (!input?.firmName || input.firmName.trim().length < 2) {
    return { ok: false, error: 'invalid_firm_name' };
  }
  if (!input?.contactName || input.contactName.trim().length < 2) {
    return { ok: false, error: 'invalid_contact_name' };
  }
  if (!input.phone && !input.email) {
    return { ok: false, error: 'no_contact' };
  }

  const captchaOk = await verifyTurnstile(input.turnstileToken, ip);
  if (!captchaOk) return { ok: false, error: 'captcha_failed' };

  const supabase = createServerClient();
  const { data, error } = await supabase.rpc('submit_partnership_application', {
    p_applicant_type: input.applicantType,
    p_firm_name: input.firmName,
    p_contact_name: input.contactName,
    p_email: input.email || null,
    p_phone: input.phone || null,
    p_website: input.website || null,
    p_country_id: input.countryId || null,
    p_city: input.city || null,
    p_practice_area_ids: input.practiceAreaIds || [],
    p_collaboration_interests: input.collaborationInterests || [],
    p_message: input.message || null,
    p_ip_hash: ipHash,
    p_user_agent: userAgent,
  });

  if (error) return { ok: false, error: 'server_error' };

  if (data?.ok && data?.reference) {
    await notify(
      `طلب تعاون جديد — ${data.reference}`,
      `<div style="font-family:Arial,sans-serif;line-height:1.8;color:#14213A">
        <h2 style="margin:0 0 4px">طلب تعاون جديد — ${data.reference}</h2>
        <p style="color:#666;margin:0 0 20px">وصل عبر صفحة "التعاون معنا" في المكتب الدولي.</p>
        <table style="border-collapse:collapse;width:100%;max-width:480px">
          <tr><td style="padding:6px 0;color:#666">المكتب/الجهة</td><td style="padding:6px 0;font-weight:bold">${input.firmName}</td></tr>
          <tr><td style="padding:6px 0;color:#666">جهة الاتصال</td><td style="padding:6px 0">${input.contactName}</td></tr>
          <tr><td style="padding:6px 0;color:#666">الصفة</td><td style="padding:6px 0">${input.applicantType}</td></tr>
          ${input.email ? `<tr><td style="padding:6px 0;color:#666">البريد</td><td style="padding:6px 0" dir="ltr">${input.email}</td></tr>` : ''}
          ${input.phone ? `<tr><td style="padding:6px 0;color:#666">الهاتف</td><td style="padding:6px 0" dir="ltr">${input.phone}</td></tr>` : ''}
          ${input.website ? `<tr><td style="padding:6px 0;color:#666">الموقع</td><td style="padding:6px 0" dir="ltr">${input.website}</td></tr>` : ''}
          ${input.message ? `<tr><td style="padding:6px 0;color:#666;vertical-align:top">رسالة</td><td style="padding:6px 0">${input.message}</td></tr>` : ''}
        </table>
      </div>`
    );
  }

  return data;
}

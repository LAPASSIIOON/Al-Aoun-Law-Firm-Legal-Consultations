/**
 * التحقّق من رمز Turnstile عبر واجهة Cloudflare siteverify — مشترك بين كل نماذج الموقع.
 * السرّ يُقرأ من متغيّر بيئة على الخادم فقط.
 * @param {string|undefined} token
 * @param {string} remoteIp
 */
export async function verifyTurnstile(token, remoteIp) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return false;
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

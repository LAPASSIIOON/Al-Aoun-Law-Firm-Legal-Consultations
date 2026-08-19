'use client';
import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { useTranslations, useLocale } from 'next-intl';
import { requestPasswordReset } from '@/app/actions/auth.js';
import styles from './NetworkForm.module.css';

const TURNSTILE_SITE_KEY = '0x4AAAAAAERZ7DR2SvSLSBJq';

/**
 * نموذج طلب إعادة تعيين كلمة المرور.
 * يتضمّن Turnstile: حماية الكابتشا في Supabase مفعّلة على مستوى المشروع لكل نداءات /recover،
 * فبدون توكن صالح يرفض Supabase الطلب فورًا ولا يُرسل أي بريد (بصمت، بلا أي إشعار للواجهة).
 */
export default function ForgotPasswordForm() {
  const t = useTranslations('account');
  const locale = useLocale();
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [err, setErr] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [scriptReady, setScriptReady] = useState(false);
  const widgetRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    if (scriptReady && window.turnstile && widgetRef.current && widgetIdRef.current === null) {
      widgetIdRef.current = window.turnstile.render(widgetRef.current, {
        sitekey: TURNSTILE_SITE_KEY, theme: 'dark', size: 'flexible', language: locale,
        callback: (token) => setTurnstileToken(token),
        'expired-callback': () => setTurnstileToken(''),
      });
    }
  }, [scriptReady, locale]);

  function resetWidget() {
    if (window.turnstile && widgetIdRef.current !== null) window.turnstile.reset(widgetIdRef.current);
    setTurnstileToken('');
  }

  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus('sending'); setErr('');
    const res = await requestPasswordReset({
      email: (fd.get('email') || '').toString().trim(),
      locale,
      turnstileToken,
    });
    if (res?.ok) { setStatus('sent'); }
    else {
      setStatus('error');
      if (res?.error === 'captcha_failed') setErr(t('errorCaptcha'));
      else if (res?.error === 'rate_limited') setErr(t('errorRateLimited'));
      else setErr(t('errorGeneric'));
      resetWidget();
    }
  }

  if (status === 'sent') {
    return <p className={styles.success} role="status">{t('forgotSent')}</p>;
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onLoad={() => setScriptReady(true)} />
      <label className={styles.field}>
        <span className={styles.label}>{t('emailLabel')}</span>
        <input name="email" type="email" dir="ltr" className={styles.input} required />
      </label>
      {status === 'error' && <p className={styles.err} role="alert">{err}</p>}
      <div ref={widgetRef} />
      <button type="submit" className="btn btn-solid" disabled={status === 'sending'} style={{ width: 'fit-content' }}>
        {status === 'sending' ? t('sending') : t('forgotSubmit')}<span className="arrow">→</span>
      </button>
    </form>
  );
}

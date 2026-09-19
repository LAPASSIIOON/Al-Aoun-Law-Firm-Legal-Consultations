'use client';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { requestPasswordReset } from '@/app/actions/auth.js';
import useTurnstile from '@/hooks/useTurnstile.js';
import styles from './NetworkForm.module.css';

/**
 * نموذج طلب إعادة تعيين كلمة المرور.
 * يتضمّن Turnstile: حماية الكابتشا في Supabase مفعّلة على مستوى المشروع لكل نداءات /recover،
 * فبدون توكن صالح يرفض Supabase الطلب فورًا ولا يُرسل أي بريد (بصمت، بلا أي إشعار للواجهة).
 */
export default function ForgotPasswordForm() {
  const t = useTranslations('account');
  const tt = useTranslations('turnstile');
  const locale = useLocale();
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [err, setErr] = useState('');
  const turnstile = useTurnstile({ locale });

  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = (fd.get('email') || '').toString().trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setStatus('error'); setErr(t('errorInvalidEmail')); return;
    }
    if (!turnstile.token) {
      setStatus('error');
      setErr(turnstile.failed ? tt('loadFailed') : t('errorCaptcha'));
      return;
    }
    setStatus('sending'); setErr('');
    const res = await requestPasswordReset({
      email,
      locale,
      turnstileToken: turnstile.token,
    });
    if (res?.ok) { setStatus('sent'); }
    else {
      setStatus('error');
      if (res?.error === 'captcha_failed') setErr(t('errorCaptcha'));
      else if (res?.error === 'rate_limited') setErr(t('errorRateLimited'));
      else setErr(t('errorGeneric'));
      turnstile.reset();
    }
  }

  if (status === 'sent') {
    return <p className={styles.success} role="status">{t('forgotSent')}</p>;
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <label className={styles.field}>
        <span className={styles.label}>{t('emailLabel')}</span>
        <input name="email" type="email" dir="ltr" className={styles.input} required />
      </label>
      {status === 'error' && <p className={styles.err} role="alert">{err}</p>}
      {turnstile.failed && !(status === 'error' && err === tt('loadFailed')) && (
        <p className={styles.err} role="alert">{tt('loadFailed')}</p>
      )}
      <div ref={turnstile.containerRef} />
      <button type="submit" className="btn btn-solid" disabled={status === 'sending'} style={{ width: 'fit-content' }}>
        {status === 'sending' ? t('sending') : t('forgotSubmit')}<span className="arrow">→</span>
      </button>
    </form>
  );
}

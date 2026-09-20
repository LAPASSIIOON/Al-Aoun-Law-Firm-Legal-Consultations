'use client';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { signIn } from '@/app/actions/auth.js';
import useTurnstile from '@/hooks/useTurnstile.js';
import styles from './NetworkForm.module.css';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignInForm() {
  const t = useTranslations('account');
  const tt = useTranslations('turnstile');
  const locale = useLocale();
  const [status, setStatus] = useState('idle');
  const [err, setErr] = useState('');
  const turnstile = useTurnstile({
    locale,
    onError: () => { setStatus('error'); setErr(t('errorCaptcha')); },
  });

  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = (fd.get('email') || '').toString().trim();
    const password = (fd.get('password') || '').toString();
    if (!EMAIL_PATTERN.test(email)) { setStatus('error'); setErr(t('errorInvalidEmail')); return; }
    if (!password) { setStatus('error'); setErr(t('errorInvalidCredentials')); return; }
    if (!turnstile.token) {
      setStatus('error');
      setErr(turnstile.failed ? tt('loadFailed') : t('errorCaptcha'));
      return;
    }
    setStatus('sending'); setErr('');
    const res = await signIn({
      email,
      password,
      turnstileToken: turnstile.token,
    });
    if (res?.ok) window.location.assign(`/${locale}/account`);
    else {
      const errorKey = {
        captcha_failed: 'errorCaptcha',
        rate_limited: 'errorRateLimited',
        invalid_credentials: 'errorInvalidCredentials',
      }[res?.error] || 'errorGeneric';
      setStatus('error'); setErr(t(errorKey));
      turnstile.reset();
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <label className={styles.field}><span className={styles.label}>{t('emailLabel')}</span><input name="email" type="email" dir="ltr" className={styles.input} required /></label>
      <label className={styles.field}><span className={styles.label}>{t('passwordLabel')}</span><input name="password" type="password" dir="ltr" className={styles.input} required /></label>
      {status === 'error' && <p className={styles.err} role="alert">{err}</p>}
      {turnstile.failed && !(status === 'error' && err === tt('loadFailed')) && (
        <p className={styles.err} role="alert">{tt('loadFailed')}</p>
      )}
      <div ref={turnstile.containerRef} />
      <button type="submit" className="btn btn-solid" disabled={status === 'sending'} style={{ width: 'fit-content' }}>
        {status === 'sending' ? t('sending') : t('signInCta')}<span className="arrow">→</span>
      </button>
    </form>
  );
}

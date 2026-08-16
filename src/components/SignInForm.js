'use client';
import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation.js';
import { signIn } from '@/app/actions/auth.js';
import styles from './NetworkForm.module.css';

const TURNSTILE_SITE_KEY = '0x4AAAAAAERZ7DR2SvSLSBJq';

export default function SignInForm() {
  const t = useTranslations('account');
  const locale = useLocale();
  const router = useRouter();
  const [status, setStatus] = useState('idle');
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

  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus('sending'); setErr('');
    const res = await signIn({
      email: (fd.get('email') || '').toString().trim(),
      password: (fd.get('password') || '').toString(),
      turnstileToken,
    });
    if (res?.ok) { router.push('/admin'); router.refresh(); }
    else {
      setStatus('error'); setErr(t('errorInvalidCredentials'));
      if (window.turnstile && widgetIdRef.current !== null) window.turnstile.reset(widgetIdRef.current);
      setTurnstileToken('');
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onLoad={() => setScriptReady(true)} />
      <label className={styles.field}><span className={styles.label}>{t('emailLabel')}</span><input name="email" type="email" dir="ltr" className={styles.input} required /></label>
      <label className={styles.field}><span className={styles.label}>{t('passwordLabel')}</span><input name="password" type="password" dir="ltr" className={styles.input} required /></label>
      {status === 'error' && <p className={styles.err} role="alert">{err}</p>}
      <div ref={widgetRef} />
      <button type="submit" className="btn btn-solid" disabled={status === 'sending'} style={{ width: 'fit-content' }}>
        {status === 'sending' ? t('sending') : t('signInCta')}<span className="arrow">→</span>
      </button>
    </form>
  );
}

'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation.js';
import { signIn } from '@/app/actions/auth.js';
import styles from './NetworkForm.module.css';

export default function SignInForm() {
  const t = useTranslations('account');
  const router = useRouter();
  const [status, setStatus] = useState('idle');
  const [err, setErr] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus('sending'); setErr('');
    const res = await signIn({
      email: (fd.get('email') || '').toString().trim(),
      password: (fd.get('password') || '').toString(),
    });
    if (res?.ok) { router.push('/admin'); router.refresh(); }
    else { setStatus('error'); setErr(t('errorInvalidCredentials')); }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <label className={styles.field}><span className={styles.label}>{t('emailLabel')}</span><input name="email" type="email" dir="ltr" className={styles.input} required /></label>
      <label className={styles.field}><span className={styles.label}>{t('passwordLabel')}</span><input name="password" type="password" dir="ltr" className={styles.input} required /></label>
      {status === 'error' && <p className={styles.err} role="alert">{err}</p>}
      <button type="submit" className="btn btn-solid" disabled={status === 'sending'} style={{ width: 'fit-content' }}>
        {status === 'sending' ? t('sending') : t('signInCta')}<span className="arrow">→</span>
      </button>
    </form>
  );
}

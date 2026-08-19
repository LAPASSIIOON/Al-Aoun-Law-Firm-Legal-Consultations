'use client';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { updatePassword } from '@/app/actions/auth.js';
import styles from './NetworkForm.module.css';

/**
 * نموذج تعيين كلمة مرور جديدة — يُعرض فقط داخل جلسة استعادة صالحة.
 * التحقق من القوة والتطابق على الواجهة، ثم إعادة تحقق على الخادم.
 */
export default function ResetPasswordForm() {
  const t = useTranslations('account');
  const locale = useLocale();
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [err, setErr] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = (fd.get('password') || '').toString();
    const confirm = (fd.get('confirm') || '').toString();
    setErr('');
    if (password !== confirm) { setStatus('error'); setErr(t('errorPasswordMismatch')); return; }
    const strong = password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);
    if (!strong) { setStatus('error'); setErr(t('errorWeakPassword')); return; }
    setStatus('sending');
    const res = await updatePassword({ password });
    if (res?.ok) { setStatus('done'); }
    else if (res?.error === 'weak_password') { setStatus('error'); setErr(t('errorWeakPassword')); }
    else if (res?.error === 'no_session') { setStatus('error'); setErr(t('resetInvalid')); }
    else { setStatus('error'); setErr(t('errorGeneric')); }
  }

  if (status === 'done') {
    return (
      <div>
        <p className={styles.success} role="status">{t('resetSuccess')}</p>
        <p className="body" style={{ marginBlockStart: '1rem' }}>
          <a href={`/${locale}/account/sign-in`} style={{ color: 'var(--clay)' }}>{t('signInCta')}</a>
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <label className={styles.field}>
        <span className={styles.label}>{t('newPasswordLabel')}</span>
        <input name="password" type="password" dir="ltr" className={styles.input} required />
      </label>
      <span className={styles.hint}>{t('passwordHint')}</span>
      <label className={styles.field}>
        <span className={styles.label}>{t('confirmPasswordLabel')}</span>
        <input name="confirm" type="password" dir="ltr" className={styles.input} required />
      </label>
      {status === 'error' && <p className={styles.err} role="alert">{err}</p>}
      <button type="submit" className="btn btn-solid" disabled={status === 'sending'} style={{ width: 'fit-content' }}>
        {status === 'sending' ? t('sending') : t('resetSubmit')}<span className="arrow">→</span>
      </button>
    </form>
  );
}

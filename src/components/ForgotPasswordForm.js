'use client';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { requestPasswordReset } from '@/app/actions/auth.js';
import styles from './NetworkForm.module.css';

/**
 * نموذج طلب إعادة تعيين كلمة المرور. بلا Turnstile عمدًا:
 * الاستعادة هي مسار الطوارئ ويجب أن تعمل حتى لو كان الكابتشا غير مضبوط،
 * وSupabase يفرض حدّ معدل على رسائل الاستعادة أصلًا.
 */
export default function ForgotPasswordForm() {
  const t = useTranslations('account');
  const locale = useLocale();
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [err, setErr] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus('sending'); setErr('');
    const res = await requestPasswordReset({
      email: (fd.get('email') || '').toString().trim(),
      locale,
    });
    if (res?.ok) setStatus('sent');
    else { setStatus('error'); setErr(t('errorGeneric')); }
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
      <button type="submit" className="btn btn-solid" disabled={status === 'sending'} style={{ width: 'fit-content' }}>
        {status === 'sending' ? t('sending') : t('forgotSubmit')}<span className="arrow">→</span>
      </button>
    </form>
  );
}

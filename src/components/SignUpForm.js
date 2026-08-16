'use client';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation.js';
import { signUp } from '@/app/actions/auth.js';
import styles from './NetworkForm.module.css';

const TYPES = ['individual', 'lawyer', 'organization'];

export default function SignUpForm() {
  const t = useTranslations('account');
  const locale = useLocale();
  const router = useRouter();
  const [memberType, setMemberType] = useState('individual');
  const [status, setStatus] = useState('idle');
  const [err, setErr] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus('sending'); setErr('');
    const res = await signUp({
      email: (fd.get('email') || '').toString().trim(),
      password: (fd.get('password') || '').toString(),
      fullName: (fd.get('fullName') || '').toString().trim(),
      memberType, locale,
    });
    if (res?.ok) {
      if (res.needsConfirmation) { setNeedsConfirmation(true); setStatus('idle'); }
      else { router.push('/admin'); }
    } else {
      setStatus('error');
      setErr(res?.error === 'already_registered' ? t('errorAlreadyRegistered') : t('errorGeneric'));
    }
  }

  if (needsConfirmation) {
    return <div className={styles.success}><p className="body" style={{ color: 'var(--ink)' }}>{t('checkEmail')}</p></div>;
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <fieldset className={styles.group}>
        <legend className={styles.label}>{t('memberTypeLabel')}</legend>
        <div className={styles.segs}>
          {TYPES.map((v) => (
            <button type="button" key={v} className={`${styles.seg} ${memberType === v ? styles.segOn : ''}`} onClick={() => setMemberType(v)}>
              {t(v === 'individual' ? 'typeIndividual' : v === 'lawyer' ? 'typeLawyer' : 'typeOrganization')}
            </button>
          ))}
        </div>
      </fieldset>
      <label className={styles.field}><span className={styles.label}>{t('fullNameLabel')}</span><input name="fullName" className={styles.input} required /></label>
      <label className={styles.field}><span className={styles.label}>{t('emailLabel')}</span><input name="email" type="email" dir="ltr" className={styles.input} required /></label>
      <label className={styles.field}><span className={styles.label}>{t('passwordLabel')}</span><input name="password" type="password" dir="ltr" minLength={8} className={styles.input} required /></label>
      {status === 'error' && <p className={styles.err} role="alert">{err}</p>}
      <button type="submit" className="btn btn-solid" disabled={status === 'sending'} style={{ width: 'fit-content' }}>
        {status === 'sending' ? t('sending') : t('signUpCta')}<span className="arrow">→</span>
      </button>
    </form>
  );
}

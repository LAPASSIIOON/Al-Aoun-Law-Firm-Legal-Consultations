'use client';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { signUp } from '@/app/actions/auth.js';
import useTurnstile from '@/hooks/useTurnstile.js';
import styles from './NetworkForm.module.css';

const TYPES = ['lawyer', 'consultant', 'law_firm', 'company', 'institution', 'client'];
const CONSENT_VERSION = '2026-08-16';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const hasStrongPassword = (password) =>
  password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) &&
  /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);

export default function SignUpForm() {
  const t = useTranslations('account');
  const tt = useTranslations('turnstile');
  const locale = useLocale();
  const [memberType, setMemberType] = useState('client');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState('idle');
  const [err, setErr] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const turnstile = useTurnstile({ locale });

  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const fullName = (fd.get('fullName') || '').toString().trim();
    const email = (fd.get('email') || '').toString().trim();
    const password = (fd.get('password') || '').toString();
    if (!consent) { setStatus('error'); setErr(t('errorConsent')); return; }
    if (fullName.length < 2) { setStatus('error'); setErr(t('errorFullName')); return; }
    if (!EMAIL_PATTERN.test(email)) { setStatus('error'); setErr(t('errorInvalidEmail')); return; }
    if (!hasStrongPassword(password)) { setStatus('error'); setErr(t('errorWeakPassword')); return; }
    if (!(fd.get('phone') || '').toString().trim()) { setStatus('error'); setErr(t('errorMissingField')); return; }
    if (!turnstile.token) {
      setStatus('error');
      setErr(turnstile.failed ? tt('loadFailed') : t('errorCaptcha'));
      return;
    }
    setStatus('sending'); setErr('');
    const res = await signUp({
      email,
      password,
      fullName,
      phone: (fd.get('phone') || '').toString().trim(),
      organizationName: (fd.get('organizationName') || '').toString().trim(),
      licenseNumber: (fd.get('licenseNumber') || '').toString().trim(),
      memberType, locale, turnstileToken: turnstile.token,
      consent: true, consentVersion: CONSENT_VERSION,
    });
    if (res?.ok) {
      if (res.needsConfirmation) { setNeedsConfirmation(true); setStatus('idle'); }
      else { window.location.assign(`/${locale}/account`); }
    } else {
      setStatus('error');
      const msg = res?.error === 'already_registered' ? t('errorAlreadyRegistered')
        : res?.error === 'consent_required' ? t('errorConsent')
        : res?.error === 'invalid_name' ? t('errorFullName')
        : res?.error === 'invalid_email' ? t('errorInvalidEmail')
        : res?.error === 'weak_password' ? t('errorWeakPassword')
        : res?.error === 'rate_limited' ? t('errorRateLimited')
        : res?.error === 'missing_required_field' ? t('errorMissingField')
        : t('errorGeneric');
      setErr(msg);
      turnstile.reset();
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
              {t(`type_${v}`)}
            </button>
          ))}
        </div>
      </fieldset>
      <label className={styles.field}><span className={styles.label}>{t('fullNameLabel')}</span><input name="fullName" className={styles.input} required /></label>
      <label className={styles.field}><span className={styles.label}>{t('phoneLabel')}</span><input name="phone" type="tel" dir="ltr" placeholder="+965 XXXXXXXX" className={styles.input} required /></label>
      {['law_firm', 'company', 'institution'].includes(memberType) && (
        <label className={styles.field}><span className={styles.label}>{t('organizationNameLabel')}</span><input name="organizationName" className={styles.input} required /></label>
      )}
      {['lawyer', 'consultant'].includes(memberType) && (
        <label className={styles.field}><span className={styles.label}>{t('licenseNumberLabel')}</span><input name="licenseNumber" dir="ltr" className={styles.input} required /></label>
      )}
      <label className={styles.field}><span className={styles.label}>{t('emailLabel')}</span><input name="email" type="email" dir="ltr" className={styles.input} required /></label>
      <label className={styles.field}>
        <span className={styles.label}>{t('passwordLabel')}</span>
        <input name="password" type="password" dir="ltr" minLength={8} className={styles.input} required />
        <span className="body" style={{ fontSize: '.78rem', color: 'var(--muted)', marginBlockStart: '.35rem', display: 'block' }}>{t('passwordHint')}</span>
      </label>

      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--hair-light-strong)', borderRadius: 'var(--r-lg)', padding: '1rem 1.1rem' }}>
        <p className="body" style={{ fontSize: '.85rem', color: 'var(--muted)', marginBlockEnd: '.75rem' }}>{t('dataNotice')}</p>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '.6rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginBlockStart: '.25rem' }} required />
          <span className="body" style={{ fontSize: '.85rem' }}>
            {t('consentPrefix')} <a href={`/${locale}/privacy`} target="_blank" rel="noopener noreferrer" className="text-link">{t('consentPrivacyLink')}</a> {t('consentAnd')} <a href={`/${locale}/terms`} target="_blank" rel="noopener noreferrer" className="text-link">{t('consentTermsLink')}</a>
          </span>
        </label>
      </div>

      {status === 'error' && <p className={styles.err} role="alert">{err}</p>}
      {turnstile.failed && !(status === 'error' && err === tt('loadFailed')) && (
        <p className={styles.err} role="alert">{tt('loadFailed')}</p>
      )}
      <div ref={turnstile.containerRef} />
      <button type="submit" className="btn btn-solid" disabled={status === 'sending' || !consent} style={{ width: 'fit-content' }}>
        {status === 'sending' ? t('sending') : t('signUpCta')}<span className="arrow">→</span>
      </button>
    </form>
  );
}

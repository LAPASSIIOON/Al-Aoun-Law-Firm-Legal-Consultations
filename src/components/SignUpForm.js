'use client';
import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation.js';
import { signUp } from '@/app/actions/auth.js';
import styles from './NetworkForm.module.css';

const TYPES = ['lawyer', 'consultant', 'law_firm', 'company', 'institution', 'client'];
const TURNSTILE_SITE_KEY = '0x4AAAAAAERZ7DR2SvSLSBJq';
const CONSENT_VERSION = '2026-08-16';

export default function SignUpForm() {
  const t = useTranslations('account');
  const locale = useLocale();
  const router = useRouter();
  const [memberType, setMemberType] = useState('client');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState('idle');
  const [err, setErr] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
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
    if (!consent) { setStatus('error'); setErr(t('errorConsent')); return; }
    setStatus('sending'); setErr('');
    const res = await signUp({
      email: (fd.get('email') || '').toString().trim(),
      password: (fd.get('password') || '').toString(),
      fullName: (fd.get('fullName') || '').toString().trim(),
      phone: (fd.get('phone') || '').toString().trim(),
      organizationName: (fd.get('organizationName') || '').toString().trim(),
      licenseNumber: (fd.get('licenseNumber') || '').toString().trim(),
      memberType, locale, turnstileToken,
      consent: true, consentVersion: CONSENT_VERSION,
    });
    if (res?.ok) {
      if (res.needsConfirmation) { setNeedsConfirmation(true); setStatus('idle'); }
      else { router.push('/admin'); }
    } else {
      setStatus('error');
      const msg = res?.error === 'already_registered' ? t('errorAlreadyRegistered')
        : res?.error === 'consent_required' ? t('errorConsent')
        : res?.error === 'weak_password' ? t('errorWeakPassword')
        : res?.error === 'rate_limited' ? t('errorRateLimited')
        : res?.error === 'missing_required_field' ? t('errorMissingField')
        : t('errorGeneric');
      setErr(msg);
      if (window.turnstile && widgetIdRef.current !== null) window.turnstile.reset(widgetIdRef.current);
      setTurnstileToken('');
    }
  }

  if (needsConfirmation) {
    return <div className={styles.success}><p className="body" style={{ color: 'var(--ink)' }}>{t('checkEmail')}</p></div>;
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onLoad={() => setScriptReady(true)} />
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
      <div ref={widgetRef} />
      <button type="submit" className="btn btn-solid" disabled={status === 'sending' || !consent} style={{ width: 'fit-content' }}>
        {status === 'sending' ? t('sending') : t('signUpCta')}<span className="arrow">→</span>
      </button>
    </form>
  );
}

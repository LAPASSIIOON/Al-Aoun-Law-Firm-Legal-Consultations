'use client';
import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { useTranslations, useLocale } from 'next-intl';
import { submitReferral } from '@/app/actions/network.js';
import styles from './NetworkForm.module.css';

const TURNSTILE_SITE_KEY = '0x4AAAAAAERZ7DR2SvSLSBJq';

/** @param {{ jurisdictions: {id:string,name:string}[], practiceAreas: {id:string,title:string}[] }} props */
export default function ReferMatterForm({ jurisdictions, practiceAreas }) {
  const t = useTranslations('referMatter');
  const locale = useLocale();
  const [status, setStatus] = useState('idle');
  const [err, setErr] = useState('');
  const [urgency, setUrgency] = useState('standard');
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
    if (!turnstileToken) { setStatus('error'); setErr(t('errorCaptcha')); return; }
    setStatus('sending'); setErr('');
    try {
      const res = await submitReferral({
        referringFirmName: (fd.get('firm') || '').toString().trim(),
        contactName: (fd.get('contact') || '').toString().trim(),
        email: (fd.get('email') || '').toString().trim(),
        phone: (fd.get('phone') || '').toString().trim(),
        jurisdictionId: (fd.get('jurisdiction') || '').toString() || undefined,
        practiceAreaId: (fd.get('practiceArea') || '').toString() || undefined,
        urgency,
        matterSummary: (fd.get('summary') || '').toString().trim(),
        turnstileToken,
      });
      if (res?.ok) { setStatus('success'); }
      else if (res?.error === 'captcha_failed') {
        setStatus('error'); setErr(t('errorCaptcha'));
        if (window.turnstile && widgetIdRef.current !== null) window.turnstile.reset(widgetIdRef.current);
        setTurnstileToken('');
      } else { setStatus('error'); setErr(t('errorGeneric')); }
    } catch (_) { setStatus('error'); setErr(t('errorGeneric')); }
  }

  if (status === 'success') {
    return <div className={styles.success} role="status"><p className="body" style={{ color: 'var(--ink)' }}>{t('success')}</p></div>;
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onLoad={() => setScriptReady(true)} />
      <div className={styles.row}>
        <label className={styles.field}><span className={styles.label}>{t('firmLabel')}</span><input name="firm" className={styles.input} /></label>
        <label className={styles.field}><span className={styles.label}>{t('contactLabel')}</span><input name="contact" className={styles.input} required /></label>
      </div>
      <div className={styles.row}>
        <label className={styles.field}><span className={styles.label}>{t('emailLabel')}</span><input name="email" type="email" dir="ltr" className={styles.input} /></label>
        <label className={styles.field}><span className={styles.label}>{t('phoneLabel')}</span><input name="phone" type="tel" dir="ltr" className={styles.input} /></label>
      </div>
      <div className={styles.row}>
        <label className={styles.field}>
          <span className={styles.label}>{t('jurisdictionLabel')}</span>
          <select name="jurisdiction" className={styles.input}>
            <option value="">{t('jurisdictionPlaceholder')}</option>
            {jurisdictions.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
          </select>
        </label>
        <label className={styles.field}>
          <span className={styles.label}>{t('practiceAreaLabel')}</span>
          <select name="practiceArea" className={styles.input}>
            <option value="">{t('practiceAreaPlaceholder')}</option>
            {practiceAreas.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
          </select>
        </label>
      </div>
      <fieldset className={styles.group}>
        <legend className={styles.label}>{t('urgencyLabel')}</legend>
        <div className={styles.segs}>
          {['standard', 'urgent'].map((v) => (
            <button type="button" key={v} className={`${styles.seg} ${urgency === v ? styles.segOn : ''}`} onClick={() => setUrgency(v)}>
              {t(v === 'standard' ? 'urgencyStandard' : 'urgencyUrgent')}
            </button>
          ))}
        </div>
      </fieldset>
      <label className={styles.field}>
        <span className={styles.label}>{t('summaryLabel')}</span>
        <textarea name="summary" className={styles.input} rows={3} placeholder={t('summaryPlaceholder')} />
      </label>
      {status === 'error' && <p className={styles.err} role="alert">{err}</p>}
      <div ref={widgetRef} />
      <button type="submit" className="btn btn-solid" disabled={status === 'sending'} style={{ width: 'fit-content' }}>
        {status === 'sending' ? t('sending') : t('submit')}<span className="arrow">→</span>
      </button>
    </form>
  );
}

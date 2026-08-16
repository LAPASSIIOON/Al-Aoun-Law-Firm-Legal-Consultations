'use client';
import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { useTranslations, useLocale } from 'next-intl';
import { submitPartnershipApplication } from '@/app/actions/network.js';
import styles from './NetworkForm.module.css';

const TURNSTILE_SITE_KEY = '0x4AAAAAAERZ7DR2SvSLSBJq';
const TYPES = ['law_firm', 'lawyer', 'legal_consultant', 'corporate_legal_team', 'professional_organization', 'other'];
const INTERESTS = ['client_referrals', 'matter_referrals', 'local_counsel', 'cross_border_matters', 'strategic_partnership', 'knowledge_exchange'];
const INTEREST_KEY = {
  client_referrals: 'interestClientReferrals', matter_referrals: 'interestMatterReferrals',
  local_counsel: 'interestLocalCounsel', cross_border_matters: 'interestCrossBorder',
  strategic_partnership: 'interestStrategic', knowledge_exchange: 'interestKnowledge',
};
const TYPE_KEY = {
  law_firm: 'typeLawFirm', lawyer: 'typeLawyer', legal_consultant: 'typeLegalConsultant',
  corporate_legal_team: 'typeCorporateLegalTeam', professional_organization: 'typeProfessionalOrganization', other: 'typeOther',
};

/** @param {{ countries: {id:string,name:string}[], practiceAreas: {id:string,title:string}[] }} props */
export default function PartnerApplicationForm({ countries, practiceAreas }) {
  const t = useTranslations('partnerApply');
  const locale = useLocale();
  const [status, setStatus] = useState('idle');
  const [err, setErr] = useState('');
  const [applicantType, setApplicantType] = useState('law_firm');
  const [interests, setInterests] = useState([]);
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

  function toggleInterest(v) {
    setInterests((cur) => cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]);
  }

  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!turnstileToken) { setStatus('error'); setErr(t('errorCaptcha')); return; }
    setStatus('sending'); setErr('');
    try {
      const res = await submitPartnershipApplication({
        applicantType,
        firmName: (fd.get('firm') || '').toString().trim(),
        contactName: (fd.get('contact') || '').toString().trim(),
        email: (fd.get('email') || '').toString().trim(),
        phone: (fd.get('phone') || '').toString().trim(),
        website: (fd.get('website') || '').toString().trim(),
        countryId: (fd.get('country') || '').toString() || undefined,
        city: (fd.get('city') || '').toString().trim(),
        practiceAreaIds: fd.getAll('practiceAreas'),
        collaborationInterests: interests,
        message: (fd.get('message') || '').toString().trim(),
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
      <fieldset className={styles.group}>
        <legend className={styles.label}>{t('typeLabel')}</legend>
        <div className={styles.segs}>
          {TYPES.map((v) => (
            <button type="button" key={v} className={`${styles.seg} ${applicantType === v ? styles.segOn : ''}`} onClick={() => setApplicantType(v)}>
              {t(TYPE_KEY[v])}
            </button>
          ))}
        </div>
      </fieldset>
      <div className={styles.row}>
        <label className={styles.field}><span className={styles.label}>{t('firmLabel')}</span><input name="firm" className={styles.input} required /></label>
        <label className={styles.field}><span className={styles.label}>{t('contactLabel')}</span><input name="contact" className={styles.input} required /></label>
      </div>
      <div className={styles.row}>
        <label className={styles.field}><span className={styles.label}>{t('emailLabel')}</span><input name="email" type="email" dir="ltr" className={styles.input} /></label>
        <label className={styles.field}><span className={styles.label}>{t('phoneLabel')}</span><input name="phone" type="tel" dir="ltr" className={styles.input} /></label>
      </div>
      <div className={styles.row}>
        <label className={styles.field}><span className={styles.label}>{t('websiteLabel')}</span><input name="website" dir="ltr" className={styles.input} /></label>
        <label className={styles.field}>
          <span className={styles.label}>{t('countryLabel')}</span>
          <select name="country" className={styles.input}>
            <option value="">{t('countryPlaceholder')}</option>
            {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
      </div>
      <label className={styles.field}><span className={styles.label}>{t('cityLabel')}</span><input name="city" className={styles.input} /></label>
      <fieldset className={styles.group}>
        <legend className={styles.label}>{t('interestsLabel')}</legend>
        <div className={styles.segs}>
          {INTERESTS.map((v) => (
            <button type="button" key={v} className={`${styles.seg} ${interests.includes(v) ? styles.segOn : ''}`} onClick={() => toggleInterest(v)}>
              {t(INTEREST_KEY[v])}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className={styles.group}>
        <legend className={styles.label}>{t('practiceAreaLabel')}</legend>
        <div className={styles.segs}>
          {practiceAreas.map((a) => (
            <label key={a.id} className={styles.seg} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}>
              <input type="checkbox" name="practiceAreas" value={a.id} style={{ margin: 0 }} />
              {a.title}
            </label>
          ))}
        </div>
      </fieldset>
      <label className={styles.field}>
        <span className={styles.label}>{t('messageLabel')}</span>
        <textarea name="message" className={styles.input} rows={3} placeholder={t('messagePlaceholder')} />
      </label>
      {status === 'error' && <p className={styles.err} role="alert">{err}</p>}
      <div ref={widgetRef} />
      <button type="submit" className="btn btn-solid" disabled={status === 'sending'} style={{ width: 'fit-content' }}>
        {status === 'sending' ? t('sending') : t('submit')}<span className="arrow">→</span>
      </button>
    </form>
  );
}

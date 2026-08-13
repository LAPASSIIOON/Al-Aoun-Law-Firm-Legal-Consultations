'use client';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { submitConsultation } from '@/app/actions/consultation.js';
import styles from './ContactForm.module.css';

export default function ContactForm() {
  const t = useTranslations('contactPage');
  const locale = useLocale();
  const [clientType, setClientType] = useState('individual');
  const [preferredContact, setPreferredContact] = useState('phone');
  const [status, setStatus] = useState('idle');
  const [err, setErr] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const fullName = (fd.get('fullName') || '').toString().trim();
    const phone = (fd.get('phone') || '').toString().trim();
    const email = (fd.get('email') || '').toString().trim();
    const note = (fd.get('note') || '').toString().trim();
    if (fullName.length < 2) { setStatus('error'); setErr(t('errorName')); return; }
    if (!phone && !email) { setStatus('error'); setErr(t('errorContact')); return; }
    setStatus('sending'); setErr('');
    try {
      const res = await submitConsultation({ fullName, clientType, preferredContact, preferredLocale: locale, phone, email, routingNote: note });
      if (res && res.ok) { setStatus('success'); e.target.reset(); }
      else { setStatus('error'); setErr(t('errorGeneric')); }
    } catch (_) { setStatus('error'); setErr(t('errorGeneric')); }
  }

  if (status === 'success') {
    return <div className={styles.success} role="status"><p className="body" style={{ color: 'var(--ink)' }}>{t('success')}</p></div>;
  }
  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <label className={styles.field}>
        <span className={styles.label}>{t('nameLabel')}</span>
        <input name="fullName" className={styles.input} autoComplete="name" required />
      </label>
      <fieldset className={styles.group}>
        <legend className={styles.label}>{t('clientTypeLabel')}</legend>
        <div className={styles.segs}>
          {['individual','company','investor'].map((v) => (
            <button type="button" key={v} className={`${styles.seg} ${clientType===v?styles.segOn:''}`} onClick={() => setClientType(v)}>
              {t(v==='individual'?'clientIndividual':v==='company'?'clientCompany':'clientInvestor')}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className={styles.group}>
        <legend className={styles.label}>{t('contactLabel')}</legend>
        <div className={styles.segs}>
          {['phone','email'].map((v) => (
            <button type="button" key={v} className={`${styles.seg} ${preferredContact===v?styles.segOn:''}`} onClick={() => setPreferredContact(v)}>
              {t(v==='phone'?'contactPhone':'contactEmail')}
            </button>
          ))}
        </div>
      </fieldset>
      <div className={styles.row}>
        <label className={styles.field}><span className={styles.label}>{t('phoneLabel')}</span><input name="phone" className={styles.input} type="tel" dir="ltr" autoComplete="tel" /></label>
        <label className={styles.field}><span className={styles.label}>{t('emailLabel')}</span><input name="email" className={styles.input} type="email" dir="ltr" autoComplete="email" /></label>
      </div>
      <label className={styles.field}>
        <span className={styles.label}>{t('noteLabel')}</span>
        <textarea name="note" className={styles.input} rows={3} placeholder={t('notePlaceholder')} />
      </label>
      {status === 'error' && <p className={styles.err} role="alert">{err}</p>}
      <button type="submit" className="btn btn-solid" disabled={status==='sending'}>
        {status==='sending' ? t('sending') : t('submit')}<span className="arrow">→</span>
      </button>
    </form>
  );
}

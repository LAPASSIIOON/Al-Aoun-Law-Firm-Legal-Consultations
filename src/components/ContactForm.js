'use client';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { submitConsultation } from '@/app/actions/consultation.js';
import styles from './ContactForm.module.css';

export default function ContactForm() {
  const t = useTranslations('contactPage');
  const locale = useLocale();
  const [step, setStep] = useState(1);
  const [clientType, setClientType] = useState('individual');
  const [preferredContact, setPreferredContact] = useState('phone');
  const [status, setStatus] = useState('idle');
  const [err, setErr] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  function goNext(e) {
    e.preventDefault();
    if (fullName.trim().length < 2) { setStatus('error'); setErr(t('errorName')); return; }
    if (!phone.trim()) { setStatus('error'); setErr(t('errorContact')); return; }
    setStatus('idle'); setErr(''); setStep(2);
  }

  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = (fd.get('email') || '').toString().trim();
    const note = (fd.get('note') || '').toString().trim();
    setStatus('sending'); setErr('');
    try {
      const res = await submitConsultation({ fullName: fullName.trim(), clientType, preferredContact, preferredLocale: locale, phone: phone.trim(), email, routingNote: note });
      if (res && res.ok) { setStatus('success'); }
      else { setStatus('error'); setErr(t('errorGeneric')); }
    } catch (_) { setStatus('error'); setErr(t('errorGeneric')); }
  }

  if (status === 'success') {
    return <div className={styles.success} role="status"><p className="body" style={{ color: 'var(--ink)' }}>{t('success')}</p></div>;
  }

  return (
    <div className={styles.form}>
      <div className={styles.stepBar}>
        <span className={styles.stepDot} data-active="true" />
        <span className={`${styles.stepDot} ${step === 2 ? styles.stepDotActive : ''}`} data-active={step === 2} />
        <span className={styles.stepLabel}>{t('stepOf').replace('{n}', String(step))}</span>
      </div>

      {step === 1 ? (
        <form key="step1" onSubmit={goNext} noValidate>
          <p className={styles.hint}>{t('startEasy')}</p>
          <label className={styles.field}>
            <span className={styles.label}>{t('nameLabel')}</span>
            <input className={styles.input} autoComplete="name" autoFocus value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>{t('phoneLabel')}</span>
            <input className={styles.input} type="tel" dir="ltr" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </label>
          {status === 'error' && <p className={styles.err} role="alert">{err}</p>}
          <button type="submit" className="btn btn-solid">{t('nextStep')} <span className="arrow">→</span></button>
        </form>
      ) : (
        <form key="step2" onSubmit={onSubmit} noValidate className={styles.stepIn}>
          <fieldset className={styles.group}>
            <legend className={styles.label}>{t('clientTypeLabel')}</legend>
            <div className={styles.segs}>
              {['individual', 'company', 'investor'].map((v) => (
                <button type="button" key={v} className={`${styles.seg} ${clientType === v ? styles.segOn : ''}`} onClick={() => setClientType(v)}>
                  {t(v === 'individual' ? 'clientIndividual' : v === 'company' ? 'clientCompany' : 'clientInvestor')}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className={styles.group}>
            <legend className={styles.label}>{t('contactLabel')}</legend>
            <div className={styles.segs}>
              {['phone', 'email'].map((v) => (
                <button type="button" key={v} className={`${styles.seg} ${preferredContact === v ? styles.segOn : ''}`} onClick={() => setPreferredContact(v)}>
                  {t(v === 'phone' ? 'contactPhone' : 'contactEmail')}
                </button>
              ))}
            </div>
          </fieldset>
          <label className={styles.field}>
            <span className={styles.label}>{t('emailLabel')}</span>
            <input name="email" className={styles.input} type="email" dir="ltr" autoComplete="email" />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>{t('noteLabel')}</span>
            <textarea name="note" className={styles.input} rows={3} placeholder={t('notePlaceholder')} />
          </label>
          {status === 'error' && <p className={styles.err} role="alert">{err}</p>}
          <div className={styles.stepActions}>
            <button type="button" className="btn-line" onClick={() => setStep(1)}>{t('back')}</button>
            <button type="submit" className="btn btn-solid" disabled={status === 'sending'}>
              {status === 'sending' ? t('sending') : t('submit')}<span className="arrow">→</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

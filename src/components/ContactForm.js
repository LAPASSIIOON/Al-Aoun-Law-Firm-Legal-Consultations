'use client';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { submitConsultation } from '@/app/actions/consultation.js';
import useTurnstile from '@/hooks/useTurnstile.js';
import styles from './ContactForm.module.css';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactForm({ intent = null, sourceRoute = null } = {}) {
  const t = useTranslations('contactPage');
  const tt = useTranslations('turnstile');
  const locale = useLocale();
  const [step, setStep] = useState(1);
  const [clientType, setClientType] = useState('individual');
  const [preferredContact, setPreferredContact] = useState('phone');
  const [status, setStatus] = useState('idle');
  const [err, setErr] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // حاوية الودجت لا توجد في الـDOM إلا في الخطوة ٢، لذا active مربوطة بالخطوة:
  // الخُطّاف يُنشئ الودجت عند الدخول ويُزيله نظيفًا عند الخروج، فالعودة تُنشئ ودجتًا جديدًا.
  const turnstile = useTurnstile({ locale, active: step === 2 });

  function goNext(e) {
    e.preventDefault();
    if (fullName.trim().length < 2) { setStatus('error'); setErr(t('errorName')); return; }
    if (!phone.trim()) { setStatus('error'); setErr(t('errorContact')); return; }
    const digitCount = phone.replace(/\D/g, '').length;
    if (digitCount < 7) { setStatus('error'); setErr(t('errorPhoneFormat')); return; }
    setStatus('idle'); setErr(''); setStep(2);
  }

  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = (fd.get('email') || '').toString().trim();
    const note = (fd.get('note') || '').toString().trim();
    if (preferredContact === 'email' && !email) { setStatus('error'); setErr(t('errorEmailRequired')); return; }
    if (email && !EMAIL_PATTERN.test(email)) { setStatus('error'); setErr(t('errorEmailFormat')); return; }
    if (!turnstile.token) {
      setStatus('error');
      setErr(turnstile.failed ? tt('loadFailed') : t('errorCaptcha'));
      return;
    }
    setStatus('sending'); setErr('');
    try {
      const res = await submitConsultation({ fullName: fullName.trim(), clientType, preferredContact, preferredLocale: locale, phone: phone.trim(), email, routingNote: note, turnstileToken: turnstile.token, intent, sourceRoute });
      if (res && res.ok) { setStatus('success'); }
      else if (res && (res.error === 'email_required' || res.error === 'invalid_email')) {
        setStatus('error'); setErr(t(res.error === 'email_required' ? 'errorEmailRequired' : 'errorEmailFormat'));
      } else if (res && res.error === 'invalid_name') {
        setStatus('error'); setErr(t('errorName'));
      } else if (res && res.error === 'no_contact') {
        setStatus('error'); setErr(t('errorContact'));
      } else if (res && res.error === 'invalid_phone') {
        setStatus('error'); setErr(t('errorPhoneFormat'));
      } else if (res && res.error === 'captcha_failed') {
        setStatus('error'); setErr(t('errorCaptcha'));
        turnstile.reset();
      } else { setStatus('error'); setErr(t('errorGeneric')); }
    } catch (_) { setStatus('error'); setErr(t('errorGeneric')); }
  }

  if (status === 'success') {
    return <div className={styles.success} role="status"><p className="body" style={{ color: 'var(--ink)' }}>{t('success')}</p></div>;
  }

  return (
    <div className={styles.form}>
      <div className={styles.stepBar}>
        <span className={styles.stepDot} data-active="true" aria-hidden="true" />
        <span className={`${styles.stepDot} ${step === 2 ? styles.stepDotActive : ''}`} data-active={step === 2} aria-hidden="true" />
        <span className={styles.stepLabel} role="status">{t('stepOf').replace('{n}', String(step))}</span>
      </div>

      {step === 1 ? (
        <form key="step1" onSubmit={goNext} noValidate className={styles.fields}>
          <p className={styles.hint}>{t('startEasy')}</p>
          <label className={styles.field}>
            <span className={styles.label}>{t('nameLabel')}</span>
            <input className={styles.input} autoComplete="name" autoFocus value={fullName} onChange={(e) => setFullName(e.target.value)} required
              aria-invalid={status === 'error' || undefined} aria-describedby={status === 'error' ? 'contact-err' : undefined} />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>{t('phoneLabel')}</span>
            <input className={styles.input} type="tel" dir="ltr" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required
              aria-invalid={status === 'error' || undefined} aria-describedby={status === 'error' ? 'contact-err' : undefined} />
          </label>
          {status === 'error' && <p id="contact-err" className={styles.err} role="alert">{err}</p>}
          <button type="submit" className="btn btn-solid">{t('nextStep')} <span className="arrow">→</span></button>
        </form>
      ) : (
        <form key="step2" onSubmit={onSubmit} noValidate className={`${styles.fields} ${styles.stepIn}`}>
          <fieldset className={styles.group}>
            <legend className={styles.label}>{t('clientTypeLabel')}</legend>
            <div className={styles.segs}>
              {['individual', 'company', 'investor'].map((v) => (
                <button type="button" key={v} aria-pressed={clientType === v} className={`${styles.seg} ${clientType === v ? styles.segOn : ''}`} onClick={() => setClientType(v)}>
                  {t(v === 'individual' ? 'clientIndividual' : v === 'company' ? 'clientCompany' : 'clientInvestor')}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className={styles.group}>
            <legend className={styles.label}>{t('contactLabel')}</legend>
            <div className={styles.segs}>
              {['phone', 'email'].map((v) => (
                <button type="button" key={v} aria-pressed={preferredContact === v} className={`${styles.seg} ${preferredContact === v ? styles.segOn : ''}`} onClick={() => setPreferredContact(v)}>
                  {t(v === 'phone' ? 'contactPhone' : 'contactEmail')}
                </button>
              ))}
            </div>
          </fieldset>
          <label className={styles.field}>
            <span className={styles.label}>{t('emailLabel')}</span>
            <input name="email" className={styles.input} type="email" dir="ltr" autoComplete="email"
              required={preferredContact === 'email'} aria-required={preferredContact === 'email'} />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>{t('noteLabel')}</span>
            <textarea name="note" className={styles.input} rows={3} placeholder={t('notePlaceholder')} />
          </label>
          {status === 'error' && <p id="contact-err" className={styles.err} role="alert">{err}</p>}
          {turnstile.failed && !(status === 'error' && err === tt('loadFailed')) && (
            <p className={styles.err} role="alert">{tt('loadFailed')}</p>
          )}
          <div ref={turnstile.containerRef} />
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

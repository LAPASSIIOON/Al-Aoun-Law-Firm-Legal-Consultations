'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser.js';
import styles from './NetworkForm.module.css';

const validCode = (value) => /^\d{6}$/.test(value.trim());

/** @param {{ locale: string, nextPath: string, copy: Record<string, string> }} props */
export default function AdminMfaSecurity({ locale, nextPath, copy }) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [status, setStatus] = useState('loading');
  const [factor, setFactor] = useState(null);
  const [pending, setPending] = useState(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  async function load() {
    setError('');
    const [{ data: factors, error: factorsError }, { data: assurance, error: assuranceError }] = await Promise.all([
      supabase.auth.mfa.listFactors(),
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    ]);
    if (factorsError || assuranceError) {
      setStatus('error');
      setError(copy.errorGeneric);
      return;
    }
    const verified = (factors?.totp || []).find((item) => item.status === 'verified');
    setFactor(verified || null);
    setStatus(verified ? (assurance.currentLevel === 'aal2' ? 'active' : 'challenge') : 'setup');
  }

  useEffect(() => { load(); }, []);

  async function startEnrollment() {
    setError('');
    setStatus('working');
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'AL OUN administration',
    });
    if (enrollError || !data?.totp?.qr_code) {
      setError(copy.errorGeneric);
      setStatus('setup');
      return;
    }
    setPending({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
    setStatus('enroll');
  }

  async function verify(factorId, destination) {
    if (!validCode(code)) {
      setError(copy.codeInvalid);
      return;
    }
    setError('');
    setStatus('working');
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError || !challenge?.id) {
      setError(copy.errorGeneric);
      setStatus(destination === 'enroll' ? 'enroll' : 'challenge');
      return;
    }
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: code.trim(),
    });
    if (verifyError) {
      setError(copy.errorGeneric);
      setStatus(destination === 'enroll' ? 'enroll' : 'challenge');
      return;
    }
    await supabase.auth.refreshSession();
    router.replace(`/${locale}${nextPath}`);
    router.refresh();
  }

  async function cancelEnrollment() {
    if (!pending?.id) return;
    setStatus('working');
    await supabase.auth.mfa.unenroll({ factorId: pending.id });
    setPending(null);
    setCode('');
    setStatus('setup');
  }

  if (status === 'loading') return <p className="body">{copy.loading}</p>;
  if (status === 'error') return <p className={styles.err} role="alert">{error}</p>;

  if (status === 'active') {
    return (
      <div className={styles.success}>
        <h2 className="display d-3" style={{ fontSize: '1.35rem', marginBlockEnd: '.65rem' }}>{copy.activeHeading}</h2>
        <p className="body" style={{ marginBlockEnd: '1.25rem' }}>{copy.activeBody}</p>
        <button type="button" className="btn btn-solid" onClick={() => router.replace(`/${locale}${nextPath}`)}>{copy.continueCta}</button>
      </div>
    );
  }

  if (status === 'setup') {
    return (
      <div className={styles.success}>
        <h2 className="display d-3" style={{ fontSize: '1.35rem', marginBlockEnd: '.65rem' }}>{copy.setupHeading}</h2>
        <p className="body" style={{ marginBlockEnd: '1.25rem' }}>{copy.setupBody}</p>
        <button type="button" className="btn btn-solid" onClick={startEnrollment}>{copy.setupCta}</button>
      </div>
    );
  }

  const isEnrollment = status === 'enroll' || (status === 'working' && pending);
  const factorId = isEnrollment ? pending?.id : factor?.id;
  const heading = isEnrollment ? copy.setupHeading : copy.challengeHeading;
  const body = isEnrollment ? copy.setupBody : copy.challengeBody;
  const action = isEnrollment ? copy.enableCta : copy.verifyCta;
  // الإصدارات الحالية من Auth تعيد أحيانًا data URL جاهزًا وأحيانًا SVG خامًا.
  // ترميز data URL مرة ثانية يكسره؛ نحافظ عليه كما هو ونرمّز SVG الخام فقط.
  const qr = pending?.qr
    ? (pending.qr.startsWith('data:image/') ? pending.qr : `data:image/svg+xml;utf8,${encodeURIComponent(pending.qr)}`)
    : '';

  return (
    <form className={styles.form} onSubmit={(event) => { event.preventDefault(); if (factorId) verify(factorId, isEnrollment ? 'enroll' : 'challenge'); }} noValidate>
      <div>
        <h2 className="display d-3" style={{ fontSize: '1.35rem', marginBlockEnd: '.65rem' }}>{heading}</h2>
        <p className="body">{body}</p>
      </div>
      {isEnrollment && pending && (
        <>
          <img src={qr} alt={copy.setupHeading} width="220" height="220" style={{ background: '#fff', padding: '.75rem', borderRadius: 'var(--r)' }} />
          <div>
            <p className={styles.label}>{copy.secretLabel}</p>
            <code style={{ display: 'block', overflowWrap: 'anywhere', padding: '.75rem', background: 'var(--surface-2)', borderRadius: 'var(--r)' }}>{pending.secret}</code>
          </div>
        </>
      )}
      <label className={styles.field}>
        <span className={styles.label}>{copy.codeLabel}</span>
        <input className={styles.input} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength="6" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} placeholder={copy.codeHint} />
      </label>
      {error && <p className={styles.err} role="alert">{error}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem' }}>
        <button type="submit" className="btn btn-solid" disabled={status === 'working'}>{action}</button>
        {isEnrollment ? (
          <button type="button" className="btn btn-ghost" onClick={cancelEnrollment} disabled={status === 'working'}>{copy.cancelSetupCta}</button>
        ) : (
          <a className="btn btn-ghost" href={`/${locale}`}>{copy.cancelCta}</a>
        )}
      </div>
    </form>
  );
}

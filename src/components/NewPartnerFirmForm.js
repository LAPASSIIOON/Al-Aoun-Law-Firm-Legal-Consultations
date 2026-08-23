'use client';
import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation.js';
import { createPartnerFirm } from '@/app/actions/content.js';

const inputStyle = { display: 'block', width: '100%', marginBlockStart: '.35rem', font: 'inherit', fontSize: '.95rem', background: 'var(--surface-2)', color: 'var(--ink)', border: '1px solid var(--hair-light-strong)', borderRadius: 'var(--r)', padding: '.6rem .75rem' };
const labelStyle = { fontSize: '.85rem', color: 'var(--platinum-3)' };
const STATUSES = ['prospect', 'engaged', 'agreement_signed', 'active', 'dormant'];

export default function NewPartnerFirmForm({ countries }) {
  const t = useTranslations('admin');
  const router = useRouter();
  const [legalName, setLegalName] = useState('');
  const [displayNameAr, setDisplayNameAr] = useState('');
  const [displayNameEn, setDisplayNameEn] = useState('');
  const [countryId, setCountryId] = useState('');
  const [city, setCity] = useState('');
  const [website, setWebsite] = useState('');
  const [relationshipStatus, setRelationshipStatus] = useState('prospect');
  const [internalNotes, setInternalNotes] = useState('');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function create() {
    if (!legalName.trim()) return;
    setError('');
    startTransition(async () => {
      const res = await createPartnerFirm({ legalName, displayNameAr, displayNameEn, countryId, city, website, relationshipStatus, internalNotes });
      if (res?.error) { setError(res.error); return; }
      router.push(`/admin/partner-firms/${res.id}`);
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '640px' }}>
      <label className="body" style={labelStyle}>{t('partnerLegalName')}
        <input value={legalName} onChange={(e) => setLegalName(e.target.value)} style={inputStyle} />
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <label className="body" style={labelStyle}>{t('partnerDisplayNameAr')}
          <input value={displayNameAr} onChange={(e) => setDisplayNameAr(e.target.value)} style={inputStyle} />
        </label>
        <label className="body" style={labelStyle}>{t('partnerDisplayNameEn')}
          <input value={displayNameEn} onChange={(e) => setDisplayNameEn(e.target.value)} style={inputStyle} />
        </label>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <label className="body" style={labelStyle}>{t('partnerCountry')}
          <select value={countryId} onChange={(e) => setCountryId(e.target.value)} style={inputStyle}>
            <option value="">—</option>
            {countries.map((c) => (<option key={c.id} value={c.id}>{c.name_en}</option>))}
          </select>
        </label>
        <label className="body" style={labelStyle}>{t('partnerCity')}
          <input value={city} onChange={(e) => setCity(e.target.value)} style={inputStyle} />
        </label>
      </div>
      <label className="body" style={labelStyle}>{t('partnerWebsite')}
        <input value={website} onChange={(e) => setWebsite(e.target.value)} style={inputStyle} placeholder="https://" />
      </label>
      <label className="body" style={labelStyle}>{t('partnerStatus')}
        <select value={relationshipStatus} onChange={(e) => setRelationshipStatus(e.target.value)} style={inputStyle}>
          {STATUSES.map((s) => (<option key={s} value={s}>{t(`partnerStatus_${s}`)}</option>))}
        </select>
      </label>
      <label className="body" style={labelStyle}>{t('partnerInternalNotes')}
        <textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
      </label>
      <p className="body" style={{ color: 'var(--muted)', fontSize: '.82rem' }}>{t('partnerVisibilityHint')}</p>
      {error && <p style={{ color: '#B42722', fontSize: '.85rem' }}>{error}</p>}
      <div>
        <button type="button" className="btn btn-solid" disabled={pending || !legalName.trim()} onClick={create}>{t('contentCreate')}</button>
      </div>
    </div>
  );
}

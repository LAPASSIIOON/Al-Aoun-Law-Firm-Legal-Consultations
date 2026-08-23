'use client';
import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { updatePartnerFirm } from '@/app/actions/content.js';

const inputStyle = { display: 'block', width: '100%', marginBlockStart: '.35rem', font: 'inherit', fontSize: '.95rem', background: 'var(--surface-2)', color: 'var(--ink)', border: '1px solid var(--hair-light-strong)', borderRadius: 'var(--r)', padding: '.6rem .75rem' };
const labelStyle = { fontSize: '.85rem', color: 'var(--platinum-3)' };
const STATUSES = ['prospect', 'engaged', 'agreement_signed', 'active', 'dormant'];

export default function EditPartnerFirmForm({ firm, countries }) {
  const t = useTranslations('admin');
  const [legalName, setLegalName] = useState(firm.legal_name || '');
  const [displayNameAr, setDisplayNameAr] = useState(firm.display_name_ar || '');
  const [displayNameEn, setDisplayNameEn] = useState(firm.display_name_en || '');
  const [countryId, setCountryId] = useState(firm.country_id || '');
  const [city, setCity] = useState(firm.city || '');
  const [website, setWebsite] = useState(firm.website || '');
  const [relationshipStatus, setRelationshipStatus] = useState(firm.relationship_status || 'prospect');
  const [publicVisible, setPublicVisible] = useState(!!firm.public_visible);
  const [consentToDisplay, setConsentToDisplay] = useState(!!firm.consent_to_display);
  const [internalNotes, setInternalNotes] = useState(firm.internal_notes || '');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  function save() {
    setError(''); setSaved(false);
    startTransition(async () => {
      const res = await updatePartnerFirm({
        id: firm.id, legalName, displayNameAr, displayNameEn, countryId, city, website,
        relationshipStatus, publicVisible, consentToDisplay, internalNotes,
      });
      if (res?.error) { setError(res.error); return; }
      setSaved(true);
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
          <select value={countryId || ''} onChange={(e) => setCountryId(e.target.value)} style={inputStyle}>
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

      <div style={{ padding: '1rem 1.1rem', borderRadius: 'var(--r-lg)', boxShadow: 'inset 0 0 0 1px rgba(180,39,34,.3)', background: 'rgba(180,39,34,.06)' }}>
        <p className="body" style={{ fontSize: '.85rem', color: 'var(--ink)', fontWeight: 700, marginBlockEnd: '.6rem' }}>{t('partnerVisibilitySectionTitle')}</p>
        <p className="body" style={{ fontSize: '.8rem', color: 'var(--muted)', marginBlockEnd: '.75rem' }}>{t('partnerVisibilityHint')}</p>
        <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.9rem', marginBlockEnd: '.5rem' }}>
          <input type="checkbox" checked={consentToDisplay} onChange={(e) => setConsentToDisplay(e.target.checked)} />
          {t('partnerConsentToDisplay')}
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.9rem' }}>
          <input type="checkbox" checked={publicVisible} onChange={(e) => setPublicVisible(e.target.checked)} />
          {t('partnerPublicVisible')}
        </label>
      </div>

      <label className="body" style={labelStyle}>{t('partnerInternalNotes')}
        <textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
      </label>
      {error && <p style={{ color: '#B42722', fontSize: '.85rem' }}>{error}</p>}
      {saved && <p style={{ color: '#1C7D5A', fontSize: '.85rem' }}>{t('contentSaved')}</p>}
      <div>
        <button type="button" className="btn btn-solid" disabled={pending || !legalName.trim()} onClick={save}>{t('contentSave')}</button>
      </div>
    </div>
  );
}

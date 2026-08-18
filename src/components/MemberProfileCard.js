'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateMyProfile } from '@/app/actions/member.js';

const ORG_TYPES = ['law_firm', 'company', 'institution', 'organization'];
const LICENSE_TYPES = ['lawyer', 'consultant'];

/**
 * @param {{ member: any, typeLabel: string, locale: string, labels: Record<string,string> }} props
 */
export default function MemberProfileCard({ member, typeLabel, locale, labels }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  const showOrg = ORG_TYPES.includes(member.member_type);
  const showLicense = LICENSE_TYPES.includes(member.member_type);

  const [form, setForm] = useState({
    displayName: member.display_name || '',
    phone: member.phone || '',
    organizationName: member.organization_name || '',
    licenseNumber: member.license_number || '',
  });

  function field(key, value) { setForm((f) => ({ ...f, [key]: value })); }

  function save() {
    setError(''); setSaved(false);
    startTransition(async () => {
      const res = await updateMyProfile(form);
      if (res && res.ok) {
        setSaved(true); setEditing(false); router.refresh();
      } else {
        setError(labels.error);
      }
    });
  }

  const rowStyle = { display: 'flex', gap: '.5rem', flexWrap: 'wrap', justifyContent: 'space-between', padding: '.5rem 0', borderBlockEnd: '1px solid var(--hair-light-strong)' };
  const keyStyle = { color: 'var(--muted)', fontSize: '.85rem' };
  const valStyle = { fontFamily: 'var(--f-display)', fontSize: '.98rem' };
  const inputStyle = { width: '100%', padding: '.6rem .75rem', borderRadius: 'var(--r-md, 10px)', border: '1px solid var(--muted)', background: 'var(--surface, transparent)', font: 'inherit', color: 'inherit' };
  const labelStyle = { display: 'block', fontSize: '.82rem', color: 'var(--muted)', marginBlockEnd: '.3rem' };

  return (
    <div style={{ border: '1px solid var(--hair-light-strong)', borderRadius: 'var(--r-lg)', padding: '1.4rem 1.5rem', marginBlockEnd: '2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBlockEnd: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
          <h2 className="display d-3" style={{ margin: 0, fontSize: '1.25rem' }}>{labels.profileHeading}</h2>
          <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--clay-bright)', background: 'var(--surface-2)', padding: '.2rem .7rem', borderRadius: '999px' }}>{typeLabel}</span>
        </div>
        {!editing && (
          <button className="btn-line" style={{ padding: '.4rem .9rem', fontSize: '.85rem' }} onClick={() => { setEditing(true); setSaved(false); }}>
            {labels.editProfile}
          </button>
        )}
      </div>

      {!editing ? (
        <div>
          <div style={rowStyle}><span style={keyStyle}>{labels.fieldName}</span><span style={valStyle}>{member.display_name}</span></div>
          <div style={rowStyle}><span style={keyStyle}>{labels.fieldEmail}</span><span style={valStyle} dir="ltr">{member.email}</span></div>
          <div style={rowStyle}><span style={keyStyle}>{labels.fieldPhone}</span><span style={valStyle} dir="ltr">{member.phone || '—'}</span></div>
          {showOrg && <div style={rowStyle}><span style={keyStyle}>{labels.fieldOrg}</span><span style={valStyle}>{member.organization_name || '—'}</span></div>}
          {showLicense && <div style={rowStyle}><span style={keyStyle}>{labels.fieldLicense}</span><span style={valStyle} dir="ltr">{member.license_number || '—'}</span></div>}
          {saved && <p className="body" style={{ color: 'var(--success-text, #176E4E)', fontSize: '.85rem', marginBlockStart: '.9rem' }}>{labels.saved}</p>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>{labels.fieldName}</label>
            <input style={inputStyle} value={form.displayName} onChange={(e) => field('displayName', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>{labels.fieldEmail}</label>
            <input style={{ ...inputStyle, opacity: .6, cursor: 'not-allowed' }} value={member.email} dir="ltr" disabled readOnly />
            <span className="body" style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{labels.emailLockedNote}</span>
          </div>
          <div>
            <label style={labelStyle}>{labels.fieldPhone}</label>
            <input style={inputStyle} value={form.phone} dir="ltr" onChange={(e) => field('phone', e.target.value)} />
          </div>
          {showOrg && (
            <div>
              <label style={labelStyle}>{labels.fieldOrg}</label>
              <input style={inputStyle} value={form.organizationName} onChange={(e) => field('organizationName', e.target.value)} />
            </div>
          )}
          {showLicense && (
            <div>
              <label style={labelStyle}>{labels.fieldLicense}</label>
              <input style={inputStyle} value={form.licenseNumber} dir="ltr" onChange={(e) => field('licenseNumber', e.target.value)} />
            </div>
          )}
          {error && <p className="body" style={{ color: 'var(--error-text, #A7201B)', fontSize: '.85rem' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '.6rem' }}>
            <button className="btn btn-solid" style={{ padding: '.5rem 1.1rem', fontSize: '.9rem' }} disabled={pending} onClick={save}>
              {pending ? labels.saving : labels.save}
            </button>
            <button className="btn-line" style={{ padding: '.5rem 1.1rem', fontSize: '.9rem' }} disabled={pending} onClick={() => { setEditing(false); setError(''); }}>
              {labels.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

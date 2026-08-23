import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation.js';
import { listPartnerFirms } from '@/app/actions/content.js';

function Badge({ label, color }) {
  return (
    <span style={{ fontSize: '.78rem', color, boxShadow: `inset 0 0 0 1px ${color}55`, borderRadius: 'var(--r)', padding: '.2rem .55rem', whiteSpace: 'nowrap' }}>
      {label}
    </span>
  );
}

export default async function AdminPartnerFirms() {
  const t = await getTranslations('admin');
  const firms = await listPartnerFirms();

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBlockEnd: '1.5rem' }}>
        <h1 className="display d-2" style={{ margin: 0 }}>{t('navPartnerFirms')}</h1>
        <Link href="/admin/partner-firms/new" className="btn btn-solid" style={{ fontSize: '.88rem' }}>{t('contentNewPartnerFirm')}</Link>
      </div>
      <p className="body" style={{ color: 'var(--muted)', fontSize: '.88rem', marginBlockEnd: '1.5rem' }}>{t('partnerFirmsHint')}</p>

      {firms.length === 0 ? (
        <p className="body" style={{ color: 'var(--muted)' }}>{t('emptyList')}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
          {firms.map((f) => (
            <Link key={f.id} href={`/admin/partner-firms/${f.id}`} style={{
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem',
              padding: '1rem 1.25rem', borderRadius: 'var(--r-lg)', boxShadow: 'inset 0 0 0 1px var(--hair-light-strong)',
            }}>
              <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                <div className="body" style={{ color: 'var(--ink)', fontWeight: 700, fontSize: '.95rem' }}>{f.legal_name}</div>
                <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}>
                  {[f.city, f.country_name_en].filter(Boolean).join(' · ') || '—'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                <Badge label={t(`partnerStatus_${f.relationship_status}`)} color="var(--clay-bright)" />
                {f.public_visible && f.consent_to_display
                  ? <Badge label={t('partnerLivePublicly')} color="#1C7D5A" />
                  : <Badge label={t('partnerNotPublic')} color="var(--muted)" />}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

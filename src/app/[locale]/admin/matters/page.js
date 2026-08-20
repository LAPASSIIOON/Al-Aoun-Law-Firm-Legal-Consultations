import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation.js';
import { listMattersAdmin } from '@/app/actions/matters.js';

export default async function AdminMatters() {
  const t = await getTranslations('admin');
  const locale = await getLocale();
  const matters = await listMattersAdmin();
  const fmtDate = (v) => new Date(v).toLocaleDateString(locale === 'ar' ? 'ar-KW' : 'en-GB');

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBlockEnd: '1.5rem' }}>
        <h1 className="display d-2" style={{ margin: 0 }}>{t('navMatters')}</h1>
        <Link href="/admin/matters/new" className="btn btn-solid" style={{ fontSize: '.88rem' }}>{t('matterNew')}</Link>
      </div>

      {matters.length === 0 ? (
        <p className="body" style={{ color: 'var(--muted)' }}>{t('matterNoMatters')}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
          {matters.map((m) => (
            <Link key={m.id} href={`/admin/matters/${m.id}`} style={{
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem',
              padding: '1rem 1.25rem', borderRadius: 'var(--r-lg)', boxShadow: 'inset 0 0 0 1px var(--hair-light-strong)',
            }}>
              <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                <div className="body" style={{ color: 'var(--ink)', fontWeight: 700, fontSize: '.95rem' }}>{m.title}</div>
                <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>{m.client_name} · {m.client_email}</div>
              </div>
              <span style={{ fontSize: '.78rem', color: m.status === 'open' ? '#1C7D5A' : 'var(--muted)', boxShadow: `inset 0 0 0 1px ${m.status === 'open' ? '#1C7D5A' : 'var(--muted)'}55`, borderRadius: 'var(--r)', padding: '.2rem .55rem' }}>
                {t(`matterStatus_${m.status}`)}
              </span>
              <span style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{fmtDate(m.created_at)}</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

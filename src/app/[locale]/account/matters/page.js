import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation.js';
import { listMyMatters } from '@/app/actions/matters.js';

export default async function MyMatters() {
  const t = await getTranslations('admin');
  const locale = await getLocale();
  const matters = await listMyMatters();
  const fmtDate = (v) => new Date(v).toLocaleDateString(locale === 'ar' ? 'ar-KW' : 'en-GB');

  return (
    <section className="wrap" style={{ paddingBlock: '3rem' }}>
      <h1 className="display d-2" style={{ marginBlockEnd: '.4rem' }}>{t('accountMattersHeading')}</h1>
      <p className="body" style={{ color: 'var(--muted)', marginBlockEnd: '2rem' }}>{t('accountMattersHint')}</p>

      {matters.length === 0 ? (
        <p className="body" style={{ color: 'var(--muted)' }}>{t('matterNoMatters')}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
          {matters.map((m) => (
            <Link key={m.id} href={`/account/matters/${m.id}`} style={{
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem',
              padding: '1rem 1.25rem', borderRadius: 'var(--r-lg)', boxShadow: 'inset 0 0 0 1px var(--hair-light-strong)',
            }}>
              <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                <div className="body" style={{ color: 'var(--ink)', fontWeight: 700, fontSize: '.95rem' }}>{m.title}</div>
                {m.reference && <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>{m.reference}</div>}
              </div>
              <span style={{ fontSize: '.78rem', color: m.status === 'open' ? '#1C7D5A' : 'var(--muted)', boxShadow: `inset 0 0 0 1px ${m.status === 'open' ? '#1C7D5A' : 'var(--muted)'}55`, borderRadius: 'var(--r)', padding: '.2rem .55rem' }}>
                {t(`matterStatus_${m.status}`)}
              </span>
              <span style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{fmtDate(m.created_at)}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

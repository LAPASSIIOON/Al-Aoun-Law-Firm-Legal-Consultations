import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation.js';
import { listPracticeAreas } from '@/app/actions/content.js';

function statusOf(t, tr) {
  if (!tr) return { label: t('contentMissingTranslation'), color: '#B42722' };
  if (tr.legal_approved && tr.status === 'published') return { label: t('contentStatus_published'), color: '#1C7D5A' };
  if (tr.status === 'legal_review') return { label: t('contentStatus_legal_review'), color: '#A0630D' };
  return { label: t(`contentStatus_${tr.status}`), color: 'var(--muted)' };
}

function Badge({ label, color }) {
  return (
    <span style={{ fontSize: '.78rem', color, boxShadow: `inset 0 0 0 1px ${color}55`, borderRadius: 'var(--r)', padding: '.2rem .55rem', whiteSpace: 'nowrap' }}>
      {label}
    </span>
  );
}

export default async function AdminPracticeAreas() {
  const t = await getTranslations('admin');
  const locale = await getLocale();
  const areas = await listPracticeAreas();

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBlockEnd: '1.5rem' }}>
        <h1 className="display d-2" style={{ margin: 0 }}>{t('navPracticeAreas')}</h1>
        <Link href="/admin/practice-areas/new" className="btn btn-solid" style={{ fontSize: '.88rem' }}>{t('contentNewPracticeArea')}</Link>
      </div>

      {areas.length === 0 ? (
        <p className="body" style={{ color: 'var(--muted)' }}>{t('emptyList')}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
          {areas.map((a) => {
            const ar = a.practice_area_translations.find((x) => x.locale === 'ar');
            const en = a.practice_area_translations.find((x) => x.locale === 'en');
            const sAr = statusOf(t, ar);
            const sEn = statusOf(t, en);
            return (
              <Link key={a.id} href={`/admin/practice-areas/${a.id}`} style={{
                display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem',
                padding: '1rem 1.25rem', borderRadius: 'var(--r-lg)', boxShadow: 'inset 0 0 0 1px var(--hair-light-strong)',
              }}>
                <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                  <div className="body" style={{ color: 'var(--ink)', fontWeight: 700, fontSize: '.95rem' }}>
                    {ar?.title || en?.title || '—'}
                  </div>
                  {!a.is_active && <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{t('contentInactive')}</span>}
                </div>
                <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '.72rem', color: 'var(--platinum-3)', alignSelf: 'center' }}>{t('contentLocaleAr')}</span>
                  <Badge {...sAr} />
                  <span style={{ fontSize: '.72rem', color: 'var(--platinum-3)', alignSelf: 'center', marginInlineStart: '.5rem' }}>{t('contentLocaleEn')}</span>
                  <Badge {...sEn} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

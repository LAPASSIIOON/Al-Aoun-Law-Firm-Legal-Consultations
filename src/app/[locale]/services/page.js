import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createAnonClient } from '@/lib/supabase-server.js';
import { Link } from '@/i18n/navigation.js';
import s from '../shared.module.css';
import styles from '../home.module.css';

export const revalidate = 300;
export function generateStaticParams() { return [{ locale: 'ar' }, { locale: 'en' }]; }
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'practiceAreas' });
  return { title: t('heading'), description: t('subhead') };
}

async function fetchAreas(locale) {
  try {
    const supabase = createAnonClient();
    const { data } = await supabase.from('practice_area_translations')
      .select('slug, title, summary, practice_areas(sort_order)')
      .eq('locale', locale).eq('status', 'published').eq('legal_approved', true);
    return (data || []).sort((a, b) => (a.practice_areas?.sort_order || 0) - (b.practice_areas?.sort_order || 0));
  } catch (e) { return []; }
}

/** @param {{ params: Promise<{ locale: string }> }} props */
export default async function Services({ params }) {
  const { locale } = await params; setRequestLocale(locale);
  const t = await getTranslations('practiceAreas');
  const tp = await getTranslations('servicesPage');
  const n = await getTranslations('nav');
  const rows = await fetchAreas(locale);
  const items = rows.length ? rows : null;

  return (
    <>
      <section className={`on-navy ${s.pageHead} section-tight`}>
        <div className="wrap">
          <span className="eyebrow" data-reveal>{t('eyebrow')}</span>
          <h1 className="display d-1" data-reveal style={{ marginBlock: '1.2rem 1.5rem' }}>{t('heading')}</h1>
          <p className="lead" data-reveal style={{ maxWidth: '52ch' }}>{tp('lead')}</p>
        </div>
      </section>

      <section className="on-white section">
        <div className="wrap">
          <div className={styles.paList}>
            {(items || Array.from({ length: 6 })).map((r, i) => (
              items ? (
                <Link key={r.slug} href={`/services/${r.slug}`} className={styles.paRow} data-reveal>
                  <span className={styles.paIdx}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={styles.paBody}>
                    <span className={styles.paTitle}>{r.title}</span>
                    {r.summary && <span className={styles.paSum}>{r.summary}</span>}
                  </span>
                  <span className={styles.paArrow} aria-hidden="true">→</span>
                </Link>
              ) : (
                <div key={i} className={styles.paRow} data-reveal>
                  <span className={styles.paIdx}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={styles.paBody}>
                    <span className={styles.paTitle}>{t('placeholderTitle')}</span>
                    <span className={styles.paSum}>{t('flag')}</span>
                  </span>
                </div>
              )
            ))}
          </div>

          <p data-reveal style={{ marginBlockStart: '2.75rem', display: 'flex', flexWrap: 'wrap', gap: '.6rem', alignItems: 'baseline' }}>
            <span className="muted" style={{ fontSize: '.95rem' }}>
              {locale === 'ar' ? 'غير متأكّد من المجال المناسب؟' : 'Not sure which area fits your matter?'}
            </span>
            <Link href="/contact" className="btn-line">{n('consult')} <span className="arrow">→</span></Link>
          </p>
        </div>
      </section>
    </>
  );
}

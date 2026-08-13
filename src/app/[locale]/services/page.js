import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createAnonClient } from '@/lib/supabase-server.js';
import { Link } from '@/i18n/navigation.js';
import s from '../shared.module.css';
import h from '../home.module.css';

export function generateStaticParams() { return [{ locale: 'ar' }, { locale: 'en' }]; }
export async function generateMetadata({ params }) { const { locale } = await params; const t = await getTranslations({ locale, namespace: 'practiceAreas' }); return { title: t('heading'), description: t('subhead') }; }

export default async function Services({ params }) {
  const { locale } = await params; setRequestLocale(locale);
  const t = await getTranslations('practiceAreas');
  const tp = await getTranslations('servicesPage');
  let rows = [];
  try {
    const supabase = createAnonClient();
    const { data } = await supabase.from('practice_area_translations')
      .select('slug, title, summary').eq('locale', locale).eq('status', 'published').eq('legal_approved', true);
    rows = data || [];
  } catch (e) { rows = []; }
  return (
    <>
      <section className={`on-espresso ${s.pageHead} section-tight`}>
        <div className="wrap">
          <span className="eyebrow" data-reveal>{t('eyebrow')}</span>
          <h1 className="display d-1" data-reveal style={{ marginBlock: '1.2rem 1.5rem' }}>{t('heading')}</h1>
          <p className="lead" data-reveal style={{ maxWidth: '52ch' }}>{tp('lead')}</p>
        </div>
      </section>
      <section className="on-graphite section">
        <div className="wrap">
          {rows.length > 0 ? (
            <ul className={h.areaList}>
              {rows.map((r, i) => (
                <li key={r.slug} className={h.areaRow} data-reveal>
                  <span className="idx">{String(i+1).padStart(2,'0')}</span>
                  <Link href={`/services/${r.slug}`} className={h.areaName}>{r.title}</Link>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <ul className={h.areaList}>
                {[0,1,2,3,4].map((i) => (
                  <li key={i} className={h.areaRow} data-reveal>
                    <span className="idx">{String(i+1).padStart(2,'0')}</span>
                    <span className={h.areaName}>{t('placeholderTitle')}</span>
                    <span className="tag">{t('forthcoming')}</span>
                  </li>
                ))}
              </ul>
              <p className="muted" data-reveal style={{ marginBlockStart: '1.75rem', fontSize: '0.9rem' }}>{t('flag')}</p>
            </>
          )}
        </div>
      </section>
    </>
  );
}

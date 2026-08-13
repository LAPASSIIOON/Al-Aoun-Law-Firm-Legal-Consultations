import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createAnonClient } from '@/lib/supabase-server.js';
import { Link } from '@/i18n/navigation.js';
import s from '../shared.module.css';

export const revalidate = 300;
export function generateStaticParams() { return [{ locale: 'ar' }, { locale: 'en' }]; }
export async function generateMetadata({ params }) { const { locale } = await params; const t = await getTranslations({ locale, namespace: 'insights' }); return { title: t('heading'), description: t('subhead') }; }

export default async function Insights({ params }) {
  const { locale } = await params; setRequestLocale(locale);
  const t = await getTranslations('insights');
  const tp = await getTranslations('insightsPage');
  let rows = [];
  try {
    const supabase = createAnonClient();
    const { data } = await supabase.from('article_translations')
      .select('slug, title, excerpt').eq('locale', locale).eq('status', 'published').eq('legal_approved', true)
      .order('created_at', { ascending: false });
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
      <section className="on-ivory section">
        <div className="wrap">
          {rows.length > 0 ? (
            <div className="grid cols-2">
              {rows.map((r) => (
                <Link key={r.slug} href={`/insights/${r.slug}`} className="card" data-reveal>
                  <h2 className="card-title">{r.title}</h2>
                  {r.excerpt && <p className="body">{r.excerpt}</p>}
                  <span className="btn-line" style={{ marginBlockStart: 'auto' }}>{tp('readMore')}<span className="arrow">→</span></span>
                </Link>
              ))}
            </div>
          ) : (
            <div className={s.emptyBox} data-reveal style={{ boxShadow: 'inset 0 0 0 1px var(--hair-light)' }}>
              <span className="tag">{t('forthcoming')}</span>
              <p className="body">{t('empty')}</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

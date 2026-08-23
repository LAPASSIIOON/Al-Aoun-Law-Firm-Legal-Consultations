import { getTranslations, setRequestLocale } from 'next-intl/server';
import { altLangs } from '@/lib/i18n-meta.js';
import { createAnonClient } from '@/lib/supabase-server.js';
import { Link } from '@/i18n/navigation.js';
import s from '../shared.module.css';
import styles from '../home.module.css';
import PageHeroImage from '@/components/PageHeroImage.js';
import PracticeAreasFilter from '@/components/PracticeAreasFilter.js';
import fs from 'node:fs';
import path from 'node:path';

export const revalidate = 300;
export function generateStaticParams() { return [{ locale: 'ar' }, { locale: 'en' }]; }
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'practiceAreas' });
  return { title: t('heading'), description: t('subhead'), alternates: altLangs(locale, '/services') };
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

const ICONS_DIR = path.join(process.cwd(), 'public', 'practice-areas', 'icons');
function hasIcon(slug) {
  try { return fs.existsSync(path.join(ICONS_DIR, `${slug}.png`)); } catch { return false; }
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
      <section className={`on-navy ${s.pageHead} section-tight`} style={{ position: 'relative', overflow: 'hidden' }}>
        <PageHeroImage src="/kuwait/modern-facade-geometric.webp" />
        <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
          <span className="eyebrow" data-reveal>{t('eyebrow')}</span>
          <h1 className="display d-1" data-reveal style={{ marginBlock: '1.2rem 1.5rem' }}>{t('heading')}</h1>
          <p className="lead" data-reveal style={{ maxWidth: '52ch' }}>{tp('lead')}</p>
        </div>
      </section>

      <section className="on-white section">
        <div className="wrap">
          {items ? (
            <PracticeAreasFilter
              items={items.map((r) => ({ ...r, hasIcon: hasIcon(r.slug) }))}
              locale={locale}
              placeholder={locale === 'ar' ? 'ابحث عن مجال ممارسة...' : 'Search a practice area...'}
              noResults={locale === 'ar' ? 'لا نتائج مطابقة لبحثك.' : 'No practice areas match your search.'}
            />
          ) : (
            <div className={styles.paList}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={styles.paRow} data-reveal="file">
                  <span className={styles.paIdx}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={styles.paBody}>
                    <span className={styles.paTitle}>{t('placeholderTitle')}</span>
                    <span className={styles.paSum}>{t('flag')}</span>
                  </span>
                </div>
              ))}
            </div>
          )}

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

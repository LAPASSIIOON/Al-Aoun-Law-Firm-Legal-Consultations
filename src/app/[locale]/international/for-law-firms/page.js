import { getTranslations, setRequestLocale } from 'next-intl/server';
import { altLangs } from '@/lib/i18n-meta.js';
import { createAnonClient } from '@/lib/supabase-server.js';
import { Link } from '@/i18n/navigation.js';
import Breadcrumbs from '@/components/Breadcrumbs.js';
import s from '../../shared.module.css';
import hs from '../../home.module.css';

export function generateStaticParams() { return [{ locale: 'ar' }, { locale: 'en' }]; }
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'forLawFirms' });
  return { title: t('heading'), description: t('lead'), alternates: altLangs(locale, '/international/for-law-firms') };
}

async function fetchAreas(locale) {
  try {
    const supabase = createAnonClient();
    const { data } = await supabase.from('practice_area_translations')
      .select('slug, title, practice_areas(sort_order)')
      .eq('locale', locale).eq('status', 'published').eq('legal_approved', true);
    return (data || []).sort((a, b) => (a.practice_areas?.sort_order || 0) - (b.practice_areas?.sort_order || 0));
  } catch (e) { return []; }
}

/** @param {{ params: Promise<{ locale: string }> }} props */
export default async function ForLawFirms({ params }) {
  const { locale } = await params; setRequestLocale(locale);
  const t = await getTranslations('forLawFirms');
  const rows = await fetchAreas(locale);
  const credIds = [1, 2, 3, 4];
  const receiveIds = [1, 2, 3, 4];

  return (
    <>
      <section className={`on-navy ${s.pageHead} section-tight`}>
        <div className="wrap">
          <Breadcrumbs items={[
            { label: locale === 'ar' ? 'الرئيسية' : 'Home', href: '/' },
            { label: locale === 'ar' ? 'دولي' : 'International', href: '/international' },
            { label: t('heading') },
          ]} />
          <span className="eyebrow" data-reveal>{t('eyebrow')}</span>
          <h1 className="display d-1" data-reveal style={{ marginBlock: '1.2rem 1.5rem' }}>{t('heading')}</h1>
          <p className="lead" data-reveal style={{ maxWidth: '54ch' }}>{t('lead')}</p>
        </div>
      </section>

      {/* المؤهلات — نفس فهرس العمق المؤسسي المستخدم في الصفحة الرئيسية */}
      <section className="on-white section">
        <div className="wrap">
          <span className="eyebrow" data-reveal>{t('credEye')}</span>
          <h2 className="display d-2" data-reveal style={{ marginBlock: '1rem 2rem', maxWidth: '20ch' }}>{t('credHead')}</h2>
          <div className={hs.legacyList}>
            {credIds.map((n) => (
              <div key={n} className={hs.legacyRow} data-reveal>
                <span className={hs.legacyIdx}>{String(n).padStart(2, '0')}</span>
                <span className={hs.legacyBody}>
                  <span className={hs.legacyTitle}>{t(`cred${n}T`)}</span>
                  <span className={hs.legacyDesc}>{t(`cred${n}D`)}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* كيف نستقبل الإحالات */}
      <section className="on-navy section">
        <div className="wrap">
          <h2 className="display d-2" data-reveal style={{ color: '#fff', marginBlockEnd: '2.25rem' }}>{t('receiveHeading')}</h2>
          <div className="grid cols-2">
            {receiveIds.map((n) => (
              <div key={n} data-reveal style={{ marginBlockEnd: '1.5rem' }}>
                <span className="idx">{String(n).padStart(2, '0')}</span>
                <h3 className="display d-3" style={{ marginBlock: '.6rem .4rem', color: '#fff' }}>{t(`r${n}T`)}</h3>
                <p className="body" style={{ fontSize: '.95rem' }}>{t(`r${n}D`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* مجالات نغطّيها */}
      <section className="on-white section">
        <div className="wrap">
          <h2 className="display d-2" data-reveal style={{ marginBlockEnd: '2rem' }}>{t('areasHeading')}</h2>
          <div className={hs.paList}>
            {(rows.length ? rows : Array.from({ length: 6 })).map((r, i) => (
              rows.length ? (
                <Link key={r.slug} href={`/services/${r.slug}`} className={hs.paRow} data-reveal>
                  <span className={hs.paIdx}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={hs.paBody}><span className={hs.paTitle}>{r.title}</span></span>
                  <span className={hs.paArrow} aria-hidden="true">→</span>
                </Link>
              ) : <div key={i} className={hs.paRow} data-reveal><span className={hs.paIdx}>{String(i + 1).padStart(2, '0')}</span></div>
            ))}
          </div>
        </div>
      </section>

      {/* الاتصال */}
      <section className="on-navy section">
        <div className="wrap">
          <h2 className="display d-2" data-reveal style={{ color: '#fff', marginBlockEnd: '1rem', maxWidth: '20ch' }}>{t('ctaHead')}</h2>
          <p className="body" data-reveal style={{ maxWidth: '52ch', marginBlockEnd: '1.75rem' }}>{t('ctaBody')}</p>
          <p style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link href="/international/refer-a-matter" className="btn btn-solid">{t('ctaBtn')} <span className="arrow">→</span></Link>
            <Link href="/international/partner-with-us" className="btn-line">{t('partnerCta')}</Link>
          </p>
        </div>
      </section>
    </>
  );
}

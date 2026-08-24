import { getTranslations, setRequestLocale } from 'next-intl/server';
import { altLangs } from '@/lib/i18n-meta.js';
import { Link } from '@/i18n/navigation.js';
import PageHeroImage from '@/components/PageHeroImage.js';
import JurisdictionsNetwork from '@/components/JurisdictionsNetwork.js';
import { createAnonClient } from '@/lib/supabase-server.js';
import s from '../shared.module.css';

export const revalidate = 300;
export function generateStaticParams() { return [{ locale: 'ar' }, { locale: 'en' }]; }
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'international' });
  return { title: t('heading'), description: t('lead'), alternates: altLangs(locale, '/international') };
}

/** @param {{ params: Promise<{ locale: string }> }} props */
export default async function International({ params }) {
  const { locale } = await params; setRequestLocale(locale);
  const t = await getTranslations('international');
  const n = await getTranslations('nav');

  let jurisdictions = [];
  try {
    const supabase = createAnonClient();
    const { data } = await supabase.from('v_active_jurisdictions').select('id, name_ar, name_en').order('name_en');
    jurisdictions = (data || []).map((x) => (locale === 'ar' ? x.name_ar : x.name_en));
  } catch (e) { jurisdictions = []; }

  const howSteps = [1, 2, 3, 4, 5];

  return (
    <>
      <section className={`on-navy ${s.pageHead} section-tight`} style={{ position: 'relative', overflow: 'hidden' }}>
        <PageHeroImage src="/kuwait/skyline-water-reflection.webp" />
        <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
          <span className="eyebrow" data-reveal>{t('eyebrow')}</span>
          <h1 className="display d-1" data-reveal style={{ marginBlock: '1.2rem 1.5rem' }}>{t('heading')}</h1>
          <p className="lead" data-reveal style={{ maxWidth: '54ch' }}>{t('lead')}</p>
        </div>
      </section>

      {/* الازدواج — القرار المعماري الأهم في الصفحة */}
      <section className="on-white section">
        <div className="wrap">
          <div className={s.forkGrid}>
            <div className={s.forkCard} data-reveal>
              <span className="eyebrow">{t('forkClientEye')}</span>
              <h2 className="display d-2" style={{ marginBlock: '1rem .9rem' }}>{t('forkClientHead')}</h2>
              <p className="body">{t('forkClientBody')}</p>
              <p style={{ marginBlockStart: '1.5rem' }}>
                <Link href="/contact" className="btn btn-solid">{t('forkClientCta')} <span className="arrow">→</span></Link>
              </p>
            </div>
            <div className={s.forkCard} data-reveal>
              <span className="eyebrow">{t('forkFirmEye')}</span>
              <h2 className="display d-2" style={{ marginBlock: '1rem .9rem' }}>{t('forkFirmHead')}</h2>
              <p className="body">{t('forkFirmBody')}</p>
              <p style={{ marginBlockStart: '1.5rem' }}>
                <Link href="/international/for-law-firms" className="btn-line">{t('forkFirmCta')} <span className="arrow">→</span></Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* كيف نعمل */}
      <section className="on-navy section">
        <div className="wrap">
          <h2 className="display d-2" data-reveal style={{ color: '#fff', marginBlockEnd: '2.25rem' }}>{t('howHeading')}</h2>
          <div className="grid cols-3">
            {howSteps.map((n2) => (
              <div key={n2} data-reveal style={{ marginBlockEnd: '1.5rem' }}>
                <span className="idx">{String(n2).padStart(2, '0')}</span>
                <h3 className="display d-3" style={{ marginBlock: '.6rem .4rem', color: '#fff' }}>{t(`how${n2}T`)}</h3>
                <p className="body" style={{ fontSize: '.95rem' }}>{t(`how${n2}D`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* لماذا الكويت مركز الثقل */}
      <section className="on-white section">
        <div className="wrap">
          <span className="eyebrow" data-reveal>{t('anchorEye')}</span>
          <h2 className="display d-2" data-reveal style={{ marginBlock: '1rem 1.2rem', maxWidth: '20ch' }}>{t('anchorHead')}</h2>
          <p className="body" data-reveal style={{ fontSize: '1.05rem', maxWidth: '62ch' }}>{t('anchorBody')}</p>
        </div>
      </section>

      {/* تغطية التنسيق — بيانات حقيقية من قاعدة الشبكة، صياغة صادقة (تنسيق لا شراكة رسمية) */}
      {jurisdictions.length > 0 && (
        <section className="on-paper section-tight">
          <div className="wrap">
            <span className="eyebrow" data-reveal>{t('jurisdictionsEye')}</span>
            <h2 className="display d-2" data-reveal style={{ marginBlock: '1rem 1.2rem', maxWidth: '26ch' }}>{t('jurisdictionsHead')}</h2>
            <p className="body" data-reveal style={{ maxWidth: '58ch', marginBlockEnd: '2.5rem' }}>{t('jurisdictionsBody')}</p>
            <div style={{ background: 'var(--ground)', borderRadius: 'var(--r-lg)', padding: 'clamp(1.5rem,4vw,3rem)' }}>
              <JurisdictionsNetwork
                jurisdictions={jurisdictions.filter((name) => name !== 'الكويت' && name !== 'Kuwait')}
                hubLabel={locale === 'ar' ? 'الكويت' : 'Kuwait'}
                locale={locale}
              />
            </div>
            <p data-reveal style={{ marginBlockStart: '2rem', textAlign: 'center' }}>
              <Link href="/international/refer-a-matter" className="btn btn-solid">
                {locale === 'ar' ? 'أحِل ملفًا إلينا' : 'Refer a matter to us'} <span className="arrow">→</span>
              </Link>
            </p>
          </div>
        </section>
      )}

      {/* الحوكمة */}
      <section className="on-navy section-tight">
        <div className="wrap">
          <span className="eyebrow" data-reveal>{t('govEye')}</span>
          <h2 className="display d-2" data-reveal style={{ color: '#fff', marginBlock: '1rem 1.1rem', maxWidth: '22ch' }}>{t('govHead')}</h2>
          <p className="body" data-reveal style={{ maxWidth: '58ch' }}>{t('govBody')}</p>
        </div>
      </section>

      {/* اتصال مزدوج */}
      <section className="on-paper section">
        <div className="wrap">
          <div className={s.forkGrid}>
            <div data-reveal>
              <h3 className="display d-3" style={{ marginBlockEnd: '1.1rem' }}>{t('ctaClientHead')}</h3>
              <Link href="/contact" className="btn btn-solid">{n('consult')} <span className="arrow">→</span></Link>
            </div>
            <div data-reveal>
              <h3 className="display d-3" style={{ marginBlockEnd: '1.1rem' }}>{t('ctaFirmHead')}</h3>
              <Link href="/international/for-law-firms" className="btn-line">{t('forkFirmCta')} <span className="arrow">→</span></Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

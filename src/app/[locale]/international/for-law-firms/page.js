import { getTranslations, setRequestLocale } from 'next-intl/server';
import { altLangs } from '@/lib/i18n-meta.js';
import { createAnonClient } from '@/lib/supabase-server.js';
import { Link } from '@/i18n/navigation.js';
import Breadcrumbs from '@/components/Breadcrumbs.js';
import styles from '../for-law-firms.module.css';

export function generateStaticParams() { return [{ locale: 'ar' }, { locale: 'en' }]; }
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'forLawFirms' });
  return { title: t('heading'), description: t('lead'), alternates: altLangs(locale, '/international/for-law-firms') };
}

/* مجالات الممارسة المنشورة فعلًا — بلا صفوف بديلة عند غياب البيانات (قاعدة D3). */
async function fetchAreas(locale) {
  try {
    const supabase = createAnonClient();
    const { data } = await supabase.from('practice_area_translations')
      .select('slug, title, practice_areas(sort_order)')
      .eq('locale', locale).eq('status', 'published').eq('legal_approved', true);
    return (data || []).sort((a, b) => (a.practice_areas?.sort_order || 0) - (b.practice_areas?.sort_order || 0));
  } catch (e) { return []; }
}

const CREDS = [1, 2, 3, 4];
const STEPS = [1, 2, 3, 4];

/** @param {{ params: Promise<{ locale: string }> }} props */
export default async function ForLawFirms({ params }) {
  const { locale } = await params; setRequestLocale(locale);
  const t = await getTranslations('forLawFirms');
  const areas = await fetchAreas(locale);
  const ar = locale === 'ar';

  return (
    <>
      {/* رأس الصفحة — الوعد الأساسي: نقطة اتصال واحدة مسؤولة عن كل ملف مُحال */}
      <section className={`on-navy ${styles.hero}`}>
        <div className="wrap">
          <Breadcrumbs locale={locale} items={[
            { label: ar ? 'الرئيسية' : 'Home', href: '/' },
            { label: ar ? 'دولي' : 'International', href: '/international' },
            { label: t('heading') },
          ]} />
          <span className="eyebrow" data-reveal>{t('eyebrow')}</span>
          <h1 className={`display d-1 ${styles.heroHead}`} data-reveal>{t('heading')}</h1>
          <p className={`lead ${styles.heroLead}`} data-reveal>{t('lead')}</p>
        </div>
      </section>

      {/* لماذا AL OUN داخل الكويت — سجلّ مؤهلات بشعيرات، لا بطاقات */}
      <section className={`on-ivory ${styles.section}`}>
        <div className={`wrap ${styles.grid}`}>
          <header className={styles.colHead}>
            <span className="eyebrow" data-reveal>{t('credEye')}</span>
            <h2 className="display d-2" data-reveal>{t('credHead')}</h2>
          </header>
          <div className={styles.ledger}>
            {CREDS.map((n) => (
              <div key={n} className={styles.ledgerRow} data-reveal="file">
                <span className={styles.ledgerIdx}>{String(n).padStart(2, '0')}</span>
                <span>
                  <span className={styles.ledgerTitle}>{t(`cred${n}T`)}</span>
                  <span className={styles.ledgerDesc}>{t(`cred${n}D`)}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ماذا يحدث عند الإحالة — مسار متّصل من أربع محطات، تشمل فحص تعارض المصالح */}
      <section className={`on-navy ${styles.section}`}>
        <div className="wrap">
          <header className={styles.stackHead}>
            <h2 className="display d-2" data-reveal style={{ color: '#fff' }}>{t('receiveHeading')}</h2>
          </header>
          <ol className={styles.flow}>
            {STEPS.map((n) => (
              <li key={n} className={styles.step} data-reveal>
                <span className={styles.stepIdx}>{String(n).padStart(2, '0')}</span>
                <h3 className={`display d-3 ${styles.stepTitle}`}>{t(`r${n}T`)}</h3>
                <p className={styles.stepDesc}>{t(`r${n}D`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* أنواع المسائل — البيانات المنشورة فعلًا، بكثافة قابلة للمسح */}
      {areas.length > 0 && (
        <section className={`on-ivory ${styles.section}`}>
          <div className="wrap">
            <header className={styles.stackHead}>
              <h2 className="display d-2" data-reveal>{t('areasHeading')}</h2>
            </header>
            <div className={styles.areas}>
              {areas.map((a, i) => (
                <Link key={a.slug} href={`/services/${a.slug}`} className={styles.area} data-reveal="file">
                  <span className={styles.areaIdx}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={styles.areaTitle}>{a.title}</span>
                  <span className={styles.areaArrow} aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* الخطوة التالية — المساران المعتمدان كما هما */}
      <section className={`on-navy ${styles.section}`}>
        <div className="wrap">
          <h2 className={`display d-2 ${styles.ctaHead}`} data-reveal>{t('ctaHead')}</h2>
          <p className={`body ${styles.ctaBody}`} data-reveal>{t('ctaBody')}</p>
          <div className={styles.ctaRow} data-reveal>
            <Link href="/international/refer-a-matter" className="btn btn-solid">{t('ctaBtn')} <span className="arrow">→</span></Link>
            <Link href="/international/partner-with-us" className="btn-line">{t('partnerCta')} <span className="arrow">→</span></Link>
          </div>
        </div>
      </section>
    </>
  );
}

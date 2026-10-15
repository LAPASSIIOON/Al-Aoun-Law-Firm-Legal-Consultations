import { getTranslations, setRequestLocale } from 'next-intl/server';
import { altLangs } from '@/lib/i18n-meta.js';
import { Link } from '@/i18n/navigation.js';
import IntlMap from '@/components/IntlMap.js';
import { createAnonClient } from '@/lib/supabase-server.js';
import { INTERNATIONAL_ANCHOR, RELATIONSHIP_COUNTRIES } from '@/lib/international-relations.js';
import styles from './international.module.css';

export const revalidate = 300;

export function generateStaticParams() {
  return [{ locale: 'ar' }, { locale: 'en' }];
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'international' });
  return { title: t('heading'), description: t('lead'), alternates: altLangs(locale, '/international') };
}

/** @param {{ params: Promise<{ locale: string }> }} props */
export default async function International({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('international');
  const n = await getTranslations('nav');

  /* The public field appears only when live coverage exists. Static relationship
     countries enrich that verified set; they never create a standalone fallback. */
  let fieldCountries = [];
  try {
    const supabase = createAnonClient();
    const { data } = await supabase
      .from('v_active_jurisdictions')
      .select('id, name_ar, name_en')
      .order('name_en');
    const coverage = (data || []).filter((country) => country.name_en !== INTERNATIONAL_ANCHOR.en);
    if (coverage.length > 0) {
      const merged = new Map();
      coverage.forEach((country) => merged.set(country.name_en, { en: country.name_en, ar: country.name_ar }));
      RELATIONSHIP_COUNTRIES.forEach((country) => merged.set(country.en, { en: country.en, ar: country.ar }));
      fieldCountries = [...merged.values()].sort((a, b) => a.en.localeCompare(b.en));
    }
  } catch (error) {
    fieldCountries = [];
  }

  /* المفتاح = الاسم الإنجليزي كما يرد من قاعدة البيانات؛ يربطه IntlMap بإحداثيات العاصمة */
  const mapCountries = fieldCountries.map((country) => ({ key: country.en, label: locale === 'ar' ? country.ar : country.en }));
  const anchorBilingual = `${INTERNATIONAL_ANCHOR.ar} | ${INTERNATIONAL_ANCHOR.en.toUpperCase()}`;
  const routes = [
    {
      eye: t('forkClientEye'),
      head: t('forkClientHead'),
      body: t('forkClientBody'),
      cta: t('forkClientCta'),
      href: `/contact?intent=kuwaitCounsel&from=/${locale}/international`,
    },
    {
      eye: t('forkOutboundEye'),
      head: t('forkOutboundHead'),
      body: t('forkOutboundBody'),
      cta: t('forkOutboundCta'),
      href: `/contact?intent=internationalMatter&from=/${locale}/international`,
    },
    {
      eye: t('forkFirmEye'),
      head: t('forkFirmHead'),
      body: t('forkFirmBody'),
      cta: t('forkFirmCta'),
      href: '/international/for-law-firms',
    },
  ];
  const steps = [1, 2, 3, 4, 5].map((step) => ({
    number: String(step).padStart(2, '0'),
    title: t(`how${step}T`),
    body: t(`how${step}D`),
  }));

  return (
    <>
      {/* «الكويت مرتكزًا»: الخريطة هي الهيرو — العالم، ثم الكويت، ثم مسارات التنسيق.
          نطاق التنسيق نفسه الذي كان في قسم «حقل التنسيق» (التغطية الحية + علاقات المالك الموثّقة)،
          بنصّه وتوضيحه ورابط الإحالة. */}
      <section className={`on-navy ${styles.mapHero}`}>
        <div className={styles.mapBackdrop} aria-hidden="true" />
        <div className={`wrap ${styles.mapHeroCopy}`}>
          <div>
            <span className={styles.kicker}>{t('eyebrow')}</span>
            <h1 className={`display d-1 ${styles.mapHeroHeading}`}>{t('heading')}</h1>
          </div>
          <p className={`lead ${styles.mapHeroLead}`}>{t('lead')}</p>
        </div>
        {mapCountries.length > 0 && (
          <div className={styles.mapBlock}>
            <IntlMap
              variant="full"
              countries={mapCountries}
              anchorLabel={anchorBilingual}
              mapLabel={t('mapAria')}
              listLabel={t('jurisdictionsHead')}
              hint={t('mapHint')}
            />
            <div className={`wrap ${styles.fieldFoot}`}>
              <p className="body">{t('fieldCaption')}</p>
              <Link href="/international/refer-a-matter" className="btn btn-solid">
                {locale === 'ar' ? 'أحِل ملفًا إلينا' : 'Refer a matter to us'} <span className="arrow">→</span>
              </Link>
            </div>
          </div>
        )}
        <div className={styles.heroRule} aria-hidden="true" />
      </section>

      <section className={`on-white ${styles.routes}`}>
        <div className="wrap">
          <header className={styles.sectionIntro}>
            <span className={styles.kicker}>{t('routesEye')}</span>
            <div>
              <h2 className="display d-2" data-reveal>{t('routesHeading')}</h2>
              <p className="body" data-reveal="slow">{t('routesLead')}</p>
            </div>
          </header>
          <div className={styles.routeGrid}>
            {routes.map((route, index) => (
              <article className={styles.route} key={route.head} data-reveal>
                <div className={styles.routeMeta}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <span>{route.eye}</span>
                </div>
                <h3 className="display d-3">{route.head}</h3>
                <p className="body">{route.body}</p>
                <Link href={route.href} className={styles.routeLink}>
                  {route.cta}<span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`on-graphite ${styles.process}`}>
        <div className="wrap">
          <header className={styles.processHead}>
            <span className={styles.kicker}>{t('processEye')}</span>
            <h2 className="display d-2" data-reveal>{t('howHeading')}</h2>
          </header>
          <ol className={styles.steps}>
            {steps.map((step) => (
              <li key={step.number} data-reveal>
                <span className={styles.stepNumber}>{step.number}</span>
                <h3 className="display d-3">{step.title}</h3>
                <p className="body">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`on-ivory ${styles.anchor}`}>
        <div className={`wrap ${styles.anchorGrid}`}>
          <div className={styles.anchorCopy}>
            <span className={styles.kicker}>{t('anchorEye')}</span>
            <h2 className="display d-2" data-reveal>{t('anchorHead')}</h2>
            <p className="body" data-reveal="slow">{t('anchorBody')}</p>
          </div>
          <aside className={styles.proof} data-reveal="slow">
            <div>
              <strong>{locale === 'ar' ? '٢٥+' : '25+'}</strong>
              <span>{t('proofExperience')}</span>
            </div>
            <div>
              <strong>{locale === 'ar' ? '٤' : '4'}</strong>
              <span>{t('proofCentres')}</span>
            </div>
          </aside>
        </div>
      </section>

      <section className={`on-white ${styles.closing}`}>
        <div className={`wrap ${styles.closingGrid}`}>
          <div>
            <span className={styles.kicker}>{t('govEye')}</span>
            <h2 className="display d-2" data-reveal>{t('govHead')}</h2>
            <p className="body" data-reveal>{t('govBody')}</p>
          </div>
          <div className={styles.actions} data-reveal="slow">
            <div>
              <span>{t('ctaClientHead')}</span>
              <Link href="/contact" className="btn btn-solid">{n('consult')} <span className="arrow">→</span></Link>
            </div>
            <div>
              <span>{t('ctaFirmHead')}</span>
              <Link href="/international/for-law-firms" className="btn-line">{t('forkFirmCta')} <span className="arrow">→</span></Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

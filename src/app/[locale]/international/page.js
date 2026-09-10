import { getTranslations, setRequestLocale } from 'next-intl/server';
import { altLangs } from '@/lib/i18n-meta.js';
import { Link } from '@/i18n/navigation.js';
import PageHeroImage from '@/components/PageHeroImage.js';
import CoordinationField from '@/components/CoordinationField.js';
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

  const fieldNames = fieldCountries.map((country) => (locale === 'ar' ? country.ar : country.en));
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
      <section className={`on-navy ${styles.hero}`}>
        <PageHeroImage src="/kuwait/skyline-water-reflection.webp" position="center 62%" />
        <div className={`wrap ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <span className={styles.kicker} data-reveal>{t('eyebrow')}</span>
            <h1 className={`display d-1 ${styles.heroHeading}`} data-reveal>{t('heading')}</h1>
            <p className={`lead ${styles.heroLead}`} data-reveal="slow">{t('lead')}</p>
          </div>
          <div className={styles.coordinate} aria-hidden="true" data-reveal="slow">
            <span>{locale === 'ar' ? INTERNATIONAL_ANCHOR.ar : INTERNATIONAL_ANCHOR.en}</span>
            <i />
            <span>{t('eyebrow')}</span>
          </div>
        </div>
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

      <section className={`on-navy ${styles.field}`}>
        <div className="wrap">
          <header className={styles.fieldHead}>
            <span className={styles.kicker}>{t('jurisdictionsEye')}</span>
            <h2 className="display d-2" data-reveal>{t('jurisdictionsHead')}</h2>
          </header>
          {fieldNames.length > 0 && (
            <>
              <CoordinationField
                variant="full"
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
                countries={fieldNames}
                anchorLabel={locale === 'ar' ? INTERNATIONAL_ANCHOR.ar : INTERNATIONAL_ANCHOR.en}
              />
              <div className={styles.fieldFoot} data-reveal>
                <p className="body">{t('fieldCaption')}</p>
                <Link href="/international/refer-a-matter" className="btn btn-solid">
                  {locale === 'ar' ? 'أحِل ملفًا إلينا' : 'Refer a matter to us'} <span className="arrow">→</span>
                </Link>
              </div>
            </>
          )}
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

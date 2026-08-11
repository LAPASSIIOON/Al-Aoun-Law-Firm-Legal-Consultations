import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation.js';
import { AlAounMark } from '@/components/AlAounMark.js';
import { Arc } from '@/components/Arc.js';
import styles from './page.module.css';

const ARABIC_NUM = ['١', '٢', '٣'];

export default async function HomePage() {
  const tHero = await getTranslations('hero');
  const tTrust = await getTranslations('trust');
  const tDiff = await getTranslations('differentiators');
  const tIntake = await getTranslations('intake');
  const tPractice = await getTranslations('practiceAreas');
  const tConsult = await getTranslations('consultCta');

  const values = tHero.raw('valuesStrip');
  const diffItems = tDiff.raw('items');

  return (
    <>
      {/* ══ HERO ══ */}
      <section className={styles.hero}>
        <div className={styles.heroWatermark} aria-hidden="true">
          <AlAounMark size={640} title="" />
        </div>
        <div className="container">
          <div className={`${styles.heroInner} ${styles.reveal}`}>
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowDot} aria-hidden="true" />
              {tHero('eyebrow')}
            </span>
            <h1 className={styles.headline}>{tHero('headline')}</h1>
            <p className={styles.subhead}>{tHero('subhead')}</p>
            <div className={styles.ctaRow}>
              <Link href="/#consult" className={styles.ctaPrimary}>
                {tHero('ctaPrimary')}
              </Link>
              <Link href="/#about" className={styles.ctaSecondary}>
                {tHero('ctaSecondary')}
              </Link>
            </div>
          </div>
          <ul className={styles.values} aria-label="القيم">
            {values.map((v) => (
              <li key={v} className={styles.valueItem}>
                <Arc tone="accent" className={styles.valueMark} />
                {v}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ══ ABOUT / TRUST ══ */}
      <section id="about" className={styles.section}>
        <div className="container">
          <div className={styles.sectionHead}>
            <span className={styles.sEyebrow}>{tTrust('eyebrow')}</span>
            <h2 className={styles.sHeading}>{tTrust('heading')}</h2>
            <p className={styles.sBody}>{tTrust('body')}</p>
            <span className={styles.flag}>{tTrust('note')}</span>
          </div>
        </div>
      </section>

      {/* ══ DIFFERENTIATORS ══ */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className="container">
          <div className={styles.sectionHead}>
            <span className={styles.sEyebrow}>{tDiff('eyebrow')}</span>
            <h2 className={styles.sHeading}>{tDiff('heading')}</h2>
          </div>
          <div className={styles.diffGrid}>
            {diffItems.map((item, i) => (
              <div key={item.title} className={styles.diffCard}>
                <span className={styles.diffNum}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className={styles.diffTitle}>{item.title}</h3>
                <p className={styles.diffBody}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ INTAKE ══ */}
      <section id="consult-flow" className={styles.section}>
        <div className="container">
          <div className={styles.sectionHead}>
            <span className={styles.sEyebrow}>{tIntake('eyebrow')}</span>
            <h2 className={styles.sHeading}>{tIntake('heading')}</h2>
          </div>
          <div className={styles.steps}>
            {[1, 2, 3].map((n) => (
              <div key={n} className={styles.step}>
                <span className={styles.stepNum}>{ARABIC_NUM[n - 1]}</span>
                <p className={styles.stepTitle}>{tIntake(`step${n}Title`)}</p>
                <p className={styles.stepBody}>{tIntake(`step${n}Body`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRACTICE AREAS ══ */}
      <section id="practice" className={`${styles.section} ${styles.sectionAlt}`}>
        <div className="container">
          <div className={styles.sectionHead}>
            <span className={styles.sEyebrow}>{tPractice('eyebrow')}</span>
            <h2 className={styles.sHeading}>{tPractice('heading')}</h2>
            <p className={styles.sBody}>{tPractice('subhead')}</p>
            <span className={styles.flag}>{tPractice('flag')}</span>
          </div>
          <div className={styles.practiceGrid}>
            {[0, 1, 2].map((i) => (
              <Link
                key={i}
                href="/practice-areas/placeholder"
                className={styles.practiceCard}
              >
                <AlAounMark size={44} title="" className={styles.practiceIcon} />
                <span className={styles.practiceTitle}>
                  {tPractice('placeholderTitle')}
                </span>
                <span className={styles.practiceBody}>
                  {tPractice('placeholderBody')}
                </span>
                <span className={styles.practiceCta}>
                  {tPractice('cta')} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ INSIGHTS ══ */}
      <section id="insights" className={styles.section}>
        <div className="container">
          <div className={styles.sectionHead}>
            <span className={styles.sEyebrow}>
              {(await getTranslations('insights'))('eyebrow')}
            </span>
            <h2 className={styles.sHeading}>
              {(await getTranslations('insights'))('heading')}
            </h2>
            <p className={styles.sBody}>
              {(await getTranslations('insights'))('subhead')}
            </p>
            <span className={styles.flag}>
              {(await getTranslations('insights'))('flag')}
            </span>
          </div>
        </div>
      </section>

      {/* ══ CONSULT CTA ══ */}
      <section id="consult" className={styles.consult}>
        <Arc tone="accent" className={styles.consultArc} />
        <div className={`container ${styles.consultInner}`}>
          <h2 className={styles.consultHeading}>{tConsult('heading')}</h2>
          <p className={styles.consultBody}>{tConsult('body')}</p>
          <Link href="/#contact" className={styles.consultBtn}>
            {tConsult('cta')}
          </Link>
          <p className={styles.consultDisclaimer}>{tConsult('disclaimer')}</p>
        </div>
      </section>
    </>
  );
}

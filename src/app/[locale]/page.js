import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation.js';
import { ArcMark } from '@/components/ArcMark.js';
import { GradientRule } from '@/components/GradientRule.js';
import styles from './page.module.css';

export default async function HomePage() {
  const tHero = await getTranslations('hero');
  const tTrust = await getTranslations('trust');
  const tIntake = await getTranslations('intake');
  const tPractice = await getTranslations('practiceAreas');

  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div>
            <p className={styles.eyebrow}>{tHero('eyebrow')}</p>
            <h1 className={styles.headline}>{tHero('headline')}</h1>
            <div className={styles.rule}>
              <GradientRule />
            </div>
            <p className={styles.subhead}>{tHero('subhead')}</p>
            <div className={styles.ctaRow}>
              <Link href="/#consult" className={styles.ctaPrimary}>
                {tHero('ctaPrimary')}
              </Link>
              <Link
                href="/practice-areas/placeholder"
                className={styles.ctaSecondary}
              >
                {tHero('ctaSecondary')}
              </Link>
            </div>
          </div>
          <div className={styles.heroArt}>
            <ArcMark size={220} />
          </div>
        </div>
      </section>

      <section id="about" className={styles.section}>
        <div className="container">
          <h2 className={styles.sectionHeading}>{tTrust('heading')}</h2>
          <p className={styles.sectionBody}>{tTrust('body')}</p>
        </div>
      </section>

      <section id="consult" className={`${styles.section} ${styles.sectionAlt}`}>
        <div className="container">
          <h2 className={styles.sectionHeading}>{tIntake('heading')}</h2>
          <div className={styles.steps}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>١</span>
              <p className={styles.stepTitle}>{tIntake('step1Title')}</p>
              <p className={styles.stepBody}>{tIntake('step1Body')}</p>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>٢</span>
              <p className={styles.stepTitle}>{tIntake('step2Title')}</p>
              <p className={styles.stepBody}>{tIntake('step2Body')}</p>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>٣</span>
              <p className={styles.stepTitle}>{tIntake('step3Title')}</p>
              <p className={styles.stepBody}>{tIntake('step3Body')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className="container">
          <h2 className={styles.sectionHeading}>{tPractice('heading')}</h2>
          <p className={styles.sectionBody}>{tPractice('subhead')}</p>
          <div className={styles.practiceGrid}>
            <Link
              href="/practice-areas/placeholder"
              className={styles.practiceCard}
            >
              <p className={styles.practiceCardTitle}>
                {tPractice('placeholderCard.title')}
              </p>
              <p className={styles.practiceCardBody}>
                {tPractice('placeholderCard.description')}
              </p>
              <span className={styles.practiceCardCta}>
                {tPractice('placeholderCard.cta')}
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

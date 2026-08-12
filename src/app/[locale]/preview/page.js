import { getTranslations, setRequestLocale } from 'next-intl/server';
import StoneHero from '@/components/StoneHero.js';
import './preview.global.css';
import styles from './preview.module.css';

export const metadata = { robots: { index: false, follow: false } };

export default async function PreviewHero({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const ar = locale === 'ar';
  const tBrand = await getTranslations('brand');
  const tInst = await getTranslations('institution');
  const tHero = await getTranslations('hero');

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <StoneHero className={styles.stage} />
        <div className={styles.grain} aria-hidden="true" />

        <div className={styles.overlay}>
          <div className={styles.masthead}>
            <span className={styles.word}>{tBrand('fullName')}</span>
            <span className={styles.meta}>{tInst('est')} · {tInst('kuwait')}</span>
          </div>
          <span className={styles.rule} />

          <div className={styles.center}>
            <span className={styles.kicker}>{ar ? 'مؤسسة قانونية كويتية' : 'A Kuwaiti Legal Institution'}</span>
            <h1 className={styles.headline}>{tHero('headline')}</h1>
          </div>

          <div className={styles.foot}>
            <span className={styles.year}>2000</span>
            <span className={styles.scroll}>{ar ? 'مرِّر' : 'Scroll'}</span>
          </div>
        </div>
      </section>

      {/* قسم لاختبار انسياب الضوء مع الاسكرول */}
      <section className={styles.after}>
        <p className={styles.afterLine}>{tHero('subhead')}</p>
      </section>
    </div>
  );
}

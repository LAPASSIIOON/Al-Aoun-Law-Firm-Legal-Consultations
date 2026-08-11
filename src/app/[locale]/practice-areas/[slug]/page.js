import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation.js';
import { GradientRule } from '@/components/GradientRule.js';
import styles from './page.module.css';

/**
 * قائمة مجالات الممارسة المعتمدة لم تُسلَّم بعد (البند الحاجب §٦.٥).
 * "placeholder" هو المسار الوحيد المولَّد حاليًا، لإثبات بنية الصفحة فقط.
 */
export function generateStaticParams() {
  return [{ slug: 'placeholder' }];
}

export default async function PracticeAreaPage() {
  const t = await getTranslations('practiceAreaPage');

  return (
    <>
      <header className={styles.header}>
        <div className="container">
          <p className={styles.eyebrow}>{t('eyebrow')}</p>
          <h1 className={styles.title}>{t('title')}</h1>
          <div className={styles.rule}>
            <GradientRule />
          </div>
          <p className={styles.intro}>{t('intro')}</p>
          <span className={styles.contentFlag}>CONTENT REQUIRED</span>
        </div>
      </header>

      <section className={styles.section}>
        <div className="container">
          <h2 className={styles.sectionHeading}>{t('servicesHeading')}</h2>
          <p className={styles.servicesPlaceholder}>
            {t('servicesPlaceholder')}
          </p>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className="container">
          <h2 className={styles.ctaHeading}>{t('ctaHeading')}</h2>
          <Link href="/#consult" className={styles.ctaButton}>
            {t('cta')}
          </Link>
        </div>
      </section>
    </>
  );
}

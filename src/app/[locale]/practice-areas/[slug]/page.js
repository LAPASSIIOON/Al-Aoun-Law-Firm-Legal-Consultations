import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation.js';
import styles from './page.module.css';

/**
 * قائمة مجالات الممارسة المعتمدة لم تُسلَّم بعد (البند الحاجب §٦.٥).
 * "placeholder" هو المسار الوحيد المولَّد حاليًا، لإثبات بنية الصفحة فقط.
 */
export function generateStaticParams() {
  return [{ slug: 'placeholder' }];
}

export default async function PracticeAreaPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('practiceAreaPage');

  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <span className={styles.eyebrow}>{t('eyebrow')}</span>
          <h1 className={styles.title}>{t('title')}</h1>
          <p className={styles.intro}>{t('intro')}</p>
          <span className={styles.flag}>CONTENT REQUIRED</span>
        </div>
      </section>

      <section className={styles.body}>
        <div className="container">
          <div className={styles.grid}>
            <div>
              <h2 className={styles.blockHeading}>{t('servicesHeading')}</h2>
              <div className={styles.placeholder}>{t('servicesFlag')}</div>
            </div>
            <div>
              <h2 className={styles.blockHeading}>{t('whoHeading')}</h2>
              <div className={styles.placeholder}>{t('whoFlag')}</div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.consult}>
        <div className="container">
          <h2 className={styles.consultHeading}>{t('ctaHeading')}</h2>
          <Link href="/#consult" className={styles.consultBtn}>{t('cta')}</Link>
        </div>
      </section>
    </>
  );
}

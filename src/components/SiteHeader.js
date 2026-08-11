import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation.js';
import { ArcMark } from './ArcMark.js';
import styles from './SiteHeader.module.css';

export async function SiteHeader() {
  const t = await getTranslations('nav');
  const locale = await getLocale();
  const otherLocale = locale === 'ar' ? 'en' : 'ar';
  const tLang = await getTranslations({
    locale,
    namespace: 'langSwitch',
  });

  return (
    <header className={styles.header}>
      <div className={`container ${styles.bar}`}>
        <Link href="/" className={styles.brand}>
          <ArcMark size={32} />
          <span className={styles.brandName}>مجموعة العون</span>
        </Link>

        <nav className={styles.nav} aria-label="التنقّل الرئيسي">
          <Link href="/" className={styles.navLink}>
            {t('home')}
          </Link>
          <Link href="/practice-areas/placeholder" className={styles.navLink}>
            {t('practiceAreas')}
          </Link>
          <Link href="/#about" className={styles.navLink}>
            {t('about')}
          </Link>
          <Link href="/#contact" className={styles.navLink}>
            {t('contact')}
          </Link>
        </nav>

        <div className={styles.actions}>
          <Link href="/" locale={otherLocale} className={styles.langSwitch}>
            {tLang('label')}
          </Link>
          <Link href="/#consult" className={styles.cta}>
            {t('consult')}
          </Link>
        </div>
      </div>
    </header>
  );
}

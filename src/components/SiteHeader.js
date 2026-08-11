import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation.js';
import { AlAounMark } from './AlAounMark.js';
import styles from './SiteHeader.module.css';

export async function SiteHeader() {
  const t = await getTranslations('nav');
  const tBrand = await getTranslations('brand');
  const tLang = await getTranslations('langSwitch');
  const locale = await getLocale();
  const otherLocale = locale === 'ar' ? 'en' : 'ar';

  return (
    <header className={styles.header}>
      <div className={`container ${styles.bar}`}>
        <Link href="/" className={styles.brand} aria-label={tBrand('fullName')}>
          <AlAounMark size={34} />
          <span>
            <span className={styles.brandName}>{tBrand('name')}</span>
            <span className={styles.brandSince}>{tBrand('since')}</span>
          </span>
        </Link>

        <nav className={styles.nav} aria-label={t('home')}>
          <Link href="/#about" className={styles.navLink}>{t('about')}</Link>
          <Link href="/practice-areas/placeholder" className={styles.navLink}>{t('practiceAreas')}</Link>
          <Link href="/#insights" className={styles.navLink}>{t('insights')}</Link>
          <Link href="/#contact" className={styles.navLink}>{t('contact')}</Link>
        </nav>

        <div className={styles.actions}>
          <Link href="/" locale={otherLocale} className={styles.langSwitch} aria-label={tLang('label')}>
            {tLang('code')}
          </Link>
          <Link href="/#consult" className={styles.cta}>{t('consult')}</Link>
        </div>
      </div>
    </header>
  );
}

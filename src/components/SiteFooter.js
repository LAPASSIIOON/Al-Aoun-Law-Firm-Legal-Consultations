import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation.js';
import { AlAounLogo } from './AlAounLogo.js';
import styles from './SiteFooter.module.css';

export async function SiteFooter() {
  const t = await getTranslations('footer');
  const tBrand = await getTranslations('brand');
  const tNav = await getTranslations('nav');

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          <div className={styles.brandCol}>
            <AlAounLogo height={52} variant="white" />
            <p className={styles.tagline}>{t('tagline')}</p>
          </div>

          <nav className={styles.col} aria-label={t('linksHeading')}>
            <p className={styles.colHeading}>{t('linksHeading')}</p>
            <Link href="/#about" className={styles.link}>{tNav('about')}</Link>
            <Link href="/practice-areas/placeholder" className={styles.link}>{tNav('practiceAreas')}</Link>
            <Link href="/#insights" className={styles.link}>{tNav('insights')}</Link>
            <Link href="/#consult" className={styles.link}>{tNav('consult')}</Link>
          </nav>

          <div className={styles.col}>
            <p className={styles.colHeading}>{t('contactHeading')}</p>
            <p className={styles.flag}>{t('contactFlag')}</p>
          </div>

          <div className={styles.col}>
            <p className={styles.colHeading}>{t('legalHeading')}</p>
            <Link href="/#" className={styles.link}>{t('privacy')}</Link>
            <Link href="/#" className={styles.link}>{t('terms')}</Link>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.disclaimer}>{t('disclaimer')}</p>
          <p className={styles.rights}>
            {"\u00A9"} {new Date().getFullYear()} {tBrand('fullName')} {"\u2014"} {t('rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}

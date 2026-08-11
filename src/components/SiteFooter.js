import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation.js';
import { AlAounMark } from './AlAounMark.js';
import styles from './SiteFooter.module.css';

export async function SiteFooter() {
  const t = await getTranslations('footer');
  const tBrand = await getTranslations('brand');
  const tNav = await getTranslations('nav');

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.top}`}>
        <div className={styles.brandCol}>
          <span className={styles.brandRow}>
            <AlAounMark size={36} title={tBrand('fullName')} />
            <span className={styles.brandName}>{tBrand('name')}</span>
          </span>
          <p className={styles.tagline}>{t('tagline')}</p>
        </div>

        <div>
          <p className={styles.colHeading}>{t('linksHeading')}</p>
          <ul className={styles.linkList}>
            <li><Link href="/#about" className={styles.footLink}>{tNav('about')}</Link></li>
            <li><Link href="/practice-areas/placeholder" className={styles.footLink}>{tNav('practiceAreas')}</Link></li>
            <li><Link href="/#insights" className={styles.footLink}>{tNav('insights')}</Link></li>
            <li><Link href="/#consult" className={styles.footLink}>{tNav('consult')}</Link></li>
          </ul>
        </div>

        <div>
          <p className={styles.colHeading}>{t('contactHeading')}</p>
          <p className={styles.flag}>{t('contactFlag')}</p>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <span className={styles.disclaimer}>{t('disclaimer')}</span>
        <span>© {new Date().getFullYear()} {tBrand('fullName')} — {t('rights')}</span>
      </div>
    </footer>
  );
}

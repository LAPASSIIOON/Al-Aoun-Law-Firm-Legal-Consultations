import { getTranslations } from 'next-intl/server';
import styles from './SiteFooter.module.css';

export async function SiteFooter() {
  const t = await getTranslations('footer');

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.top}`}>
        <div>
          <p className={styles.firmName}>{t('firmName')}</p>
          <p className={styles.disclaimer}>{t('disclaimer')}</p>
        </div>
        <div>
          <p className={styles.contactHeading}>{t('contactHeading')}</p>
          <p className={styles.placeholder}>{t('contactPlaceholder')}</p>
        </div>
      </div>
      <div className={`container ${styles.bottom}`}>
        <span>
          © {new Date().getFullYear()} {t('firmName')} — {t('rights')}
        </span>
        <a href="/privacy">{t('privacyLink')}</a>
      </div>
    </footer>
  );
}

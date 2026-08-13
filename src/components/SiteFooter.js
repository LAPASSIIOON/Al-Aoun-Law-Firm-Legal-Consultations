import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation.js';
import styles from './SiteFooter.module.css';

export async function SiteFooter() {
  const locale = await getLocale();
  const t = await getTranslations('footer');
  const tn = await getTranslations('nav');
  const tb = await getTranslations('brand');
  const year = new Date().getFullYear();
  const nav = [['about','/about'],['services','/services'],['team','/team'],['insights','/insights'],['careers','/careers'],['contact','/contact']];

  return (
    <footer className={styles.footer}>
      <div className={`wrap ${styles.top}`}>
        <div className={styles.brandCol}>
          <img src={`/brand/logo-full-${locale}-white.png`} alt="مجموعة العون" className={styles.logo} />
          <p className={styles.tagline}>{t('tagline')}</p>
        </div>
        <nav className={styles.linksCol} aria-label="footer">
          <span className={styles.colHead}>{t('linksHeading')}</span>
          {nav.map(([k,href]) => (<Link key={k} href={href} className={styles.fLink}>{tn(k)}</Link>))}
        </nav>
        <div className={styles.contactCol}>
          <span className={styles.colHead}>{t('contactHeading')}</span>
          <a href="tel:+96599010470" className={styles.fLink} dir="ltr">+965 99010470</a>
          <a href="mailto:Aloun.Law@gmail.com" className={styles.fLink}>Aloun.Law@gmail.com</a>
          <span className={styles.muted}>{t('contactFlag')}</span>
        </div>
      </div>
      <div className={`wrap ${styles.bottom}`}>
        <span className={styles.muted}>© {year} {tb('fullName')}</span>
        <div className={styles.legalLinks}>
          <Link href="/privacy" className={styles.fLink}>{t('privacy')}</Link>
          <Link href="/terms" className={styles.fLink}>{t('terms')}</Link>
        </div>
      </div>
      <p className={`wrap ${styles.disclaimer}`}>{t('disclaimer')}</p>
    </footer>
  );
}

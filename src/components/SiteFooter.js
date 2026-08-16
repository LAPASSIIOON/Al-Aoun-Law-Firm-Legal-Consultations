import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation.js';
import styles from './SiteFooter.module.css';

/** @param {{ locale: string, areas: {slug:string,title:string}[] }} props */
export function SiteFooter({ locale, areas = [] }) {
  const t = useTranslations('footer');
  const n = useTranslations('nav');
  const year = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', { useGrouping: false }).format(2026);
  const firmLinks = [
    { key: 'about', href: '/about' }, { key: 'team', href: '/team' },
    { key: 'insights', href: '/insights' }, { key: 'careers', href: '/careers' },
    { key: 'contact', href: '/contact' },
  ];
  return (
    <footer className={`${styles.footer} on-navy`}>
      <div className={`wrap ${styles.statement}`}>
        <p className={styles.statementText}>
          {locale === 'ar'
            ? <>مجموعة العون — استشارات ومحاماة كويتية، بمعايير عالمية.<br/>تأسّست عام ٢٠٠٠، ومقرّها الكويت.</>
            : <>AL OUN — Kuwaiti legal counsel, to an international standard.<br/>Established 2000. Based in Kuwait.</>}
        </p>
      </div>
      <div className={`wrap ${styles.top}`}>
        <div className={styles.brandCol}>
          <span className={styles.logoPlinth}>
            <img src={`/brand/logo-full-${locale}-color.png`} alt={locale === 'en' ? 'OUN GROUP' : 'مجموعة العون'} className={styles.logo} />
          </span>
          <p className={styles.tagline}>{t('tagline')}</p>
        </div>
        <div className={styles.col}>
          <span className={styles.head}>{n('services')}</span>
          {areas.slice(0, 6).map((a) => (
            <Link key={a.slug} href={`/services/${a.slug}`} className={styles.link}>{a.title}</Link>
          ))}
          <Link href="/services" className={styles.linkMore}>{locale === 'ar' ? 'استعراض الكل ←' : 'View all →'}</Link>
        </div>
        <div className={styles.col}>
          <span className={styles.head}>{t('linksHeading')}</span>
          {firmLinks.map((l) => (<Link key={l.key} href={l.href} className={styles.link}>{n(l.key)}</Link>))}
          <Link href="/account/sign-in" className={styles.link}>{t('portal')}</Link>
        </div>
        <div className={styles.col}>
          <span className={styles.head}>{t('contactHeading')}</span>
          <a href="tel:+96599010470" className={styles.link} dir="ltr">+965 99010470</a>
          <a href="mailto:Aloun.Law@gmail.com" className={styles.link}>Aloun.Law@gmail.com</a>
          <span className={styles.hours}>{t('hoursHeading')}</span>
          <span className={styles.hoursVal}>{t('hoursValue')}</span>
        </div>
      </div>
      <div className={`wrap ${styles.bottom}`}>
        <span className={styles.rights}>© {year} {locale === 'ar' ? 'مجموعة العون للمحاماة والاستشارات القانونية' : 'Al Oun Law Firm & Legal Consultations'}</span>
        <div className={styles.legal}>
          <Link href="/privacy" className={styles.legalLink}>{t('privacy')}</Link>
          <Link href="/terms" className={styles.legalLink}>{t('terms')}</Link>
        </div>
      </div>
      <div className={`wrap ${styles.discWrap}`}><p className={styles.disc}>{t('disclaimer')}</p></div>
    </footer>
  );
}

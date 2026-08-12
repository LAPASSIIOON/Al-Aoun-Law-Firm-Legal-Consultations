import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation.js';
import { AlAounLogo } from './AlAounLogo.js';
import MobileMenu from './MobileMenu.js';
import styles from './SiteHeader.module.css';

export async function SiteHeader() {
  const t = await getTranslations('nav');
  const tBrand = await getTranslations('brand');
  const tLang = await getTranslations('langSwitch');
  const locale = await getLocale();
  const otherLocale = locale === 'ar' ? 'en' : 'ar';

  const links = [
    { href: '/#about', label: t('about') },
    { href: '/practice-areas/placeholder', label: t('practiceAreas') },
    { href: '/#insights', label: t('insights') },
    { href: '/#contact', label: t('contact') },
  ];

  return (
    <header className={styles.header}>
      <div className={`container ${styles.bar}`}>
        <Link href="/" className={styles.brand} aria-label={tBrand('fullName')}>
          <AlAounLogo height={46} variant="color" priority />
        </Link>

        <nav className={styles.nav} aria-label={t('home')}>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={styles.navLink}>{l.label}</Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <Link href="/" locale={otherLocale} className={styles.lang} aria-label={tLang('label')}>
            {tLang('code')}
          </Link>
          <Link href="/#consult" className={styles.cta}>{t('consult')}</Link>
        </div>

        <MobileMenu
          links={links}
          cta={{ href: '/#consult', label: t('consult') }}
          langCode={tLang('code')}
          langLabel={tLang('label')}
          openLabel={t('home')}
          closeLabel={t('home')}
          otherLocale={otherLocale}
        />
      </div>
    </header>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation.js';
import styles from './SiteHeader.module.css';

const LINKS = [
  { key: 'about', href: '/about' },
  { key: 'services', href: '/services' },
  { key: 'team', href: '/team' },
  { key: 'insights', href: '/insights' },
  { key: 'careers', href: '/careers' },
];

export default function SiteHeader() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const other = locale === 'ar' ? 'en' : 'ar';
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; }, [open]);

  return (
    <header className={`${styles.header} ${solid ? styles.solid : ''}`}>
      <div className={styles.bar}>
        <Link href="/" className={styles.brand} aria-label={t('home')}>
          <img src={`/brand/logo-full-${locale}-white.png`} alt="مجموعة العون" className={styles.logo} />
        </Link>

        <nav className={styles.nav} aria-label="primary">
          {LINKS.map((l) => (
            <Link key={l.key} href={l.href} className={styles.link}>{t(l.key)}</Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <Link href={pathname} locale={other} className={styles.lang} aria-label={other === 'en' ? 'English' : 'العربية'}>
            {other === 'en' ? 'EN' : 'ع'}
          </Link>
          <Link href="/contact" className={styles.cta}>{t('consult')}</Link>
          <button className={styles.burger} onClick={() => setOpen(true)} aria-label={t('contact')} aria-expanded={open}>
            <span /><span />
          </button>
        </div>
      </div>

      {open && (
        <div className={styles.overlay} role="dialog" aria-modal="true">
          <div className={styles.overlayTop}>
            <img src={`/brand/logo-full-${locale}-white.png`} alt="" className={styles.logo} />
            <button className={styles.close} onClick={() => setOpen(false)} aria-label="close">×</button>
          </div>
          <nav className={styles.overlayNav}>
            <Link href="/" className={styles.overlayLink}>{t('home')}</Link>
            {LINKS.map((l) => (<Link key={l.key} href={l.href} className={styles.overlayLink}>{t(l.key)}</Link>))}
            <Link href="/contact" className={styles.overlayLink}>{t('contact')}</Link>
          </nav>
          <div className={styles.overlayFoot}>
            <Link href={pathname} locale={other} className={styles.lang}>{other === 'en' ? 'English' : 'العربية'}</Link>
            <Link href="/contact" className={styles.cta}>{t('consult')}</Link>
          </div>
        </div>
      )}
    </header>
  );
}

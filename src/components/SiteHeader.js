'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation.js';
import styles from './SiteHeader.module.css';

const Chevron = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);

/** @param {{ locale: string, areas: {slug:string,title:string}[] }} props */
export default function SiteHeader({ locale, areas = [] }) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const other = locale === 'ar' ? 'en' : 'ar';
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [mega, setMega] = useState(false);
  const [mAreas, setMAreas] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { document.body.style.overflow = mobile ? 'hidden' : ''; }, [mobile]);

  const nav = [
    { key: 'about', href: '/about' },
    { key: 'team', href: '/team' },
    { key: 'insights', href: '/insights' },
    { key: 'careers', href: '/careers' },
  ];

  return (
    <header className={`${styles.header} ${scrolled ? styles.solid : ''}`}>
      <div className={styles.bar}>
        <Link href="/" className={styles.brand} aria-label={locale === 'en' ? 'OUN GROUP' : 'مجموعة العون'}>
          <img src={`/brand/logo-full-${locale}-color.png`} alt={locale === 'en' ? 'OUN GROUP' : 'مجموعة العون'} className={styles.logo} />
        </Link>

        <nav className={styles.nav} aria-label={locale === 'en' ? 'Primary' : 'رئيسية'}>
          <div className={styles.navItem} onMouseEnter={() => setMega(true)} onMouseLeave={() => setMega(false)}>
            <button className={styles.navLink} aria-expanded={mega} onClick={() => setMega((v) => !v)}>
              {t('services')} <span className={`${styles.chev} ${mega ? styles.chevUp : ''}`}><Chevron /></span>
            </button>
            <div className={`${styles.mega} ${mega ? styles.megaOpen : ''}`} role="menu">
              <div className={styles.megaInner}>
                <div className={styles.megaHead}>
                  <span className="eyebrow">{t('services')}</span>
                  <Link href="/services" className="btn-line" onClick={() => setMega(false)}>{locale === 'ar' ? 'استعراض الكل' : 'View all'} <span className="arrow">→</span></Link>
                </div>
                <div className={styles.megaGrid}>
                  {(areas.length ? areas : []).map((a) => (
                    <Link key={a.slug} href={`/services/${a.slug}`} className={styles.megaLink} onClick={() => setMega(false)} role="menuitem">
                      <span className={styles.megaDot} />{a.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {nav.map((n) => (
            <Link key={n.key} href={n.href} className={styles.navLink}>{t(n.key)}</Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <Link href={pathname} locale={other} className={styles.lang}>{other === 'en' ? 'EN' : 'ع'}</Link>
          <Link href="/contact" className={`btn btn-solid ${styles.cta}`}>{t('consult')}</Link>
          <button className={styles.burger} aria-label={locale === 'ar' ? 'القائمة' : 'Menu'} aria-expanded={mobile} onClick={() => setMobile(true)}>
            <span /><span /><span />
          </button>
        </div>
      </div>

      {mobile && (
        <div className={styles.overlay}>
          <div className={styles.overlayTop}>
            <img src={`/brand/logo-full-${locale}-color.png`} alt="" className={styles.logo} />
            <button className={styles.close} aria-label={locale === 'ar' ? 'إغلاق' : 'Close'} onClick={() => setMobile(false)}>×</button>
          </div>
          <nav className={styles.overlayNav}>
            <button className={styles.overlayLink} onClick={() => setMAreas((v) => !v)}>
              {t('services')} <span className={`${styles.chev} ${mAreas ? styles.chevUp : ''}`}><Chevron /></span>
            </button>
            {mAreas && (
              <div className={styles.overlaySub}>
                {areas.map((a) => (
                  <Link key={a.slug} href={`/services/${a.slug}`} className={styles.overlaySubLink} onClick={() => setMobile(false)}>{a.title}</Link>
                ))}
                <Link href="/services" className={styles.overlaySubLink} onClick={() => setMobile(false)}>{locale === 'ar' ? 'استعراض الكل ←' : 'View all →'}</Link>
              </div>
            )}
            {nav.map((n) => (
              <Link key={n.key} href={n.href} className={styles.overlayLink} onClick={() => setMobile(false)}>{t(n.key)}</Link>
            ))}
          </nav>
          <div className={styles.overlayFoot}>
            <Link href={pathname} locale={other} className={styles.lang} onClick={() => setMobile(false)}>{other === 'en' ? 'English' : 'العربية'}</Link>
            <Link href="/contact" className="btn btn-solid" onClick={() => setMobile(false)}>{t('consult')}</Link>
          </div>
        </div>
      )}
    </header>
  );
}

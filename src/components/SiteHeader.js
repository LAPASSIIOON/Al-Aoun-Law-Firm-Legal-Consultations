'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation.js';
import styles from './SiteHeader.module.css';
import SiteSearch from './SiteSearch.js';

const Chevron = () => (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);

/** @param {{ locale: string, areas: {slug:string,title:string}[] }} props */
export default function SiteHeader({ locale, areas = [], member = null }) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const other = locale === 'ar' ? 'en' : 'ar';
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [openMenu, setOpenMenu] = useState(null); // 'services' | 'firm' | null
  const [mOpen, setMOpen] = useState(null); // mobile accordion group

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { document.body.style.overflow = mobile ? 'hidden' : ''; }, [mobile]);

  const firmLinks = [
    { key: 'about', href: '/about' },
    { key: 'team', href: '/team' },
    { key: 'careers', href: '/careers' },
  ];

  const closeAll = () => { setMobile(false); setOpenMenu(null); };

  return (
    <>
    <header className={`${styles.header} ${scrolled ? styles.solid : ''}`}>
      <div className={styles.bar}>
        <Link href="/" className={styles.brand} aria-label={locale === 'en' ? 'OUN GROUP' : 'مجموعة العون'} onClick={closeAll}>
          <img src={`/brand/logo-full-${locale}-color.png`} alt={locale === 'en' ? 'OUN GROUP' : 'مجموعة العون'} className={styles.logo} />
        </Link>

        <nav className={styles.nav} aria-label={locale === 'en' ? 'Primary' : 'رئيسية'}>
          {/* THE FIRM — grouped dropdown, leads with identity/credibility */}
          <div className={styles.navItem} onMouseEnter={() => setOpenMenu('firm')} onMouseLeave={() => setOpenMenu((m) => (m === 'firm' ? null : m))}>
            <button className={styles.navLink} aria-expanded={openMenu === 'firm'} onClick={() => setOpenMenu((m) => (m === 'firm' ? null : 'firm'))}>
              {locale === 'ar' ? 'المكتب' : 'The Firm'} <span className={`${styles.chev} ${openMenu === 'firm' ? styles.chevUp : ''}`}><Chevron /></span>
            </button>
            <div className={`${styles.drop} ${openMenu === 'firm' ? styles.dropOpen : ''}`} role="menu">
              <div className={styles.dropInner}>
                {firmLinks.map((n) => (<Link key={n.key} href={n.href} className={styles.dropLink} onClick={closeAll} role="menuitem">{t(n.key)}</Link>))}
              </div>
            </div>
          </div>

          {/* PRACTICE AREAS — mega */}
          <div className={styles.navItem} onMouseEnter={() => setOpenMenu('services')} onMouseLeave={() => setOpenMenu((m) => (m === 'services' ? null : m))}>
            <button className={styles.navLink} aria-expanded={openMenu === 'services'} onClick={() => setOpenMenu((m) => (m === 'services' ? null : 'services'))}>
              {t('services')} <span className={`${styles.chev} ${openMenu === 'services' ? styles.chevUp : ''}`}><Chevron /></span>
            </button>
            <div className={`${styles.mega} ${openMenu === 'services' ? styles.megaOpen : ''}`} role="menu">
              <div className={styles.megaInner}>
                <div className={styles.megaHead}>
                  <span className="eyebrow">{t('services')}</span>
                  <Link href="/services" className="btn-line" onClick={closeAll}>{locale === 'ar' ? 'استعراض الكل' : 'View all'} <span className="arrow">→</span></Link>
                </div>
                <div className={styles.megaGrid}>
                  {areas.slice(0, 8).map((a, i) => (
                    <Link key={a.slug} href={`/services/${a.slug}`} className={styles.megaLink} onClick={closeAll} role="menuitem">
                      <span className={styles.megaIdx}>{String(i + 1).padStart(2, '0')}</span>{a.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Link href="/international" className={styles.navLink}>{t('international')}</Link>
          <Link href="/insights" className={styles.navLink}>{t('insights')}</Link>
          <Link href="/contact" className={styles.navLink}>{t('contact')}</Link>
        </nav>

        <div className={styles.actions}>
          <SiteSearch locale={locale} />
          <Link href={member ? (member.role === 'admin' ? '/admin' : '/account/my-requests') : '/account/sign-in'} className={`${styles.lang} ${styles.barOnly}`}>
            {member ? (locale === 'ar' ? 'لوحة التحكم' : 'Dashboard') : (locale === 'ar' ? 'تسجيل الدخول' : 'Sign In')}
          </Link>
          <Link href={pathname} locale={other} className={`${styles.lang} ${styles.barOnly}`}>{other === 'en' ? 'EN' : 'ع'}</Link>
          <Link href="/contact" className={`btn btn-solid ${styles.cta}`}>{t('consult')}</Link>
          <button className={styles.burger} aria-label={locale === 'ar' ? 'القائمة' : 'Menu'} aria-expanded={mobile} onClick={() => setMobile(true)}>
            <span /><span /><span />
          </button>
        </div>
      </div>

    </header>
    {mobile && (
      <div className={styles.overlay}>
        <div className={styles.overlayTop}>
          <img src={`/brand/logo-full-${locale}-color.png`} alt="" className={styles.logo} />
          <button className={styles.close} aria-label={locale === 'ar' ? 'إغلاق' : 'Close'} onClick={closeAll}>×</button>
        </div>
        <nav className={styles.overlayNav}>
          <button className={styles.oGroupHead} onClick={() => setMOpen((v) => (v === 'firm' ? null : 'firm'))} style={{ animationDelay: '.02s' }}>
            <span><span className={styles.oIdx}>01</span>{locale === 'ar' ? 'المكتب' : 'The Firm'}</span>
            <span className={`${styles.chev} ${mOpen === 'firm' ? styles.chevUp : ''}`}><Chevron /></span>
          </button>
          {mOpen === 'firm' && (
            <div className={styles.oSub}>
              {firmLinks.map((n) => (<Link key={n.key} href={n.href} className={styles.oSubLink} onClick={closeAll}>{t(n.key)}</Link>))}
            </div>
          )}

          <button className={styles.oGroupHead} onClick={() => setMOpen((v) => (v === 'services' ? null : 'services'))} style={{ animationDelay: '.08s' }}>
            <span><span className={styles.oIdx}>02</span>{t('services')}</span>
            <span className={`${styles.chev} ${mOpen === 'services' ? styles.chevUp : ''}`}><Chevron /></span>
          </button>
          {mOpen === 'services' && (
            <div className={styles.oSub}>
              {areas.slice(0, 8).map((a) => (<Link key={a.slug} href={`/services/${a.slug}`} className={styles.oSubLink} onClick={closeAll}>{a.title}</Link>))}
              <Link href="/services" className={styles.oSubLink} onClick={closeAll}>{locale === 'ar' ? 'استعراض الكل ←' : 'View all →'}</Link>
            </div>
          )}

          <Link href="/international" className={styles.overlayLink} onClick={closeAll} style={{ animationDelay: '.14s' }}><span className={styles.oIdx}>03</span>{t('international')}</Link>
          <Link href="/insights" className={styles.overlayLink} onClick={closeAll} style={{ animationDelay: '.16s' }}><span className={styles.oIdx}>04</span>{t('insights')}</Link>
          <Link href="/contact" className={styles.overlayLink} onClick={closeAll} style={{ animationDelay: '.18s' }}><span className={styles.oIdx}>05</span>{t('contact')}</Link>
        </nav>
        <div className={styles.overlayFoot}>
          <Link href={member ? (member.role === 'admin' ? '/admin' : '/account/my-requests') : '/account/sign-in'} className={styles.lang} onClick={closeAll}>
            {member ? (locale === 'ar' ? 'لوحة التحكم' : 'Dashboard') : (locale === 'ar' ? 'تسجيل الدخول' : 'Sign In')}
          </Link>
          <Link href={pathname} locale={other} className={styles.lang} onClick={closeAll}>{other === 'en' ? 'English' : 'العربية'}</Link>
          <Link href="/contact" className="btn btn-solid" onClick={closeAll}>{t('consult')}</Link>
        </div>
      </div>
    )}
    </>
  );
}

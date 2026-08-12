'use client';
import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation.js';
import styles from './MobileMenu.module.css';

/**
 * قائمة موبايل بملء الشاشة، تحريرية. تُغلق عند اختيار رابط أو Esc.
 * @param {{ links: {href:string,label:string}[], cta:{href:string,label:string},
 *           langHref:string, langCode:string, langLabel:string,
 *           openLabel:string, closeLabel:string, otherLocale:'ar'|'en' }} props
 */
export default function MobileMenu({ links, cta, langCode, langLabel, openLabel, closeLabel, otherLocale }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={styles.toggle}
        aria-label={open ? closeLabel : openLabel}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`${styles.bars} ${open ? styles.barsOpen : ''}`} aria-hidden="true">
          <span /><span />
        </span>
      </button>

      <div className={`${styles.overlay} ${open ? styles.overlayOpen : ''}`} role="dialog" aria-modal="true" hidden={!open}>
        <nav className={styles.nav}>
          {links.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              className={styles.link}
              style={{ '--i': i }}
              onClick={() => setOpen(false)}
            >
              <span className={styles.linkNum}>{String(i + 1).padStart(2, '0')}</span>
              <span>{l.label}</span>
            </Link>
          ))}
        </nav>
        <div className={styles.foot}>
          <Link href={cta.href} className={styles.cta} onClick={() => setOpen(false)}>{cta.label}</Link>
          <Link href="/" locale={otherLocale} className={styles.lang} aria-label={langLabel} onClick={() => setOpen(false)}>
            {langCode}
          </Link>
        </div>
      </div>
    </>
  );
}

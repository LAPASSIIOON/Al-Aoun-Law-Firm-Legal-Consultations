'use client';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation.js';
import styles from './Chrome.module.css';

const SECTIONS = ['identity', 'history', 'philosophy', 'expertise', 'people', 'knowledge', 'action'];
const AR = ['٠١','٠٢','٠٣','٠٤','٠٥','٠٦','٠٧'];
const EN = ['01','02','03','04','05','06','07'];

export function Chrome() {
  const locale = useLocale();
  const t = useTranslations();
  const N = locale === 'ar' ? AR : EN;
  const other = locale === 'ar' ? 'en' : 'ar';
  const otherLabel = locale === 'ar' ? 'EN' : 'ع';
  const [active, setActive] = useState('');
  const [open, setOpen] = useState(false);
  const logo = '/brand/al-aoun-logo-white.png';

  useEffect(() => {
    const els = SECTIONS.map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* ═══ العمود المؤسسي الدائم (ديسكتوب) ═══ */}
      <aside className={styles.rail} aria-label={t('institution.wordmark')}>
        <Link href="/#opening" className={styles.mark} aria-label={t('institution.wordmark')}>
          <img src={logo} alt={t('institution.wordmark')} />
        </Link>

        <nav className={styles.index} aria-label={t('sections.identity')}>
          {SECTIONS.map((id, i) => (
            <Link key={id} href={`/#${id}`} className={`${styles.idx} ${active === id ? styles.idxOn : ''}`}>
              <span className={`regnum ${styles.idxNum}`}>{N[i]}</span>
              <span className={styles.idxLabel}>{t(`sections.${id}`)}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.railFoot}>
          <span className={`monnum ${styles.railYear}`}>2000</span>
          <Link href="/" locale={other} className={styles.railLang}>{otherLabel}</Link>
        </div>
      </aside>

      {/* ═══ شريط علوي (موبايل) ═══ */}
      <header className={styles.bar}>
        <Link href="/#opening" className={styles.barMark} aria-label={t('institution.wordmark')}>
          <img src={logo} alt={t('institution.wordmark')} />
        </Link>
        <button className={styles.toggle} aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}>
          <span className={`${styles.bars} ${open ? styles.barsX : ''}`}><span /><span /></span>
        </button>
      </header>

      {/* ═══ قائمة الشاشة الكاملة (موبايل) ═══ */}
      <div className={`${styles.overlay} ${open ? styles.overlayOpen : ''}`}>
        <nav className={styles.mnav}>
          {SECTIONS.map((id, i) => (
            <Link key={id} href={`/#${id}`} className={styles.mlink} onClick={() => setOpen(false)}>
              <span className={`regnum ${styles.mnum}`}>{N[i]}</span>
              <span>{t(`sections.${id}`)}</span>
            </Link>
          ))}
        </nav>
        <div className={styles.mfoot}>
          <span className={`monnum ${styles.myear}`}>2000</span>
          <Link href="/" locale={other} className={styles.mlang} onClick={() => setOpen(false)}>{otherLabel}</Link>
        </div>
      </div>
    </>
  );
}

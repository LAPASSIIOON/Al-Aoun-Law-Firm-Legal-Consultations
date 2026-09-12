'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from '@/i18n/navigation.js';
import styles from './SiteLoader.module.css';

/** شاشة افتتاح وانتقال هادئة، بلا تأخير مصطنع بعد اكتمال التنقل. */
export default function SiteLoader({ locale }) {
  const pathname = usePathname();
  const firstPath = useRef(true);
  const timers = useRef([]);
  const [state, setState] = useState({ visible: true, phase: 'boot' });

  const clearTimers = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  };

  const finish = () => {
    clearTimers();
    setState({ visible: true, phase: 'leaving' });
    timers.current.push(window.setTimeout(() => {
      setState({ visible: false, phase: 'idle' });
    }, 360));
  };

  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      timers.current.push(window.setTimeout(() => {
        setState({ visible: false, phase: 'idle' });
      }, 720));
      return () => clearTimers();
    }

    finish();
    return () => clearTimers();
  }, [pathname]);

  useEffect(() => {
    const onNavigate = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target.closest('a[href]');
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (`${destination.pathname}${destination.search}` === `${window.location.pathname}${window.location.search}`) return;

      clearTimers();
      setState({ visible: true, phase: 'waiting' });
      timers.current.push(window.setTimeout(finish, 10000));
    };

    document.addEventListener('click', onNavigate, true);
    return () => document.removeEventListener('click', onNavigate, true);
  }, []);

  if (!state.visible) return null;

  return (
    <div
      className={`${styles.loader} ${styles[state.phase]}`}
      role="status"
      aria-live="polite"
      aria-label={locale === 'ar' ? 'جاري تحميل الصفحة' : 'Loading page'}
    >
      <div className={styles.lockup}>
        <img src="/brand/al-aoun-mark.svg" alt="" aria-hidden="true" className={styles.mark} />
        <span className={styles.name}>{locale === 'ar' ? 'مجموعة العون' : 'AL OUN'}</span>
        <span className={styles.rule} aria-hidden="true"><span /></span>
        <span className={styles.label}>{locale === 'ar' ? 'جاري التحميل' : 'Loading'}</span>
      </div>
    </div>
  );
}

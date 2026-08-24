'use client';
import { useEffect, useState } from 'react';

const UpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 19V5M6 11l6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** زرار تمرير سريع لأعلى — يظهر فقط بعد تمرير حقيقي، لا يزاحم زرار واتساب. */
export default function ScrollToTop({ locale }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label={locale === 'ar' ? 'التمرير لأعلى' : 'Scroll to top'}
      className="no-print"
      style={{
        position: 'fixed', insetBlockEnd: '1.25rem', insetInlineStart: '1.25rem', zIndex: 60,
        width: '44px', height: '44px', borderRadius: '50%', background: 'var(--surface-2)',
        color: 'var(--platinum)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 6px 18px rgba(0,0,0,.3), inset 0 0 0 1px var(--hair-dark-strong)',
        transition: 'transform .2s ease, opacity .2s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      <UpIcon />
    </button>
  );
}

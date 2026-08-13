'use client';
import { useEffect, useRef, useState } from 'react';

/** Animated count-up stat. @param {{value:number, label:string, suffix?:string, locale:string}} p */
export default function CounterStat({ value, label, suffix = '', locale }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  const done = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setN(value); return; }
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting && !done.current) {
          done.current = true;
          const dur = 1400, t0 = performance.now();
          const tick = (now) => {
            const p = Math.min(1, (now - t0) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            setN(Math.round(value * eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.4 });
    io.observe(el); return () => io.disconnect();
  }, [value]);
  const fmt = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', { useGrouping: false }).format(n);
  return (
    <div ref={ref} className="counter">
      <div className="counter-n">{fmt}{suffix}</div>
      <div className="counter-l">{label}</div>
    </div>
  );
}

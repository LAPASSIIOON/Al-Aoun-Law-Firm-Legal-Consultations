'use client';
import { useEffect } from 'react';

/** ظهور تدريجي آمن: المحتوى ظاهر افتراضيًا. عند توفر JS نضيف .reveal-init (يُخفي)
 *  ثم .in عند الدخول للعرض. شبكة أمان تُظهر كل شيء بعد مهلة حتى لو تعطّل المراقب. */
export default function RevealController() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nodes = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!nodes.length) return;
    if (reduce || typeof IntersectionObserver === 'undefined') return; // يبقى ظاهرًا

    nodes.forEach((n) => n.classList.add('reveal-init'));
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.1 }
    );
    const raf = requestAnimationFrame(() => nodes.forEach((n) => io.observe(n)));
    const safety = setTimeout(() => nodes.forEach((n) => n.classList.add('in')), 2600);
    return () => { cancelAnimationFrame(raf); clearTimeout(safety); io.disconnect(); };
  }, []);
  return null;
}

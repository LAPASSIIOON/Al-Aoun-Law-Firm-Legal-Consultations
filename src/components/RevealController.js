'use client';
import { useEffect } from 'react';

/**
 * يفعّل الظهور التدريجي لكل عنصر يحمل data-reveal أو data-line-reveal
 * عبر IntersectionObserver. يحترم prefers-reduced-motion.
 * يُركّب مرة واحدة في التخطيط ويعمل على كامل الصفحة.
 */
export default function RevealController() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nodes = document.querySelectorAll('[data-reveal], [data-line-reveal]');
    if (reduce) { nodes.forEach((n) => n.classList.add('in')); return; }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  return null;
}

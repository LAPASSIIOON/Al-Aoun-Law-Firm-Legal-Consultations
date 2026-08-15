'use client';
import { useEffect, useRef } from 'react';

/** Premium code-built motion graphic: concentric brand arcs + drifting particles on deep navy.
 *  Interim hero visual until real footage is provided. Reduced-motion safe. */
export default function HeroMotion() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0, w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), t = 0;
    const rtl = getComputedStyle(document.documentElement).direction === 'rtl';
    const CLAY = '48,161,217';        // #30A1D9 measured logo blue
    const PLAT = '174,185,204';       // --platinum-2 (cool)
    const GLOW = '100,184,227';       // #64B8E3 measured 400
    const NOTE = '44,143,214';        // --blue-note (لمسة أزرق اللوجو)
    let particles = [];

    function size() {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = Array.from({ length: Math.round(Math.min(48, w / 26)) }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.6 + 0.4, s: Math.random() * 0.28 + 0.06,
        a: Math.random() * 0.5 + 0.15, drift: (Math.random() - 0.5) * 0.15,
      }));
    }

    function cx() { return rtl ? w * 0.24 : w * 0.76; }
    const cy = () => h * 0.52;

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const ax = cx(), ay = cy();

      // soft radial glow
      const g = ctx.createRadialGradient(ax, ay, 0, ax, ay, Math.max(w, h) * 0.6);
      g.addColorStop(0, `rgba(${GLOW},0.14)`);
      g.addColorStop(0.35, `rgba(${NOTE},0.05)`);
      g.addColorStop(0.7, `rgba(${GLOW},0.03)`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

      // concentric brand arcs (echo the logo arc), gently rotating
      const base = Math.min(w, h);
      const rings = [0.26, 0.40, 0.56, 0.74, 0.94];
      rings.forEach((rr, i) => {
        const rad = base * rr;
        const dir = i % 2 === 0 ? 1 : -1;
        const start = t * 0.00016 * dir * (1 + i * 0.12) + i * 1.7;
        const sweep = Math.PI * (0.85 + 0.18 * Math.sin(t * 0.0004 + i));
        ctx.beginPath();
        ctx.arc(ax, ay, rad, start, start + sweep);
        const col = i % 2 === 0 ? PLAT : CLAY;
        ctx.strokeStyle = `rgba(${col},${0.14 - i * 0.016})`;
        ctx.lineWidth = i === 1 ? 2 : 1;
        ctx.stroke();
      });
      // one brighter accent arc
      const rad = base * 0.40;
      const st = t * 0.0003 + 0.6;
      ctx.beginPath();
      ctx.arc(ax, ay, rad, st, st + Math.PI * 0.42);
      ctx.strokeStyle = `rgba(${GLOW},0.55)`; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
      ctx.stroke(); ctx.lineCap = 'butt';

      // drifting particles
      particles.forEach((p) => {
        p.y -= p.s; p.x += p.drift;
        if (p.y < -4) { p.y = h + 4; p.x = Math.random() * w; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${PLAT},${p.a * 0.8})`; ctx.fill();
      });
    }

    size();
    if (reduce) { draw(); return () => {}; }
    const loop = () => { t += 16; draw(); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    const ro = new ResizeObserver(() => size());
    ro.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return <canvas ref={ref} aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />;
}

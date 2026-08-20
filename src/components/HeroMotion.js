'use client';
import { useEffect, useRef } from 'react';

/** خلفية الهيرو المتحرّكة — نظام خطوط الفهرسة (السجل المرجعي): خطوط دليل رأسية رفيعة
 *  بعلامات تقسيم دقيقة، ونقاط مرجعية قليلة تتنفّس ببطء شديد — دقّة لا زخرفة، وتحت عتبة
 *  الملاحظة الواعية عمدًا. لا أقواس متكرّرة (قرار معتمَد نهائيًا). آمنة مع تفضيل تقليل الحركة. */
export default function HeroMotion() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0, w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), t = 0;
    const LINE = '138,131,119';   // بلاتين معتم — خطوط الدليل والعلامات (دافئ، لا أزرق بارد)
    const POINT = '94,157,190';   // أزرق إشارة نادر — النقاط المرجعية فقط
    let lines = [], points = [];

    function size() {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // خطوط دليل رأسية بتباعد منتظم — شبكة قياس هادئة، ثابتة تمامًا (بلا انحراف)
      const gap = Math.max(90, w / 11);
      const count = Math.ceil(w / gap) + 1;
      lines = Array.from({ length: count }, (_, i) => ({
        x: i * gap,
        tickGap: 34 + (i % 3) * 6,
        tickOffset: (i * 11) % 34,
      }));

      // عدد محدود من النقاط المرجعية (لا حشد) — تتنفّس ببطء شديد فقط، بلا حركة انتقالية
      const nPoints = Math.max(3, Math.min(6, Math.round(w / 340)));
      points = Array.from({ length: nPoints }, () => ({
        x: Math.random() * w,
        y: h * 0.18 + Math.random() * h * 0.64,
        phase: Math.random() * Math.PI * 2,
        speed: 0.00035 + Math.random() * 0.00025,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      // خطوط الدليل + علامات التقسيم
      lines.forEach((ln) => {
        ctx.strokeStyle = `rgba(${LINE},0.055)`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(ln.x, 0); ctx.lineTo(ln.x, h); ctx.stroke();

        ctx.strokeStyle = `rgba(${LINE},0.16)`;
        for (let y = ln.tickOffset; y < h; y += ln.tickGap) {
          ctx.beginPath(); ctx.moveTo(ln.x - 4, y); ctx.lineTo(ln.x + 4, y); ctx.stroke();
        }
      });

      // نقاط مرجعية تتنفّس ببطء — إشارة "نشاط" هادئة، تحت عتبة الملاحظة الواعية
      points.forEach((p) => {
        const pulse = 0.22 + 0.18 * (0.5 + 0.5 * Math.sin(t * p.speed + p.phase));
        ctx.beginPath(); ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${POINT},${pulse})`; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${POINT},${pulse * 0.35})`; ctx.lineWidth = 1; ctx.stroke();
      });
    }

    size();
    if (reduce) { draw(); return () => {}; }

    let last = performance.now(), visible = true;
    const loop = (now) => {
      const dt = now - last; last = now;
      t += dt;
      draw();
      if (visible) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const ro = new ResizeObserver(() => size());
    ro.observe(canvas);

    // إيقاف الحلقة كليًا وقت خروج الهيرو من الشاشة (سكرول متجاوز) — توفير معالج/بطارية بلا أثر بصري
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) { last = performance.now(); raf = requestAnimationFrame(loop); }
      else cancelAnimationFrame(raf);
    }, { threshold: 0 });
    io.observe(canvas);

    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, []);

  return <canvas ref={ref} aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />;
}

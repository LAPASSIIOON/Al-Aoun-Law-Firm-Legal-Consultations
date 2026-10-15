'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { MAP, ANCHOR, PLACES, ALIASES } from '@/lib/intl-map-data.js';
import s from './IntlMap.module.css';

/* ═══ «الكويت مرتكزًا» — خريطة التنسيق الدولي ═══
 *
 * الخريطة كلها من المتصفح: يابسة Natural Earth (ملف SVG ثابت) وأشكال الدول ونقاط العواصم مسقطة
 * مسبقًا بإسقاط Equal Earth واحد (scripts/build-intl-map.mjs). الخطوط منحنيات بين إحداثيات العواصم
 * الحقيقية — تمثّل نطاق التنسيق والإحالة، لا مكاتب ولا فروعًا. كل الدول بمعاملة بصرية واحدة؛
 * الكويت وحدها المرتكز.
 *
 * المشهد (variant="full"): حركة كاميرا واحدة هادئة — تبدأ أقرب قليلًا إلى الكويت وتتراجع ببطء إلى
 * الإطار الكامل، والمسارات تمتد خلالها بمجموعات جغرافية (الخليج، ثم المشرق وتركيا، ثم البعيد).
 * لا وميض ولا نبض ولا عبور ضوء: حركة الموقع كلها ظهور هادئ، والخريطة على إيقاعه.
 * المعاينة (variant="preview"): بلا كاميرا، والمسارات تُرسم مرة واحدة حين يدخل القسم الشاشة.
 * مرة واحدة في الجلسة؛ مع «تقليل الحركة» تُعرض الحالة النهائية مباشرة.
 *
 * أسماء الدول ظاهرة دائمًا. تُوزَّع بالبكسل على الإطار النهائي كي لا تتراكب (الخليج متقارب جدًا):
 * كل اسم يجرّب جهات حول نقطته — الأبعد عن الكويت أولًا — ثم مسافات أبعد بخطّ إشارة رفيع.
 * الدولة الواقعة خارج الإطار (أمريكا والصين على الهاتف) يُكتب اسمها عند حافة الإطار حيث يخرج مسارها.
 */

const SEEN_KEY = { full: 'aloun-intl-seen', preview: 'aloun-intl-preview-seen' };
const W = MAP.width;
const H = MAP.height;
const KW = ANCHOR.xy;

/* حواف المسرح تتلاشى (قناع CSS) — الأسماء تبقى داخل المنطقة الآمنة */
const SAFE = { x: 0.05, y: 0.07 };
const LABEL_PX = 12;
const KW_NAME_PX = 13;
const KW_NOTE_PX = 10.5;
const GAPS = [6, 14, 26, 40, 56, 74];
const LEADER_FROM = 2; /* من هذه المسافة فأبعد يُرسم خطّ إشارة */
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];

const placeFor = (key) => PLACES.find((p) => p.key === (ALIASES[key] || key)) || null;

/* منحنى رباعي بين نقطتين مسقطتين، ينحني دائمًا نحو الشمال (أعلى الخريطة) بقدر يتناسب مع المسافة. */
function arcGeom(a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  let nx = -dy / len;
  let ny = dx / len;
  if (ny > 0) { nx = -nx; ny = -ny; }
  const lift = Math.max(5, len * 0.22);
  const c = [(a[0] + b[0]) / 2 + nx * lift, (a[1] + b[1]) / 2 + ny * lift];
  return { c, d: `M${a[0]},${a[1]} Q${c[0].toFixed(1)},${c[1].toFixed(1)} ${b[0]},${b[1]}` };
}
const bez = (a, c, b, t) => [
  (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0],
  (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1],
];

/* صندوق كاميرا يضمّ النقاط بهامش، بنسبة أبعاد المسرح. */
function fit(points, aspect, pad = 0.18, minW = 60) {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const x0 = Math.min(...xs); const x1 = Math.max(...xs);
  const y0 = Math.min(...ys); const y1 = Math.max(...ys);
  let w = Math.max(x1 - x0, minW);
  let h = Math.max(y1 - y0, minW / aspect);
  w *= 1 + pad * 2; h *= 1 + pad * 2;
  if (w / h < aspect) w = h * aspect; else h = w / aspect;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  let x = cx - w / 2;
  let y = cy - h / 2;
  if (w <= W) x = Math.min(Math.max(x, 0), W - w);
  if (h <= H) y = Math.min(Math.max(y, 0), H - h);
  return { x, y, w, h };
}

/* اسم الكويت يحتاج مساحة شرقها: نوسّع الإطار الضيّق كي لا يُقصّ */
function withLabelRoom(points, aspect, pad, minW) {
  const first = fit(points, aspect, pad, minW);
  return fit([...points, [KW[0] + first.w * 0.34, KW[1]]], aspect, pad, minW);
}

/* بداية الحركة: الإطار النهائي نفسه مقرَّبًا قليلًا نحو الكويت، ومحصورًا داخله — فالحركة تراجع خالص */
function closer(view, zoom) {
  const w = view.w / zoom;
  const h = view.h / zoom;
  const fx = view.x + view.w / 2;
  const fy = view.y + view.h / 2;
  const cx = fx + (KW[0] - fx) * 0.6;
  const cy = fy + (KW[1] - fy) * 0.6;
  return {
    x: Math.min(Math.max(cx - w / 2, view.x), view.x + view.w - w),
    y: Math.min(Math.max(cy - h / 2, view.y), view.y + view.h - h),
    w,
    h,
  };
}

function readSeen(key) { try { return window.sessionStorage.getItem(key) === '1'; } catch (_) { return false; } }
function markSeen(key) { try { window.sessionStorage.setItem(key, '1'); } catch (_) { /* اختياري */ } }
const reducedMotion = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (_) { return false; } };

export default function IntlMap({ countries, variant = 'full', anchorLabel, anchorNote, mapLabel, listLabel, hint }) {
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const svgRef = useRef(null);
  const cam = useRef({ x: 0, y: 0, w: W, h: H });
  const views = useRef(null);
  const tlRef = useRef(null);
  const camTween = useRef(null);
  const spots = useRef(new Map());
  const [active, setActive] = useState(null);
  const [pinned, setPinned] = useState(null);
  const [ready, setReady] = useState(false);

  const items = useMemo(() => countries.map((c) => {
    const place = placeFor(c.key);
    return { key: c.key, label: c.label, place, arc: place ? arcGeom(KW, place.xy) : null };
  }), [countries]);
  const placed = useMemo(() => items.filter((it) => it.place), [items]);
  const current = pinned || active;

  /* ── الكاميرا: viewBox + معامل المقياس (وحدات لكل بكسل) لثبات سماكة الخطوط وحجم النص ── */
  const applyCam = useCallback(() => {
    const svg = svgRef.current;
    const stage = stageRef.current;
    if (!svg || !stage) return;
    const c = cam.current;
    svg.setAttribute('viewBox', `${c.x.toFixed(2)} ${c.y.toFixed(2)} ${c.w.toFixed(2)} ${c.h.toFixed(2)}`);
    const k = c.w / Math.max(1, stage.clientWidth);
    svg.style.setProperty('--k', k.toFixed(4));
    svg.querySelectorAll('[data-r]').forEach((el) => el.setAttribute('r', (Number(el.dataset.r) * k).toFixed(3)));
    const at = (el) => el.dataset.at.split(',').map(Number);
    svg.querySelectorAll('[data-label]').forEach((el) => {
      const sp = spots.current.get(el.dataset.slot);
      if (!sp) return;
      const [px, py] = at(el);
      const x = sp.edge ? c.x + sp.ax * k : px + sp.ox * k;
      const y = sp.edge ? c.y + sp.ay * k : py + sp.oy * k;
      el.setAttribute('x', x.toFixed(2));
      el.setAttribute('y', y.toFixed(2));
      el.setAttribute('font-size', (Number(el.dataset.px) * k).toFixed(3));
    });
    svg.querySelectorAll('[data-leader]').forEach((el) => {
      const sp = spots.current.get(el.dataset.key);
      const [px, py] = at(el);
      if (!sp || !sp.leader) { el.setAttribute('visibility', 'hidden'); return; }
      el.setAttribute('visibility', 'visible');
      el.setAttribute('x1', (px + sp.leader[0] * k).toFixed(2));
      el.setAttribute('y1', (py + sp.leader[1] * k).toFixed(2));
      el.setAttribute('x2', (px + sp.leader[2] * k).toFixed(2));
      el.setAttribute('y2', (py + sp.leader[3] * k).toFixed(2));
    });
  }, []);

  /* ── توزيع الأسماء بالبكسل على إطار معيّن ── */
  const layout = useCallback((view) => {
    const svg = svgRef.current;
    const stage = stageRef.current;
    if (!svg || !stage || !view) return;
    const sw = stage.clientWidth;
    const sh = stage.clientHeight;
    if (!sw || !sh) return;
    const k = view.w / sw;
    const px = (p) => [(p[0] - view.x) / k, (p[1] - view.y) / k];
    const safe = { x0: sw * SAFE.x, x1: sw * (1 - SAFE.x), y0: sh * SAFE.y, y1: sh * (1 - SAFE.y) };
    const taken = [];
    const box = (cx, cy, w, h) => ({ x0: cx - w / 2, x1: cx + w / 2, y0: cy - h / 2, y1: cy + h / 2 });
    const overlap = (b) => taken.reduce((sum, o) => {
      const ix = Math.min(b.x1, o.x1) - Math.max(b.x0, o.x0);
      const iy = Math.min(b.y1, o.y1) - Math.max(b.y0, o.y0);
      return ix > 0 && iy > 0 ? sum + ix * iy : sum;
    }, 0);
    const outside = (b) => Math.max(0, safe.x0 - b.x0) + Math.max(0, b.x1 - safe.x1) + Math.max(0, safe.y0 - b.y0) + Math.max(0, b.y1 - safe.y1);
    const measure = (el) => {
      el.setAttribute('font-size', (Number(el.dataset.px) * k).toFixed(3));
      try { const bb = el.getBBox(); return [bb.width / k + 4, Math.max(bb.height / k, Number(el.dataset.px) * 1.25)]; } catch (_) { return [60, 16]; }
    };
    const kwP = px(KW);
    taken.push(box(kwP[0], kwP[1], 14, 14));
    placed.forEach((it) => { const p = px(it.place.xy); taken.push(box(p[0], p[1], 9, 9)); });

    /* أفضل موضع حول نقطة: الجهة الأقرب إلى «بعيدًا عن الكويت» أولًا، ثم مسافات أبعد */
    const best = (p, w, h, prefer) => {
      let win = null;
      GAPS.forEach((gap, gi) => {
        DIRS.forEach(([ux, uy]) => {
          const diag = ux && uy ? 0.7 : 1;
          const cx = p[0] + ux * (gap * diag + w / 2);
          const cy = p[1] + uy * (gap * diag + h / 2);
          const b = box(cx, cy, w, h);
          const ang = Math.acos(Math.max(-1, Math.min(1, (ux * prefer[0] + uy * prefer[1]) / Math.hypot(ux, uy))));
          const score = overlap(b) * 1.5 + outside(b) * 40 + gi * 9 + ang * 3 + (uy === 0 ? 0 : 0.5);
          if (!win || score < win.score) win = { score, b, cx, cy, gi };
        });
      });
      return win;
    };
    const leaderFor = (p, b) => {
      const qx = Math.min(Math.max(p[0], b.x0), b.x1);
      const qy = Math.min(Math.max(p[1], b.y0), b.y1);
      const dx = qx - p[0]; const dy = qy - p[1];
      const len = Math.hypot(dx, dy) || 1;
      return [dx / len * 4.5, dy / len * 4.5, dx - dx / len * 2, dy - dy / len * 2];
    };

    const next = new Map();
    /* الكويت أولًا: الاسم والملاحظة كتلة واحدة، شمالًا شرقيًا ما أمكن (الجهة الأقل ازدحامًا بالمسارات) */
    const kwName = svg.querySelector('[data-slot="kw-name"]');
    const kwNote = svg.querySelector('[data-slot="kw-note"]');
    if (kwName) {
      const [w1, h1] = measure(kwName);
      const [w2, h2] = kwNote ? measure(kwNote) : [0, 0];
      const w = Math.max(w1, w2);
      const h = h1 + h2;
      const win = best(kwP, w, h, [0.75, -0.66]);
      taken.push(win.b);
      next.set('kw-name', { ox: win.cx - kwP[0], oy: win.b.y0 + h1 / 2 - kwP[1] });
      if (kwNote) next.set('kw-note', { ox: win.cx - kwP[0], oy: win.b.y0 + h1 + h2 / 2 - kwP[1] });
    }

    /* الأكثر ازدحامًا يختار أولًا */
    const pts = placed.map((it) => ({ it, p: px(it.place.xy) }));
    const crowd = (a) => pts.filter((o) => o !== a && Math.hypot(o.p[0] - a.p[0], o.p[1] - a.p[1]) < 70).length;
    pts.sort((a, b) => crowd(b) - crowd(a));
    pts.forEach((entry) => {
      const { it, p } = entry;
      const el = svg.querySelector(`[data-label][data-key="${CSS.escape(it.key)}"]`);
      if (!el) return;
      const [w, h] = measure(el);
      const offstage = p[0] < 0 || p[0] > sw || p[1] < 0 || p[1] > sh;
      if (offstage) {
        /* خارج الإطار: الاسم عند الحافة حيث يخرج المسار */
        let last = kwP;
        for (let i = 1; i <= 60; i += 1) {
          const q = px(bez(KW, it.arc.c, it.place.xy, i / 60));
          if (q[0] < safe.x0 || q[0] > safe.x1 || q[1] < safe.y0 || q[1] > safe.y1) break;
          last = q;
        }
        const cx = Math.min(Math.max(last[0], safe.x0 + w / 2), safe.x1 - w / 2);
        let cy = Math.min(Math.max(last[1] - h * 0.9, safe.y0 + h / 2), safe.y1 - h / 2);
        if (overlap(box(cx, cy, w, h)) > 0) cy = Math.min(cy + h * 1.8, safe.y1 - h / 2);
        const b = box(cx, cy, w, h);
        taken.push(b);
        next.set(it.key, { edge: true, ax: cx, ay: cy });
        return;
      }
      const dx = p[0] - kwP[0]; const dy = p[1] - kwP[1];
      const len = Math.hypot(dx, dy) || 1;
      const win = best(p, w, h, [dx / len, dy / len]);
      taken.push(win.b);
      next.set(it.key, { ox: win.cx - p[0], oy: win.cy - p[1], leader: win.gi >= LEADER_FROM ? leaderFor(p, win.b) : null });
    });
    spots.current = next;
    svg.querySelectorAll('[data-label]').forEach((el) => {
      const sp = next.get(el.dataset.slot);
      el.classList.toggle(s.edgeLabel, Boolean(sp && sp.edge));
    });
  }, [placed]);

  const moveCam = useCallback((to, duration = 0.8, ease = 'power2.inOut', onComplete) => {
    if (camTween.current) camTween.current.kill();
    if (!duration) { Object.assign(cam.current, to); applyCam(); if (onComplete) onComplete(); return null; }
    camTween.current = gsap.to(cam.current, { ...to, duration, ease, onUpdate: applyCam, onComplete });
    return camTween.current;
  }, [applyCam]);

  /* حركة كاميرا تُضاف إلى خط زمني (لا تُلغي غيرها، بخلاف moveCam التفاعلية) */
  const camTo = useCallback((to, duration, ease = 'power1.inOut') => gsap.to(cam.current, { ...to, duration, ease, onUpdate: applyCam }), [applyCam]);

  /* ── حساب المشاهد حسب نسبة المسرح ── */
  const computeViews = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return null;
    const aspect = stage.clientWidth / Math.max(1, stage.clientHeight);
    const narrow = aspect < 1.35;
    const all = [KW, ...placed.map((it) => it.place.xy)];
    const regional = [KW, ...placed.filter((it) => it.place.group <= 2 || it.key === 'United Kingdom').map((it) => it.place.xy)];
    const final = narrow ? withLabelRoom(regional, aspect, 0.1) : fit(all, aspect, 0.12);
    const v = { narrow, aspect, final, start: closer(final, narrow ? 1.3 : 1.45) };
    views.current = v;
    return v;
  }, [placed]);

  /* ── التشغيل — قبل الرسم، كي لا تظهر المسارات مرسومة ثم تُطوى عند التنقّل داخل الموقع ── */
  useLayoutEffect(() => {
    const root = rootRef.current;
    const svg = svgRef.current;
    if (!root || !svg) return undefined;
    const html = document.documentElement;
    const v = computeViews();
    if (!v) return undefined;

    const q = (sel) => Array.from(svg.querySelectorAll(sel));
    const arcs = q('[data-arc]');
    const nodes = q('[data-node]');
    const labels = q('[data-label]:not([data-kw])');
    const leaders = q('[data-leader]');
    const kwParts = q('[data-kw]');
    const land = q('[data-land]');
    const byKey = (list, key) => list.filter((el) => el.dataset.key === key);
    const group = (g) => placed.filter((it) => it.place.group === g).map((it) => it.key);
    const handBack = () => gsap.set([...arcs, ...nodes, ...labels, ...leaders, ...kwParts, ...land], { clearProps: 'opacity' });

    const seen = readSeen(SEEN_KEY[variant]);
    const reduced = reducedMotion();
    const done = () => {
      if (html.getAttribute('data-intl') === 'play') html.setAttribute('data-intl', 'done');
      handBack();
      setReady(true);
    };
    const finalState = () => {
      layout(v.final);
      gsap.set(arcs, { strokeDasharray: 1, strokeDashoffset: 0 });
      moveCam(v.final, 0);
      done();
    };

    let io = null;
    const lowPower = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || (navigator.connection && navigator.connection.saveData);
    const camera = variant === 'full' && !lowPower;

    const play = () => {
      markSeen(SEEN_KEY[variant]);
      layout(v.final);
      gsap.set(arcs, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set([...nodes, ...labels, ...leaders, ...kwParts, ...land], { opacity: 0 });
      moveCam(camera ? v.start : v.final, 0);

      const tl = gsap.timeline({ onComplete: done });
      tlRef.current = tl;

      /* ١ — الخريطة تظهر، والكاميرا تبدأ تراجعها البطيء (حركة واحدة طوال المشهد) */
      tl.to(land, { opacity: 1, duration: 1.2, ease: 'power1.out' }, 0);
      if (camera) tl.add(camTo(v.final, 4.9, 'power1.inOut'), 0.1);

      /* ٢ — الكويت واسمها */
      tl.to(kwParts, { opacity: 1, duration: 0.9, ease: 'power2.out', stagger: 0.05 }, 0.35);

      /* ٣ — المسارات بمجموعات جغرافية؛ النقطة واسمها يظهران حين يبلغها المسار */
      const drawGroup = (keys, at, dur) => {
        keys.forEach((key, i) => {
          const t = at + i * 0.14;
          tl.to(byKey(arcs, key), { strokeDashoffset: 0, duration: dur, ease: 'power2.inOut' }, t)
            .to([...byKey(nodes, key), ...byKey(labels, key), ...byKey(leaders, key)], { opacity: 1, duration: 0.55, ease: 'power1.out' }, t + dur * 0.8);
        });
      };
      if (camera) {
        drawGroup(group(1), 1.0, 0.9);
        drawGroup(group(2), 2.05, 1.0);
        drawGroup(group(3), 3.0, 1.3);
      } else {
        drawGroup(group(1), 0.6, 0.7);
        drawGroup(group(2), 1.1, 0.75);
        drawGroup(group(3), 1.55, 0.9);
      }
    };

    if (reduced || seen) {
      finalState();
      if (seen && !reduced) gsap.fromTo(root, { opacity: 0.4 }, { opacity: 1, duration: 0.5, ease: 'power1.out' });
    } else if (variant === 'preview') {
      /* المعاينة: الحالة النهائية مخفية حتى يدخل القسم الشاشة (يكون عادةً خارجها عند التحميل) */
      layout(v.final);
      gsap.set(arcs, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set([...nodes, ...labels, ...leaders, ...kwParts], { opacity: 0 });
      moveCam(v.final, 0);
      io = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { io.disconnect(); io = null; play(); }
      }, { threshold: 0.35 });
      io.observe(root);
    } else {
      play();
    }

    let lastW = stageRef.current.clientWidth;
    let lastH = stageRef.current.clientHeight;
    const ro = new ResizeObserver(() => {
      const st = stageRef.current;
      if (!st || (Math.abs(st.clientWidth - lastW) < 2 && Math.abs(st.clientHeight - lastH) < 2)) return;
      lastW = st.clientWidth; lastH = st.clientHeight;
      const nv = computeViews();
      if (!nv) return;
      if (tlRef.current && tlRef.current.isActive()) tlRef.current.progress(1);
      layout(nv.final);
      moveCam(nv.final, 0);
    });
    ro.observe(stageRef.current);

    /* الخطوط تُقاس بعد تحميل الخط العربي؛ نعيد التوزيع حين يجهز */
    let alive = true;
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (!alive || !views.current) return;
        layout(views.current.final);
        applyCam();
      });
    }

    return () => {
      alive = false;
      if (io) io.disconnect();
      ro.disconnect();
      if (tlRef.current) tlRef.current.kill();
      if (camTween.current) camTween.current.kill();
      if (html.getAttribute('data-intl') === 'play') html.setAttribute('data-intl', 'done');
    };
  }, [variant, placed, computeViews, moveCam, camTo, layout, applyCam]);

  /* التفاعل أثناء المشهد يُنهيه فورًا */
  useEffect(() => {
    if (current && tlRef.current && tlRef.current.isActive()) tlRef.current.progress(1);
  }, [current]);

  /* على المسرح الضيّق: الدولة المثبّتة تُؤطَّر مع الكويت، والأسماء تُعاد توزيعها على الإطار الجديد */
  const lastPin = useRef(null);
  useEffect(() => {
    const v = views.current;
    const svg = svgRef.current;
    if (!v || !ready || !v.narrow || !svg) return;
    if (lastPin.current === pinned) return;
    lastPin.current = pinned;
    const it = pinned ? placed.find((p) => p.key === pinned) : null;
    const to = it ? withLabelRoom([KW, it.place.xy], v.aspect, 0.3, 110) : v.final;
    const names = Array.from(svg.querySelectorAll('[data-names]'));
    gsap.to(names, { opacity: 0, duration: 0.2, ease: 'power1.out' });
    moveCam(to, 0.8, 'power2.inOut', () => {
      layout(to);
      applyCam();
      gsap.to(names, { opacity: 1, duration: 0.35, ease: 'power1.out' });
    });
    if (it) {
      /* الخريطة يجب أن تُرى وهي تتحرك: إن خرجت من الشاشة نعيدها إليها */
      const r = stageRef.current && stageRef.current.getBoundingClientRect();
      if (r && (r.top < 0 || r.bottom > window.innerHeight)) stageRef.current.scrollIntoView({ block: 'center', behavior: reducedMotion() ? 'auto' : 'smooth' });
    }
  }, [pinned, ready, placed, moveCam, layout, applyCam]);

  const hoverable = () => { try { return window.matchMedia('(hover: hover)').matches; } catch (_) { return false; } };
  const enter = (key) => () => { if (hoverable()) setActive(key); };
  const leave = () => { if (hoverable()) setActive(null); };

  const ok = (key) => (current === key ? s.on : '');
  const viewBox0 = `0 0 ${W} ${H}`;

  return (
    <div
      ref={rootRef}
      className={`${s.root} ${variant === 'preview' ? s.preview : s.full} ${current ? s.focus : ''} ${ready ? s.ready : ''}`}
      onKeyDown={(e) => { if (e.key === 'Escape') { setPinned(null); setActive(null); } }}
    >
      <div ref={stageRef} className={s.stage}>
        <svg ref={svgRef} className={s.svg} viewBox={viewBox0} preserveAspectRatio="xMidYMid meet" role="img" aria-label={mapLabel}>
          <defs>
            <radialGradient id={`kw-glow-${variant}`}>
              <stop offset="0" stopColor="#E9CF98" stopOpacity="0.32" />
              <stop offset="0.45" stopColor="#C9A86A" stopOpacity="0.08" />
              <stop offset="1" stopColor="#C9A86A" stopOpacity="0" />
            </radialGradient>
          </defs>
          <image data-land className={s.land} href={MAP.land} x="0" y="0" width={W} height={H} />
          <g aria-hidden="true">
            {placed.map((it) => (
              <path key={`s-${it.key}`} data-key={it.key} className={`${s.shape} ${ok(it.key)}`} d={it.place.shape}
                onPointerEnter={enter(it.key)} onPointerLeave={leave} />
            ))}
            <path data-kw className={s.kwShape} d={ANCHOR.shape} />
            <circle data-kw className={s.kwGlow} cx={KW[0]} cy={KW[1]} data-r="22" r="22" fill={`url(#kw-glow-${variant})`} />
          </g>
          <g aria-hidden="true">
            {placed.map((it) => (
              <g key={`a-${it.key}`}>
                <path data-arc data-key={it.key} className={`${s.arc} ${ok(it.key)}`} d={it.arc.d} pathLength="1" />
                <path className={s.hit} d={it.arc.d} onPointerEnter={enter(it.key)} onPointerLeave={leave} />
              </g>
            ))}
          </g>
          <g aria-hidden="true">
            {placed.map((it) => (
              <circle key={`n-${it.key}`} data-node data-key={it.key} className={`${s.node} ${ok(it.key)}`}
                cx={it.place.xy[0]} cy={it.place.xy[1]} data-r="3" r="3"
                onPointerEnter={enter(it.key)} onPointerLeave={leave} />
            ))}
            <circle data-kw className={s.kwCore} cx={KW[0]} cy={KW[1]} data-r="4.2" r="4.2" />
          </g>
          <g aria-hidden="true" data-names>
            {placed.map((it) => (
              <line key={`ld-${it.key}`} data-leader data-key={it.key} data-at={`${it.place.xy[0]},${it.place.xy[1]}`}
                className={`${s.leader} ${ok(it.key)}`} x1={it.place.xy[0]} y1={it.place.xy[1]} x2={it.place.xy[0]} y2={it.place.xy[1]} visibility="hidden" />
            ))}
            {placed.map((it) => (
              <text key={`l-${it.key}`} data-label data-slot={it.key} data-key={it.key} data-px={LABEL_PX}
                data-at={`${it.place.xy[0]},${it.place.xy[1]}`}
                className={`${s.label} ${ok(it.key)}`} x={it.place.xy[0]} y={it.place.xy[1]}
                textAnchor="middle" dominantBaseline="central" fontSize={LABEL_PX}>{it.label}</text>
            ))}
            <text data-kw data-label data-slot="kw-name" data-px={KW_NAME_PX} data-at={`${KW[0]},${KW[1]}`}
              className={s.kwLabel} x={KW[0]} y={KW[1]} textAnchor="middle" dominantBaseline="central" fontSize={KW_NAME_PX}>{anchorLabel}</text>
            {anchorNote && (
              <text data-kw data-label data-slot="kw-note" data-px={KW_NOTE_PX} data-at={`${KW[0]},${KW[1]}`}
                className={s.kwNote} x={KW[0]} y={KW[1]} textAnchor="middle" dominantBaseline="central" fontSize={KW_NOTE_PX}>{anchorNote}</text>
            )}
          </g>
        </svg>
      </div>

      <div className={s.listWrap}>
        {listLabel && <span className={s.listLabel} id={`intl-list-${variant}`}>{listLabel}</span>}
        <ul className={s.list} aria-labelledby={listLabel ? `intl-list-${variant}` : undefined}>
          {items.map((it) => (
            <li key={it.key}>
              <button
                type="button"
                className={`${s.chip} ${current === it.key ? s.chipOn : ''}`}
                aria-pressed={pinned === it.key}
                onMouseEnter={() => setActive(it.key)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(it.key)}
                onBlur={() => setActive(null)}
                onClick={() => setPinned((p) => (p === it.key ? null : it.key))}
              >
                {it.label}
              </button>
            </li>
          ))}
        </ul>
        {hint && <p className={s.hint}>{hint}</p>}
      </div>
    </div>
  );
}

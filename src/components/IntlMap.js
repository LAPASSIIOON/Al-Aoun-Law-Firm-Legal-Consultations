'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MAP, ANCHOR, PLACES, ALIASES } from '@/lib/intl-map-data.js';
import s from './IntlMap.module.css';

/* ═══ «الكويت مرتكزًا» — خريطة التنسيق الدولي ═══
 *
 * الخريطة كلها من المتصفح: يابسة Natural Earth (ملف SVG ثابت) وأشكال الدول ونقاط العواصم مسقطة
 * مسبقًا بإسقاط Equal Earth واحد (scripts/build-intl-map.mjs). الخطوط منحنيات بين إحداثيات العواصم
 * الحقيقية — تمثّل نطاق التنسيق والإحالة، لا مكاتب ولا فروعًا. كل الدول بمعاملة بصرية واحدة؛
 * الكويت وحدها المرتكز.
 *
 * المشهد (variant="full"): العالم يظهر ← الكاميرا تقترب من الكويت ← المسارات تمتد بمجموعات
 * جغرافية (الخليج، ثم المشرق وتركيا، ثم البعيد) والكاميرا تتراجع معها ← حالة تفاعلية.
 * المعاينة (variant="preview"): العالم ثابت، والمسارات تُرسم مرة واحدة حين يدخل القسم الشاشة.
 * مرة واحدة في الجلسة؛ مع «تقليل الحركة» تُعرض الحالة النهائية مباشرة.
 */

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const SEEN_KEY = { full: 'aloun-intl-seen', preview: 'aloun-intl-preview-seen' };
const W = MAP.width;
const H = MAP.height;
const KW = ANCHOR.xy;

const placeFor = (key) => PLACES.find((p) => p.key === (ALIASES[key] || key)) || null;

/* منحنى رباعي بين نقطتين مسقطتين، ينحني دائمًا نحو الشمال (أعلى الخريطة) بقدر يتناسب مع المسافة. */
function arcD(a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  let nx = -dy / len;
  let ny = dx / len;
  if (ny > 0) { nx = -nx; ny = -ny; }
  const lift = Math.max(5, len * 0.22);
  const cx = (a[0] + b[0]) / 2 + nx * lift;
  const cy = (a[1] + b[1]) / 2 + ny * lift;
  return `M${a[0]},${a[1]} Q${cx.toFixed(1)},${cy.toFixed(1)} ${b[0]},${b[1]}`;
}

/* صندوق كاميرا يضمّ النقاط بهامش، بنسبة أبعاد المسرح. */
function fit(points, aspect, pad = 0.18, minW = 60) {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  let x0 = Math.min(...xs); let x1 = Math.max(...xs);
  let y0 = Math.min(...ys); let y1 = Math.max(...ys);
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

function readSeen(key) { try { return window.sessionStorage.getItem(key) === '1'; } catch (_) { return false; } }
function markSeen(key) { try { window.sessionStorage.setItem(key, '1'); } catch (_) { /* اختياري */ } }
const reducedMotion = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (_) { return false; } };

export default function IntlMap({ countries, variant = 'full', anchorLabel, mapLabel, listLabel, hint }) {
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const svgRef = useRef(null);
  const sweepRef = useRef(null);
  const cam = useRef({ x: 0, y: 0, w: W, h: H });
  const views = useRef(null);
  const tlRef = useRef(null);
  const camTween = useRef(null);
  const [active, setActive] = useState(null);
  const [pinned, setPinned] = useState(null);
  const [ready, setReady] = useState(false);

  const items = useMemo(() => countries.map((c) => {
    const place = placeFor(c.key);
    return { key: c.key, label: c.label, place, d: place ? arcD(KW, place.xy) : null };
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
    svg.querySelectorAll('[data-label]').forEach((el) => {
      const [px, py] = el.dataset.at.split(',').map(Number);
      const dx = px - KW[0]; const dy = py - KW[1];
      const len = Math.hypot(dx, dy) || 1;
      const off = 9 * k;
      el.setAttribute('x', (px + (dx / len) * off).toFixed(2));
      el.setAttribute('y', (py + (dy / len) * off + 4 * k).toFixed(2));
      el.setAttribute('text-anchor', dx >= 0 ? 'start' : 'end');
      el.setAttribute('font-size', (13 * k).toFixed(3));
    });
    /* اسم الكويت إلى الشمال الشرقي منها — الجهة الأقلّ ازدحامًا بالمسارات — ويمتدّ شرقًا في الاتجاهين */
    const kwLabel = svg.querySelector('[data-kw-label]');
    if (kwLabel) {
      const rtl = window.getComputedStyle(svg).direction === 'rtl';
      kwLabel.setAttribute('x', (KW[0] + 12 * k).toFixed(2));
      kwLabel.setAttribute('y', (KW[1] - 10 * k).toFixed(2));
      kwLabel.setAttribute('text-anchor', rtl ? 'end' : 'start');
      kwLabel.setAttribute('font-size', (13.5 * k).toFixed(3));
    }
  }, []);

  const moveCam = useCallback((to, duration = 0.8, ease = 'power2.inOut') => {
    if (camTween.current) camTween.current.kill();
    if (!duration) { Object.assign(cam.current, to); applyCam(); return null; }
    camTween.current = gsap.to(cam.current, { ...to, duration, ease, onUpdate: applyCam });
    return camTween.current;
  }, [applyCam]);

  /* حركة كاميرا تُضاف إلى خط زمني (لا تُلغي غيرها، بخلاف moveCam التفاعلية) */
  const camTo = useCallback((to, duration, ease = 'power2.inOut') => gsap.to(cam.current, { ...to, duration, ease, onUpdate: applyCam }), [applyCam]);

  /* ── حساب المشاهد حسب نسبة المسرح ── */
  const computeViews = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return null;
    const aspect = stage.clientWidth / Math.max(1, stage.clientHeight);
    const narrow = aspect < 1.35;
    const pts = (g) => placed.filter((it) => it.place.group <= g).map((it) => it.place.xy);
    const all = [KW, ...placed.map((it) => it.place.xy)];
    const regional = [KW, ...pts(2), ...placed.filter((it) => it.key === 'United Kingdom').map((it) => it.place.xy)];
    const v = {
      narrow,
      aspect,
      kuwait: fit([KW], aspect, 0, narrow ? 120 : 150),
      g1: fit([KW, ...pts(1)], aspect, narrow ? 0.35 : 0.6),
      g2: fit([KW, ...pts(2)], aspect, narrow ? 0.2 : 0.35),
      final: narrow ? fit(regional, aspect, 0.08) : fit(all, aspect, 0.06),
    };
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
    const glints = q('[data-glint]');
    const nodes = q('[data-node]');
    const labels = q('[data-label]');
    const kwParts = q('[data-kw]');
    const land = q('[data-land]');
    const byKey = (list, key) => list.filter((el) => el.dataset.key === key);
    const group = (g) => placed.filter((it) => it.place.group === g).map((it) => it.key);

    const seen = readSeen(SEEN_KEY[variant]);
    const reduced = reducedMotion();
    const finalState = () => {
      gsap.set(arcs, { strokeDasharray: 1, strokeDashoffset: 0, opacity: '' });
      gsap.set([...nodes, ...kwParts, ...land], { opacity: 1 });
      gsap.set(glints, { opacity: 0 });
      gsap.set(labels, { opacity: '' });
      moveCam(v.final, 0);
      if (html.getAttribute('data-intl') === 'play') html.setAttribute('data-intl', 'done');
      setReady(true);
    };

    let io = null;
    let ro = null;
    const lowPower = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || (navigator.connection && navigator.connection.saveData);
    const simple = variant === 'preview' || v.narrow || lowPower;

    const play = () => {
      markSeen(SEEN_KEY[variant]);
      gsap.set(arcs, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(glints, { strokeDasharray: '0.07 1.2', strokeDashoffset: 0.07, opacity: 0 });
      gsap.set([...nodes, ...kwParts], { opacity: 0 });
      gsap.set(labels, { opacity: 0 });
      gsap.set(land, { opacity: 0 });
      moveCam(v.final, 0);

      const tl = gsap.timeline({
        onComplete: () => {
          if (html.getAttribute('data-intl') === 'play') html.setAttribute('data-intl', 'done');
          gsap.set(labels, { opacity: '' });
          setReady(true);
        },
      });
      tlRef.current = tl;

      /* ١ — العالم يظهر، ويعبره ضوء دافئ واحد */
      tl.to(land, { opacity: 1, duration: simple ? 0.6 : 1.0, ease: 'power1.out' }, 0);
      if (sweepRef.current) tl.fromTo(sweepRef.current, { xPercent: -120, opacity: 0 }, { xPercent: 120, opacity: 1, duration: 1.8, ease: 'power1.inOut' }, 0.15)
        .to(sweepRef.current, { opacity: 0, duration: 0.4 }, 1.6);

      /* ٢ — الكويت */
      if (!simple) tl.add(camTo(v.kuwait, 1.15), 0.55);
      tl.to(kwParts, { opacity: 1, duration: 0.7, ease: 'power2.out', stagger: 0.08 }, simple ? 0.35 : 1.15);

      /* ٣ — المسارات بمجموعات جغرافية */
      const drawGroup = (keys, at, dur, flashLabels) => {
        keys.forEach((key, i) => {
          const t = at + i * (simple ? 0.08 : 0.15);
          tl.to(byKey(arcs, key), { strokeDashoffset: 0, duration: dur, ease: 'power2.inOut' }, t)
            .to(byKey(nodes, key), { opacity: 1, duration: 0.35, ease: 'power1.out' }, t + dur * 0.85);
          if (!simple) {
            tl.to(byKey(glints, key), { opacity: 1, duration: 0.1 }, t + dur * 0.3)
              .to(byKey(glints, key), { strokeDashoffset: -1, duration: dur * 1.1, ease: 'power1.inOut' }, t + dur * 0.3)
              .to(byKey(glints, key), { opacity: 0, duration: 0.25 }, t + dur * 1.3);
          }
          if (flashLabels) {
            tl.to(byKey(labels, key), { opacity: 1, duration: 0.3 }, t + dur * 0.8)
              .to(byKey(labels, key), { opacity: 0, duration: 0.4 }, t + dur * 0.8 + 1.1);
          }
        });
      };
      if (simple) {
        drawGroup(group(1), 0.7, 0.6, false);
        drawGroup(group(2), 1.05, 0.65, false);
        drawGroup(group(3), 1.35, 0.8, false);
      } else {
        tl.add(camTo(v.g1, 0.85), 1.75);
        drawGroup(group(1), 2.0, 0.7, true);
        tl.add(camTo(v.g2, 0.9), 3.05);
        drawGroup(group(2), 3.3, 0.75, true);
        tl.add(camTo(v.final, 1.1), 4.15);
        drawGroup(group(3), 4.4, 0.95, false);
      }
    };

    if (reduced || seen) {
      finalState();
      if (seen && !reduced) gsap.fromTo(root, { opacity: 0.4 }, { opacity: 1, duration: 0.5, ease: 'power1.out' });
    } else if (variant === 'preview') {
      /* المعاينة: الحالة النهائية مخفية حتى يدخل القسم الشاشة (يكون عادةً خارجها عند التحميل) */
      gsap.set(arcs, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set([...nodes, ...kwParts], { opacity: 0 });
      moveCam(v.final, 0);
      io = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { io.disconnect(); io = null; play(); }
      }, { threshold: 0.35 });
      io.observe(root);
    } else {
      play();
    }

    /* ٥ — مع التمرير تنحسر الخريطة قليلًا وتفسح للمحتوى (سطح المكتب، بلا «تقليل الحركة») */
    let scroll = null;
    if (variant === 'full' && !reduced && !v.narrow) {
      scroll = gsap.to(stageRef.current, {
        yPercent: -7, opacity: 0.7, ease: 'none',
        scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: 0.6 },
      });
    }

    /* الحركة الخافتة للكويت تتوقف خارج الشاشة */
    const pulse = new IntersectionObserver(([e]) => { root.dataset.offscreen = e.isIntersecting ? 'false' : 'true'; });
    pulse.observe(root);

    let lastW = stageRef.current.clientWidth;
    let lastH = stageRef.current.clientHeight;
    ro = new ResizeObserver(() => {
      const st = stageRef.current;
      if (!st || (Math.abs(st.clientWidth - lastW) < 2 && Math.abs(st.clientHeight - lastH) < 2)) return;
      lastW = st.clientWidth; lastH = st.clientHeight;
      const nv = computeViews();
      if (!nv) return;
      if (tlRef.current && tlRef.current.isActive()) tlRef.current.progress(1);
      moveCam(nv.final, 0);
    });
    ro.observe(stageRef.current);

    return () => {
      if (io) io.disconnect();
      if (scroll) { if (scroll.scrollTrigger) scroll.scrollTrigger.kill(); scroll.kill(); }
      pulse.disconnect();
      if (ro) ro.disconnect();
      if (tlRef.current) tlRef.current.kill();
      if (camTween.current) camTween.current.kill();
      if (html.getAttribute('data-intl') === 'play') html.setAttribute('data-intl', 'done');
    };
  }, [variant, placed, computeViews, moveCam, camTo]);

  /* التفاعل أثناء المشهد يُنهيه فورًا */
  useEffect(() => {
    if (current && tlRef.current && tlRef.current.isActive()) tlRef.current.progress(1);
  }, [current]);

  /* على المسرح الضيّق: الدولة المثبّتة تُؤطَّر مع الكويت */
  useEffect(() => {
    const v = views.current;
    if (!v || !ready) return;
    if (!v.narrow) return;
    if (pinned) {
      const it = placed.find((p) => p.key === pinned);
      if (it) moveCam(fit([KW, it.place.xy], v.aspect, 0.45, 110), 0.8);
      /* الخريطة يجب أن تُرى وهي تتحرك: إن خرجت من الشاشة نعيدها إليها */
      const r = stageRef.current && stageRef.current.getBoundingClientRect();
      if (r && (r.top < 0 || r.bottom > window.innerHeight)) stageRef.current.scrollIntoView({ block: 'center', behavior: reducedMotion() ? 'auto' : 'smooth' });
    } else {
      moveCam(v.final, 0.8);
    }
  }, [pinned, ready, placed, moveCam]);

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
              <stop offset="0" stopColor="#F1D9A4" stopOpacity="0.55" />
              <stop offset="0.35" stopColor="#C9A86A" stopOpacity="0.18" />
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
            <circle data-kw className={s.kwGlow} cx={KW[0]} cy={KW[1]} data-r="38" r="38" fill={`url(#kw-glow-${variant})`} />
          </g>
          <g aria-hidden="true">
            {placed.map((it) => (
              <g key={`a-${it.key}`}>
                <path data-arc data-key={it.key} className={`${s.arc} ${ok(it.key)}`} d={it.d} pathLength="1" />
                <path data-glint data-key={it.key} className={s.glint} d={it.d} pathLength="1" />
                <path className={s.hit} d={it.d} onPointerEnter={enter(it.key)} onPointerLeave={leave} />
              </g>
            ))}
          </g>
          <g aria-hidden="true">
            {placed.map((it) => (
              <circle key={`n-${it.key}`} data-node data-key={it.key} className={`${s.node} ${ok(it.key)}`}
                cx={it.place.xy[0]} cy={it.place.xy[1]} data-r="3.4" r="3.4"
                onPointerEnter={enter(it.key)} onPointerLeave={leave} />
            ))}
            <g data-kw>
              <circle className={s.kwRing} cx={KW[0]} cy={KW[1]} data-r="6" r="6" />
              <circle className={`${s.kwRing} ${s.kwRing2}`} cx={KW[0]} cy={KW[1]} data-r="6" r="6" />
              <circle className={s.kwCore} cx={KW[0]} cy={KW[1]} data-r="4.6" r="4.6" />
            </g>
          </g>
          <g aria-hidden="true">
            {placed.map((it) => (
              <text key={`l-${it.key}`} data-label data-key={it.key} data-at={`${it.place.xy[0]},${it.place.xy[1]}`}
                className={`${s.label} ${ok(it.key)}`} x={it.place.xy[0]} y={it.place.xy[1]} fontSize="13">{it.label}</text>
            ))}
            <text data-kw data-kw-label className={s.kwLabel} x={KW[0]} y={KW[1] + 22} textAnchor="middle" fontSize="13.5">{anchorLabel}</text>
          </g>
        </svg>
        <span ref={sweepRef} className={s.sweep} aria-hidden="true" />
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

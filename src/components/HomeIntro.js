'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import styles from './HomeIntro.module.css';
import { MARK_VIEWBOX, MARK_TRANSFORM, MARK_A, MARK_G, MARK_RING } from './siteLoaderMark.js';
import { INTRO_SESSION_KEY } from '@/lib/intro-gate.js';

/* ═══ المقدمة السينمائية للرئيسية — «الصفحة تنفتح حول الشعار» ═══
 *
 * ١ الوصول: العلامة تدخل من الزاوية العلوية (يمين في العربية، يسار في الإنجليزية) والاسم يصعد من الأسفل.
 * ٢ الالتقاء: يكتمل التوقيع في المركز، ويعبر العلامةَ ضوءٌ واحد.
 * ٣ الحركة: يصغر التوقيع ويتحرّك إلى مكانه الحقيقي في الصفحة، مقيسًا من الـDOM لحظة التشغيل:
 *    - سطح المكتب: العلامة إلى العلامة الثلاثية في لوح صورة الهيرو، والاسم والسطر إلى نصّ الهيدر.
 *    - الهاتف (لا صورة في الهيرو): التوقيع كله إلى توقيع الهيدر.
 * ٤ الكشف: الخلفية تنفتح دائريًا من حول نقطة الوصول، فتظهر الصفحة حول الشعار، ثم يدخل محتوى الهيرو تباعًا.
 *
 * العناصر الطائرة توضَع من البداية في صناديق الوجهة نفسها (left/top/width/height)، وكل الحركة
 * تحويلات نسبية إليها، تنتهي عند الصفر. فالهبوط مطابق بالبناء، لا بتقريب الإحداثيات.
 * الشعار والنص هنا SVG/HTML حقيقيان؛ الذكاء الاصطناعي (Higgsfield) صنع الخلفية فقط.
 */

/* هندسة الأصل /brand/hero-mark-3d.webp (1672×941): صندوق العلامة بالبكسل داخل الصورة، مقيس من الملف.
   إن استُبدلت صورة الهيرو يجب إعادة قياس هذه القيم. */
const HERO_IMG = { w: 1672, h: 941 };
const HERO_EMBLEM = { x: 172, y: 255, w: 508, h: 455 };
/* حدود رسم العلامة داخل viewBox الخاص بها (0 0 2898 2600)، مقيسة بـgetBBox. */
const MARK_BOX = { x: 126.5, y: 123, w: 2678.5, h: 2361.5 };
const VIEW_W = 2898;
const VIEW_H = 2600;
/* إن تأخّر الترطيب أكثر من هذا (جهاز بطيء/شبكة بطيئة) نختصر: لا وصول، مباشرة إلى الحركة والكشف. */
const LATE_START_MS = 1600;
const FEATHER = 160;

const rectOf = (el) => {
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
};
const centerOf = (r) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });
const isShown = (el) => {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  const cs = window.getComputedStyle(el);
  return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden';
};
const firstShown = (selector) => Array.from(document.querySelectorAll(selector)).find(isShown) || null;
const wait = (ms) => new Promise((resolve) => { window.setTimeout(resolve, ms); });

/* صندوق العلامة الثلاثية كما يرسمه المتصفح: background-size:cover + background-position بالنسبة المئوية. */
function emblemBox(el) {
  const r = rectOf(el);
  const pos = window.getComputedStyle(el).backgroundPosition.split(',')[0].trim().split(/\s+/);
  const pct = (v) => (v && v.endsWith('%') ? parseFloat(v) / 100 : 0.5);
  const s = Math.max(r.w / HERO_IMG.w, r.h / HERO_IMG.h);
  const ox = (r.w - HERO_IMG.w * s) * pct(pos[0]);
  const oy = (r.h - HERO_IMG.h * s) * pct(pos[1]);
  return { x: r.x + ox + HERO_EMBLEM.x * s, y: r.y + oy + HERO_EMBLEM.y * s, w: HERO_EMBLEM.w * s, h: HERO_EMBLEM.h * s };
}

/* صندوق الـsvg الذي يغطّي رسمُه صندوقَ العلامة الثلاثية: العرض نفسه والمركز العمودي نفسه. */
function svgBoxOver(target) {
  const k = target.w / MARK_BOX.w;
  const c = centerOf(target);
  return { x: target.x - MARK_BOX.x * k, y: c.y - (MARK_BOX.y + MARK_BOX.h / 2) * k, w: VIEW_W * k, h: VIEW_H * k };
}

function place(el, r) {
  Object.assign(el.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` });
}

/* إنهاء احتياطي إن أُزيل المكوّن قبل اكتمال المقدمة: يؤجَّل لحظة، لأن React في وضع التطوير
   يزيل التأثير ويعيد تشغيله فورًا — إعادة التشغيل تلغي هذا الإنهاء وتكمل المقدمة. */
let pendingAbort = null;
function abortIntro() {
  const html = document.documentElement;
  if (html.getAttribute('data-intro') !== 'play') return;
  html.setAttribute('data-intro', 'done');
  document.querySelectorAll('[data-intro-target], [data-intro-stagger] > *, [data-intro-stagger] > h1 > span')
    .forEach((el) => { el.style.removeProperty('opacity'); el.style.removeProperty('transform'); });
}

function bounds(rects) {
  const x1 = Math.min(...rects.map((r) => r.x));
  const y1 = Math.min(...rects.map((r) => r.y));
  const x2 = Math.max(...rects.map((r) => r.x + r.w));
  const y2 = Math.max(...rects.map((r) => r.y + r.h));
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
}

export default function HomeIntro() {
  const [done, setDone] = useState(false);
  const rootRef = useRef(null);
  const backdropRef = useRef(null);
  const videoRef = useRef(null);
  const haloRef = useRef(null);
  const glintRef = useRef(null);
  const flyRef = useRef(null);
  const markRef = useRef(null);
  const sheenRef = useRef(null);

  useEffect(() => {
    if (pendingAbort) { window.clearTimeout(pendingAbort); pendingAbort = null; }
    const html = document.documentElement;
    if (html.getAttribute('data-intro') !== 'play') { setDone(true); return undefined; }

    let cancelled = false;
    let finished = false;
    let tl = null;
    const clones = [];
    const cleared = [];
    const prevOverflow = html.style.overflow;
    const video = videoRef.current;

    const speedUp = (factor) => { if (tl) tl.timeScale(factor); };
    const onKey = (e) => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') speedUp(5); };
    const onPointer = () => speedUp(5);
    const onResize = () => speedUp(8);

    const release = () => {
      html.style.overflow = prevOverflow;
      clones.splice(0).forEach((c) => c.remove());
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('resize', onResize);
      try { video.pause(); video.removeAttribute('src'); video.load(); } catch (_) { /* لا شيء */ }
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      html.setAttribute('data-intro', 'done');
      if (cleared.length) gsap.set(cleared, { clearProps: 'opacity,transform,visibility' });
      release();
      setDone(true);
    };

    const run = async () => {
      const startedAt = performance.now();
      try { window.sessionStorage.setItem(INTRO_SESSION_KEY, '1'); } catch (_) { /* التخزين اختياري */ }
      if (window.scrollY > 4) { finish(); return; }
      html.style.overflow = 'hidden';
      window.addEventListener('keydown', onKey);
      window.addEventListener('pointerdown', onPointer);
      window.addEventListener('resize', onResize);

      /* الخلفية: الملصق ظاهر من أول رسم عبر CSS؛ الفيديو يُحمَّل الآن فقط ويظهر حين يبدأ فعلًا. */
      const saveData = navigator.connection && navigator.connection.saveData;
      if (video && !saveData) {
        const portrait = window.matchMedia('(max-aspect-ratio: 1/1)').matches;
        video.src = portrait ? '/media/intro/atmosphere-portrait.mp4' : '/media/intro/atmosphere.mp4';
        video.addEventListener('playing', () => gsap.to(video, { opacity: 1, duration: 0.7, ease: 'power1.out' }), { once: true });
        const p = video.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      }

      /* القياس بعد اكتمال الخطوط: عرض نص الهيدر يتغيّر بتحميلها. */
      await Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), wait(900)]);
      if (cancelled) return;

      const headMarkEl = firstShown('[data-intro-target="mark"]');
      const headNameEl = firstShown('[data-intro-target="name"]');
      const headTagEl = firstShown('[data-intro-target="tagline"]');
      const emblemEl = document.querySelector('[data-intro-target="emblem"]');
      if (!headMarkEl || !headNameEl) { finish(); return; }

      const rtl = html.dir === 'rtl';
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const useEmblem = isShown(emblemEl);

      const headMark = rectOf(headMarkEl);
      const headName = rectOf(headNameEl);
      const headTag = headTagEl ? rectOf(headTagEl) : null;
      const emblem = useEmblem ? emblemBox(emblemEl) : null;
      const markDest = useEmblem ? svgBoxOver(emblem) : headMark;

      /* نسخ نصّ الهيدر نفسه (العقدة ذاتها بأصنافها) — طباعة مطابقة بلا نسخ يدوي للأنماط. */
      const cloneOf = (el, r) => {
        const c = el.cloneNode(true);
        c.removeAttribute('data-intro-target');
        c.setAttribute('aria-hidden', 'true');
        c.classList.add(styles.fly);
        place(c, r);
        flyRef.current.appendChild(c);
        clones.push(c);
        return c;
      };
      const mark = markRef.current;
      place(mark, markDest);
      const name = cloneOf(headNameEl, headName);
      const tag = headTagEl ? cloneOf(headTagEl, headTag) : null;

      /* التوقيع في المركز: هندسة توقيع الهيدر نفسها مكبَّرة. */
      const parts = [headMark, headName, headTag].filter(Boolean);
      const G = bounds(parts);
      const S = Math.min((vw * (vw < 640 ? 0.84 : 0.54)) / G.w, (vh * 0.32) / G.h, 5);
      const C = { x: vw / 2, y: vh * 0.47 };
      const gc = centerOf(G);
      const union = (headRect, destRect) => {
        const hc = centerOf(headRect);
        const dc = centerOf(destRect);
        return { x: C.x + (hc.x - gc.x) * S - dc.x, y: C.y + (hc.y - gc.y) * S - dc.y, scale: (headRect.w * S) / destRect.w };
      };
      const uMark = union(headMark, markDest);
      const uName = union(headName, headName);
      const uTag = headTag ? union(headTag, headTag) : null;

      const focus = useEmblem ? centerOf(emblem) : centerOf(bounds(parts));
      const maxR = Math.max(
        Math.hypot(focus.x, focus.y), Math.hypot(vw - focus.x, focus.y),
        Math.hypot(focus.x, vh - focus.y), Math.hypot(vw - focus.x, vh - focus.y),
      ) + FEATHER;
      const backdrop = backdropRef.current;
      backdrop.style.setProperty('--mx', `${focus.x}px`);
      backdrop.style.setProperty('--my', `${focus.y}px`);

      const glint = glintRef.current;
      if (emblem) place(glint, { x: emblem.x - emblem.w * 0.25, y: emblem.y - emblem.h * 0.25, w: emblem.w * 1.5, h: emblem.h * 1.5 });

      /* querySelectorAll يعيد العناصر بترتيب المستند: الآيبرو، أسطر العنوان، الفقرة، الأزرار. */
      const heroItems = Array.from(document.querySelectorAll('[data-intro-stagger] > :not(h1), [data-intro-stagger] > h1 > span'));
      cleared.push(...heroItems, headMarkEl, headNameEl);
      if (headTagEl) cleared.push(headTagEl);

      const late = startedAt > LATE_START_MS;
      const dirX = rtl ? 1 : -1;
      const flat = { transformOrigin: '50% 50%', force3D: false };
      const ringAndLetters = mark.querySelectorAll('[data-part]');

      gsap.set(mark, { ...flat, x: uMark.x + (late ? 0 : dirX * vw * 0.58), y: uMark.y - (late ? 0 : vh * 0.6), scale: uMark.scale * (late ? 1 : 0.9), opacity: 0 });
      gsap.set(name, { ...flat, x: uName.x, y: uName.y + (late ? 0 : vh * 0.5), scale: uName.scale, opacity: 0 });
      if (tag) gsap.set(tag, { ...flat, x: uTag.x, y: uTag.y + (late ? 0 : vh * 0.5), scale: uTag.scale, opacity: 0 });
      gsap.set(haloRef.current, { xPercent: -50, yPercent: -50, left: C.x, top: C.y, scale: 0.85, opacity: 0 });
      if (video) gsap.set(video, { scale: 1.06, force3D: false });

      tl = gsap.timeline({ onComplete: finish });
      if (video) tl.to(video, { scale: 1, duration: late ? 2.2 : 3.5, ease: 'none' }, 0);

      if (!late) {
        tl.to(haloRef.current, { opacity: 1, scale: 1, duration: 1.3, ease: 'power2.out' }, 0)
          .to(mark, { x: uMark.x, y: uMark.y, scale: uMark.scale, duration: 1.25, ease: 'expo.out' }, 0.1)
          .to(mark, { opacity: 1, duration: 0.6, ease: 'power1.out' }, 0.1)
          .to(name, { y: uName.y, duration: 1.15, ease: 'expo.out' }, 0.3)
          .to(name, { opacity: 1, duration: 0.6, ease: 'power1.out' }, 0.3);
        if (tag) {
          tl.to(tag, { y: uTag.y, duration: 1.1, ease: 'expo.out' }, 0.4)
            .to(tag, { opacity: 1, duration: 0.6, ease: 'power1.out' }, 0.4);
        }
        tl.fromTo(sheenRef.current, { attr: { x: rtl ? VIEW_W : -VIEW_W } }, { attr: { x: rtl ? -VIEW_W : VIEW_W }, duration: 0.95, ease: 'power2.inOut' }, 1.05)
          .addLabel('fly', 1.75);
      } else {
        tl.to(haloRef.current, { opacity: 0.8, scale: 1, duration: 0.3 }, 0)
          .to([mark, name, tag].filter(Boolean), { opacity: 1, duration: 0.3, ease: 'power1.out' }, 0)
          .addLabel('fly', 0.45);
      }

      /* ٣ — الحركة إلى المكان الحقيقي */
      const fly = { x: 0, y: 0, scale: 1, duration: 0.95, ease: 'power3.inOut' };
      tl.to(mark, fly, 'fly')
        .to(haloRef.current, { opacity: 0, duration: 0.7, ease: 'power1.in' }, 'fly');
      if (useEmblem) {
        /* سطح المكتب: العلامة والاسم يفترقان في اتجاهين متعاكسين. الاسم يرتفع أولًا ثم يعبر أفقيًا،
           فيمرّ فوق العلامة لا عبرها. */
        [[name, 0.05], [tag, 0.08]].forEach(([el, at]) => {
          if (!el) return;
          tl.to(el, { y: 0, duration: 0.8, ease: 'power4.out' }, `fly+=${at}`)
            .to(el, { x: 0, scale: 1, duration: 1.0, ease: 'power3.inOut' }, `fly+=${at + 0.06}`);
        });
      } else {
        tl.to(name, fly, 'fly+=0.05');
        if (tag) tl.to(tag, fly, 'fly+=0.08');
      }
      if (!useEmblem) tl.to(ringAndLetters, { fill: '#FFFFFF', duration: 0.6, ease: 'power1.inOut' }, 'fly+=0.25');

      /* ٤ — الصفحة تنفتح حول نقطة الوصول */
      tl.fromTo(backdrop, { '--mr': '0px' }, { '--mr': `${maxR}px`, duration: 1.0, ease: 'power2.in' }, 'fly+=0.4');

      if (useEmblem) {
        /* العلامة المسطّحة تذوب في العلامة الثلاثية تحتها، بضوء خافت لحظة الوصول. */
        tl.fromTo(glint, { opacity: 0, scale: 0.8 }, { opacity: 0.55, scale: 1, duration: 0.45, ease: 'power2.out' }, 'fly+=0.85')
          .to(glint, { opacity: 0, duration: 0.7, ease: 'power1.in' }, 'fly+=1.3')
          .to(mark, { opacity: 0, duration: 0.55, ease: 'power1.inOut' }, 'fly+=0.95')
          .to(headMarkEl, { opacity: 1, duration: 0.5, ease: 'power1.out' }, 'fly+=0.9');
      }

      /* تسليم النص (وعلى الهاتف العلامة أيضًا) للهيدر بعد أن يكتمل الكشف فوقه: العنصر الطائر واقف
         في المكان نفسه بالضبط، فالتبديل لا يُرى. */
      tl.call(() => {
        gsap.set(headNameEl, { opacity: 1 });
        gsap.set(name, { opacity: 0 });
        if (headTagEl && tag) { gsap.set(headTagEl, { opacity: 1 }); gsap.set(tag, { opacity: 0 }); }
        if (!useEmblem) { gsap.set(headMarkEl, { opacity: 1 }); gsap.set(mark, { opacity: 0 }); }
      }, null, 'fly+=1.44');

      if (heroItems.length) {
        tl.fromTo(heroItems, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.75, stagger: 0.07, ease: 'power3.out', force3D: false }, 'fly+=0.7');
      }
    };

    run().catch(() => finish());
    return () => {
      cancelled = true;
      if (tl) tl.kill();
      if (finished) return;
      release();
      pendingAbort = window.setTimeout(() => { pendingAbort = null; abortIntro(); }, 60);
    };
  }, []);

  if (done) return null;

  return (
    <div ref={rootRef} className={styles.intro} aria-hidden="true">
      <div ref={backdropRef} className={styles.backdrop}>
        <video ref={videoRef} className={styles.video} muted playsInline loop preload="none" disablePictureInPicture />
        <span className={styles.shade} />
        <span ref={haloRef} className={styles.halo} />
      </div>
      <span ref={glintRef} className={styles.glint} />
      <div ref={flyRef} className={styles.layer}>
        <svg ref={markRef} className={`${styles.fly} ${styles.mark}`} viewBox={MARK_VIEWBOX} focusable="false">
          <defs>
            <clipPath id="hi-mark">
              <path transform={MARK_TRANSFORM} d={MARK_RING} />
              <path transform={MARK_TRANSFORM} d={MARK_A} />
              <path transform={MARK_TRANSFORM} d={MARK_G} />
            </clipPath>
            <linearGradient id="hi-sheen" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0.4" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.5" stopColor="#fff" stopOpacity="0.7" />
              <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g transform={MARK_TRANSFORM} stroke="none">
            <path data-part="ring" className={styles.ring} d={MARK_RING} />
            <path data-part="a" className={styles.letter} d={MARK_A} />
            <path data-part="g" className={styles.letter} d={MARK_G} />
          </g>
          <g clipPath="url(#hi-mark)">
            <rect ref={sheenRef} x={-VIEW_W} y="0" width={VIEW_W} height={VIEW_H} fill="url(#hi-sheen)" />
          </g>
        </svg>
      </div>
    </div>
  );
}

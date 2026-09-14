'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from '@/i18n/navigation.js';
import styles from './SiteLoader.module.css';
import { MARK_VIEWBOX, MARK_TRANSFORM, MARK_A, MARK_G, MARK_RING } from './siteLoaderMark.js';

/* ═══ شاشة الافتتاح والانتقال ═══
   الافتتاح: العلامة تتجمّع من أجزائها الثلاثة الحقيقية (الحلقة ← A ← G) فوق خط مرجعي
   ينمو من المنتصف، ثم يُرفع الستار من الأسفل كاشفًا الصفحة. يُعرَض مرة واحدة في الجلسة.
   الانتقال: لا نعرض شيئًا إن اكتمل التنقّل خلال SHOW_AFTER — أغلب تنقّلات الموقع الساكن
   أسرع من ذلك، وإظهار غطاء كامل لثلاثمئة ميلّي ثانية يجعل الموقع يبدو أبطأ لا أسرع.
   وإن ظهر، يبقى MIN_VISIBLE على الأقل كي لا يومض. */
const BOOT_HOLD = 1350;      // ms قبل بدء رفع الستار في الافتتاح (بعد اكتمال التجمّع ~1.2s)
const BOOT_HOLD_SEEN = 40;   // ms — زيارة متكرّرة في نفس الجلسة: رفع فوري تقريبًا
const BOOT_HOLD_REDUCED = 320; // ms — مع تقليل الحركة لا تجمّع يُنتظر؛ عرض قصير ثم تلاشٍ
const SHOW_AFTER = 220;      // ms — تأخير إظهار غطاء الانتقال
const MIN_VISIBLE = 480;     // ms — أقلّ مدة بقاء إن ظهر
const LEAVE_MS = 640;        // ms — مدة رفع الستار (مطابقة لـCSS)
const LEAVE_QUICK_MS = 220;  // ms — تلاشٍ قصير للزيارة المتكرّرة (مطابقة لـCSS .quick)
const NAV_TIMEOUT = 10000;   // ms — صمّام أمان
const SESSION_KEY = 'aloun-intro-seen';

function prefersReducedMotion() {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (_) { return false; }
}
function seenThisSession() {
  try { return window.sessionStorage.getItem(SESSION_KEY) === '1'; } catch (_) { return false; }
}
function markSeen() {
  try { window.sessionStorage.setItem(SESSION_KEY, '1'); } catch (_) { /* لا شيء — التخزين اختياري */ }
}

export default function SiteLoader({ locale }) {
  const pathname = usePathname();
  const firstPath = useRef(true);
  const timers = useRef([]);
  const shownAt = useRef(0);
  const pending = useRef(false);
  // الخادم يُرسل الغطاء مرئيًا في مرحلة الافتتاح كي يغطّي الصفحة قبل الترطيب — لا وميض.
  const [state, setState] = useState({ visible: true, phase: 'boot', replay: true, quick: false });

  const clearTimers = () => { timers.current.forEach((id) => window.clearTimeout(id)); timers.current = []; };
  const after = (ms, fn) => { timers.current.push(window.setTimeout(fn, ms)); };

  const leave = (quick = false) => {
    clearTimers();
    pending.current = false;
    setState((s) => ({ ...s, visible: true, phase: 'leaving', quick }));
    after(quick ? LEAVE_QUICK_MS : LEAVE_MS, () => setState({ visible: false, phase: 'idle', replay: false, quick: false }));
  };

  /* إنهاء الانتقال: إن لم يظهر الغطاء بعد (تنقّل سريع) نلغيه بصمت؛ وإن ظهر نحترم MIN_VISIBLE. */
  const finish = () => {
    if (pending.current && shownAt.current === 0) { clearTimers(); pending.current = false; return; }
    const elapsed = Date.now() - shownAt.current;
    const wait = Math.max(0, MIN_VISIBLE - elapsed);
    clearTimers();
    after(wait, () => leave(false));
  };

  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      const seen = seenThisSession();
      const reduced = prefersReducedMotion();
      markSeen();
      if (seen) setState({ visible: true, phase: 'boot', replay: false, quick: false });
      shownAt.current = Date.now();
      const hold = seen ? BOOT_HOLD_SEEN : reduced ? BOOT_HOLD_REDUCED : BOOT_HOLD;
      after(hold, () => leave(seen || reduced));
      return () => clearTimers();
    }
    finish();
    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const onNavigate = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target.closest('a[href]');
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (`${destination.pathname}${destination.search}` === `${window.location.pathname}${window.location.search}`) return;
      if (destination.pathname === window.location.pathname && destination.hash) return; // رابط داخل الصفحة نفسها

      clearTimers();
      pending.current = true;
      shownAt.current = 0;
      after(SHOW_AFTER, () => {
        if (!pending.current) return;
        shownAt.current = Date.now();
        setState({ visible: true, phase: 'waiting', replay: false, quick: false });
        after(NAV_TIMEOUT, () => leave(false));
      });
    };
    document.addEventListener('click', onNavigate, true);
    return () => document.removeEventListener('click', onNavigate, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!state.visible) return null;

  const ar = locale === 'ar';
  return (
    <div
      className={`${styles.loader} ${styles[state.phase] || ''} ${state.replay ? styles.replay : ''} ${state.quick ? styles.quick : ''}`}
      role="status"
      aria-live="polite"
      aria-label={ar ? 'جاري تحميل الصفحة' : 'Loading page'}
    >
      <div className={styles.lockup}>
        {/* العلامة الحقيقية، بأجزائها الثلاثة كمسارات منفصلة لتتجمّع بالترتيب */}
        <svg className={styles.mark} viewBox={MARK_VIEWBOX} aria-hidden="true" focusable="false">
          <defs>
            {/* وميض الانتقال يعبر العلامة وحدها (مقصوص بمساراتها) لا مستطيلًا حولها.
                clipPath لا يقبل <g>، فالتحويل يوضَع على كل مسار. */}
            <clipPath id="ld-mark">
              <path transform={MARK_TRANSFORM} d={MARK_RING} />
              <path transform={MARK_TRANSFORM} d={MARK_A} />
              <path transform={MARK_TRANSFORM} d={MARK_G} />
            </clipPath>
            <linearGradient id="ld-sheen" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0.32" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.5" stopColor="#fff" stopOpacity="0.9" />
              <stop offset="0.68" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g transform={MARK_TRANSFORM} stroke="none">
            <path className={styles.ring} d={MARK_RING} />
            <path className={styles.letterA} d={MARK_A} />
            <path className={styles.letterG} d={MARK_G} />
          </g>
          {/* القصّ على المجموعة (ثابت) والحركة على المستطيل داخلها — لو وُضع القصّ على
              المستطيل نفسه لتحرّك معه وانعدم أثر العبور. */}
          <g clipPath="url(#ld-mark)">
            <rect className={styles.sheen} x="-2898" y="0" width="2898" height="2600" fill="url(#ld-sheen)" />
          </g>
        </svg>
        <span className={styles.rule} aria-hidden="true" />
        <span className={styles.name}>{ar ? 'مجموعة العون' : 'AL OUN'}</span>
        <span className={styles.sub}>{ar ? 'محامون ومستشارون قانونيون' : 'Advocates & Legal Consultants'}</span>
      </div>
      <span className={styles.sr}>{ar ? 'جاري التحميل' : 'Loading'}</span>
    </div>
  );
}

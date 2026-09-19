'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * منطق Turnstile المشترك لكل نماذج الموقع.
 *
 * لماذا خُطّاف مشترك بدل تكرار المنطق في كل نموذج:
 * النسخة السابقة كانت تعتمد على <Script onLoad> من next/script. و`loadScript`
 * في next/script يحتفظ بـ LoadCache على مستوى الوحدة، ويخرج مبكرًا
 * (`if (cacheKey && LoadCache.has(cacheKey)) return;`) قبل استدعاء onLoad متى
 * سبق تحميل نفس الـsrc في أي مكان من جلسة الـSPA. فأي تركيب ثانٍ لأي نموذج —
 * أو الانتقال الداخلي من صفحة فيها نموذج إلى صفحة فيها نموذج آخر — كان يترك
 * scriptReady على false إلى الأبد، فلا يُستدعى turnstile.render ولا يظهر أي iframe.
 * الحل: لا نعتمد على onLoad إطلاقًا — نستطلع window.turnstile، وهو مناعة كاملة
 * ضد أي تخزين مؤقّت، ويعمل سواء حمّل السكريبتَ هذا النموذج أو نموذج آخر قبله.
 */

export const TURNSTILE_SITE_KEY = '0x4AAAAAAERZ7DR2SvSLSBJq';

const SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const POLL_MS = 150;
const LOAD_TIMEOUT_MS = 12000;

/** حقن السكريبت مرّة واحدة لكل صفحة — idempotent، يُميّز الوسم بالـsrc نفسه. */
function ensureScript() {
  if (typeof document === 'undefined' || window.turnstile) return;
  if (document.querySelector(`script[src="${SRC}"]`)) return;
  const el = document.createElement('script');
  el.src = SRC;
  el.async = true;
  el.defer = true;
  document.head.appendChild(el);
}

/** استطلاع وجود window.turnstile بدل انتظار حدث load قد لا يصل. */
function whenReady(timeoutMs) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') { reject(new Error('ssr')); return; }
    if (window.turnstile) { resolve(window.turnstile); return; }
    const startedAt = Date.now();
    const tick = setInterval(() => {
      if (window.turnstile) { clearInterval(tick); resolve(window.turnstile); }
      else if (Date.now() - startedAt >= timeoutMs) { clearInterval(tick); reject(new Error('turnstile-timeout')); }
    }, POLL_MS);
  });
}

/**
 * @param {{ locale: string, active?: boolean, onError?: () => void }} options
 *   active: متى يجب أن يوجد الودجت. مرّرها false ما دامت الحاوية خارج الـDOM
 *   (مثال: الخطوة ١ في نموذج التواصل) — يُزال الودجت نظيفًا عند الانتقال إلى false.
 * @returns {{ containerRef: object, token: string, failed: boolean, reset: () => void }}
 */
export default function useTurnstile({ locale, active = true, onError } = {}) {
  const [token, setToken] = useState('');
  const [failed, setFailed] = useState(false);
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    if (!active) return undefined;
    let cancelled = false;
    setFailed(false);
    ensureScript();

    whenReady(LOAD_TIMEOUT_MS).then(
      (turnstile) => {
        if (cancelled || !containerRef.current || widgetIdRef.current !== null) return;
        try {
          widgetIdRef.current = turnstile.render(containerRef.current, {
            sitekey: TURNSTILE_SITE_KEY,
            theme: 'dark',
            size: 'flexible',
            language: locale,
            callback: (value) => setToken(value),
            'expired-callback': () => setToken(''),
            'error-callback': () => { setToken(''); if (onErrorRef.current) onErrorRef.current(); },
          });
          if (widgetIdRef.current === undefined) { widgetIdRef.current = null; setFailed(true); }
        } catch (_) {
          widgetIdRef.current = null;
          setFailed(true);
        }
      },
      () => { if (!cancelled) setFailed(true); },
    );

    // التنظيف هو إصلاح العطب الثاني: بدونه يبقى الودجت مسجَّلًا لدى Cloudflare
    // بحاوية محذوفة من الـDOM (مصدر "Cannot find Widget ..."), ويبقى widgetIdRef
    // غير null فيمنع الحارسُ إعادةَ الإنشاء عند العودة — فتبقى الحاوية فارغة أبدًا.
    return () => {
      cancelled = true;
      if (widgetIdRef.current !== null) {
        try { if (window.turnstile) window.turnstile.remove(widgetIdRef.current); } catch (_) { /* الودجت اختفى مسبقًا */ }
        widgetIdRef.current = null;
      }
      setToken('');
    };
  }, [active, locale]);

  /** إعادة تدوير الرمز بعد رفض الخادم — تتجاهل الودجت اليتيم بدل إطلاق خطأ في الـconsole. */
  const reset = useCallback(() => {
    setToken('');
    if (widgetIdRef.current === null || !window.turnstile) return;
    if (!containerRef.current || !document.contains(containerRef.current)) return;
    try { window.turnstile.reset(widgetIdRef.current); } catch (_) { /* لا شيء يُفعل */ }
  }, []);

  return { containerRef, token, failed, reset };
}

'use client';
import { useEffect, useRef } from 'react';

/** خلفية الهيرو — فيديو حقيقي لمكتب العون (لا مشهد ثلاثي الأبعاد، لا كائن مُختلَق).
 *  يحترم تفضيل تقليل الحركة بعرض الصورة الثابتة (poster) فقط دون تشغيل. */
export default function HeroVideoBackground() {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { v.pause(); return; }
    v.play().catch(() => {}); // بعض المتصفحات تحتاج استدعاءً صريحًا حتى مع autoPlay
  }, []);

  return (
    <video
      ref={ref}
      aria-hidden="true"
      poster="/media/office-interior-poster.jpg"
      autoPlay muted loop playsInline preload="metadata"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
    >
      <source src="/media/office-interior.webm" type="video/webm" />
      <source src="/media/office-interior.mp4" type="video/mp4" />
    </video>
  );
}

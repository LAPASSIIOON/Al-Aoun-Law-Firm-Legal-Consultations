'use client';
import { useEffect, useId, useRef, useState } from 'react';
import styles from './MediaLoop.module.css';

/* Wave 1 — لقطة فيديو صامتة متكرّرة، بوسيلة إيقاف/تشغيل صريحة.
 *
 * قبلها: <video autoPlay loop> بلا أي وسيلة إيقاف — وهذا إخفاق WCAG 2.2.2 من المستوى A
 * (أي محتوى متحرّك يبدأ تلقائيًا ويتجاوز خمس ثوانٍ يجب أن يملك المستخدم إيقافه).
 *
 * القرار هنا: لا نضع سمة autoPlay إطلاقًا، ونبدأ التشغيل من JS بعد قراءة
 * prefers-reduced-motion. فمن طلب تقليل الحركة لا يرى إطارًا واحدًا متحرّكًا — يبقى
 * الملصق (poster) ساكنًا وزرّ التشغيل ظاهرًا، لا أن يبدأ ثم يتوقّف. ومن لم يطلبها
 * يحصل على السلوك السابق نفسه دون تغيير.
 *
 * الفيديو صامت دائمًا (muted) ولا صوت له، فلا مسألة تشغيل صوت تلقائي.
 */
export default function MediaLoop({ className, poster, src, sources, label, playLabel, pauseLabel }) {
  const ref = useRef(null);
  const id = useId();
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      if (mq.matches) { v.pause(); }
      else { const p = v.play(); if (p && typeof p.catch === 'function') p.catch(() => {}); }
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) { const p = v.play(); if (p && typeof p.catch === 'function') p.catch(() => {}); }
    else { v.pause(); }
  };

  return (
    <div className={styles.frame}>
      <video
        ref={ref} id={id} className={className} poster={poster} src={src}
        muted loop playsInline preload="metadata" aria-label={label}
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
      >
        {sources?.map((s) => <source key={s.src} src={s.src} type={s.type} />)}
      </video>
      <button type="button" className={styles.toggle} onClick={toggle} aria-controls={id}>
        <span className={styles.glyph} aria-hidden="true">{playing ? '❚❚' : '▶'}</span>
        <span>{playing ? pauseLabel : playLabel}</span>
      </button>
    </div>
  );
}

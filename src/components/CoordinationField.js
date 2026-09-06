'use client';
/**
 * «حقل التنسيق» (D3.1) — THE COORDINATION FIELD
 *
 * حقل مساحي واحد يضمّ كل دول التنسيق الدولي بمساواة بصرية تامة:
 * خط واحد، حجم واحد، وزن واحد، لون واحد، نطاق شفافية واحد، وامتياز حركي واحد.
 * الصين تدخل ضمن التسلسل نفسه كأي دولة — صفر معاملة خاصة (قاعدة ملزمة من مالك المنتج).
 * الكويت «إحداثي الأصل»: أهميتها من الموقع والهندسة فقط — لا حجمًا ولا لونًا ولا وزنًا.
 *
 * الأسماء نص DOM حقيقي داخل قائمة دلالية <ul>؛ طبقة SVG (aria-hidden) للمسارات فقط،
 * تُحسب نهاياتها قياسًا من التخطيط الفعلي بعد الرسم (لا إحداثيات مكتوبة يدويًا)،
 * وتُعاد الحسبة عند تغيّر المقاس (ResizeObserver) وبعد جاهزية الخطوط (document.fonts).
 * الهندسة تُبنى دائمًا — حتى مع reduced-motion — فيرى الجميع المسارات الهادئة؛
 * الحركة وحدها محروسة بـgsap.matchMedia: أساس CSS = التكوين النهائي المرتّب،
 * فيصل زائرَ reduced-motion وزائرَ بلا JavaScript كاملًا ساكنًا جميلًا.
 *
 * الحركة: GSAP + ScrollTrigger (الاعتماد الوحيد المصرَّح به) — دخول مسرحي واحد
 * بمواقيت حتمية (لا عشوائية)، ثم «لحظة النظام»، ثم حالة حيّة خافتة تتوقف كليًا
 * خارج نافذة العرض (ScrollTrigger onToggle) فلا تُستهلك المعالجة بلا داعٍ.
 */
import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import s from './CoordinationField.module.css';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const SVG_NS = 'http://www.w3.org/2000/svg';
const REST_OPACITY = 0.1;

/** يبني خطوط المسارات من مركز علامة الأصل إلى شارة كل دولة — قياسًا من DOM الفعلي. */
function buildGeometry(root, svg) {
  const rect = root.getBoundingClientRect();
  const anchor = root.querySelector('[data-cf-origin]');
  const ticks = root.querySelectorAll('[data-cf-tick]');
  if (!rect.width || !rect.height || !anchor || !ticks.length) return [];
  const a = anchor.getBoundingClientRect();
  const ax = a.left - rect.left + a.width / 2;
  const ay = a.top - rect.top + a.height / 2;
  svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
  /* استقرار المراجع: خطوط الحركة تُنشأ مرة واحدة ثم تُحدَّث نهاياتها في مكانها —
     استبدال العناصر يقطع صلتها بمسارات GSAP الحيّة (علّة مُصادة في التحقق المحلي) */
  if (svg.children.length !== ticks.length) {
    svg.replaceChildren();
    ticks.forEach(() => svg.appendChild(document.createElementNS(SVG_NS, 'line')));
  }
  const lines = [...svg.children];
  ticks.forEach((t, i) => {
    const b = t.getBoundingClientRect();
    const x = b.left - rect.left + b.width / 2;
    const y = b.top - rect.top + b.height / 2;
    const line = lines[i];
    line.setAttribute('x1', ax); line.setAttribute('y1', ay);
    line.setAttribute('x2', x); line.setAttribute('y2', y);
    line.style.strokeDasharray = Math.hypot(x - ax, y - ay);
  });
  return lines;
}

export default function CoordinationField({ countries, anchorLabel, variant = 'full', dir = 'ltr' }) {
  const rootRef = useRef(null);
  const svgRef = useRef(null);

  /* توقيع حتمي بدائي (سلسلة) لعضوية الدول وترتيبها — يعيد تشغيل دورة الهندسة/الحركة
     كاملةً عند أي تغيّر شرعي في القائمة أو المرتكز، دون إعادة تشغيل زائدة بسبب
     مرجع مصفوفة جديد بمحتوى مطابق (إعادة تحقّق خادم على المسار نفسه مثلًا). */
  const countrySig = countries.join('␟');

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    /* ملكية صريحة قابلة للتدقيق — كل ما يُنشأ هنا مملوك لهذه النسخة وحدها ويُفكَّك
       أدناه بالكامل: لا ScrollTrigger.killAll أبدًا، ولا مساس بمشغّلات مكوّنات أخرى */
    let mm = null;   // gsap.matchMedia لهذه النسخة
    let ro = null;   // ResizeObserver لهذه النسخة
    let raf = 0;     // معرّف rAF المعلّق لإعادة القياس

    /* حالة هندسية مشتركة بين مسار reduced-motion ومسار الحركة الكاملة */
    const geo = { lines: [] };
    const setRest = () => geo.lines.forEach((l) => { l.style.strokeDashoffset = 0; l.style.opacity = REST_OPACITY; });
    const setHidden = () => geo.lines.forEach((l) => { l.style.strokeDashoffset = l.style.strokeDasharray; l.style.opacity = 0; });

    const ctx = gsap.context(() => {
      let entrance = null;   // الخط الزمني للدخول (يوجد فقط عند السماح بالحركة)
      let ambient = null;    // الحالة الحيّة
      let entranceDone = false;

      if (variant === 'full') {
        geo.lines = buildGeometry(root, svgRef.current);
        setRest(); /* الأساس المرئي دائمًا = المسارات الهادئة (يخدم reduced-motion وبلا-JS بعد الترطيب) */
      }

      mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const nodes = gsap.utils.toArray(root.querySelectorAll('[data-cf-node]'));

        if (variant === 'strip') {
          /* الشريط الموجز (الرئيسية): دخول قصير ≈1.4s — لا مسارات ولا حالة حيّة */
          gsap.set(nodes, { opacity: 0, y: 8 });
          gsap.timeline({
            defaults: { ease: 'power2.out' },
            scrollTrigger: { trigger: root, start: 'top 82%', once: true },
          }).to(nodes, { opacity: 1, y: 0, duration: 0.5, stagger: 0.09 });
          return;
        }

        const datums = gsap.utils.toArray(root.querySelectorAll('[data-cf-datum]'));
        const originWrap = root.querySelector('[data-cf-origin-wrap]');
        const allTicks = root.querySelectorAll('[data-cf-tick]');
        setHidden();

        /* إزاحات دخول حتمية لكل خانة (لا عشوائية): المحور والاتجاه من رقم الخانة */
        const off = (i) => {
          const d = 6 + (i % 4) * 2.5; // 6–13.5px
          return i % 2
            ? { x: (i % 4 < 2 ? d : -d) * (dir === 'rtl' ? -1 : 1), y: 0 }
            : { x: 0, y: i % 4 < 2 ? d : -d };
        };
        nodes.forEach((n, i) => gsap.set(n, { opacity: 0, ...off(i) }));
        gsap.set(datums, { scaleX: 0, transformOrigin: dir === 'rtl' ? 'right center' : 'left center' });
        gsap.set(originWrap, { opacity: 0 });

        /* المرحلة ٥ — الحالة الحيّة (تُنشأ موقوفة، تعمل فقط بعد الدخول وداخل نافذة العرض) */
        ambient = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 2 });
        ambient.to(datums, { y: 1, duration: 11, ease: 'sine.inOut', yoyo: true, repeat: 1, stagger: 5.5 }, 0)
          .to(geo.lines, { opacity: 0.14, duration: 7, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0);
        [0, 1, 2].forEach((cycle) => {
          const slice = geo.lines.filter((_, i) => i % 3 === cycle);
          if (slice.length) ambient.to(slice, { opacity: 0.2, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 4 + cycle * 8);
        });

        /* دفعتان متداخلتان بحسب هندسة الخانات (زوجي ثم فردي) — الصين داخل دفعتها كأي دولة */
        const volley = [...geo.lines.keys()].filter((i) => i % 2 === 0)
          .concat([...geo.lines.keys()].filter((i) => i % 2 === 1));

        /* مشغّل الرؤية يُعرَّف قبل بناء الدخول كي يستطيع نداء اكتمال الدخول فحصه:
           لا تشغيل للحالة الحيّة إن اكتمل الدخول والحقل خارج نافذة العرض
           (المستخدم دخل ثم غادر قبل ~5.9s) — صفر حرق معالجة خارج الشاشة، بلا استثناء */
        let visTrigger = null;

        entrance = gsap.timeline({
          defaults: { ease: 'power2.out' },
          scrollTrigger: { trigger: root, start: 'top 75%', once: true },
        });
        /* المرحلة ١ — الإسناد (0 → 0.9s): رسم خطَّي الإسناد وظهور إحداثي الأصل */
        entrance.to(datums, { scaleX: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out' }, 0)
          .to(originWrap, { opacity: 1, duration: 0.5 }, 0.35)
          /* المرحلة ٢ — دخول الدول (0.7 → ≈3.2s): ترتيب قراءة هندسي، 6–14px، بلا ارتداد */
          .to(nodes, { opacity: 1, x: 0, y: 0, duration: 0.48, stagger: 0.17 }, 0.7);
        /* المرحلة ٣ — حدث التنسيق (3.0 → ≈4.7s) */
        volley.forEach((li, k) => {
          const line = geo.lines[li];
          entrance.to(line, { opacity: 0.3, duration: 0.15 }, 3.0 + k * 0.09)
            .to(line, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.inOut' }, 3.0 + k * 0.09);
        });
        /* المرحلة ٤ — لحظة النظام (≈4.7 → 5.4s): تعادل تام ثم استرخاء */
        entrance.to(geo.lines, { opacity: 0.22, duration: 0.25, ease: 'power1.inOut' }, 4.7)
          .to(allTicks, { opacity: 1, duration: 0.25 }, 4.7)
          .to(geo.lines, { opacity: REST_OPACITY, duration: 0.55, ease: 'power2.inOut' }, 5.35)
          .to(allTicks, { opacity: 0.75, duration: 0.55 }, 5.35)
          .add(() => {
            entranceDone = true;
            /* تشغيل الحالة الحيّة فقط إن كان الحقل داخل نافذة العرض لحظة الاكتمال؛
               وإلا تبقى موقوفة حتى يعيدها onToggle عند عودة المستخدم للحقل */
            if (visTrigger && visTrigger.isActive) ambient.play();
          }, 5.9);

        /* أداء خارج الشاشة: الحالة الحيّة تتوقف تمامًا عند مغادرة نافذة العرض */
        visTrigger = ScrollTrigger.create({
          trigger: root, start: 'top bottom', end: 'bottom top',
          onToggle: (self) => {
            if (!entranceDone || !ambient) return;
            if (self.isActive) ambient.play(); else ambient.pause();
          },
        });
        return () => { visTrigger.kill(); if (ambient) ambient.kill(); };
      });

      /* إعادة القياس (كل الأوضاع): تغيّر المقاس أو اكتمال الخطوط — حتمي وبلا وميض */
      if (variant === 'full') {
        const rebuild = () => {
          if (!ro) return; /* بعد التفكيك: لا جدولة إطلاقًا — حتى document.fonts.ready لا يحجز إطارًا */
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => {
            if (!ro) return; /* بعد التفكيك: لا عمل */
            geo.lines = buildGeometry(root, svgRef.current); /* تحديث في المكان — المراجع ثابتة */
            const started = entrance && entrance.progress() > 0;
            if (entranceDone || !entrance || (started && entrance.progress() >= 1)) setRest();
            else if (!started) setHidden();
            /* أثناء التشغيل: النهايات تحدّثت والقيم الحيّة تكمل مسارها على العناصر ذاتها */
            ScrollTrigger.refresh();
          });
        };
        ro = new ResizeObserver(rebuild);
        ro.observe(root);
        if (document.fonts?.ready) document.fonts.ready.then(rebuild).catch(() => {});
      }
    }, root);

    /* تفكيك صريح، عديم التكرار الضار (idempotent)، لملكية هذه النسخة فقط:
       ١) فصل مراقب المقاس وإلغاء أي rAF معلّق — لا إعادة قياس بعد الموت؛
       ٢) mm.revert(): يزيل مستمعي matchMedia نهائيًا ويستدعي منظّف السياق الداخلي
          (قتل مشغّل الرؤية والخط الحيّ) ويعيد قيم GSAP — لا مستمع يعيش بعد مغادرة المسار؛
       ٣) ctx.revert(): شبكة أمان نهائية لكل ما أُنشئ داخل نطاق هذه النسخة. */
    return () => {
      if (ro) { ro.disconnect(); ro = null; }
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      if (mm) { mm.revert(); mm = null; }
      ctx.revert();
    };
  }, [variant, dir, countrySig, anchorLabel]);

  const cls = [s.field, variant === 'strip' ? s.strip : s.full, dir === 'rtl' ? s.rtl : s.ltr].join(' ');
  return (
    <div ref={rootRef} className={cls}>
      {variant === 'full' && (
        <>
          <svg ref={svgRef} className={s.paths} aria-hidden="true" focusable="false" />
          <span className={`${s.datum} ${s.datumA}`} data-cf-datum aria-hidden="true" />
          <span className={`${s.datum} ${s.datumB}`} data-cf-datum aria-hidden="true" />
          <span className={s.originWrap} data-cf-origin-wrap>
            {/* التنسيق النصّي موروث من originWrap — نفس خصائص الدول حرفيًا */}
            <span className={s.originMark} data-cf-origin aria-hidden="true" />
            <span data-cf-origin-label>{anchorLabel}</span>
          </span>
        </>
      )}
      <ul className={s.list}>
        {countries.map((name) => (
          <li key={name} className={s.country} data-cf-node>
            {variant === 'full' && <span className={s.tick} data-cf-tick aria-hidden="true" />}
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
}

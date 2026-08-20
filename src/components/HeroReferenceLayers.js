'use client';
import { useEffect, useRef, useState } from 'react';
import HeroMotion from '@/components/HeroMotion.js';

/** مشهد الهيرو ثلاثي الأبعاد — «الطبقات المرجعية العائمة»: التجسيد الحرفي لمفهوم السجل المرجعي.
 *  ٩ لوحات «سجلات» زجاجية داكنة رفيعة بإزاحات تبويب دقيقة، سجل واحد نشط بحواف أزرق اللوجو،
 *  والسكرول يفصل الطبقات بحركة محسوبة — أرشيف مؤسسي يتكشّف، لا جسم استعراضي.
 *
 *  حوكمة الأداء والوصول (غير قابلة للتفاوض):
 *  - three.js تُحمَّل ديناميكيًا فقط على ديسكتوب بمؤشر دقيق وبلا تفضيل تقليل حركة — الموبايل
 *    وكل ما عداه يبقى على خلفية الفهرسة الثنائية المُختبَرة (HeroMotion).
 *  - إيقاف كامل للرندر خارج الشاشة، سقف DPR، تنظيف كامل للموارد عند التفكيك. */
export default function HeroReferenceLayers() {
  const wrapRef = useRef(null);
  const [engaged, setEngaged] = useState(false); // 3D جاهز فعليًا — عندها فقط نخفي البديل الثنائي

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const capable = window.matchMedia('(min-width: 960px) and (hover: hover) and (pointer: fine)').matches;
    if (reduce || !capable) return;

    let disposed = false, raf = 0, cleanup = () => {};

    (async () => {
      let THREE, RoomEnvironment;
      try {
        THREE = await import('three');
        ({ RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js'));
      } catch { return; }
      if (disposed || !wrapRef.current) return;

      const host = wrapRef.current;
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      } catch { return; }

      const rtl = getComputedStyle(document.documentElement).direction === 'rtl';
      const mirror = rtl ? -1 : 1; // الكومة تسكن الجانب الحر بصريًا (يسار في العربية)

      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      const el = renderer.domElement;
      el.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none';
      el.setAttribute('aria-hidden', 'true');
      host.appendChild(el);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);

      // ═══ اللوحات المرجعية ═══
      const N = 9, ACTIVE = 2;
      const plateGeo = new THREE.BoxGeometry(2.2, 3.1, 0.035);
      const edgeGeo = new THREE.EdgesGeometry(plateGeo);
      const group = new THREE.Group();
      scene.add(group);

      const plates = [];
      for (let i = 0; i < N; i++) {
        const active = i === ACTIVE;
        const mat = new THREE.MeshPhysicalMaterial({
          color: 0x18233a, metalness: 0.15, roughness: 0.22,
          clearcoat: 1, clearcoatRoughness: 0.18,
          transparent: true, opacity: active ? 0.8 : 0.6,
          envMapIntensity: active ? 1.25 : 0.9,
        });
        const mesh = new THREE.Mesh(plateGeo, mat);
        const edges = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({
          color: active ? 0x64b8e3 : 0x30a1d9, transparent: true, opacity: active ? 0.95 : 0.4,
        }));
        mesh.add(edges);
        // إزاحات «تبويب» دقيقة — كألسنة فهارس، لا عشوائية: نمط حتمي ثابت لكل لوحة
        mesh.userData = {
          baseZ: -i * 0.17,
          tabX: ((i % 3) - 1) * 0.11 * mirror,
          tabY: (((i * 2) % 5) - 2) * 0.075,
          active,
        };
        group.add(mesh);
        plates.push(mesh);
      }
      group.position.set(3.05 * mirror, -0.1, 0);
      group.rotation.y = -0.5 * mirror;

      // ═══ الإضاءة — استوديو هادئ + ضوء حافة أزرق ═══
      scene.add(new THREE.AmbientLight(0xaeb9cc, 0.25));
      const key = new THREE.DirectionalLight(0xe9edf4, 1.35);
      key.position.set(-4 * mirror, 5, 4);
      scene.add(key);
      const rim = new THREE.PointLight(0x30a1d9, 22, 18);
      rim.position.set(4.6 * mirror, -0.6, -3.4);
      scene.add(rim);

      camera.position.set(0, 0.15, 8.6);
      camera.lookAt(group.position.x * 0.55, 0, 0);

      // ═══ القياس + السكرول + الرندر ═══
      let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      function size() {
        const r = host.getBoundingClientRect();
        w = r.width; h = r.height;
        renderer.setPixelRatio(dpr);
        renderer.setSize(w, h, false);
        camera.aspect = w / Math.max(1, h);
        camera.updateProjectionMatrix();
      }
      size();

      let progress = 0, smooth = 0;
      function readScroll() {
        const r = host.getBoundingClientRect();
        // من ٠ (الهيرو بكامله ظاهر) إلى ١ (خرج تقريبًا) — مقياس فصل الطبقات
        progress = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height * 0.85)));
      }
      window.addEventListener('scroll', readScroll, { passive: true });
      readScroll();

      let visible = true, last = performance.now(), t = 0;
      function frame(now) {
        const dt = Math.min(50, now - last); last = now; t += dt;
        smooth += (progress - smooth) * 0.07; // تخميد — حركة محسوبة لا قفزات

        plates.forEach((m, i) => {
          const u = m.userData;
          const sep = 1 + smooth * 2.1;
          const idle = Math.sin(t * 0.00042 + i * 1.7) * 0.015; // تنفّس تحت عتبة الملاحظة
          m.position.set(
            u.tabX + (u.active ? 0.16 * mirror * (1 - smooth) : 0),
            u.tabY + idle,
            u.baseZ * sep + (u.active ? 0.1 : 0),
          );
          m.rotation.y = idle * 0.25;
        });
        group.rotation.y = (-0.5 + smooth * 0.22) * mirror;
        camera.position.z = 8.6 + smooth * 1.3;

        renderer.render(scene, camera);
        if (visible) raf = requestAnimationFrame(frame);
      }

      // أول إطار قبل الإظهار — لا وميض فارغ عند تبديل البديل الثنائي
      renderer.render(scene, camera);
      setEngaged(true);
      raf = requestAnimationFrame(frame);

      const ro = new ResizeObserver(size);
      ro.observe(host);
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible) { last = performance.now(); raf = requestAnimationFrame(frame); }
        else cancelAnimationFrame(raf);
      }, { threshold: 0 });
      io.observe(host);

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('scroll', readScroll);
        ro.disconnect(); io.disconnect();
        plateGeo.dispose(); edgeGeo.dispose();
        plates.forEach((m) => { m.material.dispose(); m.children[0]?.material?.dispose?.(); });
        pmrem.dispose();
        renderer.dispose();
        el.remove();
      };
    })();

    return () => { disposed = true; cleanup(); };
  }, []);

  return (
    <div ref={wrapRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {!engaged && <HeroMotion />}
    </div>
  );
}

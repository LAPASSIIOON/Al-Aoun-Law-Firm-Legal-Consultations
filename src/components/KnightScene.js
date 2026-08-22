'use client';
import { useEffect, useRef, useState } from 'react';
import HeroMotion from '@/components/HeroMotion.js';

/** «الفارس السيادي» — نموذج ثلاثي الأبعاد حقيقي (٣٥.٨ ألف مثلّث، منحوت فعليًا)، لا هندسة
 *  إجرائية. مُحمَّل عبر FBXLoader (مُضمَّنة داخل three.js — صفر تبعية إضافية)، بلا خامات
 *  مرفقة، فتُطبَّق مادتنا البرونزية/الإسبريسو مباشرة لاتّساق الهوية عبر الموقع.
 *  ديسكتوب فقط عبر تحميل three ديناميكي؛ الموبايل/تقليل الحركة/بلا WebGL = البديل الثنائي. */
export default function KnightScene() {
  const wrapRef = useRef(null);
  const [engaged, setEngaged] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const capable = window.matchMedia('(min-width: 960px) and (hover: hover) and (pointer: fine)').matches;
    if (reduce || !capable) return;

    let disposed = false, raf = 0, cleanup = () => {};

    (async () => {
      let THREE, RoomEnvironment, FBXLoader;
      try {
        THREE = await import('three');
        ({ RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js'));
        ({ FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js'));
      } catch { return; }
      if (disposed || !wrapRef.current) return;

      const host = wrapRef.current;
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      } catch { return; }

      const rtl = getComputedStyle(document.documentElement).direction === 'rtl';
      const mirror = rtl ? -1 : 1; // النحت يسكن الجانب الحر بصريًا

      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      const el = renderer.domElement;
      el.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none';
      el.setAttribute('aria-hidden', 'true');
      host.appendChild(el);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;

      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
      camera.position.set(0, 0.3, 8.6);

      // ═══ تحميل نموذج الفارس الحقيقي ═══
      const bronze = new THREE.MeshPhysicalMaterial({
        color: 0x2a2019, metalness: 0.9, roughness: 0.38,
        clearcoat: 0.5, clearcoatRoughness: 0.3, envMapIntensity: 1,
        side: THREE.DoubleSide, // أمان بعد المرآة الأفقية (تقليب X قد يعكس اتجاه الأوجه)
      });

      const knight = new THREE.Group();
      const disposables = [];
      let modelLoaded = false;

      try {
        const loader = new FBXLoader();
        const res = await fetch('/models/knight.fbx');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buffer = await res.arrayBuffer();
        const obj = loader.parse(buffer, '');
        if (disposed) return;

        // توسيط النموذج أفقيًا وإجلاسه على الأرض (القاعدة عند y=0 محليًا أصلًا في هذا الأصل)
        const box = new THREE.Box3().setFromObject(obj);
        const center = new THREE.Vector3(); box.getCenter(center);
        obj.position.set(-center.x, -box.min.y, -center.z);

        obj.traverse((child) => {
          if (child.isMesh) {
            child.material = bronze;
            child.castShadow = true; child.receiveShadow = true;
            disposables.push(child.geometry);
          }
        });

        const scaleFactor = 2.85 / (box.max.y - box.min.y); // ارتفاع نهائي ≈ 2.85 وحدة — يطابق تكوين الكاميرا المضبوط
        knight.add(obj);
        knight.scale.set(scaleFactor * mirror, scaleFactor, scaleFactor);
        modelLoaded = true;
      } catch { /* فشل التحميل — نبقى على البديل الثنائي فقط، لا نكسر الصفحة */ }

      knight.position.set(2.6 * mirror, -1.4, 0);
      knight.rotation.y = 0.35 * mirror + Math.PI;
      scene.add(knight);

      // ═══ توهّج شعار العون خلف الفارس — نسخة النيون التي زوّدنا بها العميل ═══
      // الملف صورة نقطية (خطوط بيضاء على رمادي مصمت #919191، لا شفافية حقيقية رغم اسمه) —
      // نستخلص الخطوط باستخدام السطوع فوق خلفية معروفة (١٤٥,١٤٥,١٤٥)، لا قناع SVG هذه المرة.
      let glowMesh = null, glowTex = null;
      (async () => {
        try {
          const img = new Image();
          await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = '/brand/al-aoun-neon.png'; });
          if (disposed) return;
          const W = 640, H = Math.round(W * (img.naturalHeight / img.naturalWidth));

          const raw = document.createElement('canvas'); raw.width = W; raw.height = H;
          const rctx = raw.getContext('2d');
          rctx.drawImage(img, 0, 0, W, H);
          const frame = rctx.getImageData(0, 0, W, H);
          const BG = 145, d = frame.data;
          for (let i = 0; i < d.length; i += 4) {
            const lum = (d[i] + d[i + 1] + d[i + 2]) / 3;
            const a = Math.max(0, Math.min(255, ((lum - BG) / (255 - BG)) * 255));
            d[i] = 0xB9; d[i + 1] = 0xB5; d[i + 2] = 0xAD; // تلوين بلاتين دافئ
            d[i + 3] = a;
          }
          const tmp = document.createElement('canvas'); tmp.width = W; tmp.height = H;
          tmp.getContext('2d').putImageData(frame, 0, 0);

          const final = document.createElement('canvas'); final.width = W; final.height = H;
          const fctx = final.getContext('2d');
          fctx.filter = 'blur(14px)';
          fctx.drawImage(tmp, 0, 0);
          fctx.filter = 'blur(3px)'; fctx.globalAlpha = 0.75;
          fctx.drawImage(tmp, 0, 0);

          if (disposed) return;
          glowTex = new THREE.CanvasTexture(final);
          glowTex.colorSpace = THREE.SRGBColorSpace;
          const glowH = 6.6, glowW = glowH * (W / H); // "أكبر شوية" — كان ٤.٦، بقى ٦.٦
          const glowMat = new THREE.MeshBasicMaterial({
            map: glowTex, transparent: true, opacity: 0.55,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          glowMesh = new THREE.Mesh(new THREE.PlaneGeometry(glowW, glowH), glowMat);
          glowMesh.position.set(2.6 * mirror, 0.35, -1.9);
          scene.add(glowMesh);
        } catch { /* التوهّج تحسين اختياري — فشله لا يكسر المشهد */ }
      })();

      const shadowMat = new THREE.ShadowMaterial({ opacity: 0.35 });
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), shadowMat);
      floor.rotation.x = -Math.PI / 2; floor.position.y = -1.45; floor.receiveShadow = true;
      scene.add(floor);

      scene.add(new THREE.AmbientLight(0xb9b5ad, 0.22));
      const key = new THREE.DirectionalLight(0xf4efe7, 2.3);
      key.position.set(-5 * mirror, 6, 5);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.near = 1; key.shadow.camera.far = 25;
      key.shadow.bias = -0.0004;
      scene.add(key);
      const rim = new THREE.SpotLight(0x8a8377, 100, 22, 0.6, 0.5);
      rim.position.set(6 * mirror, 1.5, -4);
      scene.add(rim);
      const fill = new THREE.PointLight(0x5e9dbe, 8, 16);
      fill.position.set(-3 * mirror, -1, 4);
      scene.add(fill);

      camera.lookAt(knight.position.x * 0.5, 0.1, 0);

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

      let visible = true, last = performance.now(), t = 0;
      function frame(now) {
        const dt = Math.min(50, now - last); last = now; t += dt;
        // حركة خمول تحت عتبة الملاحظة فقط — تنفّس دوراني طفيف جدًا (لا دوران استعراضي)
        knight.rotation.y = 0.35 * mirror + Math.PI + Math.sin(t * 0.00018) * 0.03;
        renderer.render(scene, camera);
        if (visible) raf = requestAnimationFrame(frame);
      }

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
        ro.disconnect(); io.disconnect();
        disposables.forEach((g) => g.dispose());
        bronze.dispose(); shadowMat.dispose();
        floor.geometry.dispose();
        if (glowMesh) { glowMesh.geometry.dispose(); glowMesh.material.dispose(); }
        if (glowTex) glowTex.dispose();
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

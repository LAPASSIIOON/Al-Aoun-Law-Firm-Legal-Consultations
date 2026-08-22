'use client';
import { useEffect, useRef, useState } from 'react';
import HeroMotion from '@/components/HeroMotion.js';

/** «الفارس السيادي» — صورة ظلّية واحدة مبثوقة (Extruded Silhouette)، مضاءة بالكامل،
 *  بلا كوريغرافيا سكرول بعد. منحنى قطاع جانبي واحد مرسوم يدويًا يضمن القراءة الفورية
 *  كـ«فارس شطرنج»، مبثوق بسُمك موحَّد + شطف حواف = «مقطوعة من لوح برونز مُصمَت».
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
      const mirror = rtl ? -1 : 1; // النحت يسكن الجانب الحر بصريًا

      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
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

      // ═══ بناء الفارس — صورة ظلّية واحدة مبثوقة (Extruded Silhouette) ═══
      // منحنى قطاع جانبي واحد مرسوم يدويًا (لا تركيب من كتل منفصلة): قاعدة، صدر مائل
      // للأمام، حزّة الفك المميّزة، طرف المخطم، قمة الرأس/الأذن، ثم منحنى العُرف الطويل
      // الممسوح خلف الرقبة (الملمح الأوضح للفارس). يُبثَق بسُمك موحَّد + شطف حواف خفيف.
      const knight = new THREE.Group();

      const bronze = new THREE.MeshPhysicalMaterial({
        color: 0x2a2019, metalness: 0.92, roughness: 0.4,
        clearcoat: 0.55, clearcoatRoughness: 0.3, envMapIntensity: 0.9,
      });

      const prof = new THREE.Shape();
      prof.moveTo(-0.62, 0);
      prof.lineTo(0.62, 0);
      prof.lineTo(0.66, 0.18);
      prof.lineTo(0.42, 0.30);
      prof.lineTo(0.38, 0.62);
      prof.lineTo(0.46, 1.02);
      prof.lineTo(0.40, 1.35);
      prof.lineTo(0.56, 1.52);
      prof.lineTo(0.38, 1.66);
      prof.lineTo(0.64, 1.82);
      prof.lineTo(0.48, 1.98);
      prof.lineTo(0.40, 2.22);
      prof.lineTo(0.28, 2.42);
      prof.lineTo(0.20, 2.60);
      prof.lineTo(0.08, 2.35);
      prof.quadraticCurveTo(-0.08, 2.28, -0.30, 1.95);
      prof.quadraticCurveTo(-0.55, 1.55, -0.50, 1.05);
      prof.quadraticCurveTo(-0.46, 0.55, -0.62, 0.20);
      prof.lineTo(-0.62, 0);

      const knightGeo = new THREE.ExtrudeGeometry(prof, {
        depth: 0.34, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.03,
        bevelSegments: 3, curveSegments: 20,
      });
      knightGeo.translate(0, 0, -0.17);

      const knightMesh = new THREE.Mesh(knightGeo, bronze);
      knightMesh.castShadow = true; knightMesh.receiveShadow = true;
      knight.add(knightMesh);

      const edgeGeo = new THREE.EdgesGeometry(knightGeo, 25);
      const edgeLines = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({
        color: 0xb9b5ad, transparent: true, opacity: 0.4,
      }));
      knight.add(edgeLines);

      knight.position.set(2.6 * mirror, -1.3, 0);
      knight.rotation.y = -0.1;
      knight.scale.set(1.05 * mirror, 1.05, 1.05);
      scene.add(knight);

      // ═══ توهّج شعار العون خلف الفارس — نسيج من ملف الشعار المتجهي الرسمي، لا رسم مستقل ═══
      // طبقتان: توهّج ناعم ممسوح (blur) خلف الفارس مباشرة، ولُبّ أوضح قليلًا في وسطه.
      // لون بلاتين دافئ (لا أزرق إشارة) — الأزرق ممنوع كخلفية/مساحة كبيرة حسب توجيه الألوان.
      let glowMesh = null, glowTex = null;
      (async () => {
        try {
          const img = new Image();
          await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = '/brand/al-aoun-mark.svg'; });
          if (disposed) return;
          const W = 640, H = Math.round(W * (2600 / 2898)), pad = 60;

          const tmp = document.createElement('canvas'); tmp.width = W; tmp.height = H;
          const tctx = tmp.getContext('2d');
          tctx.drawImage(img, pad, pad, W - pad * 2, H - pad * 2);
          tctx.globalCompositeOperation = 'source-in';
          tctx.fillStyle = '#B9B5AD';
          tctx.fillRect(0, 0, W, H);

          const final = document.createElement('canvas'); final.width = W; final.height = H;
          const fctx = final.getContext('2d');
          fctx.filter = 'blur(20px)';
          fctx.drawImage(tmp, 0, 0);
          fctx.filter = 'blur(5px)'; fctx.globalAlpha = 0.65;
          fctx.drawImage(tmp, 0, 0);

          if (disposed) return;
          glowTex = new THREE.CanvasTexture(final);
          glowTex.colorSpace = THREE.SRGBColorSpace;
          const glowH = 4.6, glowW = glowH * (W / H);
          const glowMat = new THREE.MeshBasicMaterial({
            map: glowTex, transparent: true, opacity: 0.5,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          glowMesh = new THREE.Mesh(new THREE.PlaneGeometry(glowW, glowH), glowMat);
          glowMesh.position.set(2.6 * mirror, 0.35, -1.7);
          scene.add(glowMesh);
        } catch { /* التوهّج تحسين اختياري — فشله لا يكسر المشهد */ }
      })();

      const shadowMat = new THREE.ShadowMaterial({ opacity: 0.35 });
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), shadowMat);
      floor.rotation.x = -Math.PI / 2; floor.position.y = -1.45; floor.receiveShadow = true;
      scene.add(floor);

      scene.add(new THREE.AmbientLight(0xb9b5ad, 0.18));
      const key = new THREE.DirectionalLight(0xf4efe7, 2.1);
      key.position.set(-5 * mirror, 6, 5);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.near = 1; key.shadow.camera.far = 25;
      key.shadow.bias = -0.0004;
      scene.add(key);
      const rim = new THREE.SpotLight(0x8a8377, 90, 22, 0.6, 0.5);
      rim.position.set(6 * mirror, 1.5, -4);
      scene.add(rim);
      const fill = new THREE.PointLight(0x5e9dbe, 8, 16);
      fill.position.set(-3 * mirror, -1, 4);
      scene.add(fill);

      camera.lookAt(knight.position.x * 0.5, 0.05, 0);

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
        knight.rotation.y = -0.1 + Math.sin(t * 0.00018) * 0.035;
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
        knightGeo.dispose(); edgeGeo.dispose();
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

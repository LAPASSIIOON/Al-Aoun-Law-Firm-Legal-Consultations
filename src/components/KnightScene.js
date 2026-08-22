'use client';
import { useEffect, useRef, useState } from 'react';
import HeroMotion from '@/components/HeroMotion.js';

/** «الفارس السيادي» — المرحلة ٢: نحت إجرائي ثابت مُضاء بالكامل (بلا كوريغرافيا سكرول بعد).
 *  صورة ظلّية فارس شطرنج معماري مُجرَّد: قاعدة/جسم منحنيان عبر LatheGeometry + رأس منحوت،
 *  مادة برونز مُسوَّد/إسبريسو PBR بحواف بلاتين، إضاءة استوديو سينمائية بضوء حافة دافئ.
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

      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
      camera.position.set(0, 0.6, 9);

      // ═══ بناء الفارس الإجرائي ═══
      const knight = new THREE.Group();

      const bronze = new THREE.MeshPhysicalMaterial({
        color: 0x2a2019, metalness: 0.92, roughness: 0.42,
        clearcoat: 0.5, clearcoatRoughness: 0.35, envMapIntensity: 0.85,
      });
      const platinum = new THREE.MeshStandardMaterial({
        color: 0xb9b5ad, metalness: 1, roughness: 0.3, envMapIntensity: 1.1,
      });

      // القاعدة — LatheGeometry: مقطع جانبي منحنٍ يُدار حول المحور (قاعدة أسطوانية أنيقة)
      const baseProfile = [];
      const bpts = [[0, 0], [1.15, 0], [1.15, 0.12], [0.95, 0.2], [0.9, 0.34], [0.78, 0.42], [0.7, 0.55]];
      bpts.forEach(([x, y]) => baseProfile.push(new THREE.Vector2(x, y)));
      const baseGeo = new THREE.LatheGeometry(baseProfile, 64);
      const base = new THREE.Mesh(baseGeo, bronze);
      base.castShadow = true; base.receiveShadow = true;
      knight.add(base);

      // العمود/الجسم الصاعد — LatheGeometry بمقطع يتناقص لأعلى
      const bodyProfile = [
        [0.7, 0], [0.62, 0.35], [0.52, 0.85], [0.48, 1.35], [0.5, 1.75], [0.46, 2.05], [0.3, 2.2],
      ].map(([x, y]) => new THREE.Vector2(x, y));
      const bodyGeo = new THREE.LatheGeometry(bodyProfile, 64);
      const body = new THREE.Mesh(bodyGeo, bronze);
      body.position.y = 0.5; body.castShadow = true;
      knight.add(body);

      // الرأس/العنق المنحني — الكتلة التي تجعل الصورة الظلّية «فارسًا» فورًا.
      // نبنيه من صندوق مُشكَّل + انحناء أمامي، بأوجه معمارية مُبسَّطة لا خيول واقعية.
      const headGroup = new THREE.Group();
      headGroup.position.y = 2.55;

      // كتلة العنق المائلة للأمام
      const neckGeo = new THREE.BoxGeometry(0.62, 1.1, 0.85);
      const neck = new THREE.Mesh(neckGeo, bronze);
      neck.rotation.z = -0.32 * mirror;
      neck.position.set(0.12 * mirror, 0.1, 0);
      neck.castShadow = true;
      headGroup.add(neck);

      // الخطم/المقدمة الممتدة (يعرّف اتجاه الفارس)
      const muzzleGeo = new THREE.BoxGeometry(0.9, 0.42, 0.6);
      const muzzle = new THREE.Mesh(muzzleGeo, bronze);
      muzzle.rotation.z = 0.15 * mirror;
      muzzle.position.set(0.5 * mirror, 0.62, 0);
      muzzle.castShadow = true;
      headGroup.add(muzzle);

      // الأذنان/العُرف — شريحتان رفيعتان تكملان الصورة الظلّية
      const earGeo = new THREE.BoxGeometry(0.14, 0.5, 0.16);
      [-0.16, 0.02].forEach((z, i) => {
        const ear = new THREE.Mesh(earGeo, bronze);
        ear.position.set(-0.16 * mirror, 0.78, z);
        ear.rotation.z = 0.25 * mirror;
        ear.castShadow = true;
        headGroup.add(ear);
      });

      // خط حافة بلاتين على طول العُرف — لمسة معدنية دقيقة (لا زخرفة)
      const crestGeo = new THREE.BoxGeometry(0.05, 0.9, 0.05);
      const crest = new THREE.Mesh(crestGeo, platinum);
      crest.position.set(-0.1 * mirror, 0.62, -0.07);
      crest.rotation.z = 0.4 * mirror;
      headGroup.add(crest);

      knight.add(headGroup);

      // حلقة بلاتين دقيقة عند قاعدة الجسم — تفصيل مؤسسي منضبط
      const ringGeo = new THREE.TorusGeometry(0.66, 0.02, 12, 64);
      const ring = new THREE.Mesh(ringGeo, platinum);
      ring.rotation.x = Math.PI / 2; ring.position.y = 0.52;
      knight.add(ring);

      knight.position.set(2.6 * mirror, -1.4, 0);
      knight.rotation.y = -0.35 * mirror;
      knight.scale.setScalar(1.15);
      scene.add(knight);

      // أرضية غير مرئية تستقبل الظل فقط (عمق سينمائي)
      const shadowMat = new THREE.ShadowMaterial({ opacity: 0.35 });
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), shadowMat);
      floor.rotation.x = -Math.PI / 2; floor.position.y = -1.45; floor.receiveShadow = true;
      scene.add(floor);

      // ═══ الإضاءة السينمائية ═══
      scene.add(new THREE.AmbientLight(0xb9b5ad, 0.18));
      const key = new THREE.DirectionalLight(0xf4efe7, 2.1); // مفتاح دافئ
      key.position.set(-5 * mirror, 6, 5);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.near = 1; key.shadow.camera.far = 25;
      key.shadow.bias = -0.0004;
      scene.add(key);
      const rim = new THREE.SpotLight(0x8a8377, 90, 22, 0.6, 0.5); // ضوء حافة دافئ يكشف الصورة الظلّية
      rim.position.set(6 * mirror, 1.5, -4);
      scene.add(rim);
      const fill = new THREE.PointLight(0x5e9dbe, 8, 16); // إشارة زرقاء نادرة جدًا كملء بارد خافت
      fill.position.set(-3 * mirror, -1, 4);
      scene.add(fill);

      camera.lookAt(knight.position.x * 0.5, 0.2, 0);

      // ═══ القياس + الرندر ═══
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
        knight.rotation.y = (-0.35 + Math.sin(t * 0.00018) * 0.05) * mirror;
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
        [baseGeo, bodyGeo, neckGeo, muzzleGeo, earGeo, crestGeo, ringGeo].forEach((g) => g.dispose());
        bronze.dispose(); platinum.dispose(); shadowMat.dispose();
        floor.geometry.dispose();
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

'use client';
import { useEffect, useRef } from 'react';

/**
 * «الرواق الأول» — فراغ حجري مجرّد بضوء كويتي حادّ.
 * قوس محكوم (روح هندسة اللوجو) · شمس خليجية تصنع ظلًّا طويلًا على حجر دافئ ·
 * حافة معدن باردة · انعكاس عنّابي خافت جدًا. عتبة تُعبَر مع الاسكرول (خارج ساطع → داخل محميّ).
 * هادئ · دقيق · معماري — لا ألعاب/جزيئات/استعراض. يحترم reduced-motion والموبايل وبلا-WebGL.
 */
export default function StoneHero({ className }) {
  const mountRef = useRef(null);
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 900px)').matches;
    const test = document.createElement('canvas');
    if (!(test.getContext('webgl2') || test.getContext('webgl'))) { mount.dataset.fallback = 'true'; return; }

    let renderer, scene, camera, frame, ro, disposed = false, THREE;
    let sT = 0, tS = 0, px = 0, py = 0, tpx = 0, tpy = 0;

    (async () => {
      THREE = await import('three');
      if (disposed) return;
      const W = () => mount.clientWidth, H = () => mount.clientHeight;

      renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(W(), H());
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.7));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.12;
      mount.appendChild(renderer.domElement);
      renderer.domElement.style.display = 'block';

      scene = new THREE.Scene();
      const STONE = new THREE.Color('#D7C5A3');   // حجر رملي دافئ
      const WARM  = new THREE.Color('#FFF0CE');   // شمس كويتية
      const WINE  = new THREE.Color('#5E2A2E');
      // هواء خليجي صافٍ — ضباب دافئ خفيف جدًا في العمق فقط
      scene.fog = new THREE.FogExp2(new THREE.Color('#E8DCC2'), 0.012);

      camera = new THREE.PerspectiveCamera(40, W() / H(), 0.1, 100);
      camera.position.set(0, 1.75, 9);
      camera.lookAt(0, 2.1, -4);

      // أرضية حجرية
      const floorMat = new THREE.MeshStandardMaterial({ color: STONE.clone().multiplyScalar(1.02), roughness: 0.97, metalness: 0.0 });
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), floorMat);
      floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

      // جدار حجري بفتحة قوس (روح اللوجو)
      const wallW = 20, wallH = 11, archW = 3.1, archLeg = 2.7, thick = 0.9;
      const s = new THREE.Shape();
      s.moveTo(-wallW/2, 0); s.lineTo(wallW/2, 0); s.lineTo(wallW/2, wallH); s.lineTo(-wallW/2, wallH); s.closePath();
      const hole = new THREE.Path(); const aw = archW/2;
      hole.moveTo(-aw, 0); hole.lineTo(-aw, archLeg); hole.absarc(0, archLeg, aw, Math.PI, 0, true); hole.lineTo(aw, 0); hole.lineTo(-aw, 0);
      s.holes.push(hole);
      const wallGeo = new THREE.ExtrudeGeometry(s, { depth: thick, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2, curveSegments: 64 });
      wallGeo.translate(0, 0, -thick/2);
      const wallMat = new THREE.MeshStandardMaterial({ color: STONE.clone().multiplyScalar(0.97), roughness: 0.95, metalness: 0.0 });
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.set(0, 0, -5); wall.castShadow = true; wall.receiveShadow = true; scene.add(wall);

      // جدار جانبي يصنع عمقًا/انضغاطًا (ثريشولد) + ظلًّا
      const sideMat = new THREE.MeshStandardMaterial({ color: STONE.clone().multiplyScalar(0.9), roughness: 0.96 });
      const side = new THREE.Mesh(new THREE.BoxGeometry(0.9, wallH, 9), sideMat);
      side.position.set(-6.2, wallH/2, -0.5); side.castShadow = true; side.receiveShadow = true; scene.add(side);

      // حافة معدن باردة تتبع القوس
      const metalMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#B3B8BD'), roughness: 0.3, metalness: 0.92 });
      const arc = new THREE.EllipseCurve(0, archLeg, aw+0.02, aw+0.02, Math.PI, 0, true).getPoints(64).map(p => new THREE.Vector3(p.x, p.y, 0));
      arc.unshift(new THREE.Vector3(-aw-0.02, 0, 0)); arc.push(new THREE.Vector3(aw+0.02, 0, 0));
      const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arc), 128, 0.028, 8, false), metalMat);
      tube.position.set(0, 0, -5 + thick/2 + 0.02); scene.add(tube);

      // ── الضوء الكويتي: شمس واحدة حادّة + ظل عميق دافئ ──
      scene.add(new THREE.AmbientLight(0xffffff, 0.1)); // منخفض جدًا = ظل عميق
      const hemi = new THREE.HemisphereLight(new THREE.Color('#F5E8CC'), new THREE.Color('#6E5E44'), 0.45); // ارتداد دافئ يلوّن الظل (مش أسود)
      scene.add(hemi);
      const sun = new THREE.DirectionalLight(WARM, 3.7);
      sun.position.set(-7.5, 6.5, -11); // منخفضة ومائلة = ظل طويل يعبر الأرضية
      sun.target.position.set(1.5, 0.5, 2);
      sun.castShadow = true;
      sun.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048);
      sun.shadow.camera.near = 1; sun.shadow.camera.far = 55;
      sun.shadow.camera.left = -18; sun.shadow.camera.right = 18; sun.shadow.camera.top = 16; sun.shadow.camera.bottom = -6;
      sun.shadow.bias = -0.0004; sun.shadow.radius = 2.6; // ظل شبه حادّ (شمس خليجية)
      scene.add(sun); scene.add(sun.target);
      // انعكاس عنّابي خافت جدًا في جهة الظل
      const wine = new THREE.PointLight(WINE, 2.2, 16, 2); wine.position.set(4.5, 2.2, 0.5); scene.add(wine);

      const onScroll = () => {
        const r = mount.getBoundingClientRect();
        const total = window.innerHeight + mount.offsetHeight;
        tS = Math.min(1, Math.max(0, (window.innerHeight - r.top) / total));
      };
      const onPointer = (e) => { const r = mount.getBoundingClientRect(); tpx = ((e.clientX-r.left)/r.width-0.5)*2; tpy = ((e.clientY-r.top)/r.height-0.5)*2; };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      if (!isMobile && !reduce) window.addEventListener('pointermove', onPointer, { passive: true });
      ro = new ResizeObserver(() => { renderer.setSize(W(), H()); camera.aspect = W()/H(); camera.updateProjectionMatrix(); }); ro.observe(mount);

      const clock = new THREE.Clock();
      const render = () => {
        const t = clock.getElapsedTime();
        sT += (tS - sT) * 0.06; px += (tpx-px)*0.05; py += (tpy-py)*0.05;
        // الشمس تنخفض ببطء → الظل يطول (زحف نهار حادّ)
        const drift = reduce ? 0 : Math.sin(t*0.12)*0.5;
        sun.position.x = -7.5 + drift - sT*2;
        sun.position.y = 6.5 - sT*2.2;   // تنخفض مع الاسكرول = ظل أطول
        renderer.toneMappingExposure = 1.12 - sT*0.16; // الداخل أكثر حماية/هدوءًا
        wine.intensity = 2.0 + (reduce ? 0 : Math.sin(t*0.5)*0.6);
        // عبور العتبة: الكاميرا تتقدّم نحو القوس وتنخفض قليلًا
        camera.position.x = px * 0.45;
        camera.position.y = 1.75 - py*0.2 - sT*0.15;
        camera.position.z = 9 - sT*5.2;   // تعبر باتجاه الداخل
        camera.lookAt(0, 2.1 - sT*0.5, -4);
        renderer.render(scene, camera);
        if (!disposed && !reduce) frame = requestAnimationFrame(render);
      };
      render();
      if (reduce) renderer.render(scene, camera);

      mount._cleanup = () => {
        window.removeEventListener('scroll', onScroll); window.removeEventListener('pointermove', onPointer);
        if (ro) ro.disconnect(); cancelAnimationFrame(frame); renderer.dispose();
        [wallGeo, floor.geometry, tube.geometry, side.geometry].forEach(g => g.dispose());
        [floorMat, wallMat, metalMat, sideMat].forEach(m => m.dispose());
        if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      };
    })();
    return () => { disposed = true; if (mount && mount._cleanup) mount._cleanup(); };
  }, []);
  return <div ref={mountRef} className={className} aria-hidden="true" />;
}

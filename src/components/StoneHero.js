'use client';
import { useEffect, useRef } from 'react';

/**
 * لحظة العون التوقيعية: فراغ معماري — ضوء دافئ ينساب عبر قوس حجري.
 * القوس مشتق من هندسة اللوجو (الاحتواء/الإسناد). WebGL خفيف، محسّن، مع fallback.
 * scroll-driven (زاوية الضوء + الكاميرا) + parallax خفيف بالمؤشر. يحترم reduced-motion والموبايل.
 */
export default function StoneHero({ className }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 900px)').matches;

    // اكتشاف WebGL — fallback أنيق لو غير متاح
    const test = document.createElement('canvas');
    const gl = test.getContext('webgl2') || test.getContext('webgl');
    if (!gl) { mount.dataset.fallback = 'true'; return; }

    let renderer, scene, camera, frame, ro, disposed = false;
    let THREE;
    let scrollT = 0, targetScroll = 0, px = 0, py = 0, tpx = 0, tpy = 0;

    (async () => {
      THREE = await import('three');
      if (disposed) return;

      const W = () => mount.clientWidth;
      const H = () => mount.clientHeight;

      renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(W(), H());
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.6));
      renderer.shadowMap.enabled = !isMobile;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.18;
      mount.appendChild(renderer.domElement);
      renderer.domElement.style.display = 'block';

      scene = new THREE.Scene();
      const STONE = new THREE.Color('#D8CCB6');   // حجر دافئ فاتح
      const WINE = new THREE.Color('#5E2A2E');    // عنّابي
      const WARM = new THREE.Color('#F3E4C6');     // ضوء دافئ
      scene.fog = new THREE.FogExp2(new THREE.Color('#EDE6D8'), 0.02);

      camera = new THREE.PerspectiveCamera(42, W() / H(), 0.1, 100);
      camera.position.set(0, 1.7, 8.4);
      camera.lookAt(0, 2.0, -4);

      // ── الأرضية الحجرية ──
      const floorMat = new THREE.MeshStandardMaterial({ color: STONE, roughness: 0.94, metalness: 0.02 });
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);

      // ── الجدار الحجري بفتحة قوس (مشتقة من قوس اللوجو) ──
      const wallW = 16, wallH = 9, archW = 3.0, archLegH = 2.6, thick = 0.7;
      const s = new THREE.Shape();
      s.moveTo(-wallW / 2, 0); s.lineTo(wallW / 2, 0); s.lineTo(wallW / 2, wallH); s.lineTo(-wallW / 2, wallH); s.closePath();
      const hole = new THREE.Path();
      const aw = archW / 2;
      hole.moveTo(-aw, 0); hole.lineTo(-aw, archLegH);
      hole.absarc(0, archLegH, aw, Math.PI, 0, true);
      hole.lineTo(aw, 0); hole.lineTo(-aw, 0);
      s.holes.push(hole);
      const wallGeo = new THREE.ExtrudeGeometry(s, { depth: thick, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2, curveSegments: 48 });
      wallGeo.translate(0, 0, -thick / 2);
      const wallMat = new THREE.MeshStandardMaterial({ color: STONE.clone().multiplyScalar(0.96), roughness: 0.9, metalness: 0.03 });
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.set(0, 0, -4.5);
      wall.castShadow = true; wall.receiveShadow = true;
      scene.add(wall);

      // ── حافة معدنية باردة تتبع القوس ──
      const metalMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#AEB4BA'), roughness: 0.28, metalness: 0.9 });
      const arcCurve = new THREE.EllipseCurve(0, archLegH, aw + 0.03, aw + 0.03, Math.PI, 0, true);
      const pts = arcCurve.getPoints(60).map((p) => new THREE.Vector3(p.x, p.y, 0));
      pts.unshift(new THREE.Vector3(-aw - 0.03, 0, 0));
      pts.push(new THREE.Vector3(aw + 0.03, 0, 0));
      const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.035, 10, false), metalMat);
      tube.position.set(0, 0, -4.5 + thick / 2 + 0.02);
      scene.add(tube);

      // ── الإضاءة: شعاع دافئ يتسلّل عبر القوس ──
      scene.add(new THREE.AmbientLight(0xffffff, 0.34));
      const hemi = new THREE.HemisphereLight(new THREE.Color('#F6EEDD'), new THREE.Color('#8A7C6B'), 0.5);
      scene.add(hemi);

      const key = new THREE.DirectionalLight(WARM, 2.5);
      key.position.set(0.6, 5.2, -12);
      key.target.position.set(0, 1.6, 0);
      key.castShadow = !isMobile;
      if (key.castShadow) {
        key.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048);
        key.shadow.camera.near = 1; key.shadow.camera.far = 40;
        key.shadow.camera.left = -14; key.shadow.camera.right = 14;
        key.shadow.camera.top = 14; key.shadow.camera.bottom = -6;
        key.shadow.bias = -0.0005; key.shadow.radius = 5;
      }
      scene.add(key); scene.add(key.target);

      // لمسة عنّابي سيادية (rim)
      const wineLight = new THREE.PointLight(WINE, 8, 20, 2);
      wineLight.position.set(-4.5, 2.4, -1.5);
      scene.add(wineLight);
      const fill = new THREE.DirectionalLight(new THREE.Color('#CFE0EA'), 0.25);
      fill.position.set(-6, 3, 6);
      scene.add(fill);

      // ── التفاعل ──
      const onScroll = () => {
        const sc = mount.getBoundingClientRect();
        const total = window.innerHeight + mount.offsetHeight;
        targetScroll = Math.min(1, Math.max(0, (window.innerHeight - sc.top) / total));
      };
      const onPointer = (e) => {
        const r = mount.getBoundingClientRect();
        tpx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        tpy = ((e.clientY - r.top) / r.height - 0.5) * 2;
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      if (!isMobile && !reduce) window.addEventListener('pointermove', onPointer, { passive: true });

      const resize = () => { renderer.setSize(W(), H()); camera.aspect = W() / H(); camera.updateProjectionMatrix(); };
      ro = new ResizeObserver(resize); ro.observe(mount);

      const clock = new THREE.Clock();
      const render = () => {
        const t = clock.getElapsedTime();
        scrollT += (targetScroll - scrollT) * 0.06;
        px += (tpx - px) * 0.05; py += (tpy - py) * 0.05;
        // الضوء ينساب: زاوية الشعاع الدافئ تتحرك ببطء + مع الاسكرول
        const sway = reduce ? 0 : Math.sin(t * 0.18) * 1.4;
        key.position.x = 0.6 + sway - scrollT * 1.2;
        key.position.y = 5.2 - scrollT * 1.0;
        wineLight.intensity = 7 + (reduce ? 0 : Math.sin(t * 0.5) * 1.5);
        // كاميرا: دفع بطيء مع الاسكرول + parallax خفيف
        camera.position.x = px * 0.5;
        camera.position.y = 1.7 - py * 0.25 + scrollT * 0.6;
        camera.position.z = 8.4 - scrollT * 2.2;
        camera.lookAt(0, 2.0 + scrollT * 0.4, -4);
        renderer.render(scene, camera);
        if (!disposed && !reduce) frame = requestAnimationFrame(render);
      };
      render();
      if (reduce) { renderer.render(scene, camera); } // إطار ثابت واحد

      mount._cleanup = () => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('pointermove', onPointer);
        if (ro) ro.disconnect();
        cancelAnimationFrame(frame);
        renderer.dispose();
        wallGeo.dispose(); floor.geometry.dispose(); tube.geometry.dispose();
        [floorMat, wallMat, metalMat].forEach((m) => m.dispose());
        if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      };
    })();

    return () => { disposed = true; if (mount && mount._cleanup) mount._cleanup(); };
  }, []);

  return <div ref={mountRef} className={className} aria-hidden="true" />;
}

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * 3D Anatomical Human Heart Component
 * Features:
 * - Procedural striated myocardium tissue & bump map
 * - Red Aortic Arch & superior branches
 * - Blue Vena Cava & Pulmonary Trunk bifurcation
 * - Cyan veins & Scarlet coronary arteries with bioluminescent glow
 * - Real-time Lub-Dub cardiac pulse & 360° drag-to-rotate interaction
 */
export function Heart3DViewer() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.25, 5.8);

    // Studio three-point + cyan/purple rim lighting
    scene.add(new THREE.AmbientLight(0x1e293b, 1.45));

    const keyLight = new THREE.DirectionalLight(0xfff1e6, 3.2);
    keyLight.position.set(3.5, 4.8, 5.5);
    scene.add(keyLight);

    const cyanRim = new THREE.DirectionalLight(0x38bdf8, 2.6);
    cyanRim.position.set(-5.5, 2.0, 1.5);
    scene.add(cyanRim);

    const purpleRim = new THREE.PointLight(0xa855f7, 3.5, 9);
    purpleRim.position.set(-3.2, -0.4, 1.8);
    scene.add(purpleRim);

    const warmFill = new THREE.DirectionalLight(0xf87171, 1.85);
    warmFill.position.set(5.0, -1.5, 2.5);
    scene.add(warmFill);

    // Procedural striated myocardium & epicardial fat texture
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#6e1414');
    grad.addColorStop(0.5, '#8a1c19');
    grad.addColorStop(1, '#4c0b0e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 1800; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const len = 15 + Math.random() * 30;
      const angle = Math.PI / 6 + (Math.random() - 0.5) * 0.35;
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(185, 38, 32, 0.24)' : 'rgba(55, 6, 8, 0.26)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
      ctx.stroke();
    }
    const tissueTex = new THREE.CanvasTexture(canvas);

    const myocardiumMat = new THREE.MeshPhysicalMaterial({
      map: tissueTex,
      bumpMap: tissueTex,
      bumpScale: 0.04,
      color: 0xb82522,
      roughness: 0.34,
      clearcoat: 0.85,
      clearcoatRoughness: 0.18,
    });

    const aortaMat = new THREE.MeshPhysicalMaterial({
      color: 0xc81e1e,
      roughness: 0.28,
      clearcoat: 0.9,
    });

    const venaCavaMat = new THREE.MeshPhysicalMaterial({
      color: 0x28559a,
      roughness: 0.32,
      clearcoat: 0.82,
    });

    const arteryMat = new THREE.MeshPhysicalMaterial({
      color: 0xff1e1e,
      emissive: 0xb91c1c,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      clearcoat: 1.0,
    });

    const veinMat = new THREE.MeshPhysicalMaterial({
      color: 0x00e5ff,
      emissive: 0x0284c7,
      emissiveIntensity: 0.75,
      roughness: 0.18,
      clearcoat: 1.0,
    });

    const heartGroup = new THREE.Group();
    heartGroup.position.set(0, -0.15, 0);
    scene.add(heartGroup);

    // Sculpted Ventricular Myocardium
    const bodyGeo = new THREE.SphereGeometry(1.18, 80, 80);
    const pos = bodyGeo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const ny = v.y / 1.18;
      if (ny < 0) {
        const t = Math.abs(ny);
        v.x = v.x * THREE.MathUtils.lerp(1.06, 0.32, Math.pow(t, 1.35)) + Math.pow(t, 1.15) * 0.58;
        v.z = v.z * THREE.MathUtils.lerp(0.86, 0.3, Math.pow(t, 1.4)) + Math.pow(t, 1.2) * 0.18;
        v.y *= 1.32;
      } else {
        v.x = v.x * THREE.MathUtils.lerp(1.06, 0.85, Math.pow(ny, 1.6)) - ny * 0.12;
        v.z *= THREE.MathUtils.lerp(0.86, 0.72, Math.pow(ny, 1.5));
      }
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    bodyGeo.computeVertexNormals();
    const ventricles = new THREE.Mesh(bodyGeo, myocardiumMat);
    heartGroup.add(ventricles);

    // Right & Left Atria / Auricles
    const rightAtrium = new THREE.Mesh(new THREE.SphereGeometry(0.58, 36, 36), myocardiumMat);
    rightAtrium.position.set(-0.82, 0.58, 0.28);
    rightAtrium.scale.set(0.95, 0.82, 0.78);
    heartGroup.add(rightAtrium);

    const leftAuricle = new THREE.Mesh(new THREE.SphereGeometry(0.45, 36, 36), myocardiumMat);
    leftAuricle.position.set(0.86, 0.56, 0.12);
    leftAuricle.scale.set(1.05, 0.72, 0.75);
    heartGroup.add(leftAuricle);

    // Helper for tubular vessels
    const addTube = (pts: [number, number, number][], r: number, mat: THREE.Material) => {
      const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
      const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, r, 24, false), mat);
      heartGroup.add(mesh);
      return mesh;
    };

    // Aortic Arch + 3 Superior Branches
    addTube([[-0.08, 0.55, 0.18], [-0.14, 1.15, 0.24], [-0.04, 1.68, 0.18], [0.24, 1.78, 0.02], [0.48, 1.48, -0.24]], 0.36, aortaMat);
    addTube([[-0.12, 1.56, 0.18], [-0.24, 2.36, 0.14]], 0.135, aortaMat);
    addTube([[0.06, 1.68, 0.12], [0.12, 2.42, 0.08]], 0.11, aortaMat);
    addTube([[0.25, 1.65, 0.02], [0.38, 2.32, -0.05]], 0.105, aortaMat);

    // Pulmonary Trunk & Superior/Inferior Vena Cava
    addTube([[-0.15, 0.45, 0.56], [0.08, 0.92, 0.52], [0.38, 1.18, 0.36], [0.88, 1.16, 0.25]], 0.27, venaCavaMat);
    addTube([[-0.78, 0.65, 0.05], [-0.78, 1.38, -0.04], [-0.75, 2.18, -0.08]], 0.24, venaCavaMat);
    addTube([[-0.82, 1.15, -0.06], [-1.35, 1.32, -0.16]], 0.145, venaCavaMat);
    addTube([[-0.68, -0.35, -0.18], [-0.76, -1.68, -0.24]], 0.22, venaCavaMat);

    // Scarlet Coronary Arteries & Cyan Cardiac Veins
    addTube([[0.48, 0.55, 0.66], [0.64, 0.22, 0.84], [0.68, -0.15, 0.91], [0.62, -0.55, 0.86], [0.46, -1.28, 0.52]], 0.042, arteryMat);
    addTube([[-0.38, 0.55, 0.76], [-0.12, 0.02, 1.03], [-0.08, -0.32, 0.99], [0.18, -1.02, 0.68]], 0.032, arteryMat);
    addTube([[0.42, 0.62, 0.68], [0.57, 0.26, 0.86], [0.61, -0.12, 0.93], [0.54, -0.52, 0.89], [0.36, -1.26, 0.56]], 0.038, veinMat);
    addTube([[-0.32, 0.62, 0.72], [-0.58, 0.42, 0.86], [-0.78, 0.16, 0.91], [-0.74, -0.54, 0.76]], 0.032, veinMat);

    // Interactive Drag Orbit
    let isDragging = false;
    let prev = { x: 0, y: 0 };
    const onDown = (e: PointerEvent) => { 
      isDragging = true; 
      prev = { x: e.clientX, y: e.clientY }; 
    };
    const onMove = (e: PointerEvent) => {
      if (!isDragging) return;
      heartGroup.rotation.y += (e.clientX - prev.x) * 0.008;
      heartGroup.rotation.x += (e.clientY - prev.y) * 0.008;
      prev = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => { isDragging = false; };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    // Handle container resize gracefully
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 550;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const phase = (t % 0.83) / 0.83;
      const pulse = Math.exp(-Math.pow((phase - 0.16) / 0.065, 2)) + 0.45 * Math.exp(-Math.pow((phase - 0.34) / 0.08, 2));
      ventricles.scale.set(1 + pulse * 0.045, 1 - pulse * 0.025, 1 + pulse * 0.045);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      domElement.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-[520px] rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing relative"
      style={{
        background: 'radial-gradient(circle at 50% 52%, rgba(14, 116, 144, 0.28) 0%, #06090f 75%)',
      }}
    />
  );
}

// Named export for ResultsPage & default export for Dashboard
export default Heart3DViewer;
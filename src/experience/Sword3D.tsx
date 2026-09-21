import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type * as Three from 'three';
import { bladeGeometry, swordPose } from './sword-geometry';

export interface SwordHandle {
  setPose: (progress: number, velocity: number) => void;
  setActive: (active: boolean) => void;
}
type Engine = { pose: (progress: number, velocity: number) => void; active: (value: boolean) => void; dispose: () => void };

function createSword(T: typeof Three) {
  const model = new T.Group();
  const steel = new T.MeshStandardMaterial({ color: '#c9b6aa', metalness: .96, roughness: .23 });
  const edge = new T.MeshStandardMaterial({ color: '#eadcca', metalness: .93, roughness: .21 });
  const darkMetal = new T.MeshStandardMaterial({ color: '#806269', metalness: .86, roughness: .34 });
  const leather = new T.MeshStandardMaterial({ color: '#431b30', metalness: .12, roughness: .72 });
  const wrap = new T.MeshStandardMaterial({ color: '#683b49', metalness: .2, roughness: .61 });
  const data = bladeGeometry();
  const blade = new T.BufferGeometry();
  blade.setAttribute('position', new T.Float32BufferAttribute(data.positions, 3));
  blade.setIndex(data.indices);
  // Each bevel remains a plane: shared normals would turn a sharp blade into an inflated capsule.
  const facetedBlade = blade.toNonIndexed();
  blade.dispose();
  facetedBlade.computeVertexNormals();
  for (let offset = 0; offset < 192; offset += 6) {
    const facet = (offset / 6) % 8;
    facetedBlade.addGroup(offset, 6, [0, 3, 4, 7].includes(facet) ? 1 : 0);
  }
  facetedBlade.addGroup(192, facetedBlade.getAttribute('position').count - 192, 0);
  const bladeMesh = new T.Mesh(facetedBlade, [steel, edge]);
  model.add(bladeMesh);

  const add = (geometry: Three.BufferGeometry, material: Three.Material, y: number) => {
    const mesh = new T.Mesh(geometry, material); mesh.position.y = y; model.add(mesh); return mesh;
  };
  const guard = new T.Shape();
  guard.moveTo(-.89, 1.96);
  guard.bezierCurveTo(-.68, 2.04, -.32, 2.09, 0, 2.03);
  guard.bezierCurveTo(.32, 2.09, .68, 2.04, .89, 1.96);
  guard.lineTo(.88, 1.84);
  guard.bezierCurveTo(.52, 1.88, .27, 1.91, .17, 1.78);
  guard.lineTo(0, 1.69); guard.lineTo(-.17, 1.78);
  guard.bezierCurveTo(-.27, 1.91, -.52, 1.88, -.88, 1.84);
  guard.closePath();
  const guardMesh = add(new T.ExtrudeGeometry(guard, { depth: .19, bevelEnabled: true, bevelSize: .045, bevelThickness: .04, bevelSegments: 3, steps: 1, curveSegments: 16 }), steel, 0);
  guardMesh.position.z = -.095;
  add(new T.CylinderGeometry(.139, .173, 1.24, 32), leather, 2.74);
  for (let index = 0; index < 11; index++) {
    const band = add(new T.TorusGeometry(.145 + (1 - index / 11) * .024, .012, 6, 40), wrap, 2.2 + index * .106);
    band.rotation.x = Math.PI / 2; band.rotation.y = .07;
  }
  add(new T.CylinderGeometry(.18, .18, .09, 32), darkMetal, 2.12);
  add(new T.CylinderGeometry(.153, .153, .085, 32), edge, 3.39);
  const pommel = add(new T.SphereGeometry(.235, 32, 20), steel, 3.56);
  pommel.scale.set(1, .8, .74);
  add(new T.CylinderGeometry(.09, .13, .08, 16), darkMetal, 3.73);
  return model;
}

async function createEngine(canvas: HTMLCanvasElement, initialProgress: number, cancelled: () => boolean): Promise<Engine> {
  const [T, { RoomEnvironment }] = await Promise.all([import('three'), import('three/addons/environments/RoomEnvironment.js')]);
  if (cancelled()) throw new Error('Sword initialization cancelled');
  const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(27, 1, .1, 100);
  camera.position.set(0, 0, 17.8);
  const environment = new RoomEnvironment();
  const pmrem = new T.PMREMGenerator(renderer);
  const reflection = pmrem.fromScene(environment, .035);
  scene.environment = reflection.texture;
  scene.environmentIntensity = 1;
  environment.dispose(); pmrem.dispose();
  scene.add(new T.HemisphereLight('#ffe4c1', '#492339', .5));
  const key = new T.DirectionalLight('#fff1d6', 2.4); key.position.set(-4, 4, 5); scene.add(key);
  const rim = new T.DirectionalLight('#e5bdba', 1.8); rim.position.set(4, -1, -4); scene.add(rim);
  const fill = new T.DirectionalLight('#c6d3e0', .5); fill.position.set(2, 1, 4); scene.add(fill);
  const model = createSword(T); scene.add(model);
  let active = true, disposed = false, frame = 0, previous = 0;
  let target = swordPose(initialProgress, 0), turn = target.turn, tilt = target.tilt, impulse = 0;
  let impulseTarget = 0, impulseUntil = 0;
  const render = () => { model.rotation.set(.035, turn + impulse, tilt); renderer.render(scene, camera); };
  const animate = (now: number) => {
    frame = 0;
    if (!active || disposed || document.hidden) return;
    const dt = previous ? Math.min(64, now - previous) : 16;
    previous = now;
    const damping = 1 - Math.exp(-dt / 115);
    if (now > impulseUntil) impulseTarget = 0;
    turn += (target.turn - turn) * damping; tilt += (target.tilt - tilt) * damping;
    impulse += (impulseTarget - impulse) * (1 - Math.exp(-dt / 190));
    render();
    if (Math.abs(target.turn - turn) + Math.abs(target.tilt - tilt) + Math.abs(impulse) > .0004 || now < impulseUntil) frame = requestAnimationFrame(animate);
    else previous = 0;
  };
  const invalidate = () => { if (!frame && active && !document.hidden && !disposed) frame = requestAnimationFrame(animate); };
  const resize = () => {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height || disposed) return;
    renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); invalidate();
  };
  const observer = new ResizeObserver(resize); observer.observe(canvas);
  const visibility = () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; previous = 0; } else invalidate(); };
  document.addEventListener('visibilitychange', visibility);
  resize();
  return {
    pose(progress, velocity) { target = swordPose(progress, velocity); impulseTarget = target.impulse; impulseUntil = performance.now() + 110; invalidate(); },
    active(value) {
      if (active === value) return;
      active = value;
      if (value) { turn = target.turn; tilt = target.tilt; impulse = 0; invalidate(); }
      else { cancelAnimationFrame(frame); frame = 0; previous = 0; }
    },
    dispose() {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect(); document.removeEventListener('visibilitychange', visibility);
      const materials = new Set<Three.Material>();
      model.traverse(object => { if (object instanceof T.Mesh) { object.geometry.dispose(); const source = object.material; (Array.isArray(source) ? source : [source]).forEach(material => materials.add(material)); } });
      materials.forEach(material => material.dispose()); reflection.dispose(); renderer.dispose(); renderer.forceContextLoss();
    },
  };
}

/** A demand-rendered object only; the sky and typography remain accessible DOM layers. */
export const Sword3D = forwardRef<SwordHandle>(function Sword3D(_, ref) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const element = useRef<HTMLDivElement>(null);
  const engine = useRef<Engine | null>(null);
  const pose = useRef({ progress: 0, velocity: 0, active: false });
  const [failed, setFailed] = useState(false);
  useImperativeHandle(ref, () => ({
    setPose(progress, velocity) { pose.current = { ...pose.current, progress, velocity }; engine.current?.pose(progress, velocity); },
    setActive(active) { pose.current = { ...pose.current, active }; engine.current?.active(active); },
  }), []);
  useEffect(() => {
    if (!element.current || !canvas.current) return;
    let cancelled = false, starting = false;
    const observedCanvas = canvas.current;
    const observer = new IntersectionObserver(entries => {
      const visible = entries.some(entry => entry.isIntersecting);
      if (visible && !starting) {
        starting = true;
        void createEngine(observedCanvas, pose.current.progress, () => cancelled).then(instance => {
          if (cancelled) { instance.dispose(); return; }
          engine.current = instance; instance.pose(pose.current.progress, pose.current.velocity); instance.active(pose.current.active);
        }).catch(error => { if (!cancelled) { console.warn('Sword WebGL unavailable; showing the approved still.', error); setFailed(true); } });
      }
      engine.current?.active(visible && pose.current.active);
    }, { rootMargin: '150px' });
    observer.observe(element.current);
    return () => { cancelled = true; observer.disconnect(); engine.current?.dispose(); engine.current = null; };
  }, []);
  return <div ref={element} className="sword-position" aria-hidden="true">
    {failed ? <img src="/assets/worlds/sword-fallback.png" alt="" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: 'auto', maxWidth: 'none', height: '100%' }} />
      : <canvas ref={canvas} style={{ display: 'block', width: '100%', height: '100%' }} />}
  </div>;
});

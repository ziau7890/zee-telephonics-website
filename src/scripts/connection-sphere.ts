/**
 * The animated "connection sphere": a rotating globe of points with light pulses
 * travelling along arcs between them. Abstract points only, never real places.
 * Loaded on demand by hero-loader.ts, never on the critical path.
 */
import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  Line,
  Mesh,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  WebGLRenderer,
} from 'three';
import { fibonacciSphere, arcPoints, dot, type Vec3 } from '../lib/sphere';

export interface SphereOptions {
  lite: boolean; // phones and tablets: fewer points, no pointer tilt
}

const CYAN = new Color('#00D4FF');
const BLUE = new Color('#1E5EFF');
const DOT = new Color('#9FE9FF');

const pointVertex = /* glsl */ `
  attribute float aSize;
  uniform float uPixelRatio;
  varying float vDepth;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(mat3(modelViewMatrix) * position);
    vDepth = clamp(n.z * 0.5 + 0.5, 0.0, 1.0);
    gl_PointSize = aSize * uPixelRatio * (0.55 + vDepth * 0.75) * (6.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;
const pointFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vDepth;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.15, d);
    gl_FragColor = vec4(uColor, a * (0.12 + vDepth * 0.78));
  }
`;
const arcVertex = /* glsl */ `
  attribute float aT;
  varying float vT;
  void main() {
    vT = aT;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const arcFragment = /* glsl */ `
  uniform float uHead;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uFade;
  varying float vT;
  void main() {
    float tail = 0.35;
    float d = uHead - vT;
    float pulse = (d >= 0.0 && d <= tail) ? pow(1.0 - d / tail, 2.2) : 0.0;
    float base = 0.32 * step(vT, uHead);
    vec3 col = mix(uColorA, uColorB, pulse);
    gl_FragColor = vec4(col, (base + pulse) * uFade);
  }
`;
const headFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vDepth;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.18, 0.0, d);
    float halo = smoothstep(0.5, 0.0, d) * 0.45;
    gl_FragColor = vec4(mix(uColor, vec3(1.0), core * 0.6), (core + halo) * (0.35 + vDepth * 0.65));
  }
`;
const glowVertex = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const glowFragment = /* glsl */ `
  uniform vec3 uColor;
  varying vec3 vNormal;
  void main() {
    // Back faces of a slightly larger sphere: z runs from 0 at the outer edge to -1
    // at the centre. Peak just outside the globe, fading both ways, so it reads as a halo.
    float z = vNormal.z;
    float i = exp(-pow((z + 0.42) / 0.2, 2.0)) * 0.4;
    gl_FragColor = vec4(uColor * i, i);
  }
`;

interface Arc {
  line: Line;
  path: Float32Array;
  material: ShaderMaterial;
  start: number;
  duration: number;
}

export function createConnectionSphere(canvas: HTMLCanvasElement, opts: SphereOptions) {
  const renderer = new WebGLRenderer({ canvas, antialias: !opts.lite, alpha: true, powerPreference: 'low-power' });
  const pixelRatio = Math.min(window.devicePixelRatio || 1, opts.lite ? 1.25 : 1.5);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 50);
  camera.position.set(0, 0, 4.7);

  const globe = new Group();
  globe.rotation.set(0.32, -0.55, 0);
  scene.add(globe);

  // Points --------------------------------------------------------------
  const count = opts.lite ? 700 : 1500;
  const pts = fibonacciSphere(count);
  const pos = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  pts.forEach((p, i) => {
    pos.set(p, i * 3);
    sizes[i] = 1.6 + Math.random() * 1.4;
  });
  const pointGeo = new BufferGeometry();
  pointGeo.setAttribute('position', new BufferAttribute(pos, 3));
  pointGeo.setAttribute('aSize', new BufferAttribute(sizes, 1));
  const pointMat = new ShaderMaterial({
    vertexShader: pointVertex,
    fragmentShader: pointFragment,
    uniforms: { uColor: { value: DOT }, uPixelRatio: { value: pixelRatio } },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  globe.add(new Points(pointGeo, pointMat));

  // Atmosphere glow -------------------------------------------------------
  const glowMat = new ShaderMaterial({
    vertexShader: glowVertex,
    fragmentShader: glowFragment,
    uniforms: { uColor: { value: BLUE } },
    side: BackSide,
    blending: AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  const glow = new Mesh(new SphereGeometry(1.18, 48, 48), glowMat);
  scene.add(glow);

  // Arcs ------------------------------------------------------------------
  const SEGMENTS = 64;
  const arcCount = opts.lite ? 9 : 18;
  const arcs: Arc[] = [];
  const pick = (): [Vec3, Vec3] => {
    for (;;) {
      const a = pts[Math.floor(Math.random() * count)];
      const b = pts[Math.floor(Math.random() * count)];
      const d = dot(a, b);
      if (d < 0.85 && d > -0.4) return [a, b];
    }
  };
  const buildArcGeometry = (geo: BufferGeometry) => {
    const [a, b] = pick();
    const p = arcPoints(a, b, SEGMENTS);
    const arr = new Float32Array((SEGMENTS + 1) * 3);
    p.forEach((v, i) => arr.set(v, i * 3));
    geo.setAttribute('position', new BufferAttribute(arr, 3));
    geo.computeBoundingSphere();
    return arr;
  };
  const tAttr = new Float32Array(SEGMENTS + 1).map((_, i) => i / SEGMENTS);

  let now = 0;
  for (let i = 0; i < arcCount; i++) {
    const geo = new BufferGeometry();
    geo.setAttribute('aT', new BufferAttribute(tAttr, 1));
    const path = buildArcGeometry(geo);
    const material = new ShaderMaterial({
      vertexShader: arcVertex,
      fragmentShader: arcFragment,
      uniforms: {
        uHead: { value: 0 },
        uColorA: { value: BLUE },
        uColorB: { value: CYAN },
        uFade: { value: 1 },
      },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    const line = new Line(geo, material);
    globe.add(line);
    arcs.push({ line, path, material, start: -Math.random() * 4, duration: 2.4 + Math.random() * 1.8 });
  }

  // Bright "signal" heads travelling along each arc ---------------------------
  const headPos = new Float32Array(arcCount * 3);
  const headSize = new Float32Array(arcCount).fill(opts.lite ? 9 : 11);
  const headGeo = new BufferGeometry();
  headGeo.setAttribute('position', new BufferAttribute(headPos, 3));
  headGeo.setAttribute('aSize', new BufferAttribute(headSize, 1));
  const headMat = new ShaderMaterial({
    vertexShader: pointVertex,
    fragmentShader: headFragment,
    uniforms: { uColor: { value: CYAN }, uPixelRatio: { value: pixelRatio } },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const heads = new Points(headGeo, headMat);
  heads.frustumCulled = false;
  globe.add(heads);

  // Sizing ----------------------------------------------------------------
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  // Pointer tilt (desktop only) -------------------------------------------
  let tx = 0, ty = 0, cx = 0, cy = 0;
  const onPointer = (e: PointerEvent) => {
    tx = (e.clientX / window.innerWidth - 0.5) * 0.35;
    ty = (e.clientY / window.innerHeight - 0.5) * 0.25;
  };
  if (!opts.lite) window.addEventListener('pointermove', onPointer, { passive: true });

  // Loop ------------------------------------------------------------------
  let raf = 0;
  let running = false;
  let last = performance.now();
  let firstFrame = true;
  const minFrame = 1000 / 60 - 1;

  const frame = (t: number) => {
    raf = requestAnimationFrame(frame);
    const elapsed = t - last;
    if (elapsed < minFrame) return; // cap at 60 fps on high-refresh screens
    const dt = Math.min(elapsed, 100) / 1000;
    last = t;
    now += dt;

    globe.rotation.y += dt * 0.06;
    cx += (tx - cx) * 0.04;
    cy += (ty - cy) * 0.04;
    scene.rotation.y = cx;
    scene.rotation.x = cy;

    arcs.forEach((arc, k) => {
      const local = (now - arc.start) / arc.duration;
      const head = Math.min(1, Math.max(0, local * 1.28));
      const idx = Math.round(head * SEGMENTS) * 3;
      const visible = local > 0 && local < 1;
      headPos[k * 3] = arc.path[idx];
      headPos[k * 3 + 1] = arc.path[idx + 1];
      headPos[k * 3 + 2] = arc.path[idx + 2];
      headSize[k] = visible ? (opts.lite ? 9 : 11) : 0;
      if (local >= 1.35) {
        arc.path = buildArcGeometry(arc.line.geometry);
        arc.start = now + Math.random() * 1.5;
        arc.duration = 2.4 + Math.random() * 1.8;
        arc.material.uniforms.uHead.value = 0;
        return;
      }
      arc.material.uniforms.uHead.value = Math.max(0, local * 1.28);
      arc.material.uniforms.uFade.value = local > 1 ? 1 - (local - 1) / 0.35 : 1;
    });
    headGeo.attributes.position.needsUpdate = true;
    headGeo.attributes.aSize.needsUpdate = true;

    renderer.render(scene, camera);
    if (firstFrame) {
      firstFrame = false;
      canvas.dispatchEvent(new CustomEvent('sphere:ready'));
    }
  };

  const start = () => {
    if (running) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  const dispose = () => {
    stop();
    ro.disconnect();
    window.removeEventListener('pointermove', onPointer);
    scene.traverse((o) => {
      const m = o as Mesh;
      m.geometry?.dispose();
      const mat = m.material;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose();
    });
    renderer.dispose();
  };

  return { start, stop, dispose };
}

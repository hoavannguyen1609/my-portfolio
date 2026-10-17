import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
  viewChildren,
} from '@angular/core';
import { gsap } from 'gsap';
import {
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  Color,
  Group,
  IcosahedronGeometry,
  Line,
  LineBasicMaterial,
  LineDashedMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  QuadraticBezierCurve3,
  Scene,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  Vector3,
  WebGLRenderer,
  WireframeGeometry,
} from 'three';
import { PerformanceService } from '../../core/firebase/performance.service';
import { MotionService } from '../../core/motion.service';
import { MeshCanvas } from './mesh-canvas';

const LABELS = ['eDLM', 'Kafka', 'Elasticsearch', 'MySQL', 'Redis', 'Spring Boot', 'eTask', 'THADS', 'vdxp', 'Gateway', 'AWS S3', 'QueryDSL'];
const RADIUS = 2.2;

interface Arc {
  curve: QuadraticBezierCurve3;
  line: Line;
}

interface Packet {
  sprite: Sprite;
  arc: Arc;
  t: number;
  speed: number;
}

/** Điểm phân bố đều trên mặt cầu (xoắn Fibonacci). */
function fibonacciSphere(count: number, radius: number): Vector3[] {
  const points: Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    points.push(new Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(radius));
  }
  return points;
}

function glowTexture(): CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,.45)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new CanvasTexture(canvas);
}

/**
 * Cảnh 3D của hero: quả cầu điểm, lưới địa cầu, các service nối bằng cung,
 * bản tin chạy trên cung như sự kiện Kafka, hai vành quỹ đạo. Nhãn service là HTML chiếu theo toạ độ 3D.
 * Không có WebGL thì quay về canvas 2D.
 */
@Component({
  selector: 'app-hero-scene',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MeshCanvas],
  host: { class: 'pointer-events-none absolute inset-0 -z-10 block', 'aria-hidden': 'true' },
  template: `
    @if (fallback()) {
      <app-mesh-canvas />
    } @else {
      <canvas #canvas class="block size-full opacity-0"></canvas>
      @for (label of labels; track label) {
        <span #label class="absolute left-0 top-0 whitespace-nowrap rounded-full border border-line bg-surface/70 px-2 py-0.5 font-mono text-[10px] text-muted opacity-0 backdrop-blur-sm will-change-transform">{{ label }}</span>
      }
    }
  `,
})
export class HeroScene {
  protected readonly labels = LABELS;
  protected readonly fallback = signal(false);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly labelRefs = viewChildren<ElementRef<HTMLElement>>('label');
  private readonly motion = inject(MotionService);
  private readonly perf = inject(PerformanceService);

  private renderer?: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(40, 1, 0.1, 100);
  private root = new Group();
  private globe = new Group();
  private nodes: Vector3[] = [];
  private arcs: Arc[] = [];
  private packets: Packet[] = [];
  private satellites: { mesh: Mesh; radius: number; speed: number; tilt: number; phase: number }[] = [];
  private materials: {
    points?: PointsMaterial;
    wire?: LineBasicMaterial;
    arc?: LineBasicMaterial;
    ringA?: LineBasicMaterial;
    ringB?: LineDashedMaterial;
    seal?: MeshBasicMaterial;
    jade?: MeshBasicMaterial;
    glowSeal?: SpriteMaterial;
    glowJade?: SpriteMaterial;
    halo?: SpriteMaterial;
  } = {};
  private disposables: { dispose(): void }[] = [];
  private raf = 0;
  private visible = true;
  private pointer = { x: 0, y: 0 };
  private tilt = { x: 0, y: 0 };
  private spin = 0;
  private wide = true;
  private cleanups: (() => void)[] = [];
  private readonly tmp = new Vector3();
  private introPlayed = false;

  constructor() {
    afterNextRender(() => {
      try {
        this.setup();
      } catch {
        this.fallback.set(true);
      }
    });

    effect(() => {
      if (this.motion.introDone() && !this.fallback()) untracked(() => this.intro());
    });

    inject(DestroyRef).onDestroy(() => this.destroy());
  }

  private setup(): void {
    const canvas = this.canvasRef()!.nativeElement;
    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
    this.renderer.setClearColor(0x000000, 0);

    this.camera.position.set(0, 0, 9);
    this.scene.add(this.root);
    this.root.add(this.globe);
    this.build();
    this.applyColors();
    this.resize();

    const ro = new ResizeObserver(() => this.resize());
    ro.observe(this.host);
    const themeObserver = new MutationObserver(() => this.applyColors());
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const io = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      if (this.visible) this.loop();
    });
    io.observe(this.host);
    const onMove = (e: PointerEvent) => {
      this.pointer.x = (e.clientX / innerWidth) * 2 - 1;
      this.pointer.y = (e.clientY / innerHeight) * 2 - 1;
    };
    const onVisibility = () => !document.hidden && this.loop();
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    this.cleanups.push(
      () => ro.disconnect(),
      () => themeObserver.disconnect(),
      () => io.disconnect(),
      () => window.removeEventListener('pointermove', onMove),
      () => document.removeEventListener('visibilitychange', onVisibility),
    );

    this.perf.mark('hero_3d_ready');
    if (this.motion.reduced()) {
      gsap.set(canvas, { opacity: 1 });
      this.render(0);
      return;
    }
    if (this.motion.introDone()) this.intro();
    this.loop();
  }

  private build(): void {
    const glow = glowTexture();
    this.disposables.push(glow);

    // Quả cầu điểm
    const dots = fibonacciSphere(1600, RADIUS);
    const pointsGeo = new BufferGeometry().setFromPoints(dots);
    this.materials.points = new PointsMaterial({ size: 0.03, transparent: true, opacity: 0.55, depthWrite: false, sizeAttenuation: true });
    this.globe.add(new Points(pointsGeo, this.materials.points));

    // Lưới địa cầu mờ
    const ico = new IcosahedronGeometry(RADIUS * 0.985, 3);
    const wireGeo = new WireframeGeometry(ico);
    ico.dispose();
    this.materials.wire = new LineBasicMaterial({ transparent: true, opacity: 0.06, depthWrite: false });
    this.globe.add(new LineSegments(wireGeo, this.materials.wire));

    // Nút service
    this.nodes = fibonacciSphere(LABELS.length, RADIUS * 1.01).map((p, i) => p.applyAxisAngle(new Vector3(0, 1, 0), i * 0.35));
    const nodeGeo = new SphereGeometry(0.055, 16, 16);
    this.materials.seal = new MeshBasicMaterial();
    this.materials.jade = new MeshBasicMaterial();
    this.materials.glowSeal = new SpriteMaterial({ map: glow, blending: AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.9 });
    this.materials.glowJade = new SpriteMaterial({ map: glow, blending: AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.8 });
    this.nodes.forEach((p, i) => {
      const core = i === 0;
      const mesh = new Mesh(nodeGeo, core ? this.materials.seal : this.materials.jade);
      mesh.position.copy(p);
      const halo = new Sprite(core ? this.materials.glowSeal : this.materials.glowJade);
      halo.scale.setScalar(core ? 0.75 : 0.45);
      halo.position.copy(p);
      this.globe.add(mesh, halo);
    });

    // Cung nối mỗi nút với hai nút gần nhất, và eDLM nối tới mọi nút
    this.materials.arc = new LineBasicMaterial({ transparent: true, opacity: 0.38, depthWrite: false });
    const pairs = new Set<string>();
    const addArc = (a: number, b: number) => {
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (a === b || pairs.has(key)) return;
      pairs.add(key);
      const pa = this.nodes[a];
      const pb = this.nodes[b];
      const mid = pa.clone().add(pb).multiplyScalar(0.5);
      const lift = 1 + pa.distanceTo(pb) / (RADIUS * 2.4);
      mid.setLength(RADIUS * lift);
      const curve = new QuadraticBezierCurve3(pa, mid, pb);
      const geo = new BufferGeometry().setFromPoints(curve.getPoints(48));
      const line = new Line(geo, this.materials.arc);
      this.globe.add(line);
      this.arcs.push({ curve, line });
    };
    this.nodes.forEach((p, i) => {
      const nearest = this.nodes
        .map((q, j) => ({ j, d: p.distanceTo(q) }))
        .filter((n) => n.j !== i)
        .sort((x, y) => x.d - y.d)
        .slice(0, 2);
      nearest.forEach((n) => addArc(i, n.j));
      if (i !== 0) addArc(0, i);
    });

    // Bản tin chạy trên cung
    for (let i = 0; i < 14; i++) {
      const sprite = new Sprite(i % 3 === 0 ? this.materials.glowSeal : this.materials.glowJade);
      sprite.scale.setScalar(0.22);
      this.globe.add(sprite);
      this.packets.push({ sprite, arc: this.arcs[i % this.arcs.length], t: Math.random(), speed: 0.004 + Math.random() * 0.006 });
    }

    // Vành quỹ đạo
    const ring = (radius: number) => {
      const pts: Vector3[] = [];
      for (let i = 0; i <= 256; i++) {
        const a = (i / 256) * Math.PI * 2;
        pts.push(new Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
      }
      return new BufferGeometry().setFromPoints(pts);
    };
    this.materials.ringA = new LineBasicMaterial({ transparent: true, opacity: 0.45, depthWrite: false });
    this.materials.ringB = new LineDashedMaterial({ transparent: true, opacity: 0.4, dashSize: 0.08, gapSize: 0.1, depthWrite: false });
    const ringA = new Line(ring(RADIUS * 1.38), this.materials.ringA);
    ringA.rotation.set(1.18, 0.2, 0.35);
    const ringB = new Line(ring(RADIUS * 1.66), this.materials.ringB);
    ringB.computeLineDistances();
    ringB.rotation.set(1.42, -0.5, -0.4);
    this.root.add(ringA, ringB);

    // Vệ tinh chạy trên vành
    const satGeo = new SphereGeometry(0.07, 16, 16);
    [
      { ring: ringA, radius: RADIUS * 1.38, speed: 0.35, mat: this.materials.seal },
      { ring: ringB, radius: RADIUS * 1.66, speed: -0.22, mat: this.materials.jade },
    ].forEach((s, i) => {
      const mesh = new Mesh(satGeo, s.mat);
      s.ring.add(mesh);
      this.satellites.push({ mesh, radius: s.radius, speed: s.speed, tilt: 0, phase: i * 2 });
    });

    // Quầng sáng phía sau
    this.materials.halo = new SpriteMaterial({ map: glow, blending: AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.35 });
    const halo = new Sprite(this.materials.halo);
    halo.scale.setScalar(RADIUS * 4.2);
    halo.position.z = -1.5;
    this.root.add(halo);

    this.disposables.push(pointsGeo, wireGeo, nodeGeo, satGeo);
    this.arcs.forEach((a) => this.disposables.push(a.line.geometry));
    this.disposables.push(ringA.geometry, ringB.geometry);
    Object.values(this.materials).forEach((m) => m && this.disposables.push(m));
  }

  private applyColors(): void {
    const css = getComputedStyle(document.documentElement);
    const color = (name: string) => new Color(css.getPropertyValue(name).trim() || '#888');
    const light = document.documentElement.dataset['theme'] === 'light';
    const m = this.materials;
    m.points?.color.copy(color('--muted'));
    if (m.points) m.points.opacity = light ? 0.7 : 0.55;
    m.wire?.color.copy(color('--fg'));
    if (m.wire) m.wire.opacity = light ? 0.08 : 0.06;
    m.arc?.color.copy(color('--jade'));
    m.ringA?.color.copy(color('--seal'));
    m.ringB?.color.copy(color('--jade'));
    m.seal?.color.copy(color('--seal'));
    m.jade?.color.copy(color('--jade'));
    m.glowSeal?.color.copy(color('--seal'));
    m.glowJade?.color.copy(color('--jade'));
    m.halo?.color.copy(color('--seal'));
    if (m.halo) m.halo.opacity = light ? 0.12 : 0.3;
    if (this.motion.reduced()) this.render(0);
  }

  private resize(): void {
    if (!this.renderer) return;
    const w = this.host.clientWidth;
    const h = this.host.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    // Màn rộng: quả cầu nằm sau phiếu trình ở cột phải; màn hẹp: lùi lên trên, nhỏ lại
    this.wide = w >= 1024;
    const visibleH = 2 * Math.tan((this.camera.fov * Math.PI) / 360) * this.camera.position.z;
    const visibleW = visibleH * this.camera.aspect;
    if (this.wide) {
      this.root.position.set(visibleW * 0.26, 0.1, 0);
      this.root.scale.setScalar(1);
    } else {
      this.root.position.set(visibleW * 0.18, visibleH * 0.22, -1.5);
      this.root.scale.setScalar(0.8);
    }
  }

  private intro(): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas || this.motion.reduced() || this.introPlayed) return;
    this.introPlayed = true;
    gsap.to(canvas, { opacity: 1, duration: 1.6, ease: 'power2.out' });
    gsap.from(this.globe.scale, { x: 0.4, y: 0.4, z: 0.4, duration: 2.4, ease: 'expo.out' });
    gsap.from(this, { spin: -2.4, duration: 2.6, ease: 'expo.out' });
  }

  private loop = (): void => {
    cancelAnimationFrame(this.raf);
    if (!this.visible || document.hidden || !this.renderer) return;
    this.render(performance.now() / 1000);
    this.raf = requestAnimationFrame(this.loop);
  };

  private render(time: number): void {
    if (!this.renderer) return;
    const scroll = Math.min(1, window.scrollY / Math.max(1, innerHeight));

    // Nghiêng theo con trỏ, xoay chậm, cuộn thì xoay nhanh và trôi lên
    this.tilt.x += (this.pointer.y * 0.25 - this.tilt.x) * 0.04;
    this.tilt.y += (this.pointer.x * 0.4 - this.tilt.y) * 0.04;
    this.globe.rotation.y = time * 0.08 + this.spin + this.tilt.y + scroll * 1.4;
    this.globe.rotation.x = 0.28 + this.tilt.x;
    this.root.rotation.z = this.tilt.y * 0.12;
    this.camera.position.y = -scroll * 1.2;

    for (const p of this.packets) {
      p.t += p.speed;
      if (p.t >= 1) {
        p.t = 0;
        p.arc = this.arcs[Math.floor(Math.random() * this.arcs.length)];
        p.speed = 0.004 + Math.random() * 0.006;
      }
      p.arc.curve.getPoint(p.t, p.sprite.position);
    }
    for (const s of this.satellites) {
      const a = time * s.speed + s.phase;
      s.mesh.position.set(Math.cos(a) * s.radius, 0, Math.sin(a) * s.radius);
    }

    this.renderer.render(this.scene, this.camera);
    this.placeLabels();
  }

  /** Chiếu toạ độ nút lên màn hình; nút ở mặt sau quả cầu thì mờ đi. */
  private placeLabels(): void {
    const labels = this.labelRefs();
    if (!labels.length) return;
    const w = this.host.clientWidth;
    const h = this.host.clientHeight;
    const center = this.globe.getWorldPosition(new Vector3());
    const camDir = this.camera.position.clone().sub(center).normalize();
    this.globe.updateMatrixWorld();
    labels.forEach((ref, i) => {
      const el = ref.nativeElement;
      const world = this.tmp.copy(this.nodes[i]).applyMatrix4(this.globe.matrixWorld);
      const facing = world.clone().sub(center).normalize().dot(camDir);
      world.project(this.camera);
      const x = (world.x * 0.5 + 0.5) * w;
      const y = (-world.y * 0.5 + 0.5) * h;
      const alpha = Math.max(0, Math.min(1, (facing - 0.05) * 2.2));
      el.style.transform = `translate3d(${x + 10}px, ${y - 10}px, 0)`;
      el.style.opacity = String(this.canvasRef() ? alpha * Number(this.canvasRef()!.nativeElement.style.opacity || 0) : 0);
    });
  }

  private destroy(): void {
    cancelAnimationFrame(this.raf);
    this.cleanups.forEach((fn) => fn());
    this.disposables.forEach((d) => d.dispose());
    this.renderer?.dispose();
  }
}

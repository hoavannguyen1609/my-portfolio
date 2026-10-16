import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, viewChild } from '@angular/core';
import { MotionService } from '../../core/motion.service';

interface MeshNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  label?: string;
  pulse: number;
}

interface Packet {
  a: MeshNode;
  b: MeshNode;
  t: number;
  speed: number;
  hot: boolean;
}

const LABELS = ['Kafka', 'Elasticsearch', 'MySQL', 'Redis', 'Spring Boot', 'eDLM', 'eTask', 'THADS', 'vdxp', 'Gateway', 'AWS S3', 'QueryDSL'];

/**
 * Nền hero: mạng service trôi chậm, "bản tin" chạy dọc các cạnh như sự kiện Kafka, con trỏ đẩy nút ra xa.
 * Tự dừng khi ra khỏi màn hình hoặc tab bị ẩn.
 */
@Component({
  selector: 'app-mesh-canvas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pointer-events-none absolute inset-0 -z-10 block', 'aria-hidden': 'true' },
  template: `<canvas #canvas class="block size-full"></canvas>`,
})
export class MeshCanvas {
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly motion = inject(MotionService);

  private ctx!: CanvasRenderingContext2D;
  private nodes: MeshNode[] = [];
  private packets: Packet[] = [];
  private w = 0;
  private h = 0;
  private dpr = 1;
  private raf = 0;
  private visible = true;
  private lastSpawn = 0;
  private mouse = { x: -9999, y: -9999 };
  private colors = { fg: '#fff', muted: '#888', seal: '#f45', jade: '#2ec' };
  private cleanups: (() => void)[] = [];

  constructor() {
    afterNextRender(() => this.start());
    inject(DestroyRef).onDestroy(() => {
      cancelAnimationFrame(this.raf);
      this.cleanups.forEach((fn) => fn());
    });
  }

  private start(): void {
    const canvas = this.canvasRef().nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.readColors();
    this.resize();

    const ro = new ResizeObserver(() => {
      this.resize();
      if (this.motion.reduced()) this.draw();
    });
    ro.observe(canvas);

    const themeObserver = new MutationObserver(() => {
      this.readColors();
      if (this.motion.reduced()) this.draw();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    this.cleanups.push(() => ro.disconnect(), () => themeObserver.disconnect());

    if (this.motion.reduced()) {
      this.draw();
      return;
    }

    const io = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      if (this.visible) this.loop(performance.now());
    });
    io.observe(canvas);

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => (this.mouse = { x: -9999, y: -9999 });
    const onVisibility = () => {
      if (!document.hidden && this.visible) this.loop(performance.now());
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', onVisibility);
    this.cleanups.push(
      () => io.disconnect(),
      () => window.removeEventListener('pointermove', onMove),
      () => document.removeEventListener('pointerleave', onLeave),
      () => document.removeEventListener('visibilitychange', onVisibility),
    );
  }

  private readColors(): void {
    const css = getComputedStyle(document.documentElement);
    const v = (name: string) => css.getPropertyValue(name).trim();
    this.colors = { fg: v('--fg'), muted: v('--muted'), seal: v('--seal'), jade: v('--jade') };
  }

  private resize(): void {
    const canvas = this.canvasRef().nativeElement;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    this.dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = w * this.dpr;
    canvas.height = h * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    if (!this.nodes.length) {
      this.seed(w, h);
    } else {
      for (const n of this.nodes) {
        n.x *= w / this.w;
        n.y *= h / this.h;
      }
    }
    this.w = w;
    this.h = h;
  }

  private seed(w: number, h: number): void {
    const wide = w >= 1024;
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const speed = () => rand(-0.18, 0.18);
    // Nút có nhãn dồn về nửa phải khi màn rộng để không đè chữ
    for (const label of LABELS) {
      this.nodes.push({ x: rand(wide ? w * 0.5 : w * 0.05, w * 0.96), y: rand(h * 0.14, h * 0.9), vx: speed(), vy: speed(), r: 3, label, pulse: 0 });
    }
    const extra = Math.max(26, Math.min(72, Math.round((w * h) / 16000)));
    for (let i = 0; i < extra; i++) {
      this.nodes.push({ x: rand(0, w), y: rand(0, h), vx: speed(), vy: speed(), r: rand(0.8, 1.8), pulse: 0 });
    }
  }

  private loop = (time: number): void => {
    cancelAnimationFrame(this.raf);
    if (!this.visible || document.hidden) return;
    this.update(time);
    this.draw();
    this.raf = requestAnimationFrame(this.loop);
  };

  private linkDistance(): number {
    return Math.max(110, Math.min(180, this.w * 0.13));
  }

  private update(time: number): void {
    const { w, h, mouse } = this;
    for (const n of this.nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
      const dx = n.x - mouse.x;
      const dy = n.y - mouse.y;
      const d = Math.hypot(dx, dy);
      if (d < 170 && d > 0.1) {
        const f = (1 - d / 170) * 1.4;
        n.x += (dx / d) * f;
        n.y += (dy / d) * f;
      }
      n.pulse = Math.max(0, n.pulse - 0.02);
    }

    if (time - this.lastSpawn > 320 && this.packets.length < 26) {
      this.lastSpawn = time;
      this.spawnPacket();
    }
    for (const p of this.packets) p.t += p.speed;
    for (const p of this.packets) if (p.t >= 1) p.b.pulse = 1;
    this.packets = this.packets.filter((p) => p.t < 1);
  }

  private spawnPacket(): void {
    const labeled = this.nodes.filter((n) => n.label);
    const a = labeled[Math.floor(Math.random() * labeled.length)];
    const reach = this.linkDistance() * 1.7;
    const near = this.nodes.filter((n) => n !== a && Math.hypot(n.x - a.x, n.y - a.y) < reach);
    if (!near.length) return;
    const preferred = near.filter((n) => n.label);
    const pool = preferred.length && Math.random() < 0.7 ? preferred : near;
    const b = pool[Math.floor(Math.random() * pool.length)];
    this.packets.push({ a, b, t: 0, speed: 0.008 + Math.random() * 0.012, hot: Math.random() < 0.35 });
  }

  private draw(): void {
    const { ctx, w, h, nodes, colors, mouse } = this;
    const D = this.linkDistance();
    ctx.clearRect(0, 0, w, h);

    // Cạnh giữa các nút gần nhau
    ctx.lineWidth = 1;
    ctx.strokeStyle = colors.muted;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < D) {
          ctx.globalAlpha = (1 - d / D) * (a.label || b.label ? 0.42 : 0.2);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // Tia từ con trỏ
    ctx.strokeStyle = colors.seal;
    for (const n of nodes) {
      const d = Math.hypot(n.x - mouse.x, n.y - mouse.y);
      if (d < 200) {
        ctx.globalAlpha = (1 - d / 200) * 0.55;
        ctx.beginPath();
        ctx.moveTo(mouse.x, mouse.y);
        ctx.lineTo(n.x, n.y);
        ctx.stroke();
      }
    }

    // Bản tin chạy trên cạnh
    for (const p of this.packets) {
      const x = p.a.x + (p.b.x - p.a.x) * p.t;
      const y = p.a.y + (p.b.y - p.a.y) * p.t;
      const color = p.hot ? colors.seal : colors.jade;
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Nút và nhãn
    ctx.font = '500 11px "JetBrains Mono", ui-monospace, monospace';
    for (const n of nodes) {
      if (n.pulse > 0) {
        ctx.globalAlpha = n.pulse * 0.5;
        ctx.strokeStyle = colors.jade;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 4 + (1 - n.pulse) * 16, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = n.label ? 0.95 : 0.5;
      ctx.fillStyle = n.label ? colors.fg : colors.muted;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
      if (n.label) {
        ctx.globalAlpha = 0.55 + n.pulse * 0.45;
        ctx.fillStyle = n.pulse > 0.2 ? colors.jade : colors.muted;
        ctx.fillText(n.label, n.x + 8, n.y + 4);
      }
    }
    ctx.globalAlpha = 1;
  }
}

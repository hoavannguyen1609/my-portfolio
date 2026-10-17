import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  viewChild,
  viewChildren,
} from '@angular/core';
import { SKILLS } from '../core/data/profile.data';
import { I18nService } from '../core/i18n.service';
import { MotionService } from '../core/motion.service';

interface Tag {
  text: string;
  hot: boolean;
  x: number;
  y: number;
  z: number;
}

/**
 * Quả cầu kỹ năng 3D: thẻ rải đều trên mặt cầu, tự xoay, kéo để quay có quán tính,
 * thẻ phía trước to và rõ, phía sau nhỏ và mờ. Tính chiếu bằng tay nên chữ luôn sắc nét.
 */
@Component({
  selector: 'app-skill-sphere',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      #stage
      class="relative mx-auto aspect-square w-full max-w-[38rem] cursor-grab touch-pan-y select-none active:cursor-grabbing"
      data-cursor="Drag"
      (pointerdown)="onDown($event)"
      (pointerenter)="hovering = true"
      (pointerleave)="hovering = false"
    >
      <div class="pointer-events-none absolute inset-[14%] rounded-full bg-[radial-gradient(circle,var(--glow-jade),transparent_68%)] blur-2xl"></div>
      <div class="pointer-events-none absolute inset-[6%] rounded-full border border-line"></div>
      <div class="pointer-events-none absolute inset-[6%] rounded-full border border-dashed border-line [transform:rotateX(72deg)]"></div>
      <div class="pointer-events-none absolute inset-[6%] rounded-full border border-dashed border-seal/30 [transform:rotateY(72deg)]"></div>
      @for (tag of tags(); track tag.text) {
        <span
          #tag
          class="absolute left-0 top-0 whitespace-nowrap rounded-full border px-2.5 py-1 font-mono text-[11px] leading-none will-change-transform sm:text-xs"
          [class]="tag.hot ? 'border-jade/50 bg-jade/10 text-jade shadow-[0_0_24px_-6px_var(--glow-jade)]' : 'border-line bg-surface/80 text-fg'"
        >{{ tag.text }}</span>
      }
    </div>
  `,
})
export class SkillSphere {
  private readonly i18n = inject(I18nService);
  private readonly motion = inject(MotionService);
  private readonly stage = viewChild.required<ElementRef<HTMLElement>>('stage');
  private readonly tagEls = viewChildren<ElementRef<HTMLElement>>('tag');

  /** Mọi kỹ năng kỹ thuật (bỏ nhóm cách làm việc), không trùng, phân bố trên mặt cầu Fibonacci. */
  protected readonly tags = computed<Tag[]>(() => {
    const seen = new Set<string>();
    const list: { text: string; hot: boolean }[] = [];
    for (const g of SKILLS) {
      if (g.code === 'team') continue;
      for (const item of g.items) {
        const text = this.i18n.t(item);
        if (seen.has(text)) continue;
        seen.add(text);
        list.push({ text, hot: typeof item === 'string' && g.hot.includes(item) });
      }
    }
    const golden = Math.PI * (3 - Math.sqrt(5));
    return list.map((t, i) => {
      const y = 1 - (i / (list.length - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      return { ...t, x: Math.cos(golden * i) * r, y, z: Math.sin(golden * i) * r };
    });
  });

  protected hovering = false;
  private ax = -0.25;
  private ay = 0;
  private vx = 0;
  private vy = 0.004;
  private dragging = false;
  private last = { x: 0, y: 0 };
  private raf = 0;
  private visible = false;
  private radius = 200;
  private cleanups: (() => void)[] = [];

  constructor() {
    afterNextRender(() => {
      const stage = this.stage().nativeElement;
      const ro = new ResizeObserver(() => {
        // Chừa chỗ cho nửa bề rộng thẻ để thẻ ở mép không tràn ngang màn hình
        this.radius = Math.min(stage.clientWidth * 0.46, stage.clientWidth / 2 - 58);
        this.render();
      });
      ro.observe(stage);
      const io = new IntersectionObserver(([e]) => {
        this.visible = e.isIntersecting;
        if (this.visible) this.loop();
      });
      io.observe(stage);

      const move = (e: PointerEvent) => {
        if (!this.dragging) return;
        const dx = e.clientX - this.last.x;
        const dy = e.clientY - this.last.y;
        this.last = { x: e.clientX, y: e.clientY };
        this.vy = dx * 0.006;
        this.vx = -dy * 0.006;
        this.ay += this.vy;
        this.ax += this.vx;
        if (this.motion.reduced()) this.render();
      };
      const up = () => (this.dragging = false);
      window.addEventListener('pointermove', move, { passive: true });
      window.addEventListener('pointerup', up);
      this.cleanups.push(
        () => ro.disconnect(),
        () => io.disconnect(),
        () => window.removeEventListener('pointermove', move),
        () => window.removeEventListener('pointerup', up),
      );
      this.render();
    });

    inject(DestroyRef).onDestroy(() => {
      cancelAnimationFrame(this.raf);
      this.cleanups.forEach((fn) => fn());
    });
  }

  protected onDown(e: PointerEvent): void {
    this.dragging = true;
    this.last = { x: e.clientX, y: e.clientY };
  }

  private loop = (): void => {
    cancelAnimationFrame(this.raf);
    if (!this.visible || this.motion.reduced()) return;
    if (!this.dragging) {
      // Quán tính giảm dần về tốc độ tự xoay; rê chuột vào thì chậm lại
      const auto = this.hovering ? 0.0006 : 0.0035;
      this.vy += (auto - this.vy) * 0.03;
      this.vx += (0 - this.vx) * 0.05;
      this.ay += this.vy;
      this.ax = Math.max(-1.2, Math.min(1.2, this.ax + this.vx));
    }
    this.render();
    this.raf = requestAnimationFrame(this.loop);
  };

  private render(): void {
    const els = this.tagEls();
    const tags = this.tags();
    if (!els.length) return;
    const cy = Math.cos(this.ay), sy = Math.sin(this.ay);
    const cx = Math.cos(this.ax), sx = Math.sin(this.ax);
    const half = this.stage().nativeElement.clientWidth / 2;
    for (let i = 0; i < els.length; i++) {
      const t = tags[i];
      if (!t) continue;
      const x1 = t.x * cy + t.z * sy;
      const z1 = -t.x * sy + t.z * cy;
      const y2 = t.y * cx - z1 * sx;
      const z2 = t.y * sx + z1 * cx;
      const depth = (z2 + 1) / 2;
      const scale = 0.5 + depth * 0.62;
      const el = els[i].nativeElement;
      el.style.transform = `translate3d(${half + x1 * this.radius}px, ${half + y2 * this.radius}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
      el.style.opacity = (0.18 + depth * 0.82).toFixed(3);
      el.style.zIndex = String(Math.round(depth * 100));
      el.style.filter = depth < 0.35 ? `blur(${((0.35 - depth) * 4).toFixed(1)}px)` : '';
    }
  }
}

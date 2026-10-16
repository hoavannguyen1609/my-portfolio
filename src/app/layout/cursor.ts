import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { gsap } from 'gsap';
import { MotionService } from '../core/motion.service';

/** Con trỏ tuỳ biến: chấm đỏ bám sát, vòng tròn trễ nhẹ, phóng to khi rê qua phần tử bấm được. */
@Component({
  selector: 'app-cursor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    @if (enabled()) {
      <div #ring class="pointer-events-none fixed left-0 top-0 z-[95] -ml-5 -mt-5 grid size-10 place-items-center rounded-full border border-white/70 mix-blend-difference">
        <span class="font-mono text-[9px] font-bold uppercase tracking-widest text-white">{{ label() }}</span>
      </div>
      <div #dot class="pointer-events-none fixed left-0 top-0 z-[96] -ml-1 -mt-1 size-2 rounded-full bg-seal"></div>
    }
  `,
})
export class Cursor {
  protected readonly enabled = signal(false);
  protected readonly label = signal('');
  private readonly ring = viewChild<ElementRef<HTMLElement>>('ring');
  private readonly dot = viewChild<ElementRef<HTMLElement>>('dot');

  constructor() {
    const motion = inject(MotionService);
    const off: (() => void)[] = [];

    afterNextRender(() => {
      if (motion.reduced() || !matchMedia('(pointer: fine)').matches) return;
      this.enabled.set(true);
      document.documentElement.classList.add('has-cursor');

      // Chờ @if vẽ phần tử
      requestAnimationFrame(() => {
        const ring = this.ring()!.nativeElement;
        const dot = this.dot()!.nativeElement;
        gsap.set([ring, dot], { autoAlpha: 0 });
        const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' });
        const ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' });
        const dx = gsap.quickTo(dot, 'x', { duration: 0.08 });
        const dy = gsap.quickTo(dot, 'y', { duration: 0.08 });

        const move = (e: PointerEvent) => {
          gsap.to([ring, dot], { autoAlpha: 1, duration: 0.2, overwrite: 'auto' });
          rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY);
        };
        const over = (e: PointerEvent) => {
          const target = (e.target as HTMLElement).closest<HTMLElement>('a, button, [data-cursor]');
          const text = target?.dataset['cursor'] ?? '';
          this.label.set(text);
          gsap.to(ring, { scale: target ? (text ? 2.2 : 1.6) : 1, duration: 0.35, ease: 'power3.out' });
          gsap.to(dot, { scale: target ? 0 : 1, duration: 0.25 });
        };
        const leave = () => gsap.to([ring, dot], { autoAlpha: 0, duration: 0.2 });
        window.addEventListener('pointermove', move, { passive: true });
        document.addEventListener('pointerover', over);
        document.documentElement.addEventListener('pointerleave', leave);
        off.push(
          () => window.removeEventListener('pointermove', move),
          () => document.removeEventListener('pointerover', over),
          () => document.documentElement.removeEventListener('pointerleave', leave),
        );
      });
    });

    inject(DestroyRef).onDestroy(() => {
      off.forEach((fn) => fn());
      document.documentElement.classList.remove('has-cursor');
    });
  }
}

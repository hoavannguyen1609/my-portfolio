import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, viewChildren } from '@angular/core';
import { LucideSparkle } from '@lucide/angular';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MARQUEE } from '../core/data/profile.data';
import { MotionService } from '../core/motion.service';

/**
 * Hai dải băng công nghệ bắt chéo, nghiêng trong không gian 3D, chạy ngược chiều.
 * Cuộn nhanh thì dải chạy nhanh, nghiêng theo và vặn nhẹ quanh trục X.
 */
@Component({
  selector: 'app-marquee',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideSparkle],
  template: `
    <section class="relative overflow-hidden py-20 [perspective:1100px]" aria-label="Tech stack">
      @for (row of rows; track $index; let odd = $odd) {
        <div #ribbon class="relative -mx-[6vw] [transform-style:preserve-3d]" [class]="odd ? 'z-0 -mt-4' : 'z-10'">
          <div
            class="flex w-max py-4"
            [class]="odd
              ? 'min-w-full border-y border-line bg-surface [transform:rotateX(18deg)_rotate(3deg)]'
              : 'min-w-full bg-seal text-white shadow-[0_30px_80px_-30px_var(--glow-seal)] [transform:rotateX(-14deg)_rotate(-3.5deg)]'"
          >
            <div #track class="flex shrink-0 items-center gap-8 pr-8 will-change-transform">
              @for (copy of [0, 1]; track copy) {
                @for (item of row; track item) {
                  <span
                    class="flex items-center gap-8 whitespace-nowrap font-display text-[clamp(1.5rem,3.6vw,2.8rem)] font-bold uppercase leading-none tracking-tight"
                    [class.text-outline]="odd"
                    [attr.aria-hidden]="copy === 1 ? 'true' : null"
                  >
                    {{ item }}<svg lucideSparkle [size]="20" class="shrink-0" [class.text-seal]="odd"></svg>
                  </span>
                }
              }
            </div>
          </div>
        </div>
      }
    </section>
  `,
})
export class Marquee {
  protected readonly rows = [MARQUEE.slice(0, 12), MARQUEE.slice(12)];
  private readonly tracks = viewChildren<ElementRef<HTMLElement>>('track');
  private readonly ribbons = viewChildren<ElementRef<HTMLElement>>('ribbon');

  constructor() {
    const motion = inject(MotionService);
    let ctx: gsap.Context | undefined;
    let tick: (() => void) | undefined;

    afterNextRender(() => {
      if (motion.reduced()) return;
      ctx = gsap.context(() => {
        const loops = this.tracks().map((t, i) =>
          gsap.fromTo(
            t.nativeElement,
            { xPercent: i % 2 ? -50 : 0 },
            { xPercent: i % 2 ? 0 : -50, duration: 42, ease: 'none', repeat: -1 },
          ),
        );
        const setSkew = gsap.quickSetter(this.tracks().map((t) => t.nativeElement), 'skewX', 'deg');
        const ribbons = this.ribbons().map((r) => r.nativeElement);
        let speed = 1;
        let skew = 0;
        ScrollTrigger.create({
          start: 0,
          end: 'max',
          onUpdate: (self) => {
            const v = self.getVelocity();
            speed = 1 + Math.min(Math.abs(v) / 300, 6);
            skew = gsap.utils.clamp(-8, 8, v / -250);
          },
        });

        // Dải băng vặn dần khi section đi qua màn hình
        ribbons.forEach((r, i) => {
          gsap.fromTo(
            r,
            { rotateY: i % 2 ? 10 : -10 },
            {
              rotateY: i % 2 ? -10 : 10,
              ease: 'none',
              scrollTrigger: { trigger: r.parentElement!, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          );
        });

        tick = () => {
          speed += (1 - speed) * 0.05;
          skew += (0 - skew) * 0.08;
          loops.forEach((l) => l.timeScale(speed));
          setSkew(skew);
        };
        gsap.ticker.add(tick);
      });
    });

    inject(DestroyRef).onDestroy(() => {
      if (tick) gsap.ticker.remove(tick);
      ctx?.revert();
    });
  }
}

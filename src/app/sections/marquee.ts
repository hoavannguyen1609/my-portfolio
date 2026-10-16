import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, viewChildren } from '@angular/core';
import { LucideSparkle } from '@lucide/angular';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MARQUEE } from '../core/data/profile.data';
import { MotionService } from '../core/motion.service';

/** Hai dải công nghệ chạy ngược chiều; cuộn nhanh thì dải chạy nhanh và nghiêng theo. */
@Component({
  selector: 'app-marquee',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideSparkle],
  template: `
    <section class="relative overflow-hidden border-y border-line bg-bg-2 py-6" aria-label="Tech stack">
      @for (row of rows; track $index; let odd = $odd) {
        <div class="flex w-max" [class.mt-3]="odd">
          <div #track class="flex shrink-0 items-center gap-8 pr-8 will-change-transform">
            @for (copy of [0, 1]; track copy) {
              @for (item of row; track item) {
                <span class="flex items-center gap-8 whitespace-nowrap font-display text-[clamp(1.6rem,4vw,3rem)] font-bold leading-none"
                      [class.text-outline]="odd" [attr.aria-hidden]="copy === 1 ? 'true' : null">
                  {{ item }}<svg lucideSparkle [size]="20" class="shrink-0 text-seal"></svg>
                </span>
              }
            }
          </div>
        </div>
      }
    </section>
  `,
})
export class Marquee {
  protected readonly rows = [MARQUEE.slice(0, 10), MARQUEE.slice(10)];
  private readonly tracks = viewChildren<ElementRef<HTMLElement>>('track');

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
            { xPercent: i % 2 ? 0 : -50, duration: 38, ease: 'none', repeat: -1 },
          ),
        );
        const setSkew = gsap.quickSetter(this.tracks().map((t) => t.nativeElement), 'skewX', 'deg');
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
        // Mỗi khung hình kéo tốc độ và độ nghiêng dần về trạng thái nghỉ
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

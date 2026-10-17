import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { gsap } from 'gsap';
import { PerformanceService } from '../core/firebase/performance.service';
import { MotionService } from '../core/motion.service';

/** Màn chờ ngắn: đếm 0–100 trong lúc tải font, rồi kéo màn lên và báo hero chạy intro. */
@Component({
  selector: 'app-preloader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div #root class="fixed inset-0 z-[100] grid place-items-center bg-bg" style="clip-path: inset(0 0 0 0)">
        <div class="bg-grid absolute inset-0 opacity-60"></div>
        <div #inner class="relative flex flex-col items-center gap-7">
          <div #seal class="relative grid size-32 place-items-center rounded-full border-[3px] border-double border-seal text-seal">
            <svg class="absolute inset-0 size-full" viewBox="0 0 120 120" aria-hidden="true">
              <defs><path id="pre-ring" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" /></defs>
              <text class="fill-current font-mono" font-size="8.6" letter-spacing="2.4">
                <textPath href="#pre-ring" textLength="285">BACKEND · SPRING BOOT · KAFKA · ELASTIC ·</textPath>
              </text>
            </svg>
            <span class="font-display text-3xl font-extrabold tracking-tight">NVH</span>
          </div>
          <div class="flex items-baseline gap-1 font-mono text-muted">
            <span #count class="text-4xl font-bold tabular-nums text-fg">0</span><span>%</span>
          </div>
        </div>
        <div class="absolute bottom-10 left-1/2 h-px w-48 -translate-x-1/2 overflow-hidden bg-line">
          <div #bar class="h-full origin-left scale-x-0 bg-gradient-to-r from-seal to-jade"></div>
        </div>
      </div>
    }
  `,
})
export class Preloader {
  protected readonly visible = signal(true);
  private readonly root = viewChild<ElementRef<HTMLElement>>('root');
  private readonly inner = viewChild<ElementRef<HTMLElement>>('inner');
  private readonly seal = viewChild<ElementRef<HTMLElement>>('seal');
  private readonly count = viewChild<ElementRef<HTMLElement>>('count');
  private readonly bar = viewChild<ElementRef<HTMLElement>>('bar');
  private readonly motion = inject(MotionService);
  private readonly perf = inject(PerformanceService);

  constructor() {
    afterNextRender(() => {
      if (this.motion.reduced()) {
        this.finish();
        return;
      }
      // Giữ tham chiếu phần tử: khi @if gỡ màn chờ thì viewChild trả undefined
      const root = this.root()!.nativeElement;
      const inner = this.inner()!.nativeElement;
      const seal = this.seal()!.nativeElement;
      const count = this.count()!.nativeElement;
      const bar = this.bar()!.nativeElement;
      const counter = { v: 0 };
      const fonts = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]);

      const tl = gsap.timeline();
      tl.from(seal, { scale: 0.6, autoAlpha: 0, duration: 0.6, ease: 'back.out(2)' })
        .to(seal, { rotate: 360, duration: 1.6, ease: 'power2.inOut' }, 0)
        .to(counter, { v: 100, duration: 1.3, ease: 'power2.inOut', onUpdate: () => (count.textContent = String(Math.round(counter.v))) }, 0.1)
        .to(bar, { scaleX: 1, duration: 1.3, ease: 'power2.inOut' }, 0.1);

      let exit: gsap.core.Timeline | undefined;
      // Chốt an toàn: requestAnimationFrame bị treo (tab nền) thì vẫn mở trang sau 5 giây
      const safety = setTimeout(() => {
        tl.kill();
        exit?.kill();
        this.finish();
      }, 5000);

      Promise.all([fonts, tl.then()]).then(() => {
        if (!this.visible()) return;
        exit = gsap
          .timeline()
          .to(inner, { scale: 0.9, autoAlpha: 0, duration: 0.4, ease: 'power2.in' })
          .to(root, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'expo.inOut' }, '-=0.1')
          .call(() => this.motion.introDone.set(true), [], '-=0.55')
          .call(() => {
            clearTimeout(safety);
            this.finish();
          });
      });
    });
  }

  private finish(): void {
    if (!this.visible()) return;
    this.visible.set(false);
    this.motion.introDone.set(true);
    this.perf.mark('intro_ready');
    this.motion.refresh();
  }
}

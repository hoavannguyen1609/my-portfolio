import { DestroyRef, Directive, ElementRef, afterNextRender, effect, inject, input, untracked } from '@angular/core';
import { gsap } from 'gsap';
import { I18nService } from '../../core/i18n.service';
import { MotionService } from '../../core/motion.service';

/** Đếm số từ 0 tới giá trị đích khi cuộn tới, định dạng theo ngôn ngữ đang chọn. */
@Directive({ selector: '[appCountUp]' })
export class CountUpDirective {
  readonly appCountUp = input.required<number>();
  readonly countSuffix = input('');
  /** intro: đếm khi preloader xong (dùng ở hero) */
  readonly countTrigger = input<'scroll' | 'intro'>('scroll');

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly i18n = inject(I18nService);
  private readonly motion = inject(MotionService);
  private current = 0;
  private started = false;
  private tween?: gsap.core.Tween;

  constructor() {
    afterNextRender(() => {
      if (this.motion.reduced()) {
        this.current = this.appCountUp();
        this.render();
        return;
      }
      this.render();
      if (this.countTrigger() === 'scroll') {
        this.tween = gsap.to(this, {
          current: this.appCountUp(),
          duration: 1.8,
          ease: 'power2.out',
          onUpdate: () => this.render(),
          scrollTrigger: { trigger: this.el, start: 'top 92%', once: true },
        });
      }
    });

    effect(() => {
      if (this.countTrigger() === 'intro' && this.motion.introDone() && !untracked(() => this.started)) {
        this.started = true;
        this.tween = gsap.to(this, { current: this.appCountUp(), duration: 2, delay: 0.6, ease: 'power2.out', onUpdate: () => this.render() });
      }
    });

    effect(() => {
      this.i18n.lang();
      untracked(() => this.render());
    });

    inject(DestroyRef).onDestroy(() => this.tween?.kill());
  }

  private render(): void {
    this.el.textContent = this.i18n.formatNumber(Math.round(this.current)) + this.countSuffix();
  }
}

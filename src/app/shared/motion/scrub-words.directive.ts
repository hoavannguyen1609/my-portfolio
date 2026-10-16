import { DestroyRef, Directive, ElementRef, afterNextRender, effect, inject, input, untracked } from '@angular/core';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { MotionService } from '../../core/motion.service';

/** Đoạn văn sáng dần từng từ theo vị trí cuộn. */
@Directive({ selector: '[appScrubWords]' })
export class ScrubWordsDirective {
  readonly appScrubWords = input.required<string>();

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly motion = inject(MotionService);
  private split?: SplitText;
  private tween?: gsap.core.Tween;
  private ready = false;

  constructor() {
    afterNextRender(() => {
      this.ready = true;
      this.build();
    });
    effect(() => {
      this.appScrubWords();
      if (untracked(() => this.ready)) untracked(() => this.build());
    });
    inject(DestroyRef).onDestroy(() => this.cleanup());
  }

  private cleanup(): void {
    this.tween?.scrollTrigger?.kill();
    this.tween?.kill();
    this.split?.revert();
  }

  private build(): void {
    this.cleanup();
    this.el.textContent = this.appScrubWords();
    if (this.motion.reduced()) return;

    this.split = SplitText.create(this.el, { type: 'words' });
    this.tween = gsap.fromTo(
      this.split.words,
      { opacity: 0.14 },
      {
        opacity: 1,
        ease: 'none',
        stagger: 0.1,
        scrollTrigger: { trigger: this.el, start: 'top 82%', end: 'bottom 45%', scrub: 0.6 },
      },
    );
    this.motion.refresh();
  }
}

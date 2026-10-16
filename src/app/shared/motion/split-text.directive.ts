import { DestroyRef, Directive, ElementRef, afterNextRender, effect, inject, input, untracked } from '@angular/core';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { MotionService } from '../../core/motion.service';

/**
 * Tách chữ bằng GSAP SplitText rồi cho chữ trồi lên khỏi mặt nạ dòng.
 * Directive tự quản nội dung phần tử (SplitText thay DOM con), nên truyền văn bản qua input thay vì nội suy.
 */
@Directive({ selector: '[appSplit]' })
export class SplitTextDirective {
  readonly appSplit = input.required<string>();
  /** Đơn vị chuyển động */
  readonly splitBy = input<'chars' | 'words' | 'lines'>('words');
  /** scroll: chạy khi cuộn tới; intro: chạy khi preloader xong */
  readonly splitTrigger = input<'scroll' | 'intro'>('scroll');
  readonly splitDelay = input(0);

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly motion = inject(MotionService);
  private split?: SplitText;
  private ready = false;
  private played = false;

  constructor() {
    afterNextRender(() => {
      this.ready = true;
      this.build(false);
    });

    // Đổi ngôn ngữ: tách lại và chạy hiệu ứng ngắn
    effect(() => {
      this.appSplit();
      if (untracked(() => this.ready)) untracked(() => this.build(true));
    });

    // Chờ intro xong với hero
    effect(() => {
      if (this.motion.introDone() && this.splitTrigger() === 'intro' && untracked(() => this.ready)) {
        untracked(() => this.build(false));
      }
    });

    inject(DestroyRef).onDestroy(() => this.split?.revert());
  }

  private build(isUpdate: boolean): void {
    this.split?.revert();
    this.el.textContent = this.appSplit();
    if (this.motion.reduced()) return;

    const intro = this.splitTrigger() === 'intro';
    if (intro && !this.motion.introDone()) {
      gsap.set(this.el, { autoAlpha: 0 });
      return;
    }
    gsap.set(this.el, { autoAlpha: 1 });

    const by = this.splitBy();
    this.split = SplitText.create(this.el, {
      type: by === 'chars' ? 'words,chars' : by === 'words' ? 'lines,words' : 'lines',
      mask: by === 'chars' ? 'words' : 'lines',
      linesClass: 'split-line',
      wordsClass: by === 'chars' ? 'split-line' : '',
      autoSplit: true,
      onSplit: (self) => {
        const targets = by === 'chars' ? self.chars : by === 'words' ? self.words : self.lines;
        const vars: gsap.TweenVars = {
          yPercent: 115,
          rotate: by === 'chars' ? 6 : 0,
          duration: isUpdate ? 0.6 : 1.05,
          ease: 'expo.out',
          stagger: by === 'chars' ? 0.028 : 0.045,
          delay: isUpdate ? 0 : this.splitDelay(),
        };
        if (!isUpdate && !intro && !this.played) {
          vars.scrollTrigger = { trigger: this.el, start: 'top 90%', once: true, onEnter: () => (this.played = true) };
        }
        return gsap.from(targets, vars);
      },
    });
  }
}

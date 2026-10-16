import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';
import { gsap } from 'gsap';
import { MotionService } from '../../core/motion.service';

export type RevealMode = 'up' | 'fade' | 'scale' | 'left' | 'children';

/** Hiện phần tử khi cuộn tới; mode "children" so le từng con trực tiếp. */
@Directive({ selector: '[appReveal]' })
export class RevealDirective {
  readonly appReveal = input<RevealMode | ''>('up');
  readonly revealDelay = input(0);
  readonly revealStagger = input(0.08);

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const motion = inject(MotionService);
    let ctx: gsap.Context | undefined;

    afterNextRender(() => {
      if (motion.reduced()) return;
      const mode = this.appReveal() || 'up';
      const from: gsap.TweenVars = { autoAlpha: 0, duration: 1, ease: 'power3.out', delay: this.revealDelay() };
      if (mode === 'up' || mode === 'children') from.y = 48;
      if (mode === 'left') from.x = -48;
      if (mode === 'scale') Object.assign(from, { scale: 0.92, y: 24 });

      ctx = gsap.context(() => {
        gsap.from(mode === 'children' ? el.children : el, {
          ...from,
          stagger: mode === 'children' ? this.revealStagger() : 0,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      });
    });

    inject(DestroyRef).onDestroy(() => ctx?.revert());
  }
}

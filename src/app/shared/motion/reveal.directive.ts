import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';
import { gsap } from 'gsap';
import { MotionService } from '../../core/motion.service';

export type RevealMode = 'up' | 'fade' | 'scale' | 'left' | 'children' | 'tilt';

/** Hiện phần tử khi cuộn tới; "children" so le từng con trực tiếp, "tilt" lật lên từ trục X như tấm thẻ. */
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
      const from: gsap.TweenVars = { autoAlpha: 0 };
      // Giá trị đích ghi rõ: from() lấy đích từ trạng thái hiện tại, phần tử đang bị ẩn thì "hiện" từ 0 tới 0
      const to: gsap.TweenVars = { autoAlpha: 1, duration: 1, ease: 'power3.out', delay: this.revealDelay() };
      if (mode === 'up' || mode === 'children') {
        Object.assign(from, { y: 48 });
        Object.assign(to, { y: 0 });
      }
      if (mode === 'left') {
        Object.assign(from, { x: -48 });
        Object.assign(to, { x: 0 });
      }
      if (mode === 'scale') {
        Object.assign(from, { scale: 0.92, y: 24 });
        Object.assign(to, { scale: 1, y: 0 });
      }
      if (mode === 'tilt') {
        Object.assign(from, { rotateX: 32, y: 80, scale: 0.94, transformPerspective: 1100, transformOrigin: '50% 0%' });
        Object.assign(to, { rotateX: 0, y: 0, scale: 1, duration: 1.2, ease: 'expo.out' });
      }

      ctx = gsap.context(() => {
        gsap.fromTo(mode === 'children' ? el.children : el, from, {
          ...to,
          stagger: mode === 'children' ? this.revealStagger() : 0,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      });
    });

    inject(DestroyRef).onDestroy(() => ctx?.revert());
  }
}

import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';
import { gsap } from 'gsap';
import { MotionService } from '../../core/motion.service';

const finePointer = () => matchMedia('(pointer: fine)').matches;

/** Nút "hút" theo con trỏ rồi bật về chỗ cũ. */
@Directive({ selector: '[appMagnetic]' })
export class MagneticDirective {
  readonly appMagnetic = input<number | ''>(0.35);

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const motion = inject(MotionService);
    const off: (() => void)[] = [];

    afterNextRender(() => {
      if (motion.reduced() || !finePointer()) return;
      const strength = Number(this.appMagnetic() || 0.35);
      const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });

      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      };
      const leave = () => gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)' });
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', leave);
      off.push(() => el.removeEventListener('pointermove', move), () => el.removeEventListener('pointerleave', leave));
    });

    inject(DestroyRef).onDestroy(() => off.forEach((fn) => fn()));
  }
}

/**
 * Đặt --mx/--my cho hiệu ứng .spotlight; tilt > 0 thì nghiêng thẻ 3D theo con trỏ.
 */
@Directive({ selector: '[appSpotlight]', host: { class: 'spotlight' } })
export class SpotlightDirective {
  readonly tilt = input(0);

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const motion = inject(MotionService);
    const off: (() => void)[] = [];

    afterNextRender(() => {
      if (!finePointer()) return;
      const canTilt = this.tilt() > 0 && !motion.reduced();
      if (canTilt) gsap.set(el, { transformPerspective: 900 });

      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', `${px * 100}%`);
        el.style.setProperty('--my', `${py * 100}%`);
        if (canTilt) {
          gsap.to(el, { rotateY: (px - 0.5) * this.tilt(), rotateX: (0.5 - py) * this.tilt(), duration: 0.5, ease: 'power2.out' });
        }
      };
      const leave = () => canTilt && gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'power3.out' });
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', leave);
      off.push(() => el.removeEventListener('pointermove', move), () => el.removeEventListener('pointerleave', leave));
    });

    inject(DestroyRef).onDestroy(() => off.forEach((fn) => fn()));
  }
}

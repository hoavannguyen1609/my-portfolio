import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { LucideArrowRight, LucideDynamicIcon } from '@lucide/angular';
import { gsap } from 'gsap';
import { CASES, WORK_HEAD } from '../../core/data/profile.data';
import { I18nService } from '../../core/i18n.service';
import { MotionService } from '../../core/motion.service';
import { CountUpDirective } from '../../shared/motion/count-up.directive';
import { SplitTextDirective } from '../../shared/motion/split-text.directive';
import { ArchitectureDiagram } from './architecture-diagram';

/**
 * Dự án tại FPT IS. Màn rộng: ghim section và cuộn ngang qua từng panel.
 * Màn hẹp hoặc giảm chuyển động: xếp dọc như bình thường.
 */
@Component({
  selector: 'app-work',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ArchitectureDiagram, CountUpDirective, SplitTextDirective, LucideDynamicIcon, LucideArrowRight],
  templateUrl: './work.html',
})
export class Work {
  protected readonly head = WORK_HEAD;
  protected readonly cases = CASES;
  protected readonly i18n = inject(I18nService);
  protected readonly current = signal(1);
  /** Panel mở đầu + từng dự án + panel sơ đồ */
  protected readonly total = 1 + CASES.length + CASES.filter((c) => c.diagram).length;

  private readonly section = viewChild.required<ElementRef<HTMLElement>>('section');
  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  private readonly bar = viewChild.required<ElementRef<HTMLElement>>('bar');
  private readonly diagramPanel = viewChild.required<ElementRef<HTMLElement>>('diagramPanel');
  private readonly diagram = viewChild.required(ArchitectureDiagram);
  private readonly panels = viewChildren<ElementRef<HTMLElement>>('panel');

  constructor() {
    const motion = inject(MotionService);
    let mm: gsap.MatchMedia | undefined;

    afterNextRender(() => {
      mm = gsap.matchMedia();
      mm.add(
        { desktop: '(min-width: 1024px)', reduce: '(prefers-reduced-motion: reduce)' },
        (context) => {
          const { desktop, reduce } = context.conditions as { desktop: boolean; reduce: boolean };
          if (reduce) return;
          const panels = this.panels().map((p) => p.nativeElement);

          if (desktop) {
            const section = this.section().nativeElement;
            const track = this.track().nativeElement;
            const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
            const horizontal = gsap.to(track, {
              x: () => -distance(),
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: 'top top',
                end: () => `+=${distance()}`,
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                  gsap.set(this.bar().nativeElement, { scaleX: self.progress });
                  this.current.set(Math.min(this.total, Math.round(self.progress * (this.total - 1)) + 1));
                },
              },
            });

            for (const panel of panels) {
              gsap.from(panel.querySelectorAll('[data-pop]'), {
                y: 50,
                autoAlpha: 0,
                duration: 0.8,
                stagger: 0.06,
                ease: 'power3.out',
                scrollTrigger: { trigger: panel, containerAnimation: horizontal, start: 'left 85%' },
              });
            }
            this.diagram().build({ trigger: this.diagramPanel().nativeElement, containerAnimation: horizontal, start: 'left 75%' });
          } else {
            for (const panel of panels) {
              gsap.from(panel.querySelectorAll('[data-pop]'), {
                y: 40,
                autoAlpha: 0,
                duration: 0.8,
                stagger: 0.06,
                ease: 'power3.out',
                scrollTrigger: { trigger: panel, start: 'top 80%', once: true },
              });
            }
            this.diagram().build({ trigger: this.diagramPanel().nativeElement, start: 'top 75%' });
          }
          motion.refresh();
        },
      );
    });

    inject(DestroyRef).onDestroy(() => mm?.revert());
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
  viewChildren,
} from '@angular/core';
import { LucideTriangleAlert } from '@lucide/angular';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { INTEGRATION_HEAD, INTEGRITY_STEPS } from '../../core/data/integration.data';
import { I18nService } from '../../core/i18n.service';
import { MotionService } from '../../core/motion.service';

const RAIL_TOP = 30;
const RAIL_GAP = 62;

/**
 * Hành trình một bản tin qua 7 chốt. Màn rộng: thanh ray ghim bên trái, gói tin trượt tới chốt
 * đang đọc và vạch tiến độ vẽ theo cuộn; thẻ chốt bên phải sáng lên khi tới lượt.
 */
@Component({
  selector: 'app-integrity-journey',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideTriangleAlert],
  template: `
    <div #root class="grid gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-14">
      <aside class="hidden lg:block">
        <div class="sticky top-28">
          <p class="font-mono text-xs uppercase tracking-[0.2em] text-muted">{{ i18n.lang() === 'vi' ? 'Chốt' : 'Checkpoint' }}</p>
          <p class="mt-1 font-display text-7xl font-extrabold tabular-nums leading-none">
            <span class="text-seal">0{{ active() + 1 }}</span><span class="text-muted/40">/0{{ steps.length }}</span>
          </p>
          <svg [attr.viewBox]="'0 0 300 ' + railHeight" class="mt-8 h-auto w-full max-w-[300px]" aria-hidden="true">
            <line x1="20" [attr.y1]="railTop" x2="20" [attr.y2]="railTop + (steps.length - 1) * gap" class="stroke-line" stroke-width="2" />
            <line #progress x1="20" [attr.y1]="railTop" x2="20" [attr.y2]="railTop + (steps.length - 1) * gap" class="stroke-seal" stroke-width="2" />
            @for (s of steps; track $index) {
              <g>
                <circle cx="20" [attr.cy]="railTop + $index * gap" r="7" stroke-width="2"
                        [class]="$index <= active() ? 'fill-seal stroke-seal' : 'fill-bg stroke-line'" />
                <text x="42" [attr.y]="railTop + $index * gap + 5" class="font-sans text-[14px] font-semibold"
                      [class]="$index === active() ? 'fill-fg' : 'fill-muted'">{{ i18n.t(s.title) }}</text>
              </g>
            }
            <g #packet>
              <circle cx="20" [attr.cy]="railTop" r="14" class="fill-jade/25" />
              <circle cx="20" [attr.cy]="railTop" r="5" class="fill-jade" />
            </g>
          </svg>
        </div>
      </aside>

      <ol class="relative grid gap-5 border-l border-line pl-6 lg:border-0 lg:pl-0">
        @for (s of steps; track $index) {
          <li
            #card
            class="relative rounded-[1.75rem] border bg-surface/70 p-6 transition-all duration-500 sm:p-7"
            [class]="$index === active() ? 'border-seal/60 shadow-[0_30px_80px_-40px_var(--glow-seal)] lg:opacity-100' : 'border-line lg:opacity-45'"
          >
            <span class="absolute -left-[31px] top-8 size-3 rounded-full border-2 lg:hidden"
                  [class]="$index <= active() ? 'border-seal bg-seal' : 'border-line bg-bg'"></span>
            <div class="flex items-baseline gap-4">
              <span class="font-mono text-sm font-bold text-seal">0{{ $index + 1 }}</span>
              <h4 class="font-display text-[clamp(1.25rem,2.4vw,1.6rem)] font-bold leading-tight">{{ i18n.t(s.title) }}</h4>
            </div>
            <p class="mt-3 leading-relaxed text-muted">{{ i18n.t(s.mechanism) }}</p>
            <div class="mt-4 flex flex-wrap gap-2">
              @for (t of s.tags; track t) {
                <span class="chip chip-hot">{{ t }}</span>
              }
            </div>
            <div class="mt-5 flex gap-3 rounded-2xl border border-seal/25 bg-seal/[.06] p-4 text-sm leading-relaxed">
              <svg lucideTriangleAlert [size]="18" class="mt-0.5 shrink-0 text-seal"></svg>
              <p><b class="font-semibold text-seal">{{ i18n.t(head.riskLabel) }}:</b> {{ i18n.t(s.risk) }}</p>
            </div>
          </li>
        }
      </ol>
    </div>
  `,
})
export class IntegrityJourney {
  protected readonly head = INTEGRATION_HEAD;
  protected readonly steps = INTEGRITY_STEPS;
  protected readonly railTop = RAIL_TOP;
  protected readonly gap = RAIL_GAP;
  protected readonly railHeight = RAIL_TOP * 2 + (INTEGRITY_STEPS.length - 1) * RAIL_GAP;
  protected readonly i18n = inject(I18nService);
  protected readonly active = signal(0);

  private readonly motion = inject(MotionService);
  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');
  private readonly cards = viewChildren<ElementRef<HTMLElement>>('card');
  private readonly packet = viewChild<ElementRef<SVGGElement>>('packet');
  private readonly progress = viewChild.required<ElementRef<SVGLineElement>>('progress');

  constructor() {
    let ctx: gsap.Context | undefined;

    afterNextRender(() => {
      ctx = gsap.context(() => {
        const line = this.progress().nativeElement;
        if (this.motion.reduced()) {
          gsap.set(line, { drawSVG: '0% 100%' });
        } else {
          gsap.fromTo(
            line,
            { drawSVG: '0% 0%' },
            { drawSVG: '0% 100%', ease: 'none', scrollTrigger: { trigger: this.root().nativeElement, start: 'top 55%', end: 'bottom 70%', scrub: 0.6 } },
          );
        }
        this.cards().forEach((c, i) => {
          ScrollTrigger.create({
            trigger: c.nativeElement,
            start: 'top 58%',
            end: 'bottom 58%',
            onToggle: (self) => self.isActive && this.active.set(i),
          });
        });
      });
    });

    // Gói tin trượt tới chốt đang đọc
    effect(() => {
      const i = this.active();
      untracked(() => {
        const el = this.packet()?.nativeElement;
        if (!el) return;
        if (this.motion.reduced()) gsap.set(el, { y: i * RAIL_GAP });
        else gsap.to(el, { y: i * RAIL_GAP, duration: 0.7, ease: 'back.out(1.6)' });
      });
    });

    inject(DestroyRef).onDestroy(() => ctx?.revert());
  }
}

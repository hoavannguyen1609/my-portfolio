import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, viewChild, viewChildren } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EXPERIENCE_HEAD, JOBS } from '../core/data/profile.data';
import { I18nService } from '../core/i18n.service';
import { MotionService } from '../core/motion.service';
import { RevealDirective } from '../shared/motion/reveal.directive';
import { SectionHeading } from '../shared/section-heading';

/** Dòng thời gian: vạch tiến độ vẽ theo cuộn, chấm sáng khi tới từng mốc. */
@Component({
  selector: 'app-experience',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionHeading, RevealDirective],
  template: `
    <section id="experience" class="relative border-t border-line py-28 sm:py-40">
      <div class="wrap">
        <app-section-heading [label]="i18n.t(head.label)" [title]="i18n.t(head.title)" />

        <div #timeline class="relative">
          <div class="absolute bottom-3 left-[7px] top-3 w-px bg-line md:left-[calc(13rem+2.5rem)]">
            <div #progress class="absolute inset-0 origin-top scale-y-0 bg-gradient-to-b from-seal to-jade"></div>
          </div>

          @for (job of jobs; track job.company) {
            <article #job class="relative grid gap-3 pb-16 pl-10 last:pb-0 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-20 md:pl-0">
              <span class="tl-dot absolute left-0 top-1.5 size-[15px] rounded-full border-2 border-line bg-bg transition-all duration-500 md:left-[calc(13rem+2.5rem-7px)]"></span>
              <div appReveal="left" class="font-mono text-sm text-muted md:pt-1 md:text-right">
                @if (job.current) {
                  <span class="mb-1 inline-flex items-center gap-1.5 text-jade md:justify-end"><span class="size-1.5 rounded-full bg-jade"></span>{{ i18n.t(head.current) }}</span><br />
                }
                {{ i18n.t(job.period) }}
              </div>
              <div appReveal class="min-w-0">
                <h3 class="font-display text-[clamp(1.5rem,3vw,2.2rem)] font-bold leading-tight">{{ job.company }}</h3>
                <p class="mt-2 font-medium text-seal">{{ i18n.t(job.role) }}</p>
                <ul class="mt-5 grid max-w-2xl gap-3 text-muted">
                  @for (item of job.items; track $index) {
                    <li class="flex gap-3"><span class="mt-2.5 size-1.5 shrink-0 rotate-45 bg-seal/70"></span><span>{{ i18n.t(item) }}</span></li>
                  }
                </ul>
              </div>
            </article>
          }
        </div>
      </div>
    </section>
  `,
})
export class Experience {
  protected readonly head = EXPERIENCE_HEAD;
  protected readonly jobs = JOBS;
  protected readonly i18n = inject(I18nService);
  private readonly timeline = viewChild.required<ElementRef<HTMLElement>>('timeline');
  private readonly progress = viewChild.required<ElementRef<HTMLElement>>('progress');
  private readonly jobEls = viewChildren<ElementRef<HTMLElement>>('job');

  constructor() {
    const motion = inject(MotionService);
    let ctx: gsap.Context | undefined;

    afterNextRender(() => {
      ctx = gsap.context(() => {
        if (motion.reduced()) {
          gsap.set(this.progress().nativeElement, { scaleY: 1 });
          this.jobEls().forEach((j) => j.nativeElement.querySelector('.tl-dot')?.classList.add('is-on'));
          return;
        }
        gsap.to(this.progress().nativeElement, {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: this.timeline().nativeElement, start: 'top 60%', end: 'bottom 60%', scrub: 0.5 },
        });
        for (const j of this.jobEls()) {
          ScrollTrigger.create({
            trigger: j.nativeElement,
            start: 'top 60%',
            end: 'max',
            toggleClass: { targets: j.nativeElement.querySelector('.tl-dot')!, className: 'is-on' },
          });
        }
      });
    });

    inject(DestroyRef).onDestroy(() => ctx?.revert());
  }
}

import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChildren } from '@angular/core';
import { LucideArrowUpRight, LucideDynamicIcon } from '@lucide/angular';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { PROJECTS, PROJECTS_HEAD } from '../core/data/profile.data';
import { I18nService } from '../core/i18n.service';
import { MotionService } from '../core/motion.service';
import { ProjectKind } from '../core/models';
import { SpotlightDirective } from '../shared/motion/pointer.directives';
import { RevealDirective } from '../shared/motion/reveal.directive';
import { SectionHeading } from '../shared/section-heading';

/** Dự án tại 84Soft; lọc theo vai trò, thẻ trượt về vị trí mới bằng GSAP Flip. */
@Component({
  selector: 'app-projects',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionHeading, RevealDirective, SpotlightDirective, LucideDynamicIcon, LucideArrowUpRight],
  template: `
    <section id="projects" class="relative border-t border-line py-28 sm:py-40">
      <div class="wrap">
        <app-section-heading [label]="i18n.t(head.label)" [title]="i18n.t(head.title)" />

        <div appReveal class="mb-10 flex flex-wrap gap-2" role="group" [attr.aria-label]="i18n.lang() === 'vi' ? 'Lọc dự án' : 'Filter projects'">
          @for (f of head.filters; track f.key) {
            <button
              type="button"
              (click)="setFilter(f.key)"
              [attr.aria-pressed]="filter() === f.key"
              class="rounded-full border px-4 py-2 font-mono text-xs font-medium transition-colors"
              [class]="filter() === f.key ? 'border-fg bg-fg text-bg' : 'border-line text-muted hover:border-fg hover:text-fg'"
            >
              {{ i18n.t(f.label) }}
              <span class="ml-1 opacity-60">{{ countOf(f.key) }}</span>
            </button>
          }
        </div>

        <div appReveal="children" [revealStagger]="0.06" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (p of projects; track p.name) {
            <article
              #card
              appSpotlight
              [tilt]="8"
              [attr.data-kinds]="p.kinds.join(' ')"
              data-cursor="84Soft"
              class="group flex min-w-0 flex-col gap-4 rounded-[1.75rem] border border-line bg-surface/70 p-6"
            >
              <div class="flex items-center justify-between">
                <span class="grid size-12 place-items-center rounded-2xl border border-line bg-surface-2 text-fg transition-all duration-500 group-hover:-rotate-12 group-hover:border-seal group-hover:bg-seal group-hover:text-white">
                  <svg [lucideIcon]="p.icon" [size]="22"></svg>
                </span>
                <svg lucideArrowUpRight [size]="20" class="text-muted transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-seal"></svg>
              </div>
              <div>
                <p class="font-mono text-[11px] tracking-wide text-seal">{{ p.org }}</p>
                <h3 class="mt-1 font-display text-2xl font-bold">{{ p.name }}</h3>
                <p class="mt-1 text-sm font-medium">{{ i18n.t(p.role) }}</p>
              </div>
              <p class="text-[15px] leading-relaxed text-muted">{{ i18n.t(p.description) }}</p>
              <p class="mt-auto border-t border-dashed border-line pt-4 font-mono text-[11px] leading-relaxed text-muted">{{ p.stack }}</p>
            </article>
          }
        </div>
      </div>
    </section>
  `,
})
export class Projects {
  protected readonly head = PROJECTS_HEAD;
  protected readonly projects = PROJECTS;
  protected readonly i18n = inject(I18nService);
  protected readonly filter = signal<'all' | ProjectKind>('all');
  private readonly motion = inject(MotionService);
  private readonly cards = viewChildren<ElementRef<HTMLElement>>('card');

  protected countOf(key: 'all' | ProjectKind): number {
    return key === 'all' ? this.projects.length : this.projects.filter((p) => p.kinds.includes(key)).length;
  }

  protected setFilter(key: 'all' | ProjectKind): void {
    if (key === this.filter()) return;
    this.filter.set(key);
    const cards = this.cards().map((c) => c.nativeElement);
    const match = (el: HTMLElement) => key === 'all' || (el.dataset['kinds'] ?? '').split(' ').includes(key);

    if (this.motion.reduced()) {
      cards.forEach((el) => el.classList.toggle('hidden', !match(el)));
      this.motion.refresh();
      return;
    }

    const state = Flip.getState(cards);
    cards.forEach((el) => el.classList.toggle('hidden', !match(el)));
    Flip.from(state, {
      duration: 0.7,
      ease: 'power3.inOut',
      stagger: 0.03,
      absolute: true,
      onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.85 }, { autoAlpha: 1, scale: 1, duration: 0.5, delay: 0.2 }),
      onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.85, duration: 0.4 }),
      onComplete: () => this.motion.refresh(),
    });
  }
}

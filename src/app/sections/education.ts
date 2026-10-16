import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LucideGraduationCap } from '@lucide/angular';
import { EDUCATION, EDUCATION_HEAD } from '../core/data/profile.data';
import { I18nService } from '../core/i18n.service';
import { SpotlightDirective } from '../shared/motion/pointer.directives';
import { RevealDirective } from '../shared/motion/reveal.directive';
import { SectionHeading } from '../shared/section-heading';

@Component({
  selector: 'app-education',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionHeading, RevealDirective, SpotlightDirective, LucideGraduationCap],
  template: `
    <section id="education" class="relative border-t border-line py-28 sm:py-36">
      <div class="wrap">
        <app-section-heading [label]="i18n.t(head.label)" [title]="i18n.t(head.title)" />
        <div appReveal="children" class="grid gap-4 md:grid-cols-3">
          @for (e of education; track e.school) {
            <article appSpotlight class="flex min-w-0 flex-col gap-4 rounded-[1.75rem] border border-line bg-surface/70 p-6">
              <span class="grid size-11 place-items-center rounded-2xl bg-jade/10 text-jade"><svg lucideGraduationCap [size]="20"></svg></span>
              <p class="font-mono text-xs text-seal">{{ i18n.t(e.period) }}</p>
              <h3 class="font-display text-lg font-bold leading-snug">{{ e.school }}</h3>
              <p class="text-[15px] text-muted">{{ i18n.t(e.detail) }}</p>
            </article>
          }
        </div>
      </div>
    </section>
  `,
})
export class EducationSection {
  protected readonly head = EDUCATION_HEAD;
  protected readonly education = EDUCATION;
  protected readonly i18n = inject(I18nService);
}

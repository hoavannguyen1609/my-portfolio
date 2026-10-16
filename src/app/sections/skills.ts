import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { SKILLS, SKILLS_HEAD } from '../core/data/profile.data';
import { I18nService } from '../core/i18n.service';
import { Txt } from '../core/models';
import { SpotlightDirective } from '../shared/motion/pointer.directives';
import { RevealDirective } from '../shared/motion/reveal.directive';
import { SectionHeading } from '../shared/section-heading';

@Component({
  selector: 'app-skills',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionHeading, RevealDirective, SpotlightDirective, LucideDynamicIcon],
  template: `
    <section id="skills" class="relative border-t border-line py-28 sm:py-40">
      <div class="wrap">
        <app-section-heading [label]="i18n.t(head.label)" [title]="i18n.t(head.title)" [note]="i18n.t(head.note)" />

        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          @for (g of skills; track g.code) {
            <article
              appSpotlight
              appReveal="scale"
              [revealDelay]="($index % 3) * 0.08"
              [class]="g.wide ? 'md:col-span-2' : ''"
              class="flex min-w-0 flex-col gap-6 rounded-[1.75rem] border border-line bg-surface/70 p-6 sm:p-7"
            >
              <header class="flex items-center gap-4">
                <span class="grid size-12 shrink-0 place-items-center rounded-2xl bg-seal/10 text-seal">
                  <svg [lucideIcon]="g.icon" [size]="22"></svg>
                </span>
                <div class="min-w-0">
                  <h3 class="font-display text-xl font-bold">{{ i18n.t(g.title) }}</h3>
                  <p class="font-mono text-xs text-muted">./{{ g.code }} · {{ g.items.length }}</p>
                </div>
              </header>
              <div appReveal="children" [revealStagger]="0.03" class="flex flex-wrap gap-2">
                @for (s of g.items; track $index) {
                  <span class="chip" [class.chip-hot]="isHot(g.hot, s)">{{ i18n.t(s) }}</span>
                }
              </div>
            </article>
          }
        </div>
      </div>
    </section>
  `,
})
export class Skills {
  protected readonly head = SKILLS_HEAD;
  protected readonly skills = SKILLS;
  protected readonly i18n = inject(I18nService);

  protected isHot(hot: string[], skill: Txt): boolean {
    return typeof skill === 'string' && hot.includes(skill);
  }
}

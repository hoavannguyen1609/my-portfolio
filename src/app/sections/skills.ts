import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LucideDynamicIcon, LucideMove3d } from '@lucide/angular';
import { SKILLS, SKILLS_HEAD } from '../core/data/profile.data';
import { I18nService } from '../core/i18n.service';
import { Txt } from '../core/models';
import { CountUpDirective } from '../shared/motion/count-up.directive';
import { SpotlightDirective } from '../shared/motion/pointer.directives';
import { RevealDirective } from '../shared/motion/reveal.directive';
import { SectionHeading } from '../shared/section-heading';
import { SkillSphere } from './skill-sphere';

/** Năng lực: quả cầu 3D ghim bên trái, các nhóm kỹ năng cuộn bên phải. */
@Component({
  selector: 'app-skills',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionHeading, RevealDirective, SpotlightDirective, CountUpDirective, SkillSphere, LucideDynamicIcon, LucideMove3d],
  template: `
    <section id="skills" class="relative overflow-x-clip border-t border-line py-28 sm:py-40">
      <div class="wrap">
        <app-section-heading [label]="i18n.t(head.label)" [title]="i18n.t(head.title)" [note]="i18n.t(head.note)" />

        <div class="grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14">
          <div class="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <div appReveal="scale">
              <app-skill-sphere />
            </div>
            <div appReveal class="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
              <span class="inline-flex items-center gap-2"><svg lucideMove3d [size]="16" class="text-seal"></svg>{{ i18n.t(head.sphereHint) }}</span>
              <span><b class="font-display text-lg text-fg" [appCountUp]="total"></b> {{ i18n.t(head.total) }}</span>
            </div>
          </div>

          <div class="grid min-w-0 gap-4">
            @for (g of skills; track g.code) {
              <article appSpotlight [tilt]="5" appReveal="tilt" class="flex min-w-0 flex-col gap-5 rounded-[1.75rem] border border-line bg-surface/70 p-6 sm:p-7">
                <header class="flex items-center gap-4">
                  <span class="depth grid size-12 shrink-0 place-items-center rounded-2xl bg-seal/10 text-seal [--d:18px]">
                    <svg [lucideIcon]="g.icon" [size]="22"></svg>
                  </span>
                  <div class="min-w-0">
                    <h3 class="font-display text-xl font-bold">{{ i18n.t(g.title) }}</h3>
                    <p class="font-mono text-xs text-muted">./{{ g.code }} · {{ g.items.length }}</p>
                  </div>
                </header>
                <div appReveal="children" [revealStagger]="0.025" class="depth flex flex-wrap gap-2 [--d:8px]">
                  @for (s of g.items; track $index) {
                    <span class="chip" [class.chip-hot]="isHot(g.hot, s)">{{ i18n.t(s) }}</span>
                  }
                </div>
              </article>
            }
          </div>
        </div>
      </div>
    </section>
  `,
})
export class Skills {
  protected readonly head = SKILLS_HEAD;
  protected readonly skills = SKILLS;
  protected readonly i18n = inject(I18nService);
  protected readonly total = SKILLS.reduce((n, g) => n + g.items.length, 0);

  protected isHot(hot: string[], skill: Txt): boolean {
    return typeof skill === 'string' && hot.includes(skill);
  }
}

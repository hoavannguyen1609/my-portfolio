import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LucideArrowUpRight, LucideCopy, LucideDynamicIcon } from '@lucide/angular';
import { ABOUT, CONTACT_HEAD, CONTACTS } from '../core/data/profile.data';
import { I18nService } from '../core/i18n.service';
import { ContactItem } from '../core/models';
import { ToastService, copyText } from '../core/toast.service';
import { RevealDirective } from '../shared/motion/reveal.directive';
import { ScrubWordsDirective } from '../shared/motion/scrub-words.directive';
import { SectionHeading } from '../shared/section-heading';

@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionHeading, ScrubWordsDirective, RevealDirective, LucideDynamicIcon, LucideCopy, LucideArrowUpRight],
  template: `
    <section id="about" class="relative py-28 sm:py-40">
      <div class="wrap">
        <app-section-heading [label]="i18n.t(about.label)" [title]="i18n.t(about.title)" />

        <div class="grid gap-16 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-20">
          <div class="min-w-0">
            <p class="font-display text-[clamp(1.45rem,2.9vw,2.25rem)] font-semibold leading-[1.32] tracking-[-0.01em]" [appScrubWords]="i18n.t(about.statement)"></p>
            <p appReveal class="mt-10 max-w-xl text-lg leading-relaxed text-muted">{{ i18n.t(about.extra) }}</p>
          </div>

          <ul appReveal="children" class="min-w-0 divide-y divide-line border-y border-line self-start">
            @for (c of contacts; track $index) {
              <li class="group flex items-center gap-4 py-4">
                <span class="grid size-11 shrink-0 place-items-center rounded-2xl border border-line bg-surface text-muted transition-colors group-hover:border-seal group-hover:text-seal">
                  <svg [lucideIcon]="c.icon" [size]="18"></svg>
                </span>
                <div class="min-w-0 flex-1">
                  <p class="font-mono text-[11px] uppercase tracking-wider text-muted">{{ i18n.t(c.label) }}</p>
                  @if (c.href) {
                    <a [href]="c.href" [attr.target]="c.href.startsWith('http') ? '_blank' : null" rel="noopener" class="inline-flex items-center gap-1 break-all font-medium hover:text-seal">
                      {{ i18n.t(c.value) }}
                      @if (c.href.startsWith('http')) { <svg lucideArrowUpRight [size]="14" class="shrink-0 opacity-50"></svg> }
                    </a>
                  } @else {
                    <p class="font-medium">{{ i18n.t(c.value) }}</p>
                  }
                </div>
                @if (c.copy) {
                  <button type="button" (click)="copy(c)" class="grid size-9 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors hover:border-fg hover:text-fg" [attr.aria-label]="i18n.t(head.copy) + ' ' + i18n.t(c.label)">
                    <svg lucideCopy [size]="14"></svg>
                  </button>
                }
              </li>
            }
          </ul>
        </div>
      </div>
    </section>
  `,
})
export class About {
  protected readonly about = ABOUT;
  protected readonly head = CONTACT_HEAD;
  protected readonly contacts = CONTACTS;
  protected readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);

  protected async copy(c: ContactItem): Promise<void> {
    const ok = await copyText(this.i18n.t(c.value));
    if (ok) this.toast.show(`${this.i18n.t(this.head.copied)}: ${this.i18n.t(c.value)}`);
  }
}

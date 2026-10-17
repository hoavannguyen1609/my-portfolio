import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { LucidePower, LucideShieldCheck } from '@lucide/angular';
import { CODE_SAMPLES, INTEGRATION_HEAD, INTEGRATIONS } from '../../core/data/integration.data';
import { I18nService } from '../../core/i18n.service';
import { CountUpDirective } from '../../shared/motion/count-up.directive';
import { SpotlightDirective } from '../../shared/motion/pointer.directives';
import { RevealDirective } from '../../shared/motion/reveal.directive';
import { SectionHeading } from '../../shared/section-heading';
import { tokenize, tokenClass } from './code-tokens';
import { IntegrationMap } from './integration-map';
import { IntegrityJourney } from './integrity-journey';

/** Kinh nghiệm tích hợp hệ thống lớn và cách giữ toàn vẹn dữ liệu. */
@Component({
  selector: 'app-integration',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionHeading, RevealDirective, SpotlightDirective, CountUpDirective, IntegrationMap, IntegrityJourney, LucideShieldCheck, LucidePower],
  template: `
    <section id="integration" class="relative border-t border-line py-28 sm:py-40">
      <div class="wrap">
        <app-section-heading [label]="i18n.t(head.label)" [title]="i18n.t(head.title)" />

        <div class="mb-16 grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end">
          <p appReveal class="max-w-3xl text-lg leading-relaxed text-muted">{{ i18n.t(head.lead) }}</p>
          <dl appReveal="children" class="grid grid-cols-3 gap-4 border-t border-line pt-5">
            <div><dd class="font-display text-4xl font-extrabold text-seal" [appCountUp]="systems"></dd><dt class="mt-1 text-xs text-muted">{{ i18n.lang() === 'vi' ? 'hệ thống đã nối' : 'systems connected' }}</dt></div>
            <div><dd class="font-display text-4xl font-extrabold" [appCountUp]="guarantees"></dd><dt class="mt-1 text-xs text-muted">{{ i18n.lang() === 'vi' ? 'bảo đảm dữ liệu' : 'data guarantees' }}</dt></div>
            <div><dd class="font-display text-4xl font-extrabold text-jade" [appCountUp]="7"></dd><dt class="mt-1 text-xs text-muted">{{ i18n.lang() === 'vi' ? 'chốt toàn vẹn' : 'integrity checkpoints' }}</dt></div>
          </dl>
        </div>

        <div appReveal="tilt">
          <app-integration-map />
        </div>

        <div class="mt-28">
          <div appReveal class="mb-12 max-w-3xl">
            <h3 class="font-display text-[clamp(1.8rem,4vw,3rem)] font-bold leading-tight">{{ i18n.t(head.journeyTitle) }}</h3>
            <p class="mt-4 text-muted">{{ i18n.t(head.journeyLead) }}</p>
          </div>
          <app-integrity-journey />
        </div>

        <div class="mt-28 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <!-- Đoạn mã minh hoạ theo tab -->
          <figure appReveal="tilt" class="min-w-0 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#05080f] text-[#e8ecf3] shadow-[0_40px_120px_-50px_rgba(0,0,0,.9)]">
            <div class="flex items-center gap-2 overflow-x-auto border-b border-white/10 px-4 pt-3" role="tablist">
              <span class="mr-2 flex shrink-0 gap-1.5 pb-3"><span class="size-3 rounded-full bg-[#ff5f57]"></span><span class="size-3 rounded-full bg-[#febc2e]"></span><span class="size-3 rounded-full bg-[#28c840]"></span></span>
              @for (s of samples; track s.file) {
                <button type="button" role="tab" (click)="tab.set($index)" [attr.aria-selected]="tab() === $index"
                        class="shrink-0 rounded-t-lg border-b-2 px-3 pb-2.5 pt-1 font-mono text-xs transition-colors"
                        [class]="tab() === $index ? 'border-[#ff7b88] text-white' : 'border-transparent text-white/45 hover:text-white/80'">{{ s.file }}</button>
              }
            </div>
            <pre class="overflow-x-auto p-6 font-mono text-[13px] leading-7" data-lenis-prevent-wheel><code class="block">@for (line of lines(); track $index) {<span class="block"><span class="mr-6 inline-block w-4 select-none text-right text-white/25">{{ $index + 1 }}</span>@for (t of line; track $index) {<span [class]="cls(t.kind)">{{ t.text }}</span>}</span>}</code></pre>
            <figcaption class="border-t border-white/10 px-6 py-3 text-xs text-white/55">
              {{ i18n.lang() === 'vi' ? 'Minh hoạ rút gọn' : 'Simplified illustration' }} · {{ i18n.t(samples[tab()].caption) }}
            </figcaption>
          </figure>

          <div class="grid min-w-0 gap-4">
            <article appReveal="tilt" appSpotlight [tilt]="5" class="rounded-[1.75rem] border border-line bg-surface/70 p-6">
              <div class="flex items-center gap-3">
                <span class="grid size-10 place-items-center rounded-xl bg-seal/10 text-seal"><svg lucidePower [size]="18"></svg></span>
                <h4 class="font-display text-lg font-bold">{{ i18n.t(head.safetyTitle) }}</h4>
              </div>
              <ul class="mt-4 grid gap-3 text-[15px] leading-relaxed text-muted">
                @for (s of head.safety; track $index) {
                  <li class="flex gap-3"><span class="mt-2 size-1.5 shrink-0 rotate-45 bg-seal"></span>{{ i18n.t(s) }}</li>
                }
              </ul>
            </article>
            <article appReveal="tilt" appSpotlight [tilt]="5" class="rounded-[1.75rem] border border-line bg-surface/70 p-6">
              <div class="flex items-center gap-3">
                <span class="grid size-10 place-items-center rounded-xl bg-jade/10 text-jade"><svg lucideShieldCheck [size]="18"></svg></span>
                <h4 class="font-display text-lg font-bold">{{ i18n.t(head.rulesTitle) }}</h4>
              </div>
              <dl class="mt-4 grid gap-4">
                @for (r of head.rules; track $index) {
                  <div class="border-t border-dashed border-line pt-3">
                    <dt class="font-semibold">{{ i18n.t(r.t) }}</dt>
                    <dd class="mt-1 text-sm leading-relaxed text-muted">{{ i18n.t(r.d) }}</dd>
                  </div>
                }
              </dl>
            </article>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class IntegrationSection {
  protected readonly head = INTEGRATION_HEAD;
  protected readonly samples = CODE_SAMPLES;
  protected readonly i18n = inject(I18nService);
  protected readonly tab = signal(0);
  protected readonly systems = INTEGRATIONS.length;
  protected readonly guarantees = INTEGRATIONS.reduce((n, i) => n + i.guarantees.length, 0);
  private readonly tokenized = CODE_SAMPLES.map((s) => s.code.split('\n').map(tokenize));

  protected lines() {
    return this.tokenized[this.tab()];
  }

  protected cls = tokenClass;
}

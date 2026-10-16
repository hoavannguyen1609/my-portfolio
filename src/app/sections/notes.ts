import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CODE_SAMPLE, NOTES, NOTES_HEAD } from '../core/data/profile.data';
import { I18nService } from '../core/i18n.service';
import { RevealDirective } from '../shared/motion/reveal.directive';
import { SectionHeading } from '../shared/section-heading';

interface Token {
  text: string;
  kind: 'plain' | 'comment' | 'keyword' | 'call';
}

const KEYWORDS = /^(new|public|void|@Override|return|final|class)$/;

/** Tô màu tối giản cho đoạn Java mẫu: chú thích, từ khoá, lời gọi hàm. */
function tokenize(line: string): Token[] {
  const tokens: Token[] = [];
  const commentAt = line.indexOf('//');
  const code = commentAt >= 0 ? line.slice(0, commentAt) : line;
  for (const part of code.split(/(\s+|[(){};.,])/)) {
    if (!part) continue;
    tokens.push({ text: part, kind: KEYWORDS.test(part) ? 'keyword' : /^[a-z]\w*$/i.test(part) && /^[A-Z]/.test(part) === false && line.includes(part + '(') ? 'call' : 'plain' });
  }
  if (commentAt >= 0) tokens.push({ text: line.slice(commentAt), kind: 'comment' });
  return tokens;
}

@Component({
  selector: 'app-notes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionHeading, RevealDirective],
  template: `
    <section id="notes" class="relative border-t border-line py-28 sm:py-40">
      <div class="wrap">
        <app-section-heading [label]="i18n.t(head.label)" [title]="i18n.t(head.title)" />

        <div appReveal="children" class="grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          @for (n of notes; track $index) {
            <article class="group relative border-t-2 border-fg pt-6">
              <span class="absolute -top-[2px] left-0 h-[2px] w-0 bg-seal transition-all duration-700 group-hover:w-full"></span>
              <p class="font-mono text-xs uppercase tracking-[0.18em] text-jade">{{ i18n.t(n.topic) }}</p>
              <h3 class="mt-3 font-display text-xl font-bold leading-snug">{{ i18n.t(n.title) }}</h3>
              <p class="mt-3 text-[15px] leading-relaxed text-muted">{{ i18n.t(n.text) }}</p>
            </article>
          }
        </div>

        <figure appReveal="scale" class="mt-20 overflow-hidden rounded-3xl border border-white/10 bg-[#05080f] text-[#e8ecf3] shadow-[0_40px_120px_-50px_rgba(0,0,0,.9)]">
          <div class="flex items-center gap-2 border-b border-white/10 px-5 py-3">
            <span class="size-3 rounded-full bg-[#ff5f57]"></span>
            <span class="size-3 rounded-full bg-[#febc2e]"></span>
            <span class="size-3 rounded-full bg-[#28c840]"></span>
            <span class="ml-3 font-mono text-xs text-white/50">AfterCommitPublisher.java</span>
          </div>
          <pre class="overflow-x-auto p-6 font-mono text-[13px] leading-7" data-lenis-prevent-wheel><code appReveal="children" [revealStagger]="0.05" class="block">@for (line of code; track $index) {<span class="block"><span class="mr-6 inline-block w-4 select-none text-right text-white/25">{{ $index + 1 }}</span>@for (t of line; track $index) {<span [class]="tokenClass(t.kind)">{{ t.text }}</span>}</span>}</code></pre>
          <figcaption class="border-t border-white/10 px-6 py-3 text-xs text-white/50">{{ i18n.t(head.codeCaption) }}</figcaption>
        </figure>
      </div>
    </section>
  `,
})
export class Notes {
  protected readonly head = NOTES_HEAD;
  protected readonly notes = NOTES;
  protected readonly code = CODE_SAMPLE.split('\n').map(tokenize);
  protected readonly i18n = inject(I18nService);

  protected tokenClass(kind: Token['kind']): string {
    switch (kind) {
      case 'comment': return 'text-white/40 italic';
      case 'keyword': return 'text-[#ff7b88]';
      case 'call': return 'text-[#5ef0d3]';
      default: return '';
    }
  }
}

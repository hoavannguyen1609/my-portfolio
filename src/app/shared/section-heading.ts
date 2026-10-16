import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RevealDirective } from './motion/reveal.directive';
import { SplitTextDirective } from './motion/split-text.directive';

/** Tiêu đề mục: nhãn bên trái, tiêu đề lớn tách chữ, ghi chú tuỳ chọn. Nhận chuỗi đã dịch. */
@Component({
  selector: 'app-section-heading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, SplitTextDirective],
  template: `
    <div class="mb-14 grid gap-5 md:mb-20 md:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] md:items-end md:gap-10">
      <div appReveal="left" class="flex items-center gap-3 md:pb-3">
        <span class="h-px w-10 bg-seal"></span>
        <span class="eyebrow">{{ label() }}</span>
      </div>
      <div class="min-w-0">
        <h2 class="font-display text-[clamp(2.3rem,6vw,4.6rem)] font-bold leading-[1.02]" [appSplit]="title()"></h2>
        @if (note()) {
          <p appReveal class="mt-5 max-w-2xl text-muted">{{ note() }}</p>
        }
      </div>
    </div>
  `,
})
export class SectionHeading {
  readonly label = input.required<string>();
  readonly title = input.required<string>();
  readonly note = input<string>('');
}

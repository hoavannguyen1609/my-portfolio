import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { LucideShieldCheck } from '@lucide/angular';
import { APP_ENV } from '../core/config/app-env';
import { ConsentService } from '../core/firebase/consent.service';
import { I18nService } from '../core/i18n.service';

/** Hỏi đồng ý trước khi bật công cụ đo lường; chỉ hiện khi có ít nhất một công cụ được cấu hình. */
@Component({
  selector: 'app-consent-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideShieldCheck],
  template: `
    @if (consent.needed() && consent.state() === null) {
      <div
        role="dialog"
        aria-labelledby="consent-title"
        animate.enter="toast-in"
        animate.leave="toast-out"
        class="glass fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 right-4 z-[85] rounded-3xl p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,.7)] sm:left-6 sm:right-auto sm:max-w-md"
      >
        <div class="flex items-center gap-2">
          <svg lucideShieldCheck [size]="18" class="text-jade"></svg>
          <p id="consent-title" class="font-display text-base font-bold">{{ i18n.lang() === 'vi' ? 'Quyền riêng tư' : 'Privacy' }}</p>
        </div>
        <p class="mt-2 text-sm leading-relaxed text-muted">
          @if (i18n.lang() === 'vi') {
            Trang dùng {{ tools() }} để hiểu cách người xem dùng trang và tối ưu trải nghiệm. Không quảng cáo, không bán dữ liệu; ô nhập liệu được che khỏi bản ghi.
          } @else {
            This site uses {{ tools() }} to understand how visitors use it and to improve the experience. No ads, no data selling; form fields are masked in recordings.
          }
        </p>
        <div class="mt-4 flex flex-wrap gap-2">
          <button type="button" (click)="consent.set('granted')" class="btn btn-primary !px-4 !py-2.5 text-sm">{{ i18n.lang() === 'vi' ? 'Đồng ý' : 'Accept' }}</button>
          <button type="button" (click)="consent.set('denied')" class="btn !px-4 !py-2.5 text-sm">{{ i18n.lang() === 'vi' ? 'Chỉ phần cần thiết' : 'Essential only' }}</button>
        </div>
      </div>
    }
  `,
})
export class ConsentBanner {
  protected readonly consent = inject(ConsentService);
  protected readonly i18n = inject(I18nService);
  private readonly env = inject(APP_ENV);

  protected readonly tools = computed(() => {
    const names: string[] = [];
    if (this.env.features.analytics && this.env.firebase?.measurementId) names.push('Firebase Analytics');
    if (this.env.features.performance && this.env.firebase) names.push('Firebase Performance');
    if (this.env.clarityProjectId) names.push('Microsoft Clarity');
    return names.join(', ');
  });
}

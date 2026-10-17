import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { LucideLoaderCircle, LucideSend } from '@lucide/angular';
import { AnalyticsService } from '../core/firebase/analytics.service';
import { ClarityService } from '../core/firebase/clarity.service';
import { ContactMessageService, SendResult } from '../core/firebase/contact-message.service';
import { RemoteConfigService } from '../core/firebase/remote-config.service';
import { I18nService } from '../core/i18n.service';
import { Txt } from '../core/models';
import { ToastService } from '../core/toast.service';

const RESULT_TEXT: Record<Exclude<SendResult, 'unavailable'>, Txt> = {
  sent: { vi: 'Đã gửi. Tôi sẽ phản hồi qua email sớm nhất.', en: 'Sent. I will reply by email soon.' },
  'too-soon': { vi: 'Bạn vừa gửi một lời nhắn, thử lại sau 1 phút.', en: 'You just sent a message; try again in a minute.' },
  invalid: { vi: 'Kiểm tra lại: cần tên, email hợp lệ và lời nhắn từ 10 ký tự.', en: 'Please check: a name, a valid email and at least 10 characters.' },
  error: { vi: 'Chưa gửi được. Hãy gửi email trực tiếp giúp tôi.', en: 'Could not send. Please email me directly.' },
};

/** Form lời nhắn lưu vào Firestore; chưa cấu hình Firebase hoặc cờ tắt thì không hiện. */
@Component({
  selector: 'app-contact-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideSend, LucideLoaderCircle],
  template: `
    @if (visible()) {
      <div class="mt-16 grid gap-8 border-t border-bg/15 pt-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <div>
        <h3 class="font-display text-3xl font-bold">{{ i18n.lang() === 'vi' ? 'Gửi lời nhắn' : 'Leave a message' }}</h3>
        <p class="mt-3 max-w-sm text-bg/60">
          {{ i18n.lang() === 'vi'
            ? 'Lời nhắn lưu vào Firestore với luật chỉ cho phép tạo mới, không ai đọc được từ trình duyệt. Tôi đọc và trả lời qua email.'
            : 'Messages go to Firestore under create-only rules; nobody can read them from the browser. I read them and reply by email.' }}
        </p>
      </div>
      <form class="relative grid gap-3" (submit)="submit($event)" novalidate>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="grid gap-1.5">
            <span class="font-mono text-[11px] uppercase tracking-wider text-bg/55">{{ i18n.lang() === 'vi' ? 'Tên' : 'Name' }}</span>
            <input id="contact-name" name="name" autocomplete="name" maxlength="80" required [value]="name()" (input)="name.set(val($event))"
                   class="rounded-2xl border border-bg/20 bg-bg/[.06] px-4 py-3 text-bg outline-none placeholder:text-bg/35 focus:border-seal" />
          </label>
          <label class="grid gap-1.5">
            <span class="font-mono text-[11px] uppercase tracking-wider text-bg/55">Email</span>
            <input id="contact-email" name="email" type="email" autocomplete="email" maxlength="120" required [value]="email()" (input)="email.set(val($event))"
                   class="rounded-2xl border border-bg/20 bg-bg/[.06] px-4 py-3 text-bg outline-none placeholder:text-bg/35 focus:border-seal" />
          </label>
        </div>
        <label class="grid gap-1.5">
          <span class="font-mono text-[11px] uppercase tracking-wider text-bg/55">{{ i18n.lang() === 'vi' ? 'Lời nhắn' : 'Message' }}</span>
          <textarea id="contact-message" name="message" rows="4" maxlength="2000" required [value]="message()" (input)="message.set(val($event))"
                    class="resize-y rounded-2xl border border-bg/20 bg-bg/[.06] px-4 py-3 text-bg outline-none focus:border-seal"></textarea>
        </label>
        <!-- Bẫy bot: người dùng không thấy ô này -->
        <input id="contact-website" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" class="absolute -left-[9999px] h-0 w-0 opacity-0" (input)="trap = val($event)" />
        <div class="flex flex-wrap items-center gap-4">
          <button type="submit" [disabled]="sending()" class="inline-flex items-center gap-2 rounded-full bg-seal px-6 py-3.5 font-semibold text-white disabled:opacity-60" data-track="contact_submit">
            @if (sending()) { <svg lucideLoaderCircle [size]="16" class="animate-spin"></svg> } @else { <svg lucideSend [size]="16"></svg> }
            {{ i18n.lang() === 'vi' ? 'Gửi lời nhắn' : 'Send message' }}
          </button>
          <span class="font-mono text-xs text-bg/50">{{ message().length }}/2000</span>
          @if (result(); as r) {
            <p role="status" class="w-full text-sm" [class]="r === 'sent' ? 'text-jade' : 'text-seal'">{{ i18n.t(resultText[r]) }}</p>
          }
        </div>
      </form>
      </div>
    }
  `,
})
export class ContactForm {
  protected readonly i18n = inject(I18nService);
  protected readonly resultText = RESULT_TEXT;
  protected readonly name = signal('');
  protected readonly email = signal('');
  protected readonly message = signal('');
  protected readonly sending = signal(false);
  protected readonly result = signal<Exclude<SendResult, 'unavailable'> | null>(null);
  protected trap = '';

  private readonly service = inject(ContactMessageService);
  private readonly analytics = inject(AnalyticsService);
  private readonly clarity = inject(ClarityService);
  private readonly toast = inject(ToastService);
  private readonly flag = inject(RemoteConfigService).flag('contact_form');
  protected readonly visible = computed(() => this.service.available && this.flag());

  protected val(e: Event): string {
    return (e.target as HTMLInputElement | HTMLTextAreaElement).value;
  }

  protected async submit(e: Event): Promise<void> {
    e.preventDefault();
    if (this.sending()) return;
    // Bot điền ô ẩn: giả vờ thành công, không ghi gì
    if (this.trap) {
      this.result.set('sent');
      return;
    }
    this.sending.set(true);
    const r = await this.service.send({ name: this.name(), email: this.email(), message: this.message() }, this.i18n.lang());
    this.sending.set(false);
    if (r === 'unavailable') return;
    this.result.set(r);
    this.analytics.track('contact_message', { result: r });
    if (r === 'sent') {
      this.clarity.event('contact_message_sent');
      this.toast.show(this.i18n.t(RESULT_TEXT.sent));
      this.name.set('');
      this.email.set('');
      this.message.set('');
    }
  }
}

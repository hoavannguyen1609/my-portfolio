import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {
  LucideArrowUp,
  LucideCopy,
  LucideCornerDownLeft,
  LucideDynamicIcon,
  LucideFileText,
  LucideGitBranch,
  LucideHash,
  LucideLanguages,
  LucideMessageCircle,
  LucideSearch,
  LucideShieldCheck,
  LucideSunMoon,
} from '@lucide/angular';
import { NAV, PROFILE } from '../core/data/profile.data';
import { AnalyticsService } from '../core/firebase/analytics.service';
import { CommandPaletteService } from '../core/command-palette.service';
import { ConsentService } from '../core/firebase/consent.service';
import { I18nService } from '../core/i18n.service';
import { MotionService } from '../core/motion.service';
import { ThemeService } from '../core/theme.service';
import { ToastService, copyText } from '../core/toast.service';
import type { LucideIconInput } from '@lucide/angular';
import { Txt } from '../core/models';

interface Command {
  id: string;
  group: 'nav' | 'action';
  icon: LucideIconInput;
  label: Txt;
  hint?: string;
  run: () => void;
}

/** Bỏ dấu tiếng Việt để gõ "tich hop" vẫn ra "Tích hợp". */
const fold = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();

/** Bảng lệnh ⌘K / Ctrl+K: nhảy tới mục, sao chép liên hệ, đổi theme và ngôn ngữ bằng bàn phím. */
@Component({
  selector: 'app-command-palette',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideDynamicIcon, LucideSearch, LucideCornerDownLeft],
  host: { '(window:keydown)': 'onGlobalKey($event)' },
  template: `
    @if (palette.open()) {
      <div class="fixed inset-0 z-[90] grid place-items-start bg-bg/60 px-4 pt-[14vh] backdrop-blur-sm" animate.enter="toast-in" animate.leave="toast-out" (click)="close()">
        <div
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="i18n.lang() === 'vi' ? 'Bảng lệnh' : 'Command palette'"
          class="glass mx-auto w-full max-w-xl overflow-hidden rounded-3xl shadow-[0_40px_120px_-30px_rgba(0,0,0,.8)]"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-center gap-3 border-b border-line px-5">
            <svg lucideSearch [size]="18" class="shrink-0 text-muted"></svg>
            <input
              #input
              id="palette-input"
              type="text"
              autocomplete="off"
              spellcheck="false"
              class="h-14 w-full bg-transparent text-base outline-none placeholder:text-muted"
              [placeholder]="i18n.lang() === 'vi' ? 'Gõ để tìm mục hoặc lệnh…' : 'Type a section or command…'"
              [value]="query()"
              (input)="onInput($event)"
              (keydown)="onKey($event)"
              role="combobox"
              aria-controls="palette-list"
              [attr.aria-activedescendant]="'cmd-' + (results()[active()]?.id ?? '')"
            />
            <kbd class="hidden shrink-0 rounded-md border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted sm:block">ESC</kbd>
          </div>
          <ul id="palette-list" role="listbox" class="max-h-[50vh] overflow-y-auto p-2" data-lenis-prevent>
            @for (c of results(); track c.id; let i = $index) {
              @if (i === 0 || results()[i - 1].group !== c.group) {
                <li class="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted" role="presentation">
                  {{ c.group === 'nav' ? (i18n.lang() === 'vi' ? 'Đi tới' : 'Go to') : (i18n.lang() === 'vi' ? 'Hành động' : 'Actions') }}
                </li>
              }
              <li
                [id]="'cmd-' + c.id"
                role="option"
                [attr.aria-selected]="i === active()"
                (pointermove)="active.set(i)"
                (click)="execute(c)"
                class="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm"
                [class]="i === active() ? 'bg-seal text-white' : 'text-fg'"
              >
                <svg [lucideIcon]="c.icon" [size]="16" class="shrink-0"></svg>
                <span class="flex-1 truncate">{{ i18n.t(c.label) }}</span>
                @if (c.hint) { <span class="font-mono text-[11px] opacity-70">{{ c.hint }}</span> }
                @if (i === active()) { <svg lucideCornerDownLeft [size]="14" class="opacity-80"></svg> }
              </li>
            } @empty {
              <li class="px-3 py-8 text-center text-sm text-muted">{{ i18n.lang() === 'vi' ? 'Không có lệnh phù hợp' : 'No matching command' }}</li>
            }
          </ul>
        </div>
      </div>
    }
  `,
})
export class CommandPalette {
  protected readonly palette = inject(CommandPaletteService);
  protected readonly i18n = inject(I18nService);
  protected readonly query = signal('');
  protected readonly active = signal(0);

  private readonly theme = inject(ThemeService);
  private readonly motion = inject(MotionService);
  private readonly toast = inject(ToastService);
  private readonly analytics = inject(AnalyticsService);
  private readonly consent = inject(ConsentService);
  private readonly input = viewChild<ElementRef<HTMLInputElement>>('input');
  private lastFocus: HTMLElement | null = null;

  private readonly commands: Command[] = [
    ...NAV.map<Command>((n) => ({ id: `nav-${n.id}`, group: 'nav', icon: LucideHash, label: n.label, run: () => this.motion.scrollTo(`#${n.id}`) })),
    { id: 'nav-projects', group: 'nav', icon: LucideHash, label: { vi: 'Dự án tại 84Soft', en: 'Projects at 84Soft' }, run: () => this.motion.scrollTo('#projects') },
    { id: 'nav-education', group: 'nav', icon: LucideHash, label: { vi: 'Học vấn', en: 'Education' }, run: () => this.motion.scrollTo('#education') },
    { id: 'copy-email', group: 'action', icon: LucideCopy, label: { vi: 'Sao chép email', en: 'Copy email' }, hint: PROFILE.email, run: () => this.copy(PROFILE.email) },
    { id: 'copy-phone', group: 'action', icon: LucideCopy, label: { vi: 'Sao chép số điện thoại', en: 'Copy phone number' }, hint: PROFILE.phone, run: () => this.copy(PROFILE.phone) },
    { id: 'theme', group: 'action', icon: LucideSunMoon, label: { vi: 'Đổi giao diện sáng/tối', en: 'Toggle light/dark' }, run: () => this.theme.toggle() },
    { id: 'lang', group: 'action', icon: LucideLanguages, label: { vi: 'Switch to English', en: 'Chuyển sang tiếng Việt' }, run: () => this.i18n.toggle() },
    { id: 'cv', group: 'action', icon: LucideFileText, label: { vi: 'Mở sơ yếu lý lịch', en: 'Open résumé' }, run: () => window.open(this.i18n.t(PROFILE.cv), '_blank', 'noopener') },
    { id: 'gitlab', group: 'action', icon: LucideGitBranch, label: { vi: 'Mở GitLab', en: 'Open GitLab' }, run: () => window.open(PROFILE.gitlab, '_blank', 'noopener') },
    { id: 'zalo', group: 'action', icon: LucideMessageCircle, label: { vi: 'Nhắn Zalo', en: 'Message on Zalo' }, run: () => window.open(PROFILE.zalo, '_blank', 'noopener') },
    { id: 'top', group: 'action', icon: LucideArrowUp, label: { vi: 'Lên đầu trang', en: 'Back to top' }, run: () => this.motion.scrollTo(0) },
  ];

  protected readonly results = computed(() => {
    const q = fold(this.query().trim());
    if (!q) return this.commands;
    return this.commands.filter((c) => fold(this.i18n.t(c.label) + ' ' + (c.hint ?? '')).includes(q));
  });

  constructor() {
    if (this.consent.needed()) {
      this.commands.push({ id: 'privacy', group: 'action', icon: LucideShieldCheck, label: { vi: 'Cài đặt quyền riêng tư', en: 'Privacy settings' }, run: () => this.consent.reset() });
    }

    // Mở: khoá cuộn, focus ô tìm; đóng: trả focus về chỗ cũ
    effect(() => {
      const open = this.palette.open();
      untracked(() => {
        this.motion.lock(open);
        if (open) {
          this.lastFocus = document.activeElement as HTMLElement | null;
          this.query.set('');
          this.active.set(0);
          this.analytics.track('open_command_palette');
          // Đợi @if vẽ ô tìm rồi mới focus
          setTimeout(() => this.input()?.nativeElement.focus(), 30);
        } else {
          this.lastFocus?.focus?.();
        }
      });
    });
    inject(DestroyRef).onDestroy(() => this.motion.lock(false));
  }

  protected onGlobalKey(e: KeyboardEvent): void {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      this.palette.toggle();
    } else if (e.key === 'Escape' && this.palette.open()) {
      this.close();
    }
  }

  protected onInput(e: Event): void {
    this.query.set((e.target as HTMLInputElement).value);
    this.active.set(0);
  }

  protected onKey(e: KeyboardEvent): void {
    const n = this.results().length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.active.update((i) => (n ? (i + 1) % n : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.active.update((i) => (n ? (i - 1 + n) % n : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const c = this.results()[this.active()];
      if (c) this.execute(c);
    }
  }

  protected execute(c: Command): void {
    this.analytics.track('run_command', { command_id: c.id });
    this.close();
    // Đợi khoá cuộn mở rồi mới chạy lệnh cuộn
    setTimeout(() => c.run(), 60);
  }

  protected close(): void {
    this.palette.open.set(false);
  }

  private async copy(value: string): Promise<void> {
    if (await copyText(value)) this.toast.show(`${this.i18n.lang() === 'vi' ? 'Đã sao chép' : 'Copied'}: ${value}`);
  }
}

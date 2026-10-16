import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { LucideFileText, LucideLanguages, LucideMenu, LucideMoon, LucideSun, LucideX } from '@lucide/angular';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HERO, NAV, PROFILE } from '../core/data/profile.data';
import { I18nService } from '../core/i18n.service';
import { MotionService } from '../core/motion.service';
import { ThemeService } from '../core/theme.service';
import { MagneticDirective } from '../shared/motion/pointer.directives';

/** Thanh điều hướng nổi: ẩn khi cuộn xuống, hiện khi cuộn lên, vạch sáng chạy theo mục đang xem. */
@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideSun, LucideMoon, LucideMenu, LucideX, LucideLanguages, LucideFileText, MagneticDirective],
  template: `
    <div #progress class="fixed inset-x-0 top-0 z-[70] h-[3px] origin-left scale-x-0 bg-gradient-to-r from-seal via-seal to-jade"></div>

    <header #bar class="fixed inset-x-0 top-0 z-50 px-[max(12px,env(safe-area-inset-left))] pt-[max(12px,env(safe-area-inset-top))]">
      <div class="glass mx-auto flex max-w-6xl items-center gap-2 rounded-full py-2 pl-2 pr-2 shadow-[0_20px_60px_-30px_rgba(0,0,0,.6)]">
        <a href="#top" (click)="go($event, 'top')" class="group flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3" aria-label="{{ profile.name }}">
          <span class="grid size-9 -rotate-6 place-items-center rounded-full border-2 border-seal font-mono text-[10px] font-bold text-seal transition-transform duration-500 group-hover:rotate-[354deg]">NVH</span>
          <span class="hidden font-display text-[15px] font-bold sm:block">{{ profile.short }}</span>
        </a>

        <nav class="relative ml-auto hidden items-center lg:flex" aria-label="Chính">
          <span #pill class="absolute left-0 top-1/2 -z-0 h-9 -translate-y-1/2 rounded-full bg-fg/[.08] opacity-0"></span>
          @for (item of nav; track item.id) {
            <a
              #link
              [href]="'#' + item.id"
              (click)="go($event, item.id)"
              class="relative z-10 rounded-full px-3.5 py-2 text-sm transition-colors"
              [class.text-fg]="active() === item.id"
              [class.text-muted]="active() !== item.id"
              [attr.aria-current]="active() === item.id ? 'true' : null"
            >{{ i18n.t(item.label) }}</a>
          }
        </nav>

        <div class="ml-auto flex items-center gap-1.5 lg:ml-3">
          <a appMagnetic [href]="profile.cv" target="_blank" rel="noopener" class="hidden items-center gap-1.5 rounded-full border border-line px-3 py-2 text-xs font-semibold md:inline-flex">
            <svg lucideFileText [size]="14"></svg>CV
          </a>
          <button type="button" appMagnetic (click)="i18n.toggle()" class="inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3 font-mono text-xs font-bold" [attr.aria-label]="i18n.lang() === 'vi' ? 'Switch to English' : 'Chuyển sang tiếng Việt'">
            <svg lucideLanguages [size]="14"></svg>{{ i18n.lang() === 'vi' ? 'EN' : 'VI' }}
          </button>
          <button type="button" appMagnetic (click)="theme.toggle($event)" class="grid size-9 place-items-center rounded-full border border-line" [attr.aria-label]="theme.theme() === 'dark' ? 'Light mode' : 'Dark mode'">
            @if (theme.theme() === 'dark') { <svg lucideSun [size]="16"></svg> } @else { <svg lucideMoon [size]="16"></svg> }
          </button>
          <button type="button" (click)="toggleMenu()" class="grid size-9 place-items-center rounded-full bg-fg text-bg lg:hidden" [attr.aria-expanded]="menuOpen()" aria-controls="mobile-menu" aria-label="Menu">
            @if (menuOpen()) { <svg lucideX [size]="16"></svg> } @else { <svg lucideMenu [size]="16"></svg> }
          </button>
        </div>
      </div>
    </header>

    @if (menuOpen()) {
      <div id="mobile-menu" animate.enter="menu-in" animate.leave="menu-out" class="fixed inset-0 z-40 flex flex-col justify-between bg-bg/95 px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-28 backdrop-blur-xl lg:hidden">
        <nav class="flex flex-col gap-1" aria-label="Menu">
          @for (item of nav; track item.id; let i = $index) {
            <a [href]="'#' + item.id" (click)="go($event, item.id)" class="menu-link group flex items-baseline gap-4 py-2 font-display text-5xl font-bold" [style.animation-delay.ms]="80 + i * 60">
              <span class="font-mono text-sm text-seal">0{{ i + 1 }}</span>
              <span class="transition-transform group-hover:translate-x-2">{{ i18n.t(item.label) }}</span>
            </a>
          }
        </nav>
        <div class="flex flex-col gap-2 font-mono text-sm text-muted">
          <span>{{ i18n.t(hero.available) }}</span>
          <a [href]="'mailto:' + profile.email" class="text-fg">{{ profile.email }}</a>
        </div>
      </div>
    }
  `,
})
export class Header {
  protected readonly nav = NAV;
  protected readonly profile = PROFILE;
  protected readonly hero = HERO;
  protected readonly i18n = inject(I18nService);
  protected readonly theme = inject(ThemeService);
  protected readonly active = signal('');
  protected readonly menuOpen = signal(false);

  private readonly motion = inject(MotionService);
  private readonly bar = viewChild.required<ElementRef<HTMLElement>>('bar');
  private readonly progress = viewChild.required<ElementRef<HTMLElement>>('progress');
  private readonly pill = viewChild.required<ElementRef<HTMLElement>>('pill');
  private readonly links = viewChildren<ElementRef<HTMLElement>>('link');
  private triggers: ScrollTrigger[] = [];

  constructor() {
    afterNextRender(() => {
      const bar = this.bar().nativeElement;
      if (!this.motion.introDone()) gsap.set(bar, { yPercent: -150 });

      this.triggers.push(
        ScrollTrigger.create({
          start: 0,
          end: 'max',
          onUpdate: (self) => {
            gsap.set(this.progress().nativeElement, { scaleX: self.progress });
            const hide = self.direction === 1 && self.scroll() > 320 && !this.menuOpen();
            gsap.to(bar, { yPercent: hide ? -150 : 0, duration: 0.45, ease: 'power3.out', overwrite: 'auto' });
          },
        }),
      );

      for (const item of this.nav) {
        const section = document.getElementById(item.id);
        if (!section) continue;
        this.triggers.push(
          ScrollTrigger.create({
            trigger: section,
            start: 'top 55%',
            end: 'bottom 55%',
            onToggle: (self) => {
              if (self.isActive) this.active.set(item.id);
              else if (this.active() === item.id) this.active.set('');
            },
          }),
        );
      }
    });

    effect(() => {
      if (this.motion.introDone()) {
        gsap.to(this.bar().nativeElement, { yPercent: 0, duration: 1, delay: 0.5, ease: 'expo.out' });
      }
    });

    // Vạch sáng trượt tới link đang active
    effect(() => {
      const id = this.active();
      const index = this.nav.findIndex((n) => n.id === id);
      const link = this.links()[index]?.nativeElement;
      const pill = this.pill().nativeElement;
      if (!link) {
        gsap.to(pill, { opacity: 0, duration: 0.3 });
        return;
      }
      gsap.to(pill, { x: link.offsetLeft, width: link.offsetWidth, opacity: 1, duration: 0.5, ease: 'power3.out' });
    });

    inject(DestroyRef).onDestroy(() => this.triggers.forEach((t) => t.kill()));
  }

  protected go(event: Event, id: string): void {
    event.preventDefault();
    if (this.menuOpen()) this.toggleMenu();
    this.motion.scrollTo(id === 'top' ? 0 : `#${id}`);
  }

  protected toggleMenu(): void {
    this.menuOpen.update((v) => !v);
    this.motion.lock(this.menuOpen());
    // Nút đóng nằm trên thanh header: luôn kéo header xuống khi mở menu
    if (this.menuOpen()) gsap.to(this.bar().nativeElement, { yPercent: 0, duration: 0.3, overwrite: 'auto' });
  }
}

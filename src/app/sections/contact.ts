import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, viewChild } from '@angular/core';
import { LucideArrowUp, LucideArrowUpRight, LucideCopy, LucideFileText, LucideGitBranch, LucideMessageCircle, LucidePhone } from '@lucide/angular';
import { gsap } from 'gsap';
import { CONTACT_HEAD, PROFILE } from '../core/data/profile.data';
import { I18nService } from '../core/i18n.service';
import { MotionService } from '../core/motion.service';
import { ToastService, copyText } from '../core/toast.service';
import { MagneticDirective } from '../shared/motion/pointer.directives';
import { RevealDirective } from '../shared/motion/reveal.directive';
import { SplitTextDirective } from '../shared/motion/split-text.directive';
import { ContactForm } from './contact-form';

/** Khối liên hệ đảo màu, dấu son lớn xoay theo cuộn, kèm chân trang. */
@Component({
  selector: 'app-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ContactForm,
    SplitTextDirective,
    RevealDirective,
    MagneticDirective,
    LucideArrowUpRight,
    LucideArrowUp,
    LucideCopy,
    LucidePhone,
    LucideMessageCircle,
    LucideGitBranch,
    LucideFileText,
  ],
  template: `
    <section #section id="contact" class="relative isolate overflow-hidden bg-fg text-bg">
      <!-- Đồng xu dấu son 3D: hai mặt + vành dày, lật theo vị trí cuộn -->
      <div class="pointer-events-none absolute -right-28 -top-16 -z-10 size-[30rem] [perspective:1400px] sm:-right-10" aria-hidden="true">
        <div #seal class="relative size-full [transform-style:preserve-3d]">
          @for (z of edge; track z) {
            <div class="absolute inset-[2%] rounded-full border-[6px] border-bg/[.06]" [style.transform]="'translateZ(' + z + 'px)'"></div>
          }
          <div class="absolute inset-0 text-bg/[.12] [backface-visibility:hidden] [transform:translateZ(12px)]">
            <svg viewBox="0 0 200 200" class="size-full">
              <defs><path id="coin-front" d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" /></defs>
              <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" stroke-width="3" />
              <circle cx="100" cy="100" r="64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 4" />
              <text class="fill-current font-mono" font-size="12" letter-spacing="4"><textPath href="#coin-front" textLength="495">BACKEND · SPRING BOOT · KAFKA · ELASTICSEARCH ·</textPath></text>
              <text x="100" y="112" text-anchor="middle" class="fill-current font-display" font-size="34" font-weight="800">NVH</text>
            </svg>
          </div>
          <div class="absolute inset-0 text-seal/40 [backface-visibility:hidden] [transform:rotateY(180deg)_translateZ(12px)]">
            <svg viewBox="0 0 200 200" class="size-full">
              <defs><path id="coin-back" d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" /></defs>
              <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" stroke-width="3" />
              <circle cx="100" cy="100" r="58" fill="currentColor" fill-opacity=".12" stroke="currentColor" stroke-width="1.5" />
              <text class="fill-current font-mono" font-size="12" letter-spacing="4"><textPath href="#coin-back" textLength="495">ĐÃ BAN HÀNH · HÀ NỘI · 2026 · ĐÃ BAN HÀNH ·</textPath></text>
              <text x="100" y="98" text-anchor="middle" class="fill-current font-display" font-size="22" font-weight="800">VĂN</text>
              <text x="100" y="122" text-anchor="middle" class="fill-current font-display" font-size="22" font-weight="800">HÒA</text>
            </svg>
          </div>
        </div>
      </div>

      <div class="wrap pb-10 pt-28 sm:pt-36">
        <div appReveal="left" class="flex items-center gap-3">
          <span class="h-px w-10 bg-seal"></span>
          <span class="font-mono text-xs uppercase tracking-[0.18em] text-bg/60">{{ i18n.t(head.label) }}</span>
        </div>

        <h2 class="mt-6 max-w-4xl font-display text-[clamp(3rem,10vw,8.5rem)] font-extrabold leading-[0.92] tracking-[-0.045em]" [appSplit]="i18n.t(head.big)" splitBy="chars"></h2>
        <p appReveal class="mt-8 max-w-xl text-lg text-bg/70">{{ i18n.t(head.lead) }}</p>

        <div appReveal class="mt-12 flex flex-wrap items-center gap-3">
          <a [appMagnetic]="0.2" [href]="'mailto:' + profile.email" data-cursor="Mail" data-track="contact_email"
             class="group inline-flex max-w-full items-center gap-3 rounded-full bg-seal px-6 py-4 font-display text-[clamp(1rem,2.6vw,1.6rem)] font-bold text-white shadow-[0_20px_60px_-20px_var(--glow-seal)]">
            <span class="truncate">{{ profile.email }}</span>
            <svg lucideArrowUpRight [size]="22" class="shrink-0 transition-transform group-hover:rotate-45"></svg>
          </a>
          <button type="button" (click)="copyEmail()" data-track="copy_email" class="inline-flex items-center gap-2 rounded-full border border-bg/20 px-5 py-4 text-sm font-semibold hover:border-bg">
            <svg lucideCopy [size]="16"></svg>{{ i18n.t(head.copy) }}
          </button>
        </div>

        <div appReveal="children" class="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <a [appMagnetic]="0.15" [href]="profile.phoneHref" class="group flex items-center gap-4 rounded-2xl border border-bg/15 p-5 transition-colors hover:border-bg/50">
            <svg lucidePhone [size]="20" class="text-seal"></svg>
            <span class="min-w-0"><span class="block font-mono text-[11px] uppercase tracking-wider text-bg/50">{{ i18n.lang() === 'vi' ? 'Điện thoại' : 'Phone' }}</span><span class="font-semibold">{{ profile.phone }}</span></span>
          </a>
          <a [appMagnetic]="0.15" [href]="profile.zalo" target="_blank" rel="noopener" class="group flex items-center gap-4 rounded-2xl border border-bg/15 p-5 transition-colors hover:border-bg/50">
            <svg lucideMessageCircle [size]="20" class="text-seal"></svg>
            <span class="min-w-0"><span class="block font-mono text-[11px] uppercase tracking-wider text-bg/50">Zalo</span><span class="font-semibold">+84 941 470 529</span></span>
          </a>
          <a [appMagnetic]="0.15" [href]="profile.gitlab" target="_blank" rel="noopener" class="group flex items-center gap-4 rounded-2xl border border-bg/15 p-5 transition-colors hover:border-bg/50">
            <svg lucideGitBranch [size]="20" class="text-seal"></svg>
            <span class="min-w-0"><span class="block font-mono text-[11px] uppercase tracking-wider text-bg/50">GitLab</span><span class="block truncate font-semibold">NguyenVanHoa160901</span></span>
          </a>
          <a [appMagnetic]="0.15" [href]="i18n.t(profile.cv)" target="_blank" rel="noopener" type="application/pdf" data-track="contact_cv" class="group flex items-center gap-4 rounded-2xl border border-bg/15 p-5 transition-colors hover:border-bg/50">
            <svg lucideFileText [size]="20" class="text-seal"></svg>
            <span class="min-w-0"><span class="block font-mono text-[11px] uppercase tracking-wider text-bg/50">CV</span><span class="font-semibold">PDF · {{ i18n.lang() === 'vi' ? 'Tiếng Việt' : 'English' }} ↗</span></span>
          </a>
        </div>

        <app-contact-form />

        <footer class="mt-24 flex flex-wrap items-center justify-between gap-4 border-t border-bg/15 pt-6 text-sm text-bg/60">
          <span>© 2026 {{ profile.name }}</span>
          <span class="font-mono text-xs">{{ i18n.t(head.built) }}</span>
          <button type="button" (click)="toTop()" class="inline-flex items-center gap-2 rounded-full border border-bg/20 px-4 py-2 font-medium text-bg hover:border-bg">
            <svg lucideArrowUp [size]="14"></svg>{{ i18n.t(head.backTop) }}
          </button>
        </footer>
      </div>
    </section>
  `,
})
export class Contact {
  protected readonly head = CONTACT_HEAD;
  protected readonly profile = PROFILE;
  /** Các lớp vành xếp theo trục Z tạo độ dày đồng xu */
  protected readonly edge = [-10, -6, -2, 2, 6, 10];
  protected readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly motion = inject(MotionService);
  private readonly section = viewChild.required<ElementRef<HTMLElement>>('section');
  private readonly seal = viewChild.required<ElementRef<HTMLElement>>('seal');

  constructor() {
    let ctx: gsap.Context | undefined;
    afterNextRender(() => {
      if (this.motion.reduced()) return;
      ctx = gsap.context(() => {
        gsap.fromTo(
          this.seal().nativeElement,
          { rotateY: -40, rotateX: 25, rotateZ: -20 },
          { rotateY: 540, rotateX: -12, rotateZ: 10, ease: 'none', scrollTrigger: { trigger: this.section().nativeElement, start: 'top bottom', end: 'bottom bottom', scrub: 1 } },
        );
      });
    });
    inject(DestroyRef).onDestroy(() => ctx?.revert());
  }

  protected async copyEmail(): Promise<void> {
    if (await copyText(this.profile.email)) this.toast.show(`${this.i18n.t(this.head.copied)}: ${this.profile.email}`);
  }

  protected toTop(): void {
    this.motion.scrollTo(0);
  }
}

import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, effect, inject, untracked } from '@angular/core';
import { AnalyticsService } from './core/firebase/analytics.service';
import { ClarityService } from './core/firebase/clarity.service';
import { ConsentService } from './core/firebase/consent.service';
import { PerformanceService } from './core/firebase/performance.service';
import { RemoteConfigService } from './core/firebase/remote-config.service';
import { I18nService } from './core/i18n.service';
import { MotionService } from './core/motion.service';
import { ThemeService } from './core/theme.service';
import { CommandPalette } from './layout/command-palette';
import { ConsentBanner } from './layout/consent-banner';
import { Cursor } from './layout/cursor';
import { Header } from './layout/header';
import { Preloader } from './layout/preloader';
import { Toast } from './layout/toast';
import { About } from './sections/about';
import { Contact } from './sections/contact';
import { EducationSection } from './sections/education';
import { Experience } from './sections/experience';
import { Hero } from './sections/hero/hero';
import { IntegrationSection } from './sections/integration/integration';
import { Marquee } from './sections/marquee';
import { Projects } from './sections/projects';
import { Skills } from './sections/skills';
import { Work } from './sections/work/work';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Preloader,
    Cursor,
    Header,
    Toast,
    CommandPalette,
    ConsentBanner,
    Hero,
    Marquee,
    About,
    Skills,
    Experience,
    Work,
    IntegrationSection,
    Projects,
    EducationSection,
    Contact,
  ],
  host: { '(document:click)': 'onClick($event)' },
  template: `
    <app-preloader />
    <app-cursor />
    <div class="grain" aria-hidden="true"></div>
    <app-header />
    <!-- clip: thẻ đang chờ lật 3D phình ra ngoài màn hình không được làm trang cuộn ngang -->
    <main class="overflow-x-clip">
      <app-hero />
      <app-marquee />
      <app-about />
      <app-skills />
      <app-experience />
      <app-work />
      <app-integration />
      <app-projects />
      <app-education />
    </main>
    <app-contact />
    <app-toast />
    <app-command-palette />
    <app-consent-banner />
  `,
})
export class App {
  private readonly motion = inject(MotionService);
  private readonly i18n = inject(I18nService);
  private readonly theme = inject(ThemeService);
  private readonly consent = inject(ConsentService);
  private readonly analytics = inject(AnalyticsService);
  private readonly perf = inject(PerformanceService);
  private readonly clarity = inject(ClarityService);
  private readonly remoteConfig = inject(RemoteConfigService);

  constructor() {
    let sectionObserver: IntersectionObserver | undefined;

    // App đăng ký trước các component con nên Lenis được khởi tạo trước mọi ScrollTrigger
    afterNextRender(() => {
      this.motion.init();
      this.motion.refresh(300);
      document.fonts.ready.then(() => this.motion.refresh());
      window.addEventListener('load', () => this.motion.refresh(), { once: true });

      // Remote Config không thu thập dữ liệu cá nhân nên chạy ngay; lỗi thì giữ giá trị mặc định
      void this.remoteConfig.start();

      // Đo độ sâu cuộn: mỗi mục ghi một lần khi lộ đủ nhiều
      sectionObserver = new IntersectionObserver(
        (entries) => entries.forEach((e) => e.isIntersecting && this.analytics.trackSection(e.target.id)),
        { threshold: 0.35 },
      );
      document.querySelectorAll('section[id]').forEach((s) => sectionObserver!.observe(s));
    });

    // Đổi ngôn ngữ làm thay đổi chiều cao chữ: tính lại vị trí trigger
    effect(() => {
      this.i18n.lang();
      this.motion.refresh(150);
    });

    // Công cụ đo lường chỉ chạy sau khi người xem đồng ý
    effect(() => {
      const state = this.consent.state();
      untracked(() => {
        if (state === 'granted') {
          const context = { app_lang: this.i18n.lang(), app_theme: this.theme.theme() };
          void this.analytics.start(context);
          void this.perf.start();
          this.clarity.start(context);
        } else if (state === 'denied') {
          void this.analytics.stop();
        }
      });
    });

    inject(DestroyRef).onDestroy(() => sectionObserver?.disconnect());
  }

  /** Mọi phần tử có data-track gửi sự kiện ui_click với tên đó. */
  protected onClick(e: MouseEvent): void {
    const target = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-track]');
    if (target) this.analytics.track('ui_click', { target: target.dataset['track'] ?? '' });
  }
}

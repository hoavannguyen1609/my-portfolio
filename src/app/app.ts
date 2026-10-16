import { ChangeDetectionStrategy, Component, afterNextRender, effect, inject } from '@angular/core';
import { I18nService } from './core/i18n.service';
import { MotionService } from './core/motion.service';
import { Cursor } from './layout/cursor';
import { Header } from './layout/header';
import { Preloader } from './layout/preloader';
import { Toast } from './layout/toast';
import { About } from './sections/about';
import { Contact } from './sections/contact';
import { EducationSection } from './sections/education';
import { Experience } from './sections/experience';
import { Hero } from './sections/hero/hero';
import { Marquee } from './sections/marquee';
import { Notes } from './sections/notes';
import { Projects } from './sections/projects';
import { Skills } from './sections/skills';
import { Work } from './sections/work/work';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Preloader, Cursor, Header, Toast, Hero, Marquee, About, Skills, Experience, Work, Projects, Notes, EducationSection, Contact],
  template: `
    <app-preloader />
    <app-cursor />
    <div class="grain" aria-hidden="true"></div>
    <app-header />
    <main>
      <app-hero />
      <app-marquee />
      <app-about />
      <app-skills />
      <app-experience />
      <app-work />
      <app-projects />
      <app-notes />
      <app-education />
    </main>
    <app-contact />
    <app-toast />
  `,
})
export class App {
  private readonly motion = inject(MotionService);
  private readonly i18n = inject(I18nService);

  constructor() {
    // App đăng ký trước các component con nên Lenis được khởi tạo trước mọi ScrollTrigger
    afterNextRender(() => {
      this.motion.init();
      this.motion.refresh(300);
      document.fonts.ready.then(() => this.motion.refresh());
      window.addEventListener('load', () => this.motion.refresh(), { once: true });
    });

    // Đổi ngôn ngữ làm thay đổi chiều cao chữ: tính lại vị trí trigger
    effect(() => {
      this.i18n.lang();
      this.motion.refresh(150);
    });
  }
}

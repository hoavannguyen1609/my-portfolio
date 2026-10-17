import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { LucideArrowDown, LucideArrowUpRight, LucideFileText, LucideRotateCcw } from '@lucide/angular';
import { gsap } from 'gsap';
import { HERO, PROFILE, SLIP, STATS } from '../../core/data/profile.data';
import { I18nService } from '../../core/i18n.service';
import { MotionService } from '../../core/motion.service';
import { CountUpDirective } from '../../shared/motion/count-up.directive';
import { MagneticDirective, SpotlightDirective } from '../../shared/motion/pointer.directives';
import { SplitTextDirective } from '../../shared/motion/split-text.directive';
import { RemoteConfigService } from '../../core/firebase/remote-config.service';
import { HeroScene } from './hero-scene';
import { MeshCanvas } from './mesh-canvas';

@Component({
  selector: 'app-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeroScene,
    MeshCanvas,
    SplitTextDirective,
    CountUpDirective,
    MagneticDirective,
    SpotlightDirective,
    LucideArrowUpRight,
    LucideArrowDown,
    LucideFileText,
    LucideRotateCcw,
  ],
  templateUrl: './hero.html',
})
export class Hero {
  protected readonly hero = HERO;
  protected readonly slip = SLIP;
  protected readonly stats = STATS;
  protected readonly profile = PROFILE;
  protected readonly i18n = inject(I18nService);
  /** Bước đang xử lý trên phiếu trình; bằng flow.length nghĩa là đã ban hành */
  protected readonly step = signal(-1);
  protected readonly avatarFailed = signal(false);
  protected readonly hero3d = inject(RemoteConfigService).flag('hero_3d');

  private readonly motion = inject(MotionService);
  private readonly section = viewChild.required<ElementRef<HTMLElement>>('section');
  private readonly content = viewChild.required<ElementRef<HTMLElement>>('content');
  private readonly card = viewChild.required<ElementRef<HTMLElement>>('card');
  private readonly seal = viewChild.required<ElementRef<HTMLElement>>('seal');
  private readonly role = viewChild.required<ElementRef<HTMLElement>>('role');
  private ctx?: gsap.Context;
  private roleTimer?: ReturnType<typeof setInterval>;
  private flowTl?: gsap.core.Timeline;
  private floating = false;

  constructor() {
    afterNextRender(() => {
      const root = this.section().nativeElement;
      if (this.motion.reduced()) {
        this.step.set(this.slip.flow.length);
        return;
      }
      this.ctx = gsap.context(() => {
        if (!this.motion.introDone()) gsap.set(root.querySelectorAll('[data-intro]'), { autoAlpha: 0, y: 30 });
        gsap.set(this.card().nativeElement, { autoAlpha: 0, y: 70, rotate: 3 });
        gsap.set(this.seal().nativeElement, { autoAlpha: 0 });

        // Cuộn qua hero: nội dung trôi lên và mờ dần
        gsap.to(this.content().nativeElement, {
          yPercent: -14,
          opacity: 0.2,
          ease: 'none',
          scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
        });
      }, root);
    });

    effect(() => {
      if (!this.motion.introDone() || this.motion.reduced()) return;
      untracked(() => this.playIntro());
    });

    inject(DestroyRef).onDestroy(() => {
      clearInterval(this.roleTimer);
      this.flowTl?.kill();
      this.ctx?.revert();
    });
  }

  private playIntro(): void {
    const root = this.section().nativeElement;
    this.ctx?.add(() => {
      gsap.to(root.querySelectorAll('[data-intro]'), { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08, ease: 'power3.out', delay: 0.45 });
      gsap.to(this.card().nativeElement, { autoAlpha: 1, y: 0, rotate: 0, duration: 1.3, ease: 'expo.out', delay: 0.6, onComplete: () => this.playFlow() });
    });

    const roles = this.hero.roles;
    let i = 0;
    this.roleTimer = setInterval(() => {
      i = (i + 1) % roles.length;
      gsap.to(this.role().nativeElement, { duration: 1.1, scrambleText: { text: roles[i], chars: '01<>/{}#', speed: 0.5 } });
    }, 2800);
  }

  protected playFlow(): void {
    if (this.motion.reduced()) return;
    this.flowTl?.kill();
    const seal = this.seal().nativeElement;
    const card = this.card().nativeElement;
    this.step.set(-1);
    gsap.set(seal, { autoAlpha: 0 });

    const tl = gsap.timeline();
    this.slip.flow.forEach((_, index) => tl.call(() => this.step.set(index), [], index * 0.55 + 0.2));
    tl.call(() => this.step.set(this.slip.flow.length), [], '+=0.45')
      .fromTo(seal, { autoAlpha: 0, scale: 2.4, rotate: -40 }, { autoAlpha: 1, scale: 1, rotate: -14, duration: 0.5, ease: 'back.out(2.5)' })
      .fromTo(card, { x: 0 }, { keyframes: { x: [0, -5, 4, -2, 0] }, duration: 0.35, ease: 'power1.out' }, '-=0.2');
    this.flowTl = tl;

    // Phiếu trình lơ lửng nhẹ sau khi đóng dấu
    if (!this.floating) {
      this.floating = true;
      gsap.to(card, { y: -12, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: tl.duration() });
    }
  }

  protected stateOf(index: number): 'done' | 'active' | 'idle' {
    const s = this.step();
    return index < s ? 'done' : index === s ? 'active' : 'idle';
  }

  protected scrollNext(): void {
    this.motion.scrollTo('#about');
  }
}

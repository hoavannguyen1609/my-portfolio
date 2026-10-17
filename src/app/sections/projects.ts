import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { LucideDynamicIcon, LucidePlus } from '@lucide/angular';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { PROJECTS, PROJECTS_HEAD } from '../core/data/profile.data';
import { I18nService } from '../core/i18n.service';
import { MotionService } from '../core/motion.service';
import { Project, ProjectKind, Txt } from '../core/models';
import { RevealDirective } from '../shared/motion/reveal.directive';
import { SectionHeading } from '../shared/section-heading';

const KIND_TEXT: Record<ProjectKind, Txt> = {
  ai: 'AI',
  fs: 'Full-stack',
  lead: { vi: 'Dẫn dắt Frontend', en: 'Frontend lead' },
};

/** Ba kiểu ảnh bìa sinh từ token màu, xoay vòng theo thứ tự dự án. */
const COVERS = ['cover-rings', 'cover-grid', 'cover-dots'];

/**
 * Dự án tại 84Soft dạng danh mục: tên lớn theo hàng, rê chuột hiện thẻ xem trước 3D bám con trỏ,
 * bấm hàng để mở chi tiết (dùng được trên cảm ứng). Lọc theo vai trò, các hàng trượt bằng GSAP Flip.
 */
@Component({
  selector: 'app-projects',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionHeading, RevealDirective, LucideDynamicIcon, LucidePlus],
  template: `
    <section id="projects" class="relative border-t border-line py-28 sm:py-40">
      <div class="wrap">
        <app-section-heading [label]="i18n.t(head.label)" [title]="i18n.t(head.title)" />

        <div appReveal class="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <dl class="grid grid-cols-4 gap-6">
            @for (s of stats; track $index) {
              <div>
                <dd class="font-display text-3xl font-extrabold tabular-nums" [class]="s.tone">{{ s.value }}</dd>
                <dt class="mt-1 text-xs leading-snug text-muted">{{ i18n.t(s.label) }}</dt>
              </div>
            }
          </dl>
          <div class="flex flex-wrap gap-2" role="group" [attr.aria-label]="i18n.lang() === 'vi' ? 'Lọc dự án' : 'Filter projects'">
            @for (f of head.filters; track f.key) {
              <button
                type="button"
                (click)="setFilter(f.key)"
                [attr.aria-pressed]="filter() === f.key"
                class="rounded-full border px-4 py-2 font-mono text-xs font-medium transition-colors"
                [class]="filter() === f.key ? 'border-fg bg-fg text-bg' : 'border-line text-muted hover:border-fg hover:text-fg'"
              >
                {{ i18n.t(f.label) }} <span class="ml-1 opacity-60">{{ countOf(f.key) }}</span>
              </button>
            }
          </div>
        </div>

        <div #list appReveal="children" [revealStagger]="0.05" class="border-t border-line" (pointerleave)="hover(null)">
          @for (p of projects; track p.name; let i = $index) {
            <article #row [attr.data-kinds]="p.kinds.join(' ')" class="group relative isolate border-b border-line" (pointerenter)="hover(p)">
              <span class="pointer-events-none absolute inset-0 -z-10 origin-left scale-x-0 bg-gradient-to-r from-seal/[.09] to-transparent transition-transform duration-500 ease-out group-hover:scale-x-100" [class.scale-x-100]="open() === p.name"></span>
              <button
                type="button"
                (click)="toggle(p)"
                [attr.aria-expanded]="open() === p.name"
                [attr.aria-controls]="'project-' + i"
                class="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 py-6 text-left md:grid-cols-[3.5rem_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,0.8fr)_auto] md:gap-6"
                data-cursor="Open"
              >
                <span class="grid size-12 place-items-center rounded-2xl border border-line bg-surface text-fg transition-all duration-500 group-hover:-rotate-12 group-hover:border-seal group-hover:bg-seal group-hover:text-white">
                  <svg [lucideIcon]="p.icon" [size]="22"></svg>
                </span>
                <span class="min-w-0">
                  <span class="block truncate font-display text-[clamp(1.7rem,4.2vw,3.2rem)] font-bold leading-none tracking-[-0.02em] transition-transform duration-500 group-hover:translate-x-2">{{ p.name }}</span>
                  <span class="mt-1.5 block truncate text-sm text-muted md:hidden">{{ i18n.t(p.role) }}</span>
                </span>
                <span class="hidden text-sm md:block">{{ i18n.t(p.role) }}</span>
                <span class="hidden font-mono text-xs text-seal md:block">{{ p.org }}</span>
                <span class="grid size-10 place-items-center rounded-full border border-line transition-all duration-300 group-hover:border-fg" [class.rotate-45]="open() === p.name" [class.bg-fg]="open() === p.name" [class.text-bg]="open() === p.name">
                  <svg lucidePlus [size]="16"></svg>
                </span>
              </button>

              @if (open() === p.name) {
                <div [id]="'project-' + i" animate.enter="expand-in" animate.leave="expand-out" class="grid gap-6 pb-8 md:grid-cols-[3.5rem_minmax(0,1.5fr)_minmax(0,1.8fr)] md:gap-6">
                  <span class="hidden md:block"></span>
                  <div class="min-w-0">
                    <p class="font-mono text-xs text-seal md:hidden">{{ p.org }}</p>
                    <p class="mt-1 text-lg leading-relaxed">{{ i18n.t(p.description) }}</p>
                    <div class="mt-4 flex flex-wrap gap-2">
                      @for (k of p.kinds; track k) { <span class="chip chip-hot">{{ i18n.t(kindText[k]) }}</span> }
                    </div>
                  </div>
                  <div class="flex min-w-0 flex-wrap content-start gap-2">
                    @for (s of stackOf(p); track s) { <span class="chip">{{ s }}</span> }
                  </div>
                </div>
              }
            </article>
          }
        </div>
      </div>

      <!-- Thẻ xem trước bám con trỏ (chỉ thiết bị có chuột) -->
      <div #preview class="pointer-events-none fixed left-0 top-0 z-30 hidden w-[20rem] [perspective:900px] lg:block" aria-hidden="true">
        @if (hovered(); as p) {
          <div class="overflow-hidden rounded-[1.5rem] border border-line bg-surface shadow-[0_40px_100px_-30px_rgba(0,0,0,.7)]">
            <div class="relative grid h-44 place-items-center overflow-hidden" [class]="coverOf(p)">
              <span class="grid size-20 place-items-center rounded-3xl bg-bg/80 text-seal shadow-2xl backdrop-blur [transform:translateZ(40px)]">
                <svg [lucideIcon]="p.icon" [size]="38"></svg>
              </span>
            </div>
            <div class="p-5">
              <p class="font-mono text-[11px] text-seal">{{ p.org }}</p>
              <p class="mt-1 font-display text-2xl font-bold">{{ p.name }}</p>
              <p class="mt-2 text-sm leading-relaxed text-muted">{{ i18n.t(p.description) }}</p>
            </div>
          </div>
        }
      </div>
    </section>
  `,
})
export class Projects {
  protected readonly head = PROJECTS_HEAD;
  protected readonly projects = PROJECTS;
  protected readonly kindText = KIND_TEXT;
  protected readonly i18n = inject(I18nService);
  protected readonly filter = signal<'all' | ProjectKind>('all');
  protected readonly open = signal<string | null>(null);
  protected readonly hovered = signal<Project | null>(null);
  protected readonly stats = this.buildStats();

  private readonly motion = inject(MotionService);
  private readonly rows = viewChildren<ElementRef<HTMLElement>>('row');
  private readonly preview = viewChild.required<ElementRef<HTMLElement>>('preview');
  private moveTo?: { x: (v: number) => void; y: (v: number) => void };
  private lastX = 0;

  constructor() {
    const off: (() => void)[] = [];
    afterNextRender(() => {
      if (!matchMedia('(pointer: fine)').matches) return;
      const el = this.preview().nativeElement;
      gsap.set(el, { autoAlpha: 0, scale: 0.8 });
      const xTo = gsap.quickTo(el, 'x', { duration: 0.55, ease: 'power3.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.55, ease: 'power3.out' });
      this.moveTo = { x: xTo, y: yTo };
      const move = (e: PointerEvent) => {
        if (!this.hovered()) return;
        xTo(e.clientX + 28);
        yTo(e.clientY - 120);
        // Nghiêng theo vận tốc ngang cho cảm giác thẻ có quán tính
        const dx = e.clientX - this.lastX;
        this.lastX = e.clientX;
        if (!this.motion.reduced()) gsap.to(el, { rotateY: gsap.utils.clamp(-18, 18, dx * 0.8), rotateZ: gsap.utils.clamp(-6, 6, dx * 0.25), duration: 0.4, overwrite: 'auto' });
      };
      window.addEventListener('pointermove', move, { passive: true });
      off.push(() => window.removeEventListener('pointermove', move));
    });
    inject(DestroyRef).onDestroy(() => off.forEach((fn) => fn()));
  }

  protected hover(p: Project | null): void {
    this.hovered.set(p);
    const el = this.preview().nativeElement;
    if (!this.moveTo) return;
    gsap.to(el, p ? { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'back.out(1.6)' } : { autoAlpha: 0, scale: 0.8, rotateY: 0, rotateZ: 0, duration: 0.25 });
  }

  protected toggle(p: Project): void {
    this.open.update((v) => (v === p.name ? null : p.name));
    this.motion.refresh(450);
  }

  protected stackOf(p: Project): string[] {
    return p.stack.split(' · ');
  }

  protected coverOf(p: Project): string {
    return COVERS[this.projects.indexOf(p) % COVERS.length];
  }

  protected countOf(key: 'all' | ProjectKind): number {
    return key === 'all' ? this.projects.length : this.projects.filter((p) => p.kinds.includes(key)).length;
  }

  protected setFilter(key: 'all' | ProjectKind): void {
    if (key === this.filter()) return;
    this.filter.set(key);
    this.open.set(null);
    const rows = this.rows().map((r) => r.nativeElement);
    const match = (el: HTMLElement) => key === 'all' || (el.dataset['kinds'] ?? '').split(' ').includes(key);

    if (this.motion.reduced()) {
      rows.forEach((el) => el.classList.toggle('hidden', !match(el)));
      this.motion.refresh();
      return;
    }
    const state = Flip.getState(rows);
    rows.forEach((el) => el.classList.toggle('hidden', !match(el)));
    Flip.from(state, {
      duration: 0.6,
      ease: 'power3.inOut',
      absolute: true,
      onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, x: -40 }, { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.04, delay: 0.15 }),
      onLeave: (els) => gsap.to(els, { autoAlpha: 0, x: 40, duration: 0.35 }),
      onComplete: () => this.motion.refresh(),
    });
  }

  /** Số liệu tóm tắt đếm thẳng từ danh sách dự án. */
  private buildStats(): { value: number; label: Txt; tone: string }[] {
    const partners = new Set(this.projects.map((p) => p.org.split(' · ')[1]).filter(Boolean));
    return [
      { value: this.projects.length, label: { vi: 'sản phẩm', en: 'products' }, tone: '' },
      { value: partners.size, label: { vi: 'đối tác', en: 'partners' }, tone: '' },
      { value: this.countOf('lead'), label: { vi: 'lần dẫn dắt FE', en: 'times FE lead' }, tone: 'text-seal' },
      { value: this.countOf('ai'), label: { vi: 'dự án AI', en: 'AI products' }, tone: 'text-jade' },
    ];
  }
}

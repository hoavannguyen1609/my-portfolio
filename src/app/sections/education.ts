import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { LucideCalendarRange, LucideGraduationCap } from '@lucide/angular';
import { gsap } from 'gsap';
import { EDUCATION, EDUCATION_HEAD } from '../core/data/profile.data';
import { I18nService } from '../core/i18n.service';
import { Education } from '../core/models';
import { MotionService } from '../core/motion.service';
import { CountUpDirective } from '../shared/motion/count-up.directive';
import { SpotlightDirective } from '../shared/motion/pointer.directives';
import { RevealDirective } from '../shared/motion/reveal.directive';
import { SectionHeading } from '../shared/section-heading';

type Tone = 'seal' | 'jade' | 'fg';

interface Row {
  e: Education;
  tone: Tone;
  cover: string;
  months: number;
  left: number;
  width: number;
}

const TONES: Record<string, { tone: Tone; cover: string }> = {
  itplus: { tone: 'fg', cover: 'cover-dots' },
  f8: { tone: 'jade', cover: 'cover-grid' },
  ptit: { tone: 'seal', cover: 'cover-rings' },
};

/** Số tháng tuyệt đối của "YYYY-MM" để tính khoảng cách. */
const monthIndex = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  return y * 12 + (m - 1);
};

/**
 * Học vấn: thước thời gian theo năm cho thấy các chương trình nối tiếp và chồng nhau,
 * bên dưới là thẻ chứng chỉ kiểu vé (logo trường, dấu son trạng thái, thời lượng).
 * Rê vào thanh hoặc thẻ thì cặp tương ứng cùng sáng.
 */
@Component({
  selector: 'app-education',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionHeading, RevealDirective, SpotlightDirective, CountUpDirective, LucideGraduationCap, LucideCalendarRange],
  template: `
    <section id="education" class="relative overflow-x-clip border-t border-line py-28 sm:py-36">
      <div class="pointer-events-none absolute -left-40 top-1/3 -z-10 size-[460px] rounded-full bg-jade/10 blur-[120px]"></div>
      <div class="wrap">
        <app-section-heading [label]="i18n.t(head.label)" [title]="i18n.t(head.title)" [note]="i18n.t(head.note)" />

        <!-- Thước thời gian -->
        <div #ruler appReveal class="rounded-[2rem] border border-line bg-surface/50 p-5 sm:p-8" (pointerleave)="active.set(null)">
          <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p class="eyebrow inline-flex items-center gap-2"><svg lucideCalendarRange [size]="14" class="text-seal"></svg>{{ i18n.t(head.rulerTitle) }}</p>
            <dl class="flex flex-wrap gap-x-8 gap-y-2">
              <div class="flex items-baseline gap-2"><dd class="font-display text-2xl font-extrabold text-seal tabular-nums" [appCountUp]="years" countSuffix="+"></dd><dt class="text-xs text-muted">{{ i18n.t(head.statYears) }}</dt></div>
              <div class="flex items-baseline gap-2"><dd class="font-display text-2xl font-extrabold tabular-nums" [appCountUp]="rows.length"></dd><dt class="text-xs text-muted">{{ i18n.t(head.statPrograms) }}</dt></div>
              <div class="flex items-baseline gap-2"><dd class="font-display text-2xl font-extrabold text-jade tabular-nums" [appCountUp]="totalMonths"></dd><dt class="text-xs text-muted">{{ i18n.t(head.statMonths) }}</dt></div>
            </dl>
          </div>

          <div class="relative pb-10 pt-9">
            <!-- Vạch năm -->
            @for (y of yearTicks; track y.year) {
              <div class="absolute bottom-0 top-6 border-l border-dashed border-line" [style.left.%]="y.left">
                <span class="absolute -top-6 -translate-x-1/2 font-mono text-[10px] text-muted sm:text-xs">{{ y.year }}</span>
              </div>
            }

            <!-- Mốc hôm nay -->
            <div #today class="absolute bottom-8 top-6 z-10 w-px origin-top bg-seal" [style.left.%]="todayLeft">
              <span class="absolute -top-1 left-1/2 size-2.5 -translate-x-1/2 rounded-full bg-seal"><span class="absolute inset-0 animate-pulse-ring rounded-full bg-seal"></span></span>
              <span class="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-seal px-2 py-0.5 font-mono text-[10px] font-bold text-white">{{ i18n.t(head.today) }}</span>
            </div>

            <!-- Thanh thời lượng -->
            <div class="relative grid gap-3">
              @for (r of rows; track r.e.id) {
                <div class="relative h-11">
                  <button
                    #bar
                    type="button"
                    (pointerenter)="active.set(r.e.id)"
                    (focus)="active.set(r.e.id)"
                    (click)="scrollToCard(r.e.id)"
                    class="edu-bar absolute inset-y-0 flex items-center gap-2 overflow-hidden rounded-full border px-3 text-left transition-[opacity,box-shadow] duration-300"
                    [class]="barClass(r)"
                    [style.left.%]="r.left"
                    [style.width.%]="r.width"
                    [attr.aria-label]="r.e.school + ' · ' + duration(r.months)"
                  >
                    @if (!r.e.end) { <span class="absolute inset-0 bg-[repeating-linear-gradient(115deg,transparent_0_10px,rgb(255_255_255/.14)_10px_20px)] animate-[stripes_1.2s_linear_infinite]"></span> }
                    <span class="relative truncate font-display text-sm font-bold">{{ r.e.short }}</span>
                    <span class="relative hidden truncate font-mono text-[10px] opacity-80 sm:inline">{{ duration(r.months) }}</span>
                  </button>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Thẻ chứng chỉ -->
        <div appReveal="children" [revealStagger]="0.12" class="mt-8 grid gap-5 md:grid-cols-3">
          @for (r of rowsDesc; track r.e.id) {
            <article
              [id]="'edu-' + r.e.id"
              appSpotlight
              [tilt]="9"
              (pointerenter)="active.set(r.e.id)"
              (pointerleave)="active.set(null)"
              class="relative flex min-w-0 flex-col overflow-hidden rounded-[1.75rem] border bg-surface/80 transition-[border-color,box-shadow,opacity] duration-300"
              [class]="cardClass(r)"
            >
              <div class="relative h-32 overflow-hidden" [class]="r.cover">
                <div class="depth absolute bottom-4 left-5 grid size-16 place-items-center rounded-2xl bg-white p-2 shadow-xl [--d:28px]">
                  @if (!failed().has(r.e.id)) {
                    <img [src]="r.e.logo" [alt]="r.e.short" width="48" height="48" loading="lazy" class="size-12 object-contain" (error)="markFailed(r.e.id)" />
                  } @else {
                    <span class="font-display text-lg font-extrabold text-[#0b1322]">{{ r.e.short }}</span>
                  }
                </div>
                <span class="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider"
                      [class]="r.e.end ? 'bg-bg/70 text-fg backdrop-blur' : 'bg-seal text-white'">
                  @if (!r.e.end) { <span class="size-1.5 animate-pulse rounded-full bg-white"></span> }
                  {{ i18n.t(r.e.end ? head.done : head.studying) }}
                </span>
              </div>

              <div class="flex flex-1 flex-col p-6">
                <h3 class="depth font-display text-xl font-bold leading-snug [--d:12px]">{{ r.e.school }}</h3>
                <dl class="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
                  <dt class="font-mono text-[11px] uppercase tracking-wider text-muted">{{ i18n.t(head.program) }}</dt>
                  <dd class="font-medium">{{ i18n.t(r.e.program) }}</dd>
                  <dt class="font-mono text-[11px] uppercase tracking-wider text-muted">{{ i18n.t(head.mode) }}</dt>
                  <dd>{{ i18n.t(r.e.mode) }}</dd>
                  @if (r.e.credential) {
                    <dt class="font-mono text-[11px] uppercase tracking-wider text-muted">{{ i18n.t(head.credential) }}</dt>
                    <dd class="inline-flex items-center gap-1.5 font-semibold text-seal"><svg lucideGraduationCap [size]="15"></svg>{{ i18n.t(r.e.credential) }}</dd>
                  }
                </dl>
              </div>

              <!-- Đường răng cưa kiểu cuống vé -->
              <div class="relative mx-6 border-t-2 border-dashed border-line">
                <span class="absolute -left-9 -top-3 size-6 rounded-full border border-line bg-bg"></span>
                <span class="absolute -right-9 -top-3 size-6 rounded-full border border-line bg-bg"></span>
              </div>

              <div class="flex items-end justify-between gap-4 p-6 pt-5">
                <div class="min-w-0 flex-1">
                  <p class="font-mono text-xs">{{ period(r.e) }}</p>
                  <p class="mt-1 text-xs text-muted">{{ i18n.t(head.duration) }}: {{ duration(r.months) }}</p>
                  <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
                    <div class="h-full rounded-full" [class]="r.tone === 'seal' ? 'bg-seal' : r.tone === 'jade' ? 'bg-jade' : 'bg-fg/60'" [style.width.%]="(r.months / maxMonths) * 100"></div>
                  </div>
                </div>
                <div class="depth relative grid size-20 shrink-0 -rotate-12 place-items-center rounded-full border-[3px] border-double [--d:34px]"
                     [class]="r.e.end ? 'border-fg/30 text-fg/40' : 'border-seal text-seal'" aria-hidden="true">
                  <svg viewBox="0 0 100 100" class="absolute inset-0 size-full">
                    <defs><path [attr.id]="'edu-ring-' + r.e.id" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" /></defs>
                    <text class="fill-current font-mono" font-size="9" letter-spacing="1.5">
                      <textPath [attr.href]="'#edu-ring-' + r.e.id" textLength="228" lengthAdjust="spacing">{{ sealText(r.e) }}</textPath>
                    </text>
                  </svg>
                  <span class="font-display text-sm font-extrabold">{{ r.e.short }}</span>
                </div>
              </div>
            </article>
          }
        </div>
      </div>
    </section>
  `,
})
export class EducationSection {
  protected readonly head = EDUCATION_HEAD;
  protected readonly i18n = inject(I18nService);
  protected readonly active = signal<string | null>(null);
  protected readonly failed = signal(new Set<string>());

  private readonly motion = inject(MotionService);
  private readonly ruler = viewChild.required<ElementRef<HTMLElement>>('ruler');
  private readonly today = viewChild.required<ElementRef<HTMLElement>>('today');

  private readonly nowYm = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  })();
  private readonly rangeStart = monthIndex('2020-01');
  private readonly rangeEnd = monthIndex(`${new Date().getFullYear() + 1}-01`);
  private readonly span = this.rangeEnd - this.rangeStart;

  protected readonly rows: Row[] = EDUCATION.map((e) => {
    const start = monthIndex(e.start);
    const end = monthIndex(e.end ?? this.nowYm);
    const months = Math.max(1, end - start);
    return {
      e,
      ...TONES[e.id],
      months,
      left: ((start - this.rangeStart) / this.span) * 100,
      width: (months / this.span) * 100,
    };
  });
  /** Thẻ xếp mới nhất trước */
  protected readonly rowsDesc = [...this.rows].reverse();
  protected readonly maxMonths = Math.max(...this.rows.map((r) => r.months));
  protected readonly totalMonths = this.rows.reduce((n, r) => n + r.months, 0);
  protected readonly years = Math.floor((monthIndex(this.nowYm) - monthIndex(EDUCATION[0].start)) / 12);
  protected readonly todayLeft = ((monthIndex(this.nowYm) - this.rangeStart) / this.span) * 100;
  protected readonly yearTicks = Array.from({ length: this.span / 12 + 1 }, (_, i) => ({
    year: 2020 + i,
    left: ((i * 12) / this.span) * 100,
  }));

  constructor() {
    let ctx: gsap.Context | undefined;
    afterNextRender(() => {
      if (this.motion.reduced()) return;
      const root = this.ruler().nativeElement;
      ctx = gsap.context(() => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: root, start: 'top 75%', once: true } });
        tl.from(root.querySelectorAll('.edu-bar'), { scaleX: 0, transformOrigin: '0% 50%', duration: 1.3, ease: 'expo.out', stagger: 0.18 })
          .from(this.today().nativeElement, { scaleY: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6');
      });
    });
    inject(DestroyRef).onDestroy(() => ctx?.revert());
  }

  protected readonly anyActive = computed(() => this.active() !== null);

  protected barClass(r: Row): string {
    const on = this.active() === r.e.id;
    const dim = this.anyActive() && !on ? ' opacity-40' : '';
    const tone =
      r.tone === 'seal'
        ? 'border-seal bg-seal text-white shadow-[0_12px_40px_-12px_var(--glow-seal)]'
        : r.tone === 'jade'
          ? 'border-jade/60 bg-jade/20 text-fg'
          : 'border-fg/25 bg-fg/10 text-fg';
    return tone + dim + (on ? ' ring-2 ring-offset-2 ring-offset-surface ' + (r.tone === 'seal' ? 'ring-seal' : r.tone === 'jade' ? 'ring-jade' : 'ring-fg/40') : '');
  }

  protected cardClass(r: Row): string {
    const on = this.active() === r.e.id;
    if (on) return r.tone === 'jade' ? 'border-jade/60 shadow-[0_30px_80px_-40px_var(--glow-jade)]' : 'border-seal/60 shadow-[0_30px_80px_-40px_var(--glow-seal)]';
    return 'border-line' + (this.anyActive() ? ' md:opacity-60' : '');
  }

  protected duration(months: number): string {
    const y = Math.floor(months / 12);
    const m = months % 12;
    if (this.i18n.lang() === 'vi') return [y ? `${y} năm` : '', m ? `${m} tháng` : ''].filter(Boolean).join(' ');
    return [y ? `${y} yr${y > 1 ? 's' : ''}` : '', m ? `${m} mo` : ''].filter(Boolean).join(' ');
  }

  protected period(e: Education): string {
    const fmt = (ym: string) => ym.split('-').reverse().join('/');
    return `${fmt(e.start)} – ${e.end ? fmt(e.end) : this.i18n.t(this.head.today).toLowerCase()}`;
  }

  protected sealText(e: Education): string {
    const vi = this.i18n.lang() === 'vi';
    if (e.end) return vi ? 'ĐÃ HOÀN THÀNH · ĐÃ HOÀN THÀNH · ' : 'COMPLETED · COMPLETED · COMPLETED · ';
    return vi ? 'ĐANG HỌC · ĐANG HỌC · ĐANG HỌC · ' : 'IN PROGRESS · IN PROGRESS · ';
  }

  protected markFailed(id: string): void {
    this.failed.update((s) => new Set(s).add(id));
  }

  protected scrollToCard(id: string): void {
    this.motion.scrollTo(`#edu-${id}`);
  }
}

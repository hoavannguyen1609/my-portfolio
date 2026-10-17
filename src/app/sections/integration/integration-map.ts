import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { LucideArrowLeftRight, LucideArrowRight, LucideCircleCheck } from '@lucide/angular';
import { gsap } from 'gsap';
import { INTEGRATION_HEAD, INTEGRATIONS, KIND_LABEL } from '../../core/data/integration.data';
import { I18nService } from '../../core/i18n.service';
import { MotionService } from '../../core/motion.service';
import { Integration } from '../../core/models';

interface MapNode {
  item: Integration;
  x: number;
  y: number;
  path: string;
}

const HUBS = { eDLM: { x: 240, y: 230 }, THADS: { x: 520, y: 230 } } as const;

/**
 * Bản đồ tích hợp: hai cụm quanh eDLM và THADS, bản tin chạy theo chiều dữ liệu thật của từng mối nối.
 * Chọn một hệ thống để xem giao thức và các bảo đảm dữ liệu.
 */
@Component({
  selector: 'app-integration-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideCircleCheck, LucideArrowRight, LucideArrowLeftRight],
  template: `
    <div class="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start">
      <!-- Màn rộng: sơ đồ SVG; màn hẹp: dãy nút chọn -->
      <div class="min-w-0 rounded-[2rem] border border-line bg-surface/50 p-4 sm:p-6">
        <div class="mb-3 flex items-center justify-between gap-3">
          <p class="eyebrow">{{ i18n.t(head.mapTitle) }}</p>
          <p class="font-mono text-[11px] text-muted">{{ i18n.t(head.mapHint) }}</p>
        </div>

        <svg viewBox="0 0 760 460" class="hidden h-auto w-full md:block" role="group" [attr.aria-label]="i18n.t(head.mapTitle)">
          <defs>
            <radialGradient id="hub-glow"><stop offset="0" stop-color="var(--seal)" stop-opacity=".35" /><stop offset="1" stop-color="var(--seal)" stop-opacity="0" /></radialGradient>
          </defs>
          @for (hub of hubs; track hub.name) {
            <circle [attr.cx]="hub.x" [attr.cy]="hub.y" r="120" fill="url(#hub-glow)" />
            <circle [attr.cx]="hub.x" [attr.cy]="hub.y" r="170" fill="none" class="stroke-line" stroke-dasharray="3 6" />
          }
          @for (n of nodes; track n.item.id) {
            <path [attr.d]="n.path" fill="none" stroke-width="1.6"
                  [class]="selected().id === n.item.id ? 'stroke-seal' : 'stroke-muted/40'" />
            @if (!motion.reduced()) {
              @if (n.item.direction !== 'in') {
                <circle r="4" class="fill-jade"><animateMotion [attr.dur]="dur(n, 0)" repeatCount="indefinite" [attr.path]="n.path" /></circle>
              }
              @if (n.item.direction !== 'out') {
                <circle r="4" class="fill-seal"><animateMotion [attr.dur]="dur(n, 1)" repeatCount="indefinite" [attr.path]="n.path" keyPoints="1;0" keyTimes="0;1" calcMode="linear" /></circle>
              }
            }
          }
          @for (hub of hubs; track hub.name) {
            <g>
              <circle [attr.cx]="hub.x" [attr.cy]="hub.y" r="46" class="fill-fg" />
              <text [attr.x]="hub.x" [attr.y]="hub.y + 5" text-anchor="middle" class="fill-bg font-display text-[16px] font-extrabold">{{ hub.name }}</text>
            </g>
          }
          @for (n of nodes; track n.item.id) {
            <g
              role="button"
              tabindex="0"
              class="cursor-pointer outline-none"
              [attr.aria-pressed]="selected().id === n.item.id"
              [attr.aria-label]="i18n.t(n.item.name)"
              (click)="select(n.item)"
              (keydown.enter)="select(n.item)"
              (keydown.space)="select(n.item); $event.preventDefault()"
            >
              <rect [attr.x]="n.x - 62" [attr.y]="n.y - 20" width="124" height="40" rx="20" stroke-width="1.5"
                    [class]="selected().id === n.item.id ? 'fill-seal stroke-seal' : 'fill-surface stroke-line hover:stroke-fg'" />
              <text [attr.x]="n.x" [attr.y]="n.y + 5" text-anchor="middle" class="pointer-events-none font-mono text-[12px] font-bold"
                    [class]="selected().id === n.item.id ? 'fill-white' : 'fill-fg'">{{ i18n.t(n.item.short) }}</text>
            </g>
          }
        </svg>

        <div class="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:hidden" role="tablist">
          @for (item of items; track item.id) {
            <button type="button" role="tab" (click)="select(item)" [attr.aria-selected]="selected().id === item.id"
                    class="shrink-0 rounded-full border px-3.5 py-2 font-mono text-xs font-bold"
                    [class]="selected().id === item.id ? 'border-seal bg-seal text-white' : 'border-line text-fg'">
              {{ i18n.t(item.short) }}
            </button>
          }
        </div>
      </div>

      <article #panel class="min-w-0 rounded-[2rem] border border-line bg-surface p-6 sm:p-8 lg:sticky lg:top-28" aria-live="polite">
        <div data-swap class="flex flex-wrap items-center gap-2">
          <span class="chip border-seal/50 bg-seal/10 text-seal">{{ i18n.t(kindLabel[selected().kind]) }}</span>
          <span class="chip">
            {{ selected().hub }}
            @if (selected().direction === 'both') { <svg lucideArrowLeftRight [size]="12"></svg> } @else { <svg lucideArrowRight [size]="12" [class.rotate-180]="selected().direction === 'in'"></svg> }
            {{ i18n.t(selected().short) }}
          </span>
        </div>
        <h3 data-swap class="mt-5 font-display text-[clamp(1.6rem,3vw,2.3rem)] font-bold leading-tight">{{ i18n.t(selected().name) }}</h3>
        <p data-swap class="mt-3 leading-relaxed text-muted">{{ i18n.t(selected().summary) }}</p>
        <p data-swap class="mt-5 font-mono text-xs uppercase tracking-wider text-muted">{{ i18n.t(head.protocolTitle) }}</p>
        <p data-swap class="mt-1 font-mono text-sm text-jade">{{ i18n.t(selected().protocol) }}</p>
        <p data-swap class="mt-6 font-mono text-xs uppercase tracking-wider text-muted">{{ i18n.t(head.guaranteesTitle) }}</p>
        <ul class="mt-3 grid gap-3">
          @for (g of selected().guarantees; track $index) {
            <li data-swap class="flex gap-3 text-[15px] leading-relaxed">
              <svg lucideCircleCheck [size]="18" class="mt-0.5 shrink-0 text-jade"></svg><span>{{ i18n.t(g) }}</span>
            </li>
          }
        </ul>
      </article>
    </div>
  `,
})
export class IntegrationMap {
  protected readonly head = INTEGRATION_HEAD;
  protected readonly kindLabel = KIND_LABEL;
  protected readonly items = INTEGRATIONS;
  protected readonly i18n = inject(I18nService);
  protected readonly motion = inject(MotionService);
  protected readonly selected = signal<Integration>(INTEGRATIONS[0]);
  protected readonly hubs = Object.entries(HUBS).map(([name, p]) => ({ name, ...p }));
  protected readonly nodes: MapNode[] = this.layout();
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  private readonly selectedId = computed(() => this.selected().id);

  constructor() {
    // Đổi hệ thống: nội dung panel trồi lên lần lượt
    let first = true;
    effect(() => {
      this.selectedId();
      if (first) {
        first = false;
        return;
      }
      untracked(() => {
        if (this.motion.reduced()) return;
        requestAnimationFrame(() => {
          gsap.fromTo(
            this.panel().nativeElement.querySelectorAll('[data-swap]'),
            { y: 18, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.035, ease: 'power3.out', overwrite: true },
          );
        });
      });
    });
  }

  protected select(item: Integration): void {
    this.selected.set(item);
  }

  /** Bản tin chạy nhanh chậm khác nhau cho đỡ đều tăm tắp. */
  protected dur(n: MapNode, lane: number): string {
    return `${2.2 + ((n.x + n.y + lane * 97) % 13) / 10}s`;
  }

  /** Xếp nút của mỗi cụm trên cung tròn bán kính 170 quanh hub, nối bằng đường cong. */
  private layout(): MapNode[] {
    const result: MapNode[] = [];
    (['eDLM', 'THADS'] as const).forEach((hubName) => {
      const hub = HUBS[hubName];
      const group = INTEGRATIONS.filter((i) => i.hub === hubName);
      const angles = hubName === 'eDLM' ? [120, 160, 200, 240] : [60, 20, -20, -60];
      group.forEach((item, i) => {
        const a = (angles[i % angles.length] * Math.PI) / 180;
        const x = Math.round(hub.x + Math.cos(a) * 170);
        const y = Math.round(hub.y - Math.sin(a) * 170);
        const cx = (hub.x + x) / 2 + (y - hub.y) * 0.18;
        const cy = (hub.y + y) / 2 - (x - hub.x) * 0.18;
        result.push({ item, x, y, path: `M${hub.x} ${hub.y} Q${Math.round(cx)} ${Math.round(cy)} ${x} ${y}` });
      });
    });
    return result;
  }
}

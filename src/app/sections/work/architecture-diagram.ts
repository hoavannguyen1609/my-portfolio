import { ChangeDetectionStrategy, Component, ElementRef, inject, viewChild } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { I18nService } from '../../core/i18n.service';

interface DiagramNode {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  title: string | { vi: string; en: string };
  sub?: string | { vi: string; en: string };
  kind: 'core' | 'bus' | 'ext' | 'box' | 'store';
}

/** Sơ đồ kiến trúc eDLM; Work điều khiển hiệu ứng vẽ cạnh và bản tin chạy qua build(). */
@Component({
  selector: 'app-architecture-diagram',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="overflow-x-auto" data-lenis-prevent-wheel>
      <svg #svg viewBox="0 0 920 340" class="block h-auto w-full min-w-[720px]" role="img" [attr.aria-label]="i18n.t({ vi: 'Sơ đồ kiến trúc eDLM', en: 'eDLM architecture diagram' })">
        <g fill="none" stroke-width="1.4" class="stroke-muted">
          @for (e of edges; track e.id) {
            <path [attr.id]="e.id" [attr.d]="e.d" class="d-edge" [class.stroke-jade]="e.flow" [attr.stroke-dasharray]="e.flow ? null : '4 5'" />
          }
        </g>
        @for (n of nodes; track n.id) {
          <g class="d-node" [attr.data-id]="n.id">
            <rect
              [attr.x]="n.x" [attr.y]="n.y" [attr.width]="n.w" [attr.height]="n.h"
              [attr.rx]="n.kind === 'bus' ? n.h / 2 : 12"
              [class]="nodeClass(n)"
              stroke-width="1.4"
            />
            <text [attr.x]="n.x + n.w / 2" [attr.y]="n.y + (n.sub ? n.h / 2 - 3 : n.h / 2 + 4)" text-anchor="middle"
                  class="font-sans text-[13px] font-semibold" [class]="n.kind === 'core' ? 'fill-bg' : 'fill-fg'">{{ i18n.t(n.title) }}</text>
            @if (n.sub) {
              <text [attr.x]="n.x + n.w / 2" [attr.y]="n.y + n.h / 2 + 14" text-anchor="middle"
                    class="font-mono text-[10.5px]" [class]="n.kind === 'core' ? 'fill-bg/70' : 'fill-muted'">{{ i18n.t(n.sub) }}</text>
            }
          </g>
        }
        <circle class="d-dot fill-seal" r="5" cx="0" cy="0" opacity="0" />
        <circle class="d-dot fill-jade" r="5" cx="0" cy="0" opacity="0" />
      </svg>
    </div>
  `,
})
export class ArchitectureDiagram {
  protected readonly i18n = inject(I18nService);
  private readonly svg = viewChild.required<ElementRef<SVGSVGElement>>('svg');

  protected readonly nodes: DiagramNode[] = [
    { id: 'gw', x: 16, y: 150, w: 130, h: 60, title: 'Gateway', sub: 'Angular FE', kind: 'box' },
    { id: 'core', x: 196, y: 150, w: 176, h: 60, title: 'eDLM · eclm', sub: 'Spring Boot', kind: 'core' },
    { id: 'kafka', x: 430, y: 150, w: 124, h: 60, title: 'Kafka', sub: 'command / event', kind: 'bus' },
    { id: 'sub', x: 612, y: 55, w: 160, h: 60, title: 'eclm-sub', sub: 'outbox · saga', kind: 'box' },
    { id: 'vdxp', x: 612, y: 245, w: 160, h: 60, title: 'vdxp', sub: { vi: 'edXML · trạng thái', en: 'edXML · status' }, kind: 'box' },
    { id: 'etask', x: 808, y: 55, w: 100, h: 60, title: 'eTask', sub: { vi: 'dự án · việc', en: 'projects' }, kind: 'ext' },
    { id: 'axis', x: 808, y: 245, w: 100, h: 60, title: { vi: 'Trục QG', en: 'Gov axis' }, sub: { vi: 'liên thông', en: 'exchange' }, kind: 'ext' },
    { id: 'db', x: 190, y: 276, w: 86, h: 42, title: 'MySQL', kind: 'store' },
    { id: 'es', x: 284, y: 276, w: 100, h: 42, title: 'Elastic', kind: 'store' },
    { id: 'ai', x: 190, y: 42, w: 86, h: 42, title: 'AI OCR', kind: 'store' },
    { id: 'sign', x: 284, y: 42, w: 100, h: 42, title: { vi: 'Ký số · dấu', en: 'Sign · stamp' }, kind: 'store' },
  ];

  protected readonly edges = [
    { id: 'e-gw', d: 'M146 180 H196', flow: true },
    { id: 'e-core-kafka', d: 'M372 180 H430', flow: true },
    { id: 'e-kafka-sub', d: 'M554 170 C584 170 582 85 612 85', flow: true },
    { id: 'e-kafka-vdxp', d: 'M554 190 C584 190 582 275 612 275', flow: true },
    { id: 'e-sub-etask', d: 'M772 85 H808', flow: true },
    { id: 'e-vdxp-axis', d: 'M772 275 H808', flow: true },
    { id: 'e-core-db', d: 'M233 210 V276', flow: false },
    { id: 'e-core-es', d: 'M334 210 V276', flow: false },
    { id: 'e-core-ai', d: 'M233 84 V150', flow: false },
    { id: 'e-core-sign', d: 'M334 84 V150', flow: false },
  ];

  protected nodeClass(n: DiagramNode): string {
    switch (n.kind) {
      case 'core': return 'fill-fg stroke-fg';
      case 'bus': return 'fill-jade/10 stroke-jade';
      case 'ext': return 'fill-seal/10 stroke-seal';
      case 'store': return 'fill-surface-2 stroke-line';
      default: return 'fill-surface stroke-line';
    }
  }

  /** Vẽ sơ đồ khi trigger chạm, sau đó cho hai bản tin chạy lặp theo hai nhánh. */
  build(scrollTrigger: ScrollTrigger.Vars): gsap.core.Timeline {
    const root = this.svg().nativeElement;
    const q = gsap.utils.selector(root);
    const dots = q('.d-dot');
    const routes = [
      ['e-gw', 'e-core-kafka', 'e-kafka-sub', 'e-sub-etask'],
      ['e-gw', 'e-core-kafka', 'e-kafka-vdxp', 'e-vdxp-axis'],
    ];

    const packets = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.3 });
    routes.forEach((route, r) => {
      let t = r * 1.3;
      packets.set(dots[r], { autoAlpha: 1 }, t);
      for (const id of route) {
        const path = root.querySelector<SVGPathElement>(`#${id}`)!;
        packets.to(dots[r], { motionPath: { path, align: path, alignOrigin: [0.5, 0.5] }, duration: 0.5, ease: 'none' }, t);
        t += 0.5;
      }
      packets.set(dots[r], { autoAlpha: 0 }, t);
      packets.fromTo(q(`[data-id="${r === 0 ? 'etask' : 'axis'}"] rect`), { scale: 1 }, { scale: 1.08, transformOrigin: '50% 50%', yoyo: true, repeat: 1, duration: 0.15 }, t);
    });

    return gsap
      .timeline({ scrollTrigger, defaults: { ease: 'power3.out' } })
      .from(q('.d-node'), { autoAlpha: 0, scale: 0.7, transformOrigin: '50% 50%', duration: 0.5, stagger: 0.05 })
      .from(q('.d-edge'), { drawSVG: '0%', duration: 0.7, stagger: 0.05 }, '-=0.35')
      .call(() => { packets.play(); });
  }
}

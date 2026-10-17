import { Injectable, inject } from '@angular/core';
import { APP_ENV } from '../config/app-env';

type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[][] };

declare global {
  interface Window {
    clarity?: ClarityFn;
  }
}

/**
 * Microsoft Clarity: heatmap, bản ghi phiên, phát hiện rage click / dead click.
 * Chỉ nạp script sau khi người xem đồng ý; ô nhập liệu được Clarity che mặc định.
 */
@Injectable({ providedIn: 'root' })
export class ClarityService {
  private readonly env = inject(APP_ENV);
  private loaded = false;

  get enabled(): boolean {
    return !!this.env.clarityProjectId;
  }

  start(tags: Record<string, string>): void {
    if (!this.enabled || this.loaded) return;
    this.loaded = true;
    const queue: ClarityFn = Object.assign((...args: unknown[]) => (queue.q ??= []).push(args), { q: [] as unknown[][] });
    window.clarity ??= queue;
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.clarity.ms/tag/${encodeURIComponent(this.env.clarityProjectId)}`;
    document.head.appendChild(s);
    window.clarity('consent');
    Object.entries({ env: this.env.envName, ...tags }).forEach(([k, v]) => window.clarity?.('set', k, v));
  }

  /** Gắn nhãn sự kiện để lọc bản ghi phiên (ví dụ: đã gửi lời nhắn). */
  event(name: string): void {
    if (this.loaded) window.clarity?.('event', name);
  }
}

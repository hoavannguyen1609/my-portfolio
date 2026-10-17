import { Injectable, inject } from '@angular/core';
import type { FirebasePerformance, PerformanceTrace } from 'firebase/performance';
import { APP_ENV } from '../config/app-env';
import { FirebaseService } from './firebase.service';

/**
 * Firebase Performance Monitoring: tự đo thời gian tải trang, request mạng;
 * thêm trace tuỳ biến cho các mốc trải nghiệm (preloader xong, cảnh 3D sẵn sàng).
 */
@Injectable({ providedIn: 'root' })
export class PerformanceService {
  private readonly env = inject(APP_ENV);
  private readonly firebase = inject(FirebaseService);
  private perf: FirebasePerformance | null = null;
  private traceFn?: typeof import('firebase/performance').trace;
  private starting?: Promise<void>;
  /** Mốc đã ghi trước khi SDK sẵn sàng, gửi bù khi khởi tạo xong */
  private pending: { name: string; ms: number }[] = [];

  get enabled(): boolean {
    return this.env.features.performance && this.firebase.configured;
  }

  start(): Promise<void> {
    if (!this.enabled) return Promise.resolve();
    this.starting ??= (async () => {
      const app = await this.firebase.app();
      if (!app) return;
      const mod = await import('firebase/performance');
      this.perf = mod.getPerformance(app);
      this.traceFn = mod.trace;
      this.pending.splice(0).forEach((p) => this.record(p.name, p.ms));
    })();
    return this.starting;
  }

  /** Ghi một mốc tính từ lúc điều hướng (performance.now()). */
  mark(name: string): void {
    const ms = Math.round(performance.now());
    if (!this.perf) {
      if (this.pending.length < 20) this.pending.push({ name, ms });
      return;
    }
    this.record(name, ms);
  }

  private record(name: string, ms: number): void {
    if (!this.perf || !this.traceFn) return;
    const t: PerformanceTrace = this.traceFn(this.perf, name);
    t.record(performance.timeOrigin, Math.max(1, ms));
  }
}

import { Injectable, inject } from '@angular/core';
import type { Analytics } from 'firebase/analytics';
import type { Metric } from 'web-vitals';
import { APP_ENV } from '../config/app-env';
import { FirebaseService } from './firebase.service';

type Params = Record<string, string | number | boolean>;

/**
 * Firebase Analytics + Core Web Vitals. Chỉ khởi tạo sau khi người xem đồng ý;
 * trước đó track() bỏ qua sự kiện, không lưu hàng đợi.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly env = inject(APP_ENV);
  private readonly firebase = inject(FirebaseService);
  private analytics: Analytics | null = null;
  private logEvent?: typeof import('firebase/analytics').logEvent;
  private starting?: Promise<void>;
  private seenSections = new Set<string>();

  get enabled(): boolean {
    return this.env.features.analytics && !!this.env.firebase?.measurementId;
  }

  start(context: Params): Promise<void> {
    if (!this.enabled) return Promise.resolve();
    this.starting ??= this.init(context);
    return this.starting;
  }

  /** Tắt thu thập khi người xem rút lại đồng ý. */
  async stop(): Promise<void> {
    if (!this.analytics) return;
    const { setAnalyticsCollectionEnabled } = await import('firebase/analytics');
    setAnalyticsCollectionEnabled(this.analytics, false);
  }

  track(name: string, params: Params = {}): void {
    if (!this.analytics || !this.logEvent) return;
    this.logEvent(this.analytics, name, { env_name: this.env.envName, ...params });
  }

  /** Mỗi mục chỉ ghi một lần mỗi lượt xem để đo độ sâu cuộn. */
  trackSection(id: string): void {
    if (this.seenSections.has(id) || !this.analytics) return;
    this.seenSections.add(id);
    this.track('section_view', { section_id: id });
  }

  private async init(context: Params): Promise<void> {
    const app = await this.firebase.app();
    if (!app) return;
    const mod = await import('firebase/analytics');
    if (!(await mod.isSupported())) return;
    mod.setConsent({ analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    this.analytics = mod.getAnalytics(app);
    this.logEvent = mod.logEvent;
    mod.setAnalyticsCollectionEnabled(this.analytics, true);
    mod.setUserProperties(this.analytics, context);
    this.track('page_view', { page_location: location.href, page_title: document.title });
    await this.reportWebVitals();
  }

  /** LCP, INP, CLS, FCP, TTFB gửi thành sự kiện web_vital (giá trị CLS nhân 1000 cho ra số nguyên). */
  private async reportWebVitals(): Promise<void> {
    const { onCLS, onFCP, onINP, onLCP, onTTFB } = await import('web-vitals');
    const send = (m: Metric) =>
      this.track('web_vital', {
        metric_name: m.name,
        metric_value: Math.round(m.name === 'CLS' ? m.value * 1000 : m.value),
        metric_rating: m.rating,
        metric_id: m.id,
        navigation_type: m.navigationType,
      });
    onCLS(send);
    onFCP(send);
    onINP(send);
    onLCP(send);
    onTTFB(send);
  }
}

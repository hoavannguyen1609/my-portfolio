import { Injectable, computed, inject, signal } from '@angular/core';
import { APP_ENV } from '../config/app-env';

export type ConsentState = 'granted' | 'denied' | null;

const STORAGE_KEY = 'nvh-consent';

function readConsent(): ConsentState {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

/**
 * Đồng ý theo dõi của người xem. Analytics, Performance và Clarity chỉ chạy khi "granted";
 * chưa chọn thì không gửi gì.
 */
@Injectable({ providedIn: 'root' })
export class ConsentService {
  private readonly env = inject(APP_ENV);
  readonly state = signal<ConsentState>(readConsent());
  readonly granted = computed(() => this.state() === 'granted');

  /** Có công cụ theo dõi nào được cấu hình thì mới cần hỏi. */
  readonly needed = computed(() => {
    const fb = this.env.firebase;
    const analytics = !!fb?.measurementId && this.env.features.analytics;
    const performance = !!fb && this.env.features.performance;
    return analytics || performance || !!this.env.clarityProjectId;
  });

  set(state: Exclude<ConsentState, null>): void {
    this.state.set(state);
    try {
      localStorage.setItem(STORAGE_KEY, state);
    } catch {
      // bỏ qua
    }
  }

  /** Hỏi lại từ đầu (lệnh "Quyền riêng tư" trong bảng lệnh). */
  reset(): void {
    this.state.set(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // bỏ qua
    }
  }
}

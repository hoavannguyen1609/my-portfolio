import { Injectable, inject, signal } from '@angular/core';
import { APP_ENV } from '../config/app-env';
import { FirebaseService } from './firebase.service';

/** Cờ tính năng điều khiển từ Firebase Remote Config (mặc định bật hết). */
export const FLAG_DEFAULTS = {
  hero_3d: true,
  custom_cursor: true,
  contact_form: true,
} as const;

export type FlagName = keyof typeof FLAG_DEFAULTS;

/**
 * Remote Config cho bật/tắt hiệu ứng nặng hoặc thử A/B mà không phải build lại.
 * Giá trị mặc định dùng ngay; giá trị từ server cập nhật vào signal khi tải xong.
 */
@Injectable({ providedIn: 'root' })
export class RemoteConfigService {
  private readonly env = inject(APP_ENV);
  private readonly firebase = inject(FirebaseService);
  private readonly flags = Object.fromEntries(
    (Object.keys(FLAG_DEFAULTS) as FlagName[]).map((k) => [k, signal<boolean>(FLAG_DEFAULTS[k])]),
  ) as Record<FlagName, ReturnType<typeof signal<boolean>>>;
  private started = false;

  flag(name: FlagName) {
    return this.flags[name].asReadonly();
  }

  async start(): Promise<void> {
    if (this.started || !this.env.features.remoteConfig) return;
    this.started = true;
    const app = await this.firebase.app();
    if (!app) return;
    try {
      const mod = await import('firebase/remote-config');
      const rc = mod.getRemoteConfig(app);
      // Dev lấy cấu hình mới mỗi phút, production mỗi giờ
      rc.settings.minimumFetchIntervalMillis = this.env.envName === 'production' ? 3_600_000 : 60_000;
      rc.defaultConfig = { ...FLAG_DEFAULTS };
      await mod.fetchAndActivate(rc);
      (Object.keys(FLAG_DEFAULTS) as FlagName[]).forEach((k) => this.flags[k].set(mod.getBoolean(rc, k)));
    } catch (err) {
      console.warn('[remote-config] dùng giá trị mặc định', err);
    }
  }
}

import { Injectable, inject } from '@angular/core';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import { APP_ENV } from '../config/app-env';

declare global {
  // Token debug của App Check khi chạy local (in ra console, đăng ký trong Firebase Console)
  // eslint-disable-next-line no-var
  var FIREBASE_APPCHECK_DEBUG_TOKEN: boolean | string | undefined;
}

/**
 * Khởi tạo Firebase lười: SDK chỉ tải (dynamic import, chunk riêng) khi có tính năng cần dùng.
 * Chưa khai cấu hình thì mọi hàm trả null và trang vẫn chạy bình thường.
 */
@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private readonly env = inject(APP_ENV);
  private appPromise?: Promise<FirebaseApp | null>;
  private firestorePromise?: Promise<Firestore | null>;

  get configured(): boolean {
    return !!this.env.firebase;
  }

  app(): Promise<FirebaseApp | null> {
    this.appPromise ??= this.initApp();
    return this.appPromise;
  }

  firestore(): Promise<Firestore | null> {
    this.firestorePromise ??= this.app().then(async (app) => {
      if (!app) return null;
      const { getFirestore } = await import('firebase/firestore');
      return getFirestore(app);
    });
    return this.firestorePromise;
  }

  private async initApp(): Promise<FirebaseApp | null> {
    const config = this.env.firebase;
    if (!config) return null;
    try {
      const { initializeApp } = await import('firebase/app');
      const app = initializeApp(config);
      await this.initAppCheck(app);
      return app;
    } catch (err) {
      console.warn('[firebase] khởi tạo thất bại, tắt các tính năng Firebase', err);
      return null;
    }
  }

  /** App Check phải chạy trước Firestore để mọi request mang token chống bot. */
  private async initAppCheck(app: FirebaseApp): Promise<void> {
    const siteKey = this.env.recaptchaSiteKey;
    if (!siteKey) return;
    if (this.env.envName !== 'production') globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    const { initializeAppCheck, ReCaptchaV3Provider } = await import('firebase/app-check');
    initializeAppCheck(app, { provider: new ReCaptchaV3Provider(siteKey), isTokenAutoRefreshEnabled: true });
  }
}

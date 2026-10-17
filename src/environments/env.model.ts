/** Cấu hình Firebase Web SDK (khớp FirebaseOptions, khai lại để không kéo SDK vào bundle chính). */
export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export interface AppFeatures {
  analytics: boolean;
  performance: boolean;
  remoteConfig: boolean;
  contactForm: boolean;
}

/** Cấu hình runtime sinh từ biến môi trường bởi scripts/set-env.mjs. */
export interface AppEnv {
  envName: 'development' | 'staging' | 'production';
  /** null khi chưa khai Firebase: mọi tính năng Firebase tự tắt */
  firebase: FirebaseWebConfig | null;
  recaptchaSiteKey: string;
  clarityProjectId: string;
  features: AppFeatures;
  /** Thời điểm sinh file, giúp kiểm tra bản build đang chạy */
  generatedAt: string;
}

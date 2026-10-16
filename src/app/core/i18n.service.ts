import { Injectable, effect, signal } from '@angular/core';
import { Lang, Txt } from './models';

const STORAGE_KEY = 'nvh-lang';

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'vi' || saved === 'en') return saved;
  } catch {
    // Trình duyệt chặn storage: dùng mặc định
  }
  return 'vi';
}

/** Ngôn ngữ hiển thị (vi/en), đọc bằng t() trong template để tự cập nhật theo signal. */
@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly lang = signal<Lang>(initialLang());

  constructor() {
    effect(() => {
      const lang = this.lang();
      document.documentElement.lang = lang;
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // bỏ qua
      }
    });
  }

  t(value: Txt): string {
    return typeof value === 'string' ? value : value[this.lang()];
  }

  toggle(): void {
    this.lang.update((l) => (l === 'vi' ? 'en' : 'vi'));
  }

  formatNumber(value: number): string {
    return value.toLocaleString(this.lang() === 'vi' ? 'vi-VN' : 'en-US');
  }
}

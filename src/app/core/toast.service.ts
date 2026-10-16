import { Injectable, signal } from '@angular/core';

/** Thông báo ngắn ở góc màn hình (ví dụ: đã sao chép). */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly message = signal<string | null>(null);
  private timer?: ReturnType<typeof setTimeout>;

  show(message: string, duration = 1800): void {
    clearTimeout(this.timer);
    this.message.set(message);
    this.timer = setTimeout(() => this.message.set(null), duration);
  }
}

/** Chép vào clipboard; trình duyệt chặn thì chọn sẵn văn bản bằng textarea tạm. */
export async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = value;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}

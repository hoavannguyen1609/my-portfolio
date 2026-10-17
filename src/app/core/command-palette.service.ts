import { Injectable, signal } from '@angular/core';

/** Trạng thái mở/đóng bảng lệnh, dùng chung giữa header và bảng lệnh. */
@Injectable({ providedIn: 'root' })
export class CommandPaletteService {
  readonly open = signal(false);

  toggle(): void {
    this.open.update((v) => !v);
  }
}

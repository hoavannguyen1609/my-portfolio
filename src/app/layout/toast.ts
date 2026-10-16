import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LucideCheck } from '@lucide/angular';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'app-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideCheck],
  template: `
    @if (toast.message(); as msg) {
      <div
        role="status"
        animate.enter="toast-in"
        animate.leave="toast-out"
        class="glass fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 z-[80] flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium shadow-2xl"
      >
        <svg lucideCheck [size]="16" class="text-jade"></svg>{{ msg }}
      </div>
    }
  `,
})
export class Toast {
  protected readonly toast = inject(ToastService);
}

import { Injectable, signal } from '@angular/core';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'nvh-theme';

/** Theme sáng/tối; đổi theme bằng View Transitions với vòng tròn lan từ điểm bấm. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>(document.documentElement.dataset['theme'] === 'light' ? 'light' : 'dark');

  toggle(event?: MouseEvent): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!('startViewTransition' in document) || reduced) {
      this.apply(next);
      return;
    }

    const x = event?.clientX ?? innerWidth / 2;
    const y = event?.clientY ?? 0;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const transition = document.startViewTransition(() => this.apply(next));
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 700, easing: 'cubic-bezier(.65,0,.25,1)', pseudoElement: '::view-transition-new(root)' },
      );
    });
  }

  private apply(theme: Theme): void {
    this.theme.set(theme);
    document.documentElement.dataset['theme'] = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#070b14' : '#f2f4f8');
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // bỏ qua
    }
  }
}

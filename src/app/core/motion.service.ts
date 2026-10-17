import { Injectable, signal } from '@angular/core';
import { gsap } from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { Flip } from 'gsap/Flip';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

// Đăng ký plugin ngay khi module được nạp, trước mọi directive dùng tới
gsap.registerPlugin(ScrollTrigger, SplitText, Flip, DrawSVGPlugin, MotionPathPlugin, ScrambleTextPlugin);
export const HEADER_OFFSET = -88;

/** Điều phối chuyển động: cuộn mượt Lenis đồng bộ với ScrollTrigger, cờ giảm chuyển động, mốc intro. */
@Injectable({ providedIn: 'root' })
export class MotionService {
  readonly reduced = signal(matchMedia('(prefers-reduced-motion: reduce)').matches);
  /** Bật sau khi preloader kết thúc; hero chờ cờ này mới chạy intro. */
  readonly introDone = signal(false);

  private lenis?: Lenis;
  private refreshTimer?: ReturnType<typeof setTimeout>;

  init(): void {
    // Thanh địa chỉ mobile co giãn không làm tính lại toàn bộ trigger (giật khi cuộn)
    ScrollTrigger.config({ ignoreMobileResize: true });
    if (this.reduced()) return;

    this.lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, anchors: { offset: HEADER_OFFSET } });
    this.lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => this.lenis?.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  scrollTo(target: string | number): void {
    if (this.lenis) {
      this.lenis.scrollTo(target, { offset: HEADER_OFFSET, duration: 1.4 });
      return;
    }
    if (typeof target === 'number') {
      window.scrollTo({ top: target });
    } else {
      document.querySelector(target)?.scrollIntoView();
    }
  }

  lock(locked: boolean): void {
    if (locked) {
      this.lenis?.stop();
    } else {
      this.lenis?.start();
    }
  }

  /** Gom nhiều lần gọi thành một lần refresh; sort để trigger nằm sau phần pin tính đúng vị trí. */
  refresh(delay = 60): void {
    clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    }, delay);
  }
}

import { Injectable, inject } from '@angular/core';
import { APP_ENV } from '../config/app-env';
import { Lang } from '../models';
import { FirebaseService } from './firebase.service';

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

export type SendResult = 'sent' | 'too-soon' | 'invalid' | 'unavailable' | 'error';

const LAST_SENT_KEY = 'nvh-last-message';
const COOLDOWN_MS = 60_000;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Lưu lời nhắn từ form liên hệ vào Firestore (collection "messages").
 * Kiểm tra ở client chỉ để báo lỗi sớm; chốt thật nằm ở firestore.rules và App Check.
 */
@Injectable({ providedIn: 'root' })
export class ContactMessageService {
  private readonly env = inject(APP_ENV);
  private readonly firebase = inject(FirebaseService);

  get available(): boolean {
    return this.env.features.contactForm && this.firebase.configured;
  }

  validate(m: ContactMessage): boolean {
    return (
      m.name.trim().length > 0 && m.name.length <= 80 &&
      EMAIL.test(m.email) && m.email.length <= 120 &&
      m.message.trim().length >= 10 && m.message.length <= 2000
    );
  }

  async send(m: ContactMessage, lang: Lang): Promise<SendResult> {
    if (!this.available) return 'unavailable';
    if (!this.validate(m)) return 'invalid';
    if (Date.now() - this.lastSent() < COOLDOWN_MS) return 'too-soon';
    try {
      const db = await this.firebase.firestore();
      if (!db) return 'unavailable';
      const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
      await addDoc(collection(db, 'messages'), {
        name: m.name.trim(),
        email: m.email.trim(),
        message: m.message.trim(),
        lang,
        page: location.pathname,
        createdAt: serverTimestamp(),
      });
      try {
        localStorage.setItem(LAST_SENT_KEY, String(Date.now()));
      } catch {
        // bỏ qua
      }
      return 'sent';
    } catch (err) {
      console.warn('[contact] gửi lời nhắn thất bại', err);
      return 'error';
    }
  }

  private lastSent(): number {
    try {
      return Number(localStorage.getItem(LAST_SENT_KEY) ?? 0);
    } catch {
      return 0;
    }
  }
}

import { InjectionToken } from '@angular/core';
import { GENERATED_ENV } from '../../../environments/env.generated';
import type { AppEnv } from '../../../environments/env.model';

/** Cấu hình môi trường; test có thể provide giá trị khác thay cho file sinh tự động. */
export const APP_ENV = new InjectionToken<AppEnv>('APP_ENV', { providedIn: 'root', factory: () => GENERATED_ENV });

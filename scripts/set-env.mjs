// Sinh src/environments/env.generated.ts từ biến môi trường.
// Thứ tự ưu tiên: biến môi trường hệ thống (CI/GitHub Actions) > file .env > mặc định.
//   node scripts/set-env.mjs            # cảnh báo nếu cấu hình Firebase thiếu một phần
//   node scripts/set-env.mjs --strict   # thoát lỗi nếu cấu hình thiếu một phần (dùng trong CI)
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const strict = process.argv.includes('--strict');
const out = join('src', 'environments', 'env.generated.ts');

// process.loadEnvFile không ghi đè biến đã có, nên CI luôn thắng .env
if (existsSync('.env')) process.loadEnvFile('.env');

const env = (name, fallback = '') => (process.env[name] ?? fallback).trim();
const flag = (name, fallback = true) => {
  const v = env(name, String(fallback)).toLowerCase();
  return v === 'true' || v === '1' || v === 'yes';
};

const ENV_NAMES = ['development', 'staging', 'production'];
// --env-name ghi đè NG_APP_ENV_NAME (bản deploy dùng production dù .env để development)
const envNameArg = process.argv.indexOf('--env-name');
const envName = envNameArg > 0 && process.argv[envNameArg + 1] ? process.argv[envNameArg + 1] : env('NG_APP_ENV_NAME', 'development');
if (!ENV_NAMES.includes(envName)) {
  console.error(`NG_APP_ENV_NAME="${envName}" không hợp lệ, chọn một trong: ${ENV_NAMES.join(', ')}`);
  process.exit(1);
}

const firebaseKeys = {
  apiKey: 'NG_APP_FIREBASE_API_KEY',
  authDomain: 'NG_APP_FIREBASE_AUTH_DOMAIN',
  projectId: 'NG_APP_FIREBASE_PROJECT_ID',
  storageBucket: 'NG_APP_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'NG_APP_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'NG_APP_FIREBASE_APP_ID',
};
const firebaseValues = Object.fromEntries(Object.entries(firebaseKeys).map(([k, name]) => [k, env(name)]));
const missing = Object.entries(firebaseKeys).filter(([k]) => !firebaseValues[k]).map(([, name]) => name);
const anyFirebase = Object.values(firebaseValues).some(Boolean);

const problems = [];
if (anyFirebase && missing.length) problems.push(`Firebase khai thiếu: ${missing.join(', ')}`);

const measurementId = env('NG_APP_FIREBASE_MEASUREMENT_ID');
const features = {
  analytics: flag('NG_APP_ENABLE_ANALYTICS'),
  performance: flag('NG_APP_ENABLE_PERFORMANCE'),
  remoteConfig: flag('NG_APP_ENABLE_REMOTE_CONFIG'),
  contactForm: flag('NG_APP_ENABLE_CONTACT_FORM'),
};
if (features.analytics && anyFirebase && !measurementId) {
  problems.push('Bật Analytics nhưng thiếu NG_APP_FIREBASE_MEASUREMENT_ID');
}
if (measurementId && !/^G-[A-Z0-9]+$/.test(measurementId)) {
  problems.push(`NG_APP_FIREBASE_MEASUREMENT_ID="${measurementId}" không đúng dạng G-XXXXXXXXXX`);
}

for (const p of problems) console.warn(`⚠ ${p}`);
if (strict && problems.length) process.exit(1);

const firebase = anyFirebase && !missing.length ? { ...firebaseValues, ...(measurementId ? { measurementId } : {}) } : null;

const config = {
  envName,
  firebase,
  recaptchaSiteKey: env('NG_APP_RECAPTCHA_SITE_KEY'),
  clarityProjectId: env('NG_APP_CLARITY_PROJECT_ID'),
  features,
  generatedAt: new Date().toISOString(),
};

const content = `// Tự sinh bởi scripts/set-env.mjs – không sửa tay, không commit.
import type { AppEnv } from './env.model';

export const GENERATED_ENV: AppEnv = ${JSON.stringify(config, null, 2)};
`;

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, content);

const on = (b) => (b ? 'bật' : 'tắt');
console.log(
  `env: ${envName} · Firebase ${firebase ? `"${firebase.projectId}"` : 'chưa khai (tự tắt)'} · ` +
    `Analytics ${on(features.analytics && !!measurementId && !!firebase)} · Performance ${on(features.performance && !!firebase)} · ` +
    `Remote Config ${on(features.remoteConfig && !!firebase)} · App Check ${on(!!config.recaptchaSiteKey && !!firebase)} · ` +
    `Clarity ${on(!!config.clarityProjectId)} → ${out}`,
);

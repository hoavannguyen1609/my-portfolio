// Chuẩn bị dự án trên máy mới: kiểm tra Node/Git, cài gói, sinh cấu hình môi trường, build thử.
//   node scripts/setup.mjs              # đủ các bước
//   node scripts/setup.mjs --skip-build # bỏ bước build thử
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const skipBuild = process.argv.includes('--skip-build');

const run = (cmd, label) => {
  console.log(`\n▶ ${label}\n  $ ${cmd}`);
  const r = spawnSync(cmd, { shell: true, stdio: 'inherit' });
  if (r.status !== 0) {
    console.error(`✖ ${label} thất bại (mã ${r.status}).`);
    process.exit(r.status ?? 1);
  }
};

const has = (cmd) => spawnSync(cmd, { shell: true, stdio: 'ignore' }).status === 0;

// 1. Node: Angular 21 cần ^20.19 || ^22.12 || >=24
const [major, minor] = process.versions.node.split('.').map(Number);
const nodeOk = (major === 20 && minor >= 19) || (major === 22 && minor >= 12) || major >= 24;
console.log(`Node ${process.versions.node} ${nodeOk ? '✓' : '✖'}`);
if (!nodeOk) {
  console.error('Cần Node ^20.19 || ^22.12 || >=24. Cài Node 22 LTS tại https://nodejs.org (hoặc "nvm install 22 && nvm use 22").');
  process.exit(1);
}

// 2. Git (để đẩy lên GitHub)
if (!has('git --version')) {
  console.error('Chưa có Git. Cài tại https://git-scm.com/downloads rồi chạy lại.');
  process.exit(1);
}
console.log('Git ✓');
console.log(`GitHub CLI (tuỳ chọn, để bật Pages tự động) ${has('gh --version') ? '✓' : '– chưa cài (không bắt buộc)'}`);

// 3. Cài gói đúng theo package-lock. Máy mới (chưa có node_modules) dùng npm ci;
// đã có node_modules thì dùng npm install để không xoá thư mục đang bị dev server khác giữ file
const fresh = !existsSync('node_modules');
run(fresh && existsSync('package-lock.json') ? 'npm ci' : 'npm install', 'Cài gói npm');

// 4. Cấu hình môi trường (.env tuỳ chọn; thiếu thì Firebase tự tắt)
if (!existsSync('.env')) console.log('\nℹ Chưa có .env: trang chạy không Firebase. Muốn bật thì chép .env.example thành .env rồi điền.');
run('node scripts/set-env.mjs', 'Sinh src/environments/env.generated.ts');

// 5. Build thử đúng base-href của GitHub Pages
if (!skipBuild) run('npx ng build --base-href /my-portfolio/', 'Build thử production');

console.log(`
✔ Xong. Bước tiếp theo:
  npm start                 # chạy thử tại http://localhost:4200
  npm run publish:github    # đẩy lên GitHub, GitHub Actions tự build và deploy Pages
  (xem DEPLOY.md để biết chi tiết)`);

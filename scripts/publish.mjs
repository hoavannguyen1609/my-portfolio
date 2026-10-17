// Đẩy portfolio lên GitHub để GitHub Actions build và deploy GitHub Pages.
//   node scripts/publish.mjs                         # hỏi xác nhận trước khi ghi đè main trên GitHub
//   node scripts/publish.mjs --dry-run               # chỉ in kế hoạch, không ghi gì
//   node scripts/publish.mjs --yes -m "nội dung"     # không hỏi, dùng thông điệp commit riêng
//   node scripts/publish.mjs --repo owner/ten-repo   # repo khác (mặc định hoavannguyen1609/my-portfolio)
//
// Các bước: kiểm tra Git → gắn remote origin → sao lưu main cũ trên GitHub sang nhánh react-legacy
// (chỉ khi lịch sử hai bên không nối tiếp) → commit thay đổi đang có → bật Pages nguồn GitHub Actions
// (nếu có GitHub CLI đã đăng nhập) → push main.
import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name, fallback) => {
  const i = args.findIndex((a) => a === name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const DRY = flag('--dry-run');
const YES = flag('--yes');
const REPO = option('--repo', process.env.GITHUB_REPO || 'hoavannguyen1609/my-portfolio');
const MESSAGE = option('-m', option('--message', 'chore: cập nhật portfolio'));
const REMOTE_URL = `https://github.com/${REPO}.git`;
const BRANCH = 'main';
const BACKUP = 'react-legacy';
const [OWNER, NAME] = REPO.split('/');
const PAGES_URL = NAME?.toLowerCase().endsWith('.github.io') ? `https://${NAME}/` : `https://${OWNER}.github.io/${NAME}/`;

const sh = (cmd, { quiet = false, allowFail = false } = {}) => {
  const r = spawnSync(cmd, { shell: true, encoding: 'utf8', stdio: quiet ? 'pipe' : ['inherit', 'pipe', 'pipe'] });
  const out = (r.stdout ?? '').trim();
  if (r.status !== 0 && !allowFail) {
    console.error(`✖ ${cmd}\n${(r.stderr ?? '').trim()}`);
    process.exit(r.status ?? 1);
  }
  return { ok: r.status === 0, out, err: (r.stderr ?? '').trim() };
};
/** Lệnh có ghi (local hoặc remote): bỏ qua khi --dry-run */
const write = (cmd) => {
  console.log(`  $ ${cmd}${DRY ? '   (dry-run: bỏ qua)' : ''}`);
  if (!DRY) sh(cmd);
};
/** Gọi git trực tiếp không qua shell: tham số có dấu tiếng Việt, dấu nháy không bị cmd.exe làm hỏng */
const gitWrite = (gitArgs) => {
  console.log(`  $ git ${gitArgs.join(' ')}${DRY ? '   (dry-run: bỏ qua)' : ''}`);
  if (DRY) return;
  const r = spawnSync('git', gitArgs, { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status ?? 1);
};
const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = async (q) => (YES ? 'y' : (await rl.question(q)).trim());
const step = (t) => console.log(`\n▶ ${t}`);

try {
  console.log(`Repo: ${REPO}\nPages: ${PAGES_URL}${DRY ? '\n(chế độ dry-run: không ghi gì)' : ''}`);

  step('Kiểm tra Git');
  if (!sh('git --version', { quiet: true, allowFail: true }).ok) throw new Error('Chưa cài Git: https://git-scm.com/downloads');
  if (!sh('git rev-parse --is-inside-work-tree', { quiet: true, allowFail: true }).ok) write(`git init -b ${BRANCH}`);
  const current = sh('git branch --show-current', { quiet: true, allowFail: true }).out;
  if (current && current !== BRANCH) write(`git branch -M ${BRANCH}`);

  // Danh tính commit lấy từ cấu hình Git của máy; chưa có thì hỏi
  for (const [key, label] of [['user.name', 'Tên hiển thị trên commit'], ['user.email', 'Email GitHub']]) {
    if (!sh(`git config ${key}`, { quiet: true, allowFail: true }).out) {
      if (YES) throw new Error(`Chưa cấu hình ${key}. Chạy: git config --global ${key} "..."`);
      const v = (await rl.question(`${label}: `)).trim();
      if (!v) throw new Error(`Cần ${key} để commit (git config --global ${key} "...").`);
      gitWrite(['config', key, v]);
    }
  }

  step('Remote origin');
  const origin = sh('git remote get-url origin', { quiet: true, allowFail: true });
  if (!origin.ok) write(`git remote add origin ${REMOTE_URL}`);
  else if (origin.out !== REMOTE_URL) {
    console.log(`  origin hiện là ${origin.out}`);
    if ((await ask(`  Đổi origin sang ${REMOTE_URL}? (y/N) `)).toLowerCase() === 'y') write(`git remote set-url origin ${REMOTE_URL}`);
  } else console.log(`  origin = ${REMOTE_URL} ✓`);

  step('Đọc trạng thái trên GitHub');
  const remoteHeads = sh(`git ls-remote --heads ${REMOTE_URL}`, { quiet: true, allowFail: true });
  if (!remoteHeads.ok) throw new Error(`Không đọc được ${REMOTE_URL}. Kiểm tra repo đã tạo chưa và quyền truy cập.\n${remoteHeads.err}`);
  const remoteMain = remoteHeads.out.split('\n').find((l) => l.endsWith(`refs/heads/${BRANCH}`))?.split(/\s+/)[0];
  const hasBackup = remoteHeads.out.includes(`refs/heads/${BACKUP}`);
  console.log(`  main trên GitHub: ${remoteMain ?? '(chưa có)'} · nhánh ${BACKUP}: ${hasBackup ? 'đã có' : 'chưa có'}`);

  let needForce = false;
  if (remoteMain) {
    // Fetch theo URL: chỉ ghi FETCH_HEAD, chạy được cả khi chưa gắn origin (dry-run)
    sh(`git fetch ${REMOTE_URL} ${BRANCH}`);
    const hasHead = sh('git rev-parse --verify HEAD', { quiet: true, allowFail: true }).ok;
    // main local nối tiếp main trên GitHub thì push thường, ngược lại phải ghi đè
    needForce = !hasHead || !sh(`git merge-base --is-ancestor ${remoteMain} HEAD`, { quiet: true, allowFail: true }).ok;
    if (needForce && !hasBackup) {
      step(`Sao lưu main cũ trên GitHub sang nhánh ${BACKUP}`);
      write(`git push origin ${remoteMain}:refs/heads/${BACKUP}`);
    }
  }

  step('Commit thay đổi');
  const dirty = sh('git status --porcelain', { quiet: true }).out;
  if (dirty) {
    console.log(`  ${dirty.split('\n').length} file thay đổi`);
    write('git add -A');
    gitWrite(['commit', '-m', MESSAGE]);
  } else console.log('  Không có thay đổi mới ✓');

  step('Bật GitHub Pages chạy bằng GitHub Actions');
  const gh = sh('gh auth status', { quiet: true, allowFail: true });
  if (gh.ok) {
    if (DRY) console.log(`  $ gh api -X PUT repos/${REPO}/pages -f build_type=workflow   (dry-run: bỏ qua)`);
    else {
      const put = sh(`gh api -X PUT repos/${REPO}/pages -f build_type=workflow`, { quiet: true, allowFail: true });
      const post = put.ok ? put : sh(`gh api -X POST repos/${REPO}/pages -f build_type=workflow`, { quiet: true, allowFail: true });
      console.log(post.ok ? '  Đã đặt nguồn Pages = GitHub Actions ✓' : `  Không đặt được tự động: ${post.err}`);
    }
  } else {
    console.log(`  Chưa có GitHub CLI đăng nhập. Làm tay một lần:
  https://github.com/${REPO}/settings/pages → Build and deployment → Source: GitHub Actions`);
  }

  step(`Push ${BRANCH}`);
  if (needForce) {
    console.log(`  Lịch sử local không nối tiếp main trên GitHub (code React cũ${hasBackup ? ' đã có ở ' + BACKUP : ' vừa sao lưu sang ' + BACKUP}).`);
    const answer = await ask(`  Ghi đè main trên GitHub bằng bản này? (y/N) `);
    if (answer.toLowerCase() !== 'y') throw new Error('Đã huỷ, chưa push gì lên main.');
    write(`git push -u origin ${BRANCH} --force-with-lease=${BRANCH}:${remoteMain}`);
  } else {
    write(`git push -u origin ${BRANCH}`);
  }

  console.log(`
✔ ${DRY ? 'Kế hoạch như trên (chưa ghi gì).' : 'Đã đẩy lên GitHub.'}
  Theo dõi build:  https://github.com/${REPO}/actions
  Trang sau deploy: ${PAGES_URL}
  Nếu workflow báo lỗi nguồn Pages: đổi Source sang GitHub Actions rồi bấm "Re-run jobs".`);
} catch (err) {
  console.error(`\n✖ ${err instanceof Error ? err.message : err}`);
  process.exitCode = 1;
} finally {
  rl.close();
}

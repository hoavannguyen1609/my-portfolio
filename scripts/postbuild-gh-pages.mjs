// Chuẩn bị thư mục build cho GitHub Pages:
// - 404.html = index.html để link sâu không bị trang 404 mặc định
// - .nojekyll để Pages không lọc file bắt đầu bằng "_"
import { copyFileSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = join('dist', 'nvh-portfolio', 'browser');
const index = join(out, 'index.html');

if (!existsSync(index)) {
  console.error(`Không thấy ${index}. Hãy chạy ng build trước.`);
  process.exit(1);
}

copyFileSync(index, join(out, '404.html'));
writeFileSync(join(out, '.nojekyll'), '');
console.log(`GitHub Pages: đã tạo 404.html và .nojekyll trong ${out}`);

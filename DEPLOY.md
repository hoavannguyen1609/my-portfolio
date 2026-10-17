# Đưa portfolio lên GitHub Pages từ máy cá nhân

Mục tiêu: thay trang React cũ tại `https://hoavannguyen1609.github.io/my-portfolio/` bằng bản Angular này, giữ nguyên đường link.

## 1. Chuyển mã nguồn qua DeskIn

Gói `nvh-portfolio.zip` đã loại `node_modules`, `dist`, `.angular` và file cấu hình sinh tự động. Gói vẫn giữ thư mục `.git` (lịch sử commit) cùng toàn bộ thay đổi chưa commit.

Gói có kèm `.env` (cấu hình Firebase dự án `my-portfolio-2af8c`) và `.firebaserc`. Hai file này đã có trong `.gitignore` nên không lên GitHub. Chỉ chuyển gói qua kênh riêng (DeskIn), đừng đăng gói này ở nơi công khai.

1. Dùng tính năng truyền file của DeskIn để chép `nvh-portfolio.zip` sang máy cá nhân.
2. Giải nén, ví dụ vào `D:\Projects\nvh-portfolio`.
3. Mở thư mục đó bằng VS Code. VS Code sẽ gợi ý cài các extension trong `.vscode/extensions.json`.

## 2. Cài công cụ (một lần)

| Công cụ | Bắt buộc | Ghi chú |
| --- | --- | --- |
| Node.js 22 LTS | Có | `^20.19`, `^22.12` hoặc `>=24`. Có nvm thì gõ `nvm install 22` rồi `nvm use 22` (`.nvmrc` đã ghi sẵn bản 22). |
| Git | Có | https://git-scm.com/downloads. Git for Windows có sẵn Git Credential Manager để đăng nhập GitHub qua trình duyệt. |
| GitHub CLI | Không | https://cli.github.com, sau đó chạy `gh auth login`. Có công cụ này thì script tự bật GitHub Pages ở chế độ GitHub Actions. |

## 3. Cài đặt và chạy thử

Mở terminal trong thư mục dự án:

```bash
npm run setup
```

Script `scripts/setup.mjs` làm các việc sau:
- kiểm tra phiên bản Node và Git;
- cài gói npm theo `package-lock.json`;
- sinh `src/environments/env.generated.ts`;
- build thử với `base-href /my-portfolio/`.

Chạy thử trên máy:

```bash
npm start
```

Mở http://localhost:4200.

Firebase (Analytics, Firestore, …) là tùy chọn. Muốn bật thì chép `.env.example` thành `.env`, điền các giá trị, rồi chạy lại `npm run env`. Không có `.env` thì trang vẫn chạy bình thường, chỉ tắt các tính năng Firebase.

## 4. Đẩy lên GitHub

Xem trước kế hoạch, lệnh này không ghi gì:

```bash
npm run publish:github -- --dry-run
```

Chạy thật:

```bash
npm run publish:github
```

Script `scripts/publish.mjs` làm các việc sau:
1. gắn remote `origin` = `https://github.com/hoavannguyen1609/my-portfolio.git`;
2. **sao lưu** nhánh `main` cũ (code React) trên GitHub sang nhánh **`react-legacy`**;
3. commit các thay đổi đang có (thông điệp mặc định: `chore: cập nhật portfolio`, đổi bằng `-m "..."`);
4. bật GitHub Pages ở chế độ GitHub Actions, nếu máy có GitHub CLI đã đăng nhập;
5. hỏi xác nhận rồi ghi đè `main` bằng `--force-with-lease`; lệnh push dừng lại nếu ai đó đã đổi `main` trên GitHub kể từ lúc script đọc.

Lần push đầu, Git mở trình duyệt để bạn đăng nhập GitHub.

Hai nhánh `gh-pages` (bản build của trang React cũ) và `react-legacy` vẫn còn nguyên. Muốn quay lại trang cũ chỉ cần đổi nguồn Pages về `gh-pages`.

## 5. Bật GitHub Pages (một lần, nếu script không tự bật được)

Vào https://github.com/hoavannguyen1609/my-portfolio/settings/pages, tại **Build and deployment → Source** chọn **GitHub Actions**.

Trang cũ đang chạy từ nhánh `gh-pages`, nên phải đổi nguồn thì workflow mới deploy được. Nếu workflow đã chạy và báo lỗi trước khi bạn đổi, vào tab **Actions**, mở lần chạy đó rồi bấm **Re-run all jobs**.

Theo dõi tại https://github.com/hoavannguyen1609/my-portfolio/actions. Chạy xong, trang mới có ở https://hoavannguyen1609.github.io/my-portfolio/. Trình duyệt có thể còn giữ bản cũ trong cache vài phút, nhấn Ctrl+F5 để tải lại.

## 6. Biến môi trường trên GitHub (tùy chọn, khi dùng Firebase/Clarity)

Vào **Settings → Secrets and variables → Actions**:

- **Secrets**: `NG_APP_FIREBASE_API_KEY`, `NG_APP_FIREBASE_AUTH_DOMAIN`, `NG_APP_FIREBASE_PROJECT_ID`, `NG_APP_FIREBASE_STORAGE_BUCKET`, `NG_APP_FIREBASE_MESSAGING_SENDER_ID`, `NG_APP_FIREBASE_APP_ID`, `NG_APP_FIREBASE_MEASUREMENT_ID`, `NG_APP_RECAPTCHA_SITE_KEY`
- **Variables**: `NG_APP_CLARITY_PROJECT_ID`, `NG_APP_ENABLE_ANALYTICS`, `NG_APP_ENABLE_PERFORMANCE`, `NG_APP_ENABLE_REMOTE_CONFIG`, `NG_APP_ENABLE_CONTACT_FORM`

Khai thiếu một phần thì workflow dừng ở bước **Environment** để không deploy cấu hình hỏng. Giá trị lấy từ file `.env` trên máy (đổi `NG_APP_` thành tên Secret giống hệt).

**Về độ an toàn của khoá:**
- Cấu hình web của Firebase luôn được nhúng vào file JavaScript mà trình duyệt tải về. Ai mở trang cũng xem được `apiKey`; Firebase thiết kế như vậy. Giữ khoá ngoài git chỉ để repo gọn và dễ đổi môi trường.
- Bảo vệ thật sự nằm ở:
  1. **Giới hạn API key**: Google Cloud Console → APIs & Services → Credentials → khoá Browser key → *Application restrictions: Websites*, thêm `https://hoavannguyen1609.github.io/*` và `http://localhost:4200/*`.
  2. **Luật Firestore** trong [firestore.rules](firestore.rules): chỉ cho tạo lời nhắn hợp lệ. Deploy bằng `npm run deploy:rules`, cần `npm i -g firebase-tools` và `firebase login`; `.firebaserc` đã trỏ sẵn tới `my-portfolio-2af8c`.
  3. **App Check** (nên bật): tạo site key reCAPTCHA v3, điền vào `NG_APP_RECAPTCHA_SITE_KEY`, rồi bật enforcement cho Firestore.
- Cách dự phòng ở mục 7 đẩy bản build lên nhánh `gh-pages`, nên nhánh đó sẽ chứa cấu hình này trong file JS. Điều này không tránh được với ứng dụng chạy trên trình duyệt, và cũng giống như trang đang chạy.

## 7. Cách dự phòng: deploy thẳng nhánh `gh-pages`

Dùng khi chưa muốn dùng GitHub Actions. Cách này giữ nguồn Pages là nhánh `gh-pages` như trang cũ:

```bash
npm run deploy:gh-pages
```

Lệnh build bản production với base-href `/my-portfolio/`, rồi đẩy thư mục `dist/nvh-portfolio/browser` lên nhánh `gh-pages`. Cấu hình Firebase lấy từ file `.env` trên máy, không lấy từ Secrets. Cách này vẫn cần đã chạy bước 4 (hoặc tự gắn remote `origin`).

## 8. Cập nhật về sau

```bash
npm run publish:github -- -m "feat: thêm dự án mới"
```

Hoặc dùng Git như bình thường: `git add`, `git commit`, `git push`. Mỗi lần push lên `main`, workflow tự build và deploy lại.

- Sửa nội dung trang: [src/app/core/data/profile.data.ts](src/app/core/data/profile.data.ts) và [src/app/core/data/integration.data.ts](src/app/core/data/integration.data.ts).
- Sửa CV: [cv/build-cv.mjs](cv/build-cv.mjs), rồi chạy `npm run cv` để in lại PDF vào `public/cv/`.

## Sự cố thường gặp

| Hiện tượng | Cách xử lý |
| --- | --- |
| `Cần Node ^20.19 …` | Cài Node 22 LTS, hoặc `nvm use 22`. |
| npm báo `Cannot read properties of null (reading 'edgesOut')` | `.npmrc` đã bật `legacy-peer-deps`. Kiểm tra file `.npmrc` có được chép theo không. |
| `EPERM … unlink` khi cài gói | Một dev server khác đang giữ file trong `node_modules`. Tắt `npm start` hoặc VS Code terminal đang chạy rồi thử lại. |
| Trang trắng, lỗi 404 file `.js` | Base-href sai. Workflow tự tính theo tên repo; nếu deploy tay thì phải dùng `npm run build:gh`. |
| Workflow lỗi ở bước deploy | Nguồn Pages chưa là GitHub Actions, xem mục 5. |
| `rejected … stale info` khi push | `main` trên GitHub vừa thay đổi. Chạy lại `npm run publish:github` để script đọc trạng thái mới. |

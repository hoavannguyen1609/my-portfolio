# NVH Portfolio

Portfolio cá nhân của **Nguyễn Văn Hòa**, viết bằng Angular 21 (standalone, signals, zoneless), Tailwind CSS 4, GSAP 3.15, Three.js và Lenis. Song ngữ Việt/Anh, theme sáng/tối, deploy lên GitHub Pages bằng GitHub Actions.

> **Đưa lên GitHub Pages từ máy khác:** làm theo [DEPLOY.md](DEPLOY.md) — 
pm run setup rồi 
pm run publish:github.

## Chạy dự án

Cần Node `^20.19 || ^22.12 || >=24`. Máy đang dùng nvm thì chọn Node 22:

```bash
nvm use 22.12.0
npm ci
npm start            # http://localhost:4200
npm run build        # bản production ở dist/nvh-portfolio/browser
npm run build:gh     # build với base-href /my-portfolio/ + 404.html + .nojekyll
```

> `.npmrc` bật `legacy-peer-deps` vì npm 10.9.x bị crash (`reading 'edgesOut'`) khi duyệt peer tuỳ chọn `vitest` của `@angular/build`.

## Deploy lên GitHub Pages

1. Tạo repo trên GitHub rồi push nhánh `main`.
2. Vào **Settings → Pages → Build and deployment → Source** chọn **GitHub Actions**.
3. Mỗi lần push lên `main`, workflow [.github/workflows/deploy.yml](.github/workflows/deploy.yml) tự build và deploy.

Base href được tính từ tên repo:

| Tên repo | URL | base-href |
| --- | --- | --- |
| `my-portfolio` | `https://<user>.github.io/my-portfolio/` | `/my-portfolio/` |
| `<user>.github.io` | `https://<user>.github.io/` | `/` |

## Biến môi trường & Firebase

Cấu hình đọc lúc build, không đọc lúc chạy. `scripts/set-env.mjs` gộp biến môi trường hệ thống và file `.env` (biến hệ thống ưu tiên hơn), kiểm tra rồi sinh `src/environments/env.generated.ts` (file này không commit). `npm start` và `npm run build` tự chạy script trước khi build.

```bash
cp .env.example .env     # điền giá trị
npm run env              # sinh file cấu hình, in tóm tắt tính năng bật/tắt
npm run env:check        # như trên, nhưng thoát lỗi nếu khai thiếu một phần (dùng trong CI)
```

| Biến | Dùng cho |
| --- | --- |
| `NG_APP_FIREBASE_*` (6 khoá) | Firebase Web SDK; thiếu hết thì mọi tính năng Firebase tự tắt, trang vẫn chạy |
| `NG_APP_FIREBASE_MEASUREMENT_ID` | Firebase Analytics (`G-XXXXXXXXXX`) |
| `NG_APP_RECAPTCHA_SITE_KEY` | App Check reCAPTCHA v3, chặn bot ghi vào Firestore |
| `NG_APP_CLARITY_PROJECT_ID` | Microsoft Clarity: heatmap, bản ghi phiên |
| `NG_APP_ENABLE_ANALYTICS / PERFORMANCE / REMOTE_CONFIG / CONTACT_FORM` | Bật/tắt từng tính năng (`true`/`false`) |
| `NG_APP_ENV_NAME` | `development` / `staging` / `production` |

Các tính năng đi kèm (SDK tải trễ thành chunk riêng, không làm nặng lần tải đầu):

| Tính năng | Ghi chú |
| --- | --- |
| Firestore | Form "Gửi lời nhắn" ghi vào collection `messages`. Luật ở [firestore.rules](firestore.rules): chỉ cho tạo mới bản ghi hợp lệ, không đọc/sửa/xoá từ client. Deploy luật: `npm run deploy:rules` (cần `firebase-tools`). |
| Analytics | `page_view`, `section_view` (độ sâu cuộn), `ui_click` cho phần tử có `data-track`, `run_command`, `contact_message`, `web_vital` (LCP, INP, CLS, FCP, TTFB từ thư viện `web-vitals`). |
| Performance Monitoring | Tự đo tải trang và request; trace tuỳ biến `intro_ready`, `hero_3d_ready`. |
| Remote Config | Cờ `hero_3d`, `custom_cursor`, `contact_form` để tắt hiệu ứng nặng hoặc thử A/B mà không build lại. |
| App Check | Bật khi có site key; môi trường khác `production` dùng debug token (in ở console, đăng ký trong Firebase Console). |
| Microsoft Clarity | Heatmap, bản ghi phiên, rage click; ô nhập liệu được che. |

Analytics, Performance và Clarity chỉ chạy sau khi người xem bấm **Đồng ý** trên banner quyền riêng tư. Người xem đổi lựa chọn bằng lệnh "Cài đặt quyền riêng tư" trong bảng lệnh (⌘K / Ctrl+K).

**GitHub Actions:** khai trong **Settings → Secrets and variables → Actions**:
- *Secrets*: `NG_APP_FIREBASE_API_KEY`, `NG_APP_FIREBASE_AUTH_DOMAIN`, `NG_APP_FIREBASE_PROJECT_ID`, `NG_APP_FIREBASE_STORAGE_BUCKET`, `NG_APP_FIREBASE_MESSAGING_SENDER_ID`, `NG_APP_FIREBASE_APP_ID`, `NG_APP_FIREBASE_MEASUREMENT_ID`, `NG_APP_RECAPTCHA_SITE_KEY`
- *Variables*: `NG_APP_CLARITY_PROJECT_ID`, các cờ `NG_APP_ENABLE_*` (bỏ trống = `true`)

Cấu hình web của Firebase vốn được nhúng vào JavaScript phía trình duyệt, nên an toàn dữ liệu nằm ở luật Firestore và App Check, không ở việc giấu khoá. Nhớ thêm domain GitHub Pages vào danh sách domain được phép của API key và của reCAPTCHA.

## CV PDF

CV 2 trang A4 (tiếng Việt và tiếng Anh) sinh từ dữ liệu trong [cv/build-cv.mjs](cv/build-cv.mjs) rồi in bằng Chrome/Edge headless:

```bash
node cv/build-cv.mjs
```

Script ghi bản xem trước HTML và PDF vào `cv/out/`, đồng thời chép PDF vào `public/cv/`. Nút CV trên trang (header, hero, liên hệ, bảng lệnh) mở `cv/CV-Nguyen-Van-Hoa-VI.pdf` hoặc `-EN.pdf` theo ngôn ngữ đang chọn. Không tìm thấy Chrome thì đặt biến `CHROME_PATH`.

## Cấu trúc

```
src/
├─ index.html                  # meta SEO/OG, font, script đặt theme trước khi app chạy
├─ styles.css                  # Tailwind 4 + token màu (dark/light) + class thành phần
└─ app/
   ├─ app.ts                    # ghép layout + section, khởi tạo Lenis
   ├─ core/
   │  ├─ config/app-env.ts      # token APP_ENV đọc cấu hình sinh từ biến môi trường
   │  ├─ firebase/              # Firebase (lazy), consent, analytics + web-vitals, performance, remote config, clarity, lời nhắn Firestore
   │  ├─ data/integration.data.ts # nội dung tích hợp & toàn vẹn dữ liệu
   │  ├─ data/profile.data.ts   # TOÀN BỘ nội dung (vi/en) – sửa nội dung ở đây
   │  ├─ models.ts              # kiểu dữ liệu
   │  ├─ i18n.service.ts        # ngôn ngữ (signal), t(), định dạng số
   │  ├─ theme.service.ts       # sáng/tối + View Transitions vòng tròn
   │  ├─ motion.service.ts      # đăng ký plugin GSAP, Lenis ↔ ScrollTrigger, reduced-motion
   │  └─ toast.service.ts       # thông báo + sao chép clipboard
   ├─ shared/
   │  ├─ section-heading.ts
   │  └─ motion/                # directive hiệu ứng dùng lại
   │     ├─ reveal.directive.ts       # [appReveal] hiện khi cuộn tới
   │     ├─ split-text.directive.ts   # [appSplit] SplitText chữ trồi lên
   │     ├─ scrub-words.directive.ts  # [appScrubWords] sáng dần từng từ theo cuộn
   │     ├─ count-up.directive.ts     # [appCountUp] đếm số
   │     └─ pointer.directives.ts     # [appMagnetic] nút hút, [appSpotlight] đèn rọi + nghiêng 3D
   ├─ layout/                   # preloader, header, con trỏ, toast, bảng lệnh ⌘K, banner quyền riêng tư
   └─ sections/
      ├─ hero/                  # cảnh 3D three.js (hero-scene), canvas 2D dự phòng, phiếu trình
      ├─ skill-sphere.ts        # quả cầu kỹ năng 3D
      ├─ marquee.ts             # dải công nghệ chạy theo tốc độ cuộn
      ├─ integration/           # bản đồ tích hợp, 7 chốt toàn vẹn dữ liệu, mã minh hoạ
      ├─ about.ts, skills.ts, experience.ts, projects.ts, education.ts, contact.ts, contact-form.ts
      └─ work/                  # cuộn ngang ghim + sơ đồ kiến trúc (DrawSVG, MotionPath)
```

## Thư viện

| Thư viện | Dùng cho |
| --- | --- |
| Tailwind CSS 4 | toàn bộ layout và style, token màu qua `@theme inline` |
| GSAP 3.15 (ScrollTrigger, SplitText, Flip, DrawSVG, MotionPath, ScrambleText) | mọi chuyển động |
| Three.js 0.186 | cảnh 3D ở hero, tải trễ bằng `@defer (on idle)` thành chunk riêng |
| Lenis | cuộn mượt, đồng bộ với ScrollTrigger |
| @lucide/angular | icon |

## Hiệu ứng chính

- Preloader đếm 0–100, màn kéo lên rồi mới chạy intro hero.
- Hero: quả cầu 3D (Three.js) gồm điểm, lưới địa cầu, các service nối bằng cung, bản tin chạy như sự kiện Kafka, hai vành quỹ đạo; nghiêng theo con trỏ, xoay theo cuộn; không có WebGL thì dùng canvas 2D. Tên lật 3D từng ký tự, vai trò đổi bằng ScrambleText, phiếu trình có lớp chiều sâu, chạy 5 bước, đóng dấu rồi lơ lửng.
- Năng lực: quả cầu kỹ năng 3D kéo-xoay có quán tính, 8 nhóm kỹ năng dạng thẻ lật 3D.
- Dải băng công nghệ bắt chéo nghiêng trong không gian 3D.
- Đồng xu dấu son 3D hai mặt ở phần liên hệ, lật theo cuộn.
- Header nổi kiểu kính mờ, ẩn khi cuộn xuống, vạch sáng chạy theo mục đang xem, thanh tiến độ đọc.
- Section Dự án FIS: màn rộng ghim lại và cuộn ngang, panel xoay quanh trục Y như băng chuyền; sơ đồ eDLM tự vẽ cạnh và cho bản tin chạy.
- Lọc dự án 84Soft bằng GSAP Flip; thẻ có đèn rọi theo con trỏ và nghiêng 3D.
- Đổi theme bằng View Transitions (vòng tròn lan từ điểm bấm).
- Tôn trọng `prefers-reduced-motion`: tắt cuộn mượt, preloader, cuộn ngang và hiệu ứng.

## Sửa nội dung

Mọi chữ, số liệu, liên kết nằm trong [src/app/core/data/profile.data.ts](src/app/core/data/profile.data.ts). Chuỗi song ngữ viết dạng `{ vi: '...', en: '...' }`; chuỗi thường dùng chung cho cả hai.

Ảnh đại diện đang trỏ tới ảnh trên trang portfolio cũ (`PROFILE.avatar`). Muốn dùng ảnh trong repo: chép ảnh vào `public/images/avatar.png` rồi đổi `avatar: 'images/avatar.png'`.

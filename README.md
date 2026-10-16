# NVH Portfolio

Portfolio cá nhân của **Nguyễn Văn Hòa**, viết bằng Angular 21 (standalone, signals, zoneless), Tailwind CSS 4, GSAP 3.15 và Lenis. Song ngữ Việt/Anh, theme sáng/tối, deploy lên GitHub Pages bằng GitHub Actions.

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

## Cấu trúc

```
src/
├─ index.html                  # meta SEO/OG, font, script đặt theme trước khi app chạy
├─ styles.css                  # Tailwind 4 + token màu (dark/light) + class thành phần
└─ app/
   ├─ app.ts                    # ghép layout + section, khởi tạo Lenis
   ├─ core/
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
   ├─ layout/                   # preloader, header, con trỏ tuỳ biến, toast
   └─ sections/
      ├─ hero/                  # canvas mạng service + phiếu trình đóng dấu
      ├─ marquee.ts             # dải công nghệ chạy theo tốc độ cuộn
      ├─ about.ts, skills.ts, experience.ts, projects.ts, notes.ts, education.ts, contact.ts
      └─ work/                  # cuộn ngang ghim + sơ đồ kiến trúc (DrawSVG, MotionPath)
```

## Thư viện

| Thư viện | Dùng cho |
| --- | --- |
| Tailwind CSS 4 | toàn bộ layout và style, token màu qua `@theme inline` |
| GSAP 3.15 (ScrollTrigger, SplitText, Flip, DrawSVG, MotionPath, ScrambleText) | mọi chuyển động |
| Lenis | cuộn mượt, đồng bộ với ScrollTrigger |
| @lucide/angular | icon |

## Hiệu ứng chính

- Preloader đếm 0–100, màn kéo lên rồi mới chạy intro hero.
- Hero: canvas mạng service có "bản tin" chạy như sự kiện Kafka, con trỏ đẩy nút; tên tách từng ký tự; vai trò đổi bằng ScrambleText; phiếu trình chạy qua 5 bước rồi đóng dấu son.
- Header nổi kiểu kính mờ, ẩn khi cuộn xuống, vạch sáng chạy theo mục đang xem, thanh tiến độ đọc.
- Section Dự án FIS: màn rộng ghim lại và cuộn ngang; sơ đồ eDLM tự vẽ cạnh và cho bản tin chạy.
- Lọc dự án 84Soft bằng GSAP Flip; thẻ có đèn rọi theo con trỏ và nghiêng 3D.
- Đổi theme bằng View Transitions (vòng tròn lan từ điểm bấm).
- Tôn trọng `prefers-reduced-motion`: tắt cuộn mượt, preloader, cuộn ngang và hiệu ứng.

## Sửa nội dung

Mọi chữ, số liệu, liên kết nằm trong [src/app/core/data/profile.data.ts](src/app/core/data/profile.data.ts). Chuỗi song ngữ viết dạng `{ vi: '...', en: '...' }`; chuỗi thường dùng chung cho cả hai.

Ảnh đại diện đang trỏ tới ảnh trên trang portfolio cũ (`PROFILE.avatar`). Muốn dùng ảnh trong repo: chép ảnh vào `public/images/avatar.png` rồi đổi `avatar: 'images/avatar.png'`.

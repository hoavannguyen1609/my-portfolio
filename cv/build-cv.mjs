// Sinh CV A4 (vi + en) từ dữ liệu bên dưới rồi in PDF bằng Chrome headless.
//   node cv/build-cv.mjs
// Kết quả: cv/out/CV-Nguyen-Van-Hoa-VI.pdf, cv/out/CV-Nguyen-Van-Hoa-EN.pdf (+ file HTML để xem trước),
// đồng thời chép PDF vào public/cv để nút CV trên portfolio mở đúng bản theo ngôn ngữ
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, 'out');
const publicDir = join(here, '..', 'public', 'cv');
mkdirSync(outDir, { recursive: true });
mkdirSync(publicDir, { recursive: true });

/** Chuỗi song ngữ: { vi, en } hoặc chuỗi dùng chung */
const t = (v, lang) => (typeof v === 'string' ? v : v[lang]);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const CV = {
  name: 'Nguyễn Văn Hòa',
  title: { vi: 'Backend Developer · Java Spring Boot · Microservices', en: 'Backend Developer · Java Spring Boot · Microservices' },
  avatar: 'https://hoavannguyen1609.github.io/my-portfolio/images/25c92c7dcbe2b7f083afc19457d07fd9_2-removebg-preview.png',
  summary: {
    vi: 'Lập trình viên Backend hơn 4 năm kinh nghiệm, bắt đầu từ Frontend và từng dẫn dắt đội Frontend tại 84Soft. Hiện phát triển các hệ thống chính phủ số tại FPT IS: quản lý vòng đời văn bản (eDLM), phân công công việc (eTask) và hồ sơ thi hành án dân sự (THADS-eTCTHA, đối tác Bộ Tư pháp) trên kiến trúc microservice Spring Boot, Kafka, Elasticsearch, MySQL. Thế mạnh: tích hợp hệ thống lớn và giữ toàn vẹn dữ liệu qua các mối nối.',
    en: 'Backend developer with 4+ years of experience who started in frontend and led the frontend team at 84Soft. Now building digital-government systems at FPT IS: document lifecycle management (eDLM), task assignment (eTask) and civil judgment enforcement (THADS-eTCTHA, client: Ministry of Justice) on a Spring Boot, Kafka, Elasticsearch and MySQL microservice stack. Strength: integrating large systems while keeping data intact across every connection.',
  },
  contacts: [
    { k: 'email', v: 'hoavannguyen1609@gmail.com', href: 'mailto:hoavannguyen1609@gmail.com' },
    { k: 'phone', v: '+84 876 160 901', href: 'tel:+84876160901' },
    { k: 'zalo', v: 'Zalo: +84 941 470 529', href: 'https://zalo.me/+84941470529' },
    { k: 'pin', v: { vi: 'Phố Trung Kính, phường Yên Hòa, Hà Nội', en: 'Trung Kinh St., Yen Hoa Ward, Hanoi' } },
    { k: 'cake', v: '16/09/2001' },
    { k: 'globe', v: 'hoavannguyen1609.github.io/my-portfolio', href: 'https://hoavannguyen1609.github.io/my-portfolio/' },
    { k: 'git', v: 'gitlab.com/NguyenVanHoa160901', href: 'https://gitlab.com/NguyenVanHoa160901' },
  ],
  skills: [
    { g: 'Backend', items: ['Java 11', 'Spring Boot', 'Spring Data JPA', 'Hibernate', 'QueryDSL', 'MapStruct', 'Liquibase', 'Spring Security', 'OAuth2 · JWT', 'WebFlux WebClient', 'Quartz', 'RESTful API'] },
    { g: 'Microservices', items: ['JHipster', 'Eureka', 'Spring Cloud Config', 'OpenFeign', 'API Gateway', 'Kafka'] },
    { g: { vi: 'Dữ liệu & tìm kiếm', en: 'Data & search' }, items: ['MySQL 5.7 / 8', 'Elasticsearch 7', 'Redis', 'AWS S3', 'Oracle', 'PostgreSQL'] },
    { g: { vi: 'Kiến trúc & mẫu', en: 'Architecture & patterns' }, items: ['Event-driven', 'Transactional Outbox', 'Saga', { vi: 'Khoá lạc quan @Version', en: 'Optimistic locking' }, { vi: 'Truy vấn sẵn sàng sharding', en: 'Sharding-ready queries' }] },
    { g: { vi: 'Tích hợp & tài liệu', en: 'Integration & documents' }, items: ['VDXP · edXML', 'C06 · VNeID', 'MISA', { vi: 'Ký số · đóng dấu', en: 'Signing · stamping' }, 'AI OCR · QR', 'PDFBox', 'JAXB'] },
    { g: 'Frontend', items: ['TypeScript', 'React', 'Next.js', 'Angular', 'Vue', 'Redux Toolkit', 'Tailwind CSS', 'Node.js', 'NestJS'] },
    { g: { vi: 'Công cụ', en: 'Tooling' }, items: ['Git · GitLab', 'Maven', 'Docker', 'Postman', 'Swagger', 'Jira', 'Figma'] },
  ],
  soft: [
    { vi: 'Phân tích & ước tính công việc', en: 'Analysis & estimation' },
    { vi: 'Phân bổ việc, dẫn dắt đội Frontend', en: 'Task allocation, frontend team lead' },
    { vi: 'Viết tài liệu bàn giao rõ ràng', en: 'Clear hand-over documentation' },
    { vi: 'Làm việc nhóm, tự giác, ham học hỏi', en: 'Teamwork, self-driven, eager to learn' },
  ],
  languages: [{ vi: 'Tiếng Việt: bản ngữ', en: 'Vietnamese: native' }, { vi: 'Tiếng Anh: cơ bản (đọc tài liệu kỹ thuật)', en: 'English: basic (technical reading)' }],
  education: [
    { period: { vi: '05/2024 – nay', en: '05/2024 – present' }, school: { vi: 'Học viện Công nghệ Bưu chính Viễn thông (PTIT)', en: 'Posts and Telecommunications Institute of Technology (PTIT)' }, detail: { vi: 'Kỹ sư Kỹ thuật phần mềm · hệ eLearning', en: 'B.Eng. Software Engineering · eLearning' } },
    { period: '05/2021 – 11/2023', school: 'Fullstack Edu (F8)', detail: { vi: 'Full-stack Development · học lập trình để đi làm', en: 'Full-stack Development · job-ready programming' } },
    { period: '08/2020 – 09/2022', school: { vi: 'Viện CNTT và Truyền thông ITPlus', en: 'ITPlus Academy' }, detail: { vi: 'Full-stack Development · học qua dự án thực tế', en: 'Full-stack Development · project-based' } },
  ],
  jobs: [
    {
      company: 'Công ty TNHH FPT IS',
      companyEn: 'FPT Information System (FPT IS)',
      role: { vi: 'Full-Stack Developer · trọng tâm Backend', en: 'Full-Stack Developer · backend focus' },
      period: { vi: '10/2025 – nay', en: '10/2025 – present' },
      intro: { vi: 'Phát triển và duy trì các hệ thống lõi chính phủ số trên kiến trúc microservice Spring Boot. Hơn 1.900 commit trên 5 repo (theo git log, 10/2026).', en: 'Building and maintaining core digital-government systems on a Spring Boot microservice architecture. 1,900+ commits across 5 repositories (git log, 10/2026).' },
      projects: [
        {
          name: 'eDLM',
          what: { vi: 'Hệ thống quản lý vòng đời văn bản', en: 'Document lifecycle management system' },
          bullets: [
            { vi: 'Luồng văn bản đi: trình ký, ký số, đóng dấu, ban hành và ban hành bổ sung, thu hồi trong cùng luồng, ký thừa lệnh.', en: 'Outgoing documents: submission, digital signing, stamping, issuance and supplementary issuance, in-flow recall, signing on behalf.' },
            { vi: 'Kết nối Trục liên thông văn bản quốc gia (edXML): tách nghiệp vụ trục thành service vdxp riêng giao tiếp qua Kafka; theo dõi, gửi lại theo từng nơi nhận, thống kê liên thông.', en: 'National document interconnection axis (edXML): moved axis logic into a dedicated vdxp service over Kafka; per-recipient tracking, resend and statistics.' },
            { vi: 'Văn bản đến: tiếp nhận theo phòng ban, kiểm tra trùng và gộp, quét QR/OCR bản giấy qua dịch vụ AI; tra cứu chung trên Elasticsearch.', en: 'Incoming documents: department reception, duplicate detection and merge, QR/OCR scanning via an AI service; cross-document search on Elasticsearch.' },
          ],
          stack: 'Spring Boot · Kafka · Elasticsearch · MySQL · Liquibase · QueryDSL · AWS S3',
        },
        {
          name: 'THADS-eTCTHA',
          what: { vi: 'Quản lý hồ sơ thi hành án dân sự · đối tác Bộ Tư pháp', en: 'Civil judgment enforcement cases · client: Ministry of Justice' },
          bullets: [
            { vi: 'Hồ sơ, đương sự, nghiệp vụ thi hành; dòng tiền thi hành án (thu, chi, kê biên, hoàn trả) có lịch sử và index tìm kiếm.', en: 'Cases, parties and enforcement operations; enforcement cash flow (receipts, payments, seizures, refunds) with history and search indexes.' },
            { vi: 'Xác minh đương sự qua dữ liệu dân cư C06/VNeID với executor riêng, timeout cứng; đồng bộ chứng từ MISA, biên lai điện tử, đối soát với bộ ngành.', en: 'Party verification via C06/VNeID population data on a dedicated executor with hard timeouts; MISA document sync, e-receipts and ministry reconciliation.' },
          ],
          stack: 'Spring Boot · Microservices · Kafka · Redis · Elasticsearch · MySQL · AWS',
        },
        {
          name: 'eTask',
          what: { vi: 'Hệ thống phân công công việc · tích hợp với eDLM', en: 'Task assignment system · integrated with eDLM' },
          bullets: [
            { vi: 'Mỗi hành động trên văn bản tạo/cập nhật dự án và việc bên eTask qua Kafka với outbox, saga log, cấu hình trạng thái theo phiên bản.', en: 'Each document action creates or updates eTask projects and tasks over Kafka with an outbox, saga logs and versioned status configuration.' },
          ],
          stack: 'Spring Boot · Kafka · MySQL · OpenFeign',
        },
      ],
    },
    {
      company: 'Công ty Cổ phần Công nghệ và Đầu tư 84Soft',
      companyEn: '84Soft Technology and Investment JSC',
      role: 'Full-Stack Developer / Frontend Team Lead',
      period: '03/2022 – 05/2025',
      intro: { vi: 'Phân tích, phát triển và duy trì ứng dụng web; dẫn dắt đội Frontend (phân công, tối ưu quy trình) và tham gia phát triển Backend.', en: 'Analysed, built and maintained web applications; led the frontend team (planning, allocation, process) and contributed to the backend.' },
      products: [
        ['Reavol', { vi: 'Thương mại điện tử nội dung số', en: 'Digital-content e-commerce' }, 'FE Lead'],
        ['CakeAI', { vi: 'Trợ lý AI đa nền tảng', en: 'Multi-platform AI assistant' }, 'Full-stack · FE Lead'],
        ['MyID', { vi: 'Xác thực theo nhà mạng', en: 'Carrier-based authentication' }, 'Full-stack · FE Lead'],
        ['SmartQA', { vi: 'Phân tích âm thanh, phát hiện gian lận bằng AI', en: 'AI audio analysis, fraud detection' }, 'Full-stack · FE Lead'],
        ['MeetLaw', { vi: 'Học pháp luật qua tình huống', en: 'Legal learning by real cases' }, 'FE Lead'],
        ['Art Contest', { vi: 'Cuộc thi vẽ cộng đồng (Vifolac)', en: 'Community drawing contest (Vifolac)' }, 'FE Lead'],
        ['Vtbay · Vegiare', { vi: 'Tìm và đặt vé máy bay', en: 'Flight search and booking' }, 'FE · Full-stack'],
        ['HETEAC', { vi: 'Hệ thống chi trả (InterITS)', en: 'Payment system (InterITS)' }, 'FE'],
      ],
      stack: 'React · Next.js · TypeScript · Spring Boot · NestJS · MySQL · Firebase · AWS · OpenAI API',
    },
    {
      company: 'Công ty Cổ phần Giải pháp Công nghệ thông tin quốc tế',
      companyEn: 'International IT Solutions JSC',
      role: { vi: 'Onsite · Frontend Developer', en: 'Onsite · Frontend Developer' },
      period: '07/2024 – 09/2024',
      intro: { vi: 'Phát triển giao diện web, phối hợp với đội Backend để tích hợp API chính xác.', en: 'Built web interfaces and worked with the backend team on accurate API integration.' },
    },
  ],
  personal: {
    name: { vi: 'Portfolio cá nhân', en: 'Personal portfolio' },
    what: 'Angular 21 · Tailwind CSS 4 · GSAP · Three.js · Firebase',
    bullets: [
      { vi: 'Trang song ngữ Việt/Anh, theme sáng/tối; cảnh 3D tải trễ bằng @defer, cuộn ngang ghim, bảng lệnh Ctrl+K, tôn trọng prefers-reduced-motion.', en: 'Bilingual site with light/dark themes; lazily loaded 3D scene via @defer, pinned horizontal scroll, Ctrl+K command palette, honours prefers-reduced-motion.' },
      { vi: 'Biến môi trường sinh lúc build; Firebase Analytics, Performance, Remote Config chỉ chạy khi người xem đồng ý; form lời nhắn lưu Firestore với luật chỉ cho tạo mới; deploy GitHub Pages bằng GitHub Actions.', en: 'Build-time environment config; Firebase Analytics, Performance and Remote Config run only after consent; Firestore contact form with create-only rules; deployed to GitHub Pages via GitHub Actions.' },
    ],
  },
  integrity: {
    title: { vi: 'Tích hợp & toàn vẹn dữ liệu', en: 'Integration & data integrity' },
    items: [
      { vi: 'Đã nối 8 hệ thống: Trục liên thông quốc gia, eTask, ký số/đóng dấu, AI OCR, C06/VNeID, MISA, biên lai điện tử, đối soát bộ ngành.', en: 'Connected 8 systems: national interconnection axis, eTask, signing/stamping, AI OCR, C06/VNeID, MISA, e-receipts, ministry reconciliation.' },
      { vi: 'Phát bản tin sau commit qua outbox; ghi nhật ký saga bằng giao dịch riêng (REQUIRES_NEW) để rollback không xoá dấu vết.', en: 'Publish after commit through an outbox; saga logs in their own REQUIRES_NEW transaction so rollbacks keep the trail.' },
      { vi: 'Chỉ xác nhận "đã nhận" sau khi lưu đủ; trạng thái chỉ tiến, khoá lạc quan @Version chặn ghi đè đồng thời.', en: 'Acknowledge only after everything is stored; forward-only status with @Version optimistic locking.' },
      { vi: 'Mỗi lượt gửi có mã riêng, lưu cả request/response; consumer group riêng mỗi service; gửi lại theo nơi nhận khi lỗi.', en: 'An ID per round with stored request/response; one consumer group per service; per-recipient resend on failure.' },
    ],
  },
};

const LABELS = {
  vi: { profile: 'Giới thiệu', experience: 'Kinh nghiệm làm việc', experienceCont: 'Kinh nghiệm làm việc (tiếp)', personal: 'Dự án cá nhân', contact: 'Liên hệ', skills: 'Kỹ năng', education: 'Học vấn', soft: 'Kỹ năng làm việc', languages: 'Ngôn ngữ', products: 'Sản phẩm', stack: 'Công nghệ', updated: 'Cập nhật 10/2026' },
  en: { profile: 'Profile', experience: 'Experience', experienceCont: 'Experience (continued)', personal: 'Personal project', contact: 'Contact', skills: 'Skills', education: 'Education', soft: 'Ways of working', languages: 'Languages', products: 'Products', stack: 'Stack', updated: 'Updated 10/2026' },
};

// Biểu tượng nét mảnh tối giản cho mục liên hệ
const ICON = {
  email: '<path d="M3 6h18v12H3z"/><path d="m3 7 9 6 9-6"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  zalo: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
  pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  cake: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  git: '<circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="8" r="2"/><path d="M6 8v8M18 10c0 4-6 3-12 6"/>',
};
const icon = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON[k]}</svg>`;

function render(lang) {
  const L = LABELS[lang];
  const T = (v) => esc(t(v, lang));

  const contacts = CV.contacts
    // <wbr> cho phép ngắt dòng gọn ở @ và / thay vì cắt giữa chữ
    .map((c) => { const v = T(c.v).replace(/([@/])/g, '<wbr>$1'); return `<li>${icon(c.k)}${c.href ? `<a href="${c.href}">${v}</a>` : `<span>${v}</span>`}</li>`; })
    .join('');
  const skillHtml = (groups) => groups
    .map((s) => `<div class="skill"><h4>${T(s.g)}</h4><p>${s.items.map((i) => `<span>${T(i)}</span>`).join('')}</p></div>`)
    .join('');
  const education = CV.education
    .map((e) => `<div class="edu"><p class="mono">${T(e.period)}</p><p class="strong">${T(e.school)}</p><p>${T(e.detail)}</p></div>`)
    .join('');
  const list = (arr) => `<ul class="dots">${arr.map((x) => `<li>${T(x)}</li>`).join('')}</ul>`;

  const jobHtml = (list) => list
    .map((j) => {
      const projects = (j.projects ?? [])
        .map(
          (p) => `<div class="project">
            <p class="p-head"><b>${esc(p.name)}</b><span>${T(p.what)}</span></p>
            <ul class="dots">${p.bullets.map((b) => `<li>${T(b)}</li>`).join('')}</ul>
            <p class="stack"><span>${L.stack}:</span> ${esc(p.stack)}</p>
          </div>`,
        )
        .join('');
      const products = j.products
        ? `<table class="products"><tbody>${j.products.map(([n, d, r]) => `<tr><td class="strong">${esc(n)}</td><td>${T(d)}</td><td class="mono">${esc(r)}</td></tr>`).join('')}</tbody></table>
           <p class="stack"><span>${L.stack}:</span> ${esc(j.stack)}</p>`
        : '';
      return `<article class="job">
        <header><div><h3>${esc(lang === 'vi' ? j.company : j.companyEn)}</h3><p class="role">${T(j.role)}</p></div><p class="period">${T(j.period)}</p></header>
        <p class="intro">${T(j.intro)}</p>
        ${projects}${products}
      </article>`;
    })
    .join('');

  const personal = `<article class="job"><div class="project">
    <p class="p-head"><b>${T(CV.personal.name)}</b><span>${esc(CV.personal.what)}</span></p>
    <ul class="dots">${CV.personal.bullets.map((b) => `<li>${T(b)}</li>`).join('')}</ul>
    <p class="stack"><span>Link:</span> hoavannguyen1609.github.io/my-portfolio</p>
  </div></article>`;

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<title>CV · ${esc(CV.name)} · ${lang.toUpperCase()}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=block">
<style>
  @page { size: A4; margin: 0; }
  :root { --ink: #0b1322; --muted: #4f5b70; --line: #d9dee7; --seal: #c8192d; --jade: #0a8f7a; --side: #f1f3f7; }
  * { box-sizing: border-box; }
  html, body { margin: 0; }
  body { font: 400 8.9pt/1.45 "Be Vietnam Pro", "Segoe UI", Arial, sans-serif; color: var(--ink); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  /* Nền cột trái lặp lại trên mọi trang khi in */
  /* Mỗi trang là một khung A4 riêng: nội dung dài hơn sẽ đẩy ra trang thứ 3, dễ phát hiện khi kiểm tra */
  .page { position: relative; display: grid; grid-template-columns: 64mm 1fr; width: 210mm; height: 297mm; overflow: hidden; break-after: page; }
  .page:last-child { break-after: auto; }
  .page::before { content: ""; position: absolute; inset: 0 0 auto 0; height: 2.2mm; background: linear-gradient(90deg, var(--seal), var(--seal) 64mm, var(--jade)); }
  aside { padding: 12mm 7mm 8mm 8mm; background: var(--side); }
  main { padding: 12mm 12mm 8mm 9mm; }
  a { color: inherit; text-decoration: none; }
  h1, h2, h3, h4, p { margin: 0; }
  .mono { font-family: "JetBrains Mono", Consolas, monospace; font-size: 7.4pt; letter-spacing: .02em; }
  .strong { font-weight: 600; }

  .photo { position: relative; width: 28mm; height: 28mm; margin: 0 auto 3mm; }
  .photo .ring { position: absolute; inset: 0; border-radius: 50%; border: 0.9mm double var(--seal); }
  .photo img, .photo .mono-fallback { position: absolute; inset: 2.2mm; width: calc(100% - 4.4mm); height: calc(100% - 4.4mm); border-radius: 50%; object-fit: cover; background: #dfe7f0; }
  .photo .mono-fallback { display: grid; place-items: center; font: 800 16pt "Be Vietnam Pro"; color: var(--muted); }

  aside h2 { font: 700 7.6pt "JetBrains Mono", monospace; letter-spacing: .16em; text-transform: uppercase; color: var(--seal); margin: 5mm 0 2.2mm; display: flex; align-items: center; gap: 2mm; }
  aside h2::after { content: ""; flex: 1; height: 0.25mm; background: var(--line); }
  .contacts { list-style: none; padding: 0; margin: 0; display: grid; gap: 1.4mm; }
  .contacts li { display: grid; grid-template-columns: 4.2mm 1fr; gap: 2mm; align-items: start; font-size: 7.9pt; overflow-wrap: break-word; }
  .contacts svg { width: 3.8mm; height: 3.8mm; color: var(--seal); margin-top: 0.2mm; }
  .skill { margin-bottom: 2.1mm; break-inside: avoid; }
  .skill h4 { font-size: 8.2pt; font-weight: 700; margin-bottom: 1.2mm; }
  .skill p { display: flex; flex-wrap: wrap; gap: 1.1mm; }
  .skill span { font-size: 7.1pt; padding: 0.45mm 1.5mm; border-radius: 3mm; background: #fff; border: 0.25mm solid var(--line); white-space: nowrap; }
  .edu { margin-bottom: 2.6mm; break-inside: avoid; }
  .edu .mono { color: var(--seal); }
  .edu p:last-child { color: var(--muted); font-size: 8pt; }
  .dots { margin: 0; padding-left: 3.6mm; display: grid; gap: 0.8mm; }
  .dots li::marker { color: var(--seal); }
  aside .dots { font-size: 8pt; }

  header.top { display: flex; justify-content: space-between; align-items: flex-start; gap: 6mm; padding-bottom: 4mm; border-bottom: 0.3mm solid var(--line); }
  h1 { font-size: 26pt; font-weight: 800; letter-spacing: -0.02em; line-height: 1.1; }
  h1 em { font-style: normal; color: var(--seal); }
  .title { margin-top: 1.6mm; font: 600 10pt "Be Vietnam Pro"; color: var(--muted); }
  .seal { flex: none; width: 19mm; height: 19mm; border-radius: 50%; border: 0.8mm double var(--seal); color: var(--seal); display: grid; place-items: center; font: 800 9pt "Be Vietnam Pro"; transform: rotate(-12deg); }
  main h2 { font: 700 8pt "JetBrains Mono", monospace; letter-spacing: .16em; text-transform: uppercase; color: var(--seal); margin: 5mm 0 2.4mm; display: flex; align-items: center; gap: 2.5mm; }
  main h2::after { content: ""; flex: 1; height: 0.25mm; background: var(--line); }
  .summary { font-size: 9.2pt; line-height: 1.55; }

  .job { margin-bottom: 4.2mm; }
  .job > header { display: flex; justify-content: space-between; gap: 4mm; align-items: baseline; break-after: avoid; }
  .job h3 { font-size: 10.6pt; font-weight: 700; }
  .role { color: var(--seal); font-weight: 600; font-size: 8.8pt; }
  .period { font: 700 7.6pt "JetBrains Mono", monospace; color: var(--muted); white-space: nowrap; }
  .intro { margin: 1.4mm 0 2mm; color: var(--muted); }
  .project { border-left: 0.6mm solid var(--jade); padding: 0.4mm 0 0.4mm 3mm; margin: 0 0 2.6mm; break-inside: avoid; }
  .p-head { display: flex; gap: 2.4mm; align-items: baseline; margin-bottom: 1mm; }
  .p-head b { font-size: 9.6pt; }
  .p-head span { color: var(--muted); font-size: 8.2pt; }
  .stack { margin-top: 1.2mm; font-size: 7.6pt; color: var(--muted); }
  .stack span { font-weight: 700; color: var(--ink); }
  .products { width: 100%; border-collapse: collapse; font-size: 8.2pt; break-inside: avoid; }
  .products td { padding: 0.9mm 1.5mm 0.9mm 0; border-bottom: 0.2mm dashed var(--line); vertical-align: top; }
  .products td.mono { color: var(--jade); text-align: right; white-space: nowrap; }
  .integrity { background: #f6f8fb; border: 0.3mm solid var(--line); border-radius: 2.5mm; padding: 3mm 4mm; break-inside: avoid; }
  .integrity .dots { gap: 1mm; }
  footer { margin-top: 4mm; font: 500 7pt "JetBrains Mono", monospace; color: var(--muted); display: flex; justify-content: space-between; }
</style>
</head>
<body>
<section class="page">
  <aside>
    <div class="photo"><span class="ring"></span><img src="${CV.avatar}" alt="" onerror="this.outerHTML='<span class=&quot;mono-fallback&quot;>NVH</span>'"></div>
    <h2>${L.contact}</h2>
    <ul class="contacts">${contacts}</ul>
    <h2>${L.skills}</h2>
    ${skillHtml(CV.skills.slice(0, 5))}
  </aside>
  <main>
    <header class="top">
      <div>
        <h1>${esc('Nguyễn Văn')} <em>${esc('Hòa')}</em></h1>
        <p class="title">${T(CV.title)}</p>
      </div>
      <div class="seal">NVH</div>
    </header>
    <h2>${L.profile}</h2>
    <p class="summary">${T(CV.summary)}</p>
    <h2>${T(CV.integrity.title)}</h2>
    <div class="integrity">${list(CV.integrity.items)}</div>
    <h2>${L.experience}</h2>
    ${jobHtml(CV.jobs.slice(0, 1))}
  </main>
</section>
<section class="page">
  <aside>
    <h2 style="margin-top:0">${L.skills}</h2>
    ${skillHtml(CV.skills.slice(5))}
    <h2>${L.education}</h2>
    ${education}
    <h2>${L.soft}</h2>
    ${list(CV.soft)}
    <h2>${L.languages}</h2>
    ${list(CV.languages)}
  </aside>
  <main>
    <h2 style="margin-top:0">${L.experienceCont}</h2>
    ${jobHtml(CV.jobs.slice(1))}
    <h2>${L.personal}</h2>
    ${personal}
    <footer><span>${esc(CV.name)} · CV</span><span>${L.updated}</span></footer>
  </main>
</section>
</body>
</html>`;
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    join(process.env.LOCALAPPDATA ?? '', 'Google\\Chrome\\Application\\chrome.exe'),
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean);
  return candidates.find((p) => existsSync(p));
}

const chrome = findChrome();
if (!chrome) {
  console.error('Không tìm thấy Chrome/Edge; đặt biến CHROME_PATH rồi chạy lại.');
  process.exit(1);
}

for (const lang of ['vi', 'en']) {
  const html = resolve(outDir, `cv-${lang}.html`);
  const pdf = resolve(outDir, `CV-Nguyen-Van-Hoa-${lang.toUpperCase()}.pdf`);
  writeFileSync(html, render(lang));
  execFileSync(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    '--run-all-compositor-stages-before-draw',
    '--virtual-time-budget=15000',
    `--print-to-pdf=${pdf}`,
    pathToFileURL(html).href,
  ], { stdio: 'ignore' });
  copyFileSync(pdf, join(publicDir, `CV-Nguyen-Van-Hoa-${lang.toUpperCase()}.pdf`));
  console.log(`✓ ${pdf} → public/cv`);
}

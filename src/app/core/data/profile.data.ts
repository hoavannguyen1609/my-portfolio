import {
  LucideAudioLines,
  LucideBot,
  LucideCake,
  LucideDatabase,
  LucideFileStack,
  LucideFingerprint,
  LucideGitBranch,
  LucideHeartPulse,
  LucideLandmark,
  LucideLayoutDashboard,
  LucideListChecks,
  LucideMail,
  LucideMapPin,
  LucideMessageCircle,
  LucidePalette,
  LucidePhone,
  LucidePlane,
  LucideScale,
  LucideServer,
  LucideShoppingBag,
  LucideUsers,
  LucideWrench,
  LucideCalendar,
} from '@lucide/angular';
import {
  CaseStudy,
  ContactItem,
  Education,
  Job,
  NavItem,
  Note,
  Project,
  ProjectKind,
  SkillGroup,
  Stat,
  Txt,
} from '../models';

export const PROFILE = {
  name: 'Nguyễn Văn Hòa',
  short: 'Văn Hòa',
  initials: 'NVH',
  email: 'hoavannguyen1609@gmail.com',
  phone: '+84 876 160 901',
  phoneHref: 'tel:+84876160901',
  zalo: 'https://zalo.me/+84941470529',
  gitlab: 'https://gitlab.com/NguyenVanHoa160901',
  cv: 'https://www.canva.com/design/DAG1Hhk44VU/13gqOd_T-GT_GzKYeFkGwQ/edit?utm_content=DAG1Hhk44VU&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton',
  /** Ảnh đại diện: đặt file vào public/images/avatar.png để dùng ảnh trong repo */
  avatar: 'https://hoavannguyen1609.github.io/my-portfolio/images/25c92c7dcbe2b7f083afc19457d07fd9_2-removebg-preview.png',
};

export const NAV: NavItem[] = [
  { id: 'about', label: { vi: 'Về tôi', en: 'About' } },
  { id: 'skills', label: { vi: 'Năng lực', en: 'Skills' } },
  { id: 'experience', label: { vi: 'Kinh nghiệm', en: 'Experience' } },
  { id: 'work', label: { vi: 'Dự án', en: 'Work' } },
  { id: 'notes', label: { vi: 'Ghi chép', en: 'Notes' } },
  { id: 'contact', label: { vi: 'Liên hệ', en: 'Contact' } },
];

export const HERO = {
  eyebrow: { vi: 'Hồ sơ năng lực · Hà Nội, Việt Nam', en: 'Portfolio · Hanoi, Vietnam' } as Txt,
  roles: [
    'Backend Developer',
    'Java · Spring Boot',
    'Microservices · Kafka',
    'Elasticsearch · MySQL',
    'Frontend Team Lead',
  ],
  lead: {
    vi: 'Tôi xây phần lõi cho các hệ thống chính phủ số: văn bản đi đúng luồng, hồ sơ thi hành án khớp từng khoản tiền, bản tin liên thông tới đúng nơi nhận.',
    en: 'I build the core of digital-government systems: documents that follow the right workflow, enforcement records that reconcile every payment, messages that reach the right recipient.',
  } as Txt,
  ctaWork: { vi: 'Xem dự án', en: 'See my work' } as Txt,
  ctaContact: { vi: 'Liên hệ ngay', en: 'Get in touch' } as Txt,
  cv: { vi: 'Sơ yếu lý lịch', en: 'Résumé' } as Txt,
  scroll: { vi: 'Cuộn xuống', en: 'Scroll' } as Txt,
  available: { vi: 'Đang làm Backend tại FPT IS', en: 'Backend at FPT IS' } as Txt,
};

export const STATS: Stat[] = [
  { value: 4, suffix: '+', label: { vi: 'năm làm phần mềm', en: 'years building software' } },
  { value: 1900, suffix: '+', label: { vi: 'commit tại FPT IS', en: 'commits at FPT IS' } },
  { value: 12, suffix: '', label: { vi: 'dự án thực tế', en: 'shipped projects' } },
];

export const SLIP = {
  kind: { vi: 'Phiếu trình hồ sơ', en: 'Submission slip' } as Txt,
  number: 'Số: 1609/HS-NVH',
  fields: [
    { k: { vi: 'Trích yếu', en: 'Subject' }, v: { vi: 'Hồ sơ năng lực Backend', en: 'Backend developer profile' } },
    { k: { vi: 'Người trình', en: 'Submitted by' }, v: 'Nguyễn Văn Hòa' },
    { k: { vi: 'Chuyên môn', en: 'Core stack' }, v: 'Spring Boot · Kafka · ES' },
  ] as { k: Txt; v: Txt }[],
  flow: [
    { vi: 'Soạn thảo', en: 'Drafted' },
    { vi: 'Trình ký', en: 'Submitted' },
    { vi: 'Ký số', en: 'Digitally signed' },
    { vi: 'Đóng dấu & ban hành', en: 'Stamped & issued' },
    { vi: 'Gửi trục liên thông', en: 'Sent to national axis' },
  ] as Txt[],
  seal: { vi: 'ĐÃ BAN HÀNH · NGUYỄN VĂN HÒA · ', en: 'ISSUED · NGUYEN VAN HOA · ISSUED · ' } as Txt,
};

export const MARQUEE: string[] = [
  'Java', 'Spring Boot', 'Kafka', 'Elasticsearch', 'MySQL', 'Redis', 'QueryDSL', 'Liquibase',
  'Microservices', 'JHipster', 'OpenFeign', 'AWS S3', 'Docker', 'Angular', 'React', 'Next.js',
  'TypeScript', 'NestJS', 'Node.js', 'Tailwind CSS',
];

export const ABOUT = {
  label: { vi: 'Về tôi', en: 'About' } as Txt,
  title: { vi: 'Từ giao diện người dùng tới phần lõi hệ thống.', en: 'From the user interface down to the system core.' } as Txt,
  statement: {
    vi: 'Tôi bắt đầu với Frontend, dẫn dắt đội Frontend tại 84Soft cho các sản phẩm thương mại điện tử, xác thực và AI, rồi chuyển trọng tâm sang Backend tại FPT IS. Hiện tôi phát triển hệ thống quản lý văn bản, phân công công việc và hồ sơ thi hành án dân sự trên kiến trúc microservice. Tôi quan tâm nhất tới những phần dễ sai: giao dịch, đồng bộ giữa các service và tích hợp với hệ thống bên ngoài.',
    en: 'I started in frontend and led the frontend team at 84Soft on e-commerce, authentication and AI products, then moved my focus to backend at FPT IS. Today I build document-management, task-assignment and civil-enforcement systems on a microservice stack. I care most about the parts that break easily: transactions, cross-service sync and integrations with external systems.',
  } as Txt,
  extra: {
    vi: 'Tôi làm việc tự giác, thích viết tài liệu bàn giao rõ ràng cho đồng đội Frontend và kiểm thử, và luôn đo trước khi tối ưu.',
    en: 'I own my work, write clear hand-over notes for frontend and QA colleagues, and measure before I optimise.',
  } as Txt,
};

export const CONTACTS: ContactItem[] = [
  { icon: LucideCalendar, label: { vi: 'Ngày sinh', en: 'Born' }, value: '16/09/2001' },
  { icon: LucidePhone, label: { vi: 'Điện thoại', en: 'Phone' }, value: PROFILE.phone, href: PROFILE.phoneHref, copy: true },
  { icon: LucideMail, label: 'Email', value: PROFILE.email, href: `mailto:${PROFILE.email}`, copy: true },
  {
    icon: LucideMapPin,
    label: { vi: 'Địa chỉ', en: 'Address' },
    value: { vi: 'Phố Trung Kính, phường Yên Hòa, Hà Nội', en: 'Trung Kinh St., Yen Hoa Ward, Hanoi' },
    href: 'https://maps.app.goo.gl/C5LgxA1A9v5GsRiy5',
  },
  { icon: LucideMessageCircle, label: 'Zalo', value: '+84 941 470 529', href: PROFILE.zalo },
  { icon: LucideGitBranch, label: 'GitLab', value: 'NguyenVanHoa160901', href: PROFILE.gitlab },
];

export const SKILLS_HEAD = {
  label: { vi: 'Năng lực', en: 'Skills' } as Txt,
  title: { vi: 'Bộ công cụ tôi dùng hằng ngày', en: 'The toolkit I use every day' } as Txt,
  note: { vi: 'Thẻ phát sáng là công nghệ dùng trong công việc hiện tại.', en: 'Glowing chips are what I use in my current role.' } as Txt,
};

export const SKILLS: SkillGroup[] = [
  {
    icon: LucideServer,
    title: 'Backend',
    code: 'server',
    wide: true,
    items: ['Java', 'Spring Boot', 'JPA / Hibernate', 'QueryDSL', 'Microservices', 'JHipster', 'Liquibase', 'OpenFeign · OAuth2', 'RESTful API', 'Kotlin', 'Node.js', 'NestJS', 'Express.js', 'PHP · Laravel', 'JWT', 'WebSocket'],
    hot: ['Java', 'Spring Boot', 'JPA / Hibernate', 'QueryDSL', 'Microservices', 'JHipster', 'Liquibase', 'OpenFeign · OAuth2', 'RESTful API'],
  },
  {
    icon: LucideDatabase,
    title: { vi: 'Dữ liệu & tích hợp', en: 'Data & integration' },
    code: 'data',
    items: ['Kafka', 'Elasticsearch', 'MySQL', 'Redis', 'AWS S3', 'Oracle', 'PostgreSQL', 'Firebase', 'Socket.IO', 'OpenAI API'],
    hot: ['Kafka', 'Elasticsearch', 'MySQL', 'Redis', 'AWS S3'],
  },
  {
    icon: LucideLayoutDashboard,
    title: 'Frontend',
    code: 'client',
    items: ['TypeScript', 'JavaScript', 'React', 'Next.js', 'Angular', 'Vue', 'Redux Toolkit', 'RTK Query', 'Ant Design', 'MUI', 'Tailwind CSS', 'SCSS', 'Bootstrap', 'HTML5', 'CSS3'],
    hot: [],
  },
  {
    icon: LucideWrench,
    title: { vi: 'Công cụ', en: 'Tooling' },
    code: 'ops',
    items: ['Git', 'GitLab', 'Docker', 'Postman', 'Swagger', 'Jira', 'SourceTree', 'TortoiseSVN', 'Figma'],
    hot: ['Git', 'GitLab', 'Docker', 'Postman'],
  },
  {
    icon: LucideUsers,
    title: { vi: 'Cách làm việc', en: 'Ways of working' },
    code: 'team',
    items: [
      { vi: 'Phân tích & ước tính', en: 'Analysis & estimation' },
      { vi: 'Phân bổ công việc', en: 'Task allocation' },
      { vi: 'Dẫn dắt đội Frontend', en: 'Frontend team lead' },
      { vi: 'Làm việc nhóm', en: 'Teamwork' },
      { vi: 'Giải quyết vấn đề', en: 'Problem solving' },
      { vi: 'Tự giác', en: 'Self-driven' },
      { vi: 'Ham học hỏi', en: 'Eager to learn' },
      { vi: 'Tiếng Anh cơ bản', en: 'Basic English' },
    ],
    hot: [],
  },
];

export const EXPERIENCE_HEAD = {
  label: { vi: 'Kinh nghiệm', en: 'Experience' } as Txt,
  title: { vi: 'Hành trình nghề nghiệp', en: 'Career path' } as Txt,
  current: { vi: 'Hiện tại', en: 'Current' } as Txt,
};

export const JOBS: Job[] = [
  {
    period: { vi: '10/2025 – nay', en: '10/2025 – now' },
    current: true,
    company: 'Công ty TNHH FPT IS',
    role: { vi: 'Full-Stack Developer · trọng tâm Backend', en: 'Full-Stack Developer · backend focus' },
    items: [
      { vi: 'Phát triển và duy trì các hệ thống lõi eDLM, eTask, THADS-eTCTHA trên kiến trúc microservice Spring Boot.', en: 'Build and maintain the core systems eDLM, eTask and THADS-eTCTHA on a Spring Boot microservice architecture.' },
      { vi: 'Thiết kế luồng đồng bộ giữa các service qua Kafka (outbox, saga, consumer group riêng) và kết nối Trục liên thông văn bản quốc gia.', en: 'Design cross-service sync over Kafka (outbox, saga, dedicated consumer groups) and the link to the national document-interconnection axis.' },
      { vi: 'Đề xuất giải pháp: tách service liên thông riêng, chuẩn hoá truy vấn bằng QueryDSL, chuẩn bị dữ liệu cho sharding.', en: 'Propose solutions: a dedicated interconnection service, QueryDSL-only queries, sharding-ready data access.' },
      { vi: 'Cải thiện hiệu năng tìm kiếm Elasticsearch, bảo vệ thread pool khi chờ dịch vụ ngoài phản hồi chậm.', en: 'Improve Elasticsearch search performance and protect thread pools against slow external services.' },
    ],
  },
  {
    period: '03/2022 – 05/2025',
    company: 'Công ty Cổ phần Công nghệ và Đầu tư 84Soft',
    role: 'Full-Stack Developer / Frontend Team Lead',
    items: [
      { vi: 'Phân tích, phát triển và duy trì các ứng dụng web phức tạp.', en: 'Analysed, built and maintained complex web applications.' },
      { vi: 'Tham gia phát triển backend, đảm bảo tích hợp liền mạch với frontend.', en: 'Contributed to the backend and kept it seamlessly integrated with the frontend.' },
      { vi: 'Dẫn dắt đội Frontend: quản lý, phân công công việc, tối ưu quy trình.', en: 'Led the frontend team: planning, task allocation, process improvements.' },
      { vi: 'Đề xuất giải pháp kỹ thuật cho tính năng mới, cải thiện hiệu suất ứng dụng.', en: 'Proposed technical solutions for new features and improved app performance.' },
    ],
  },
  {
    period: '07/2024 – 09/2024',
    company: 'Công ty Cổ phần Giải pháp Công nghệ thông tin quốc tế',
    role: { vi: 'Onsite · Frontend Developer', en: 'Onsite · Frontend Developer' },
    items: [
      { vi: 'Phát triển ứng dụng web với giao diện thân thiện, hiệu quả.', en: 'Built web apps with friendly, efficient interfaces.' },
      { vi: 'Phối hợp chặt với đội backend để tích hợp API chính xác.', en: 'Worked closely with the backend team on accurate API integration.' },
    ],
  },
];

export const WORK_HEAD = {
  label: { vi: 'Dự án tại FPT IS', en: 'Work at FPT IS' } as Txt,
  title: { vi: 'Hệ thống chính phủ số', en: 'Digital-government systems' } as Txt,
  note: { vi: 'Số commit đếm bằng git log theo tài khoản của tôi, tới 17/10/2026.', en: 'Commit counts from git log for my accounts, as of 17 Oct 2026.' } as Txt,
  diagramCaption: {
    vi: 'Service lõi eDLM phát lệnh qua Kafka; eclm-sub đồng bộ sang eTask, vdxp lo gói tin với Trục liên thông văn bản quốc gia.',
    en: 'The eDLM core publishes over Kafka; eclm-sub syncs to eTask while vdxp handles packages with the national interconnection axis.',
  } as Txt,
};

export const CASES: CaseStudy[] = [
  {
    id: 'edlm',
    index: '01',
    icon: LucideFileStack,
    name: 'eDLM',
    summary: { vi: 'Hệ thống quản lý vòng đời văn bản', en: 'Document lifecycle management' },
    tags: ['FIS · BIT', 'Backend Developer'],
    items: [
      { title: { vi: 'Văn bản đi', en: 'Outgoing documents' }, text: { vi: 'Trình ký, ký số, đóng dấu, ban hành và ban hành bổ sung, thu hồi trong cùng luồng, ký thừa lệnh, gỡ chữ ký của một người ký.', en: 'Submission, digital signing, stamping, issuance and supplementary issuance, in-flow recall, signing on behalf, removing one signer.' } },
      { title: { vi: 'Văn bản đến', en: 'Incoming documents' }, text: { vi: 'Tiếp nhận theo phòng ban, kiểm tra trùng và gộp, quét QR/OCR bản giấy qua dịch vụ AI.', en: 'Department-level reception, duplicate detection and merge, QR/OCR scanning through an AI service.' } },
      { title: { vi: 'Liên thông quốc gia', en: 'National interconnection' }, text: { vi: 'Dựng và đọc gói edXML, phản hồi trạng thái, theo dõi và gửi lại theo từng nơi nhận, thống kê liên thông.', en: 'Build and parse edXML packages, status feedback, per-recipient tracking and resend, statistics.' } },
      { title: { vi: 'Tách service vdxp', en: 'vdxp service split' }, text: { vi: 'Chuyển nghiệp vụ trục sang service riêng, giao tiếp Kafka command/event theo từng phân hệ.', en: 'Moved axis logic into its own service, talking over Kafka commands/events per subsystem.' } },
    ],
    metrics: [
      { value: 845, label: { vi: 'commit eclm', en: 'commits · eclm' } },
      { value: 353, label: { vi: 'commit eclm-sub', en: 'commits · eclm-sub' } },
    ],
    stack: ['Spring Boot', 'Kafka', 'Elasticsearch', 'MySQL', 'Liquibase', 'QueryDSL', 'AWS S3'],
    diagram: true,
  },
  {
    id: 'thads',
    index: '02',
    icon: LucideScale,
    name: 'THADS-eTCTHA',
    summary: { vi: 'Quản lý hồ sơ thi hành án dân sự', en: 'Civil judgment enforcement cases' },
    client: { vi: 'Đối tác: Bộ Tư pháp', en: 'Client: Ministry of Justice' },
    tags: ['FIS · BIT', 'Backend Developer'],
    items: [
      { title: { vi: 'Hồ sơ thi hành án', en: 'Enforcement cases' }, text: { vi: 'Hồ sơ, đương sự, nghiệp vụ thi hành, quan hệ giữa các hồ sơ, đánh số hồ sơ.', en: 'Cases, parties, enforcement operations, case relations and numbering.' } },
      { title: { vi: 'Dòng tiền thi hành án', en: 'Enforcement cash flow' }, text: { vi: 'Thu, chi, kê biên, tính tiền theo nghiệp vụ, lịch sử dòng tiền, yêu cầu hoàn trả.', en: 'Receipts, payments, seizures, per-operation amounts, history, refund requests.' } },
      { title: { vi: 'Xác minh đương sự', en: 'Party verification' }, text: { vi: 'Gọi dịch vụ dữ liệu dân cư (C06, VNeID) với executor riêng, timeout cứng, map lỗi rõ ràng.', en: 'Calls national population data services (C06, VNeID) on a dedicated executor with hard timeouts.' } },
      { title: { vi: 'Tích hợp ngoài', en: 'External integrations' }, text: { vi: 'Đồng bộ chứng từ MISA, biên lai điện tử, đấu giá tài sản, đối soát với bộ ngành, tìm kiếm Elasticsearch.', en: 'MISA document sync, e-receipts, asset auctions, ministry reconciliation, Elasticsearch search.' } },
    ],
    metrics: [{ value: 680, label: { vi: 'commit thads-tctha', en: 'commits · thads-tctha' } }],
    stack: ['Spring Boot', 'Microservices', 'Kafka', 'Redis', 'Elasticsearch', 'MySQL', 'AWS'],
  },
  {
    id: 'etask',
    index: '03',
    icon: LucideListChecks,
    name: 'eTask',
    summary: { vi: 'Quản lý phân công công việc', en: 'Task assignment system' },
    tags: ['FIS · BIT', { vi: 'Backend · tích hợp', en: 'Backend · integration' }],
    items: [
      { title: { vi: 'Sinh việc theo văn bản', en: 'Tasks from documents' }, text: { vi: 'Mỗi hành động trên văn bản (trình ký, chuyển xử lý, thu hồi, đổi luồng) tạo hoặc cập nhật dự án và việc bên eTask.', en: 'Each document action (submit, forward, recall, change workflow) creates or updates the eTask project and tasks.' } },
      { title: { vi: 'Đồng bộ tin cậy', en: 'Reliable sync' }, text: { vi: 'Outbox, lưu request/response từng bản tin, chỉ nhận kết quả thuộc eDLM, tách consumer group để không mất bản tin.', en: 'Outbox, stored request/response, ownership checks on inbound results, separate consumer groups.' } },
      { title: { vi: 'Cấu hình', en: 'Configuration' }, text: { vi: 'Cấu hình trạng thái theo phiên bản, gợi ý người phê duyệt việc tạo tay, quyền tạo dự án theo phòng ban.', en: 'Versioned status configuration, approver suggestions, per-department project permissions.' } },
    ],
    metrics: [],
    stack: ['Spring Boot', 'Kafka', 'MySQL', 'Elasticsearch', 'OpenFeign'],
  },
];

export const PROJECTS_HEAD = {
  label: { vi: 'Dự án trước đó', en: 'Earlier projects' } as Txt,
  title: { vi: 'Sản phẩm tại 84Soft', en: 'Products at 84Soft' } as Txt,
  filters: [
    { key: 'all', label: { vi: 'Tất cả', en: 'All' } },
    { key: 'ai', label: 'AI' },
    { key: 'fs', label: 'Full-stack' },
    { key: 'lead', label: { vi: 'Dẫn dắt Frontend', en: 'Frontend lead' } },
  ] as { key: 'all' | ProjectKind; label: Txt }[],
};

export const PROJECTS: Project[] = [
  { name: 'Reavol', icon: LucideShoppingBag, org: '84Soft · Reavol', role: 'Frontend Team Lead / Maintainer', description: { vi: 'Nền tảng thương mại điện tử nội dung số, xử lý lượng lớn dữ liệu và người dùng.', en: 'Digital-content e-commerce platform with large data and user volumes.' }, stack: 'React · Next · TypeScript · Spring Boot · Firebase · MySQL · AWS', kinds: ['lead'] },
  { name: 'CakeAI', icon: LucideBot, org: '84Soft', role: 'Full-stack Developer / Frontend Team Lead', description: { vi: 'Trợ lý AI đa năng, hỗ trợ thông minh trên nhiều nền tảng.', en: 'Multi-purpose AI assistant across platforms.' }, stack: 'React · Next · NestJS · Firebase · MySQL · Socket.IO · OpenAI API', kinds: ['ai', 'fs', 'lead'] },
  { name: 'MyID', icon: LucideFingerprint, org: '84Soft · InterITS', role: 'Full-stack Developer / Frontend Team Lead', description: { vi: 'Đăng nhập và xác thực người dùng dựa trên thông tin nhà cung cấp mạng.', en: 'Sign-in and authentication based on mobile-carrier data.' }, stack: 'React · Next · TypeScript · Spring Boot · MySQL · Firebase', kinds: ['fs', 'lead'] },
  { name: 'SmartQA', icon: LucideAudioLines, org: '84Soft · InterITS', role: 'Full-stack Developer / Frontend Team Lead', description: { vi: 'Phân tích nội dung tệp âm thanh, phát hiện dấu hiệu gian lận bằng AI.', en: 'Analyses audio recordings and flags fraud signals with AI.' }, stack: 'React · Next · TypeScript · Spring Boot · MySQL · OpenAI API', kinds: ['ai', 'fs', 'lead'] },
  { name: 'MeetLaw', icon: LucideLandmark, org: '84Soft', role: 'Frontend Team Lead', description: { vi: 'Nghiên cứu và kiểm tra kiến thức pháp luật qua tình huống thực tế.', en: 'Study and test legal knowledge through real cases.' }, stack: 'React · Next · TypeScript · Spring Boot · MySQL · OpenAI API', kinds: ['ai', 'lead'] },
  { name: 'Art Contest', icon: LucidePalette, org: '84Soft · Vifolac', role: 'Frontend Team Lead', description: { vi: 'Trang cuộc thi vẽ “Những chiến sĩ Điện Biên Phủ” cho cộng đồng.', en: 'Community drawing contest “The Soldiers of Dien Bien Phu”.' }, stack: 'React · Next · TypeScript · Spring Boot · MySQL', kinds: ['lead'] },
  { name: 'Vtbay', icon: LucidePlane, org: '84Soft · Viettel Post', role: 'Frontend Developer', description: { vi: 'Tìm kiếm và đặt vé máy bay.', en: 'Flight search and booking.' }, stack: 'React · Next · TypeScript · Spring Boot · MySQL · AWS', kinds: [] },
  { name: 'Vegiare', icon: LucideCake, org: '84Soft · VeGiare', role: 'Full-stack Maintainer', description: { vi: 'Tìm kiếm và đặt vé máy bay giá rẻ.', en: 'Low-cost flight search and booking.' }, stack: 'React · Next · TypeScript · Spring Boot · MySQL', kinds: ['fs'] },
  { name: 'HETEAC', icon: LucideHeartPulse, org: '84Soft · InterITS', role: 'Frontend Developer', description: { vi: 'Hệ thống chi trả của Viện Nghiên cứu Khoa học Sức khỏe, Hội Quân dân Y Việt Nam.', en: 'Payment system for the Health Science Research Institute, Vietnam Military-Civilian Medical Association.' }, stack: 'React · TypeScript · Spring Boot · PostgreSQL', kinds: [] },
];

export const NOTES_HEAD = {
  label: { vi: 'Ghi chép kỹ thuật', en: 'Engineering notes' } as Txt,
  title: { vi: 'Bài học từ hệ thống lớn', en: 'Lessons from large systems' } as Txt,
  codeCaption: { vi: 'Minh hoạ mẫu ghi sau commit, rút gọn từ cách làm trong eDLM.', en: 'The after-commit pattern, simplified from eDLM.' } as Txt,
};

export const NOTES: Note[] = [
  { topic: { vi: 'Giao dịch', en: 'Transactions' }, title: { vi: 'Ghi sau commit cần giao dịch riêng', en: 'After-commit writes need their own transaction' }, text: { vi: 'Listener afterCommit chạy khi giao dịch cũ đã đóng. Ghi nhật ký ở đó bằng REQUIRES_NEW, nếu không bản ghi mất mà không báo lỗi.', en: 'An afterCommit listener runs after the original transaction closed. Use REQUIRES_NEW there, or the row is silently lost.' } },
  { topic: { vi: 'Bản tin', en: 'Messaging' }, title: { vi: 'Không phát bản tin khi dữ liệu chưa chắc', en: 'Never publish before data is final' }, text: { vi: 'Đồng bộ eTask đi qua outbox: phát sau commit, lưu cả request lẫn response để đối soát và gửi lại.', en: 'eTask sync goes through an outbox: publish after commit, keep request and response for reconciliation.' } },
  { topic: { vi: 'Tìm kiếm', en: 'Search' }, title: { vi: 'Đọc ngay sau ghi thì đọc CSDL', en: 'Read-after-write hits the database' }, text: { vi: 'Index Elasticsearch làm mới sau khoảng 1 giây. Màn hình cần kết quả tức thì đọc MySQL; điều kiện lọc đặt trong filter.', en: 'Elasticsearch refreshes after about a second. Instant screens read MySQL; filters go in the filter clause.' } },
  { topic: { vi: 'Mở rộng', en: 'Scaling' }, title: { vi: 'Truy vấn sẵn sàng cho sharding', en: 'Sharding-ready queries' }, text: { vi: 'Mọi WHERE có khoá tenant, không JOIN chéo shard, danh sách IN chia lô tối đa 500 phần tử.', en: 'Every WHERE carries the tenant key, no cross-shard JOINs, IN lists chunked to 500.' } },
  { topic: { vi: 'Truy vấn', en: 'Queries' }, title: { vi: 'QueryDSL thay chuỗi JPQL', en: 'QueryDSL over string JPQL' }, text: { vi: 'Kiểm tra kiểu lúc biên dịch, tránh lỗi derived query như field orgIn bị hiểu thành từ khoá In.', en: 'Type-checked at compile time; avoids traps like a field named orgIn parsed as the In keyword.' } },
  { topic: { vi: 'Đồng thời', en: 'Concurrency' }, title: { vi: 'Dịch vụ chậm không được chặn web tier', en: 'Slow dependencies must not block the web tier' }, text: { vi: 'Dịch vụ xác minh có thể mất 15–120 giây: tách executor riêng, timeout cứng, trả thread Tomcat về pool sớm.', en: 'Verification can take 15–120 s: dedicated executor, hard timeouts, release Tomcat threads early.' } },
];

export const CODE_SAMPLE = `// Ghi nhật ký saga và phát bản tin chỉ sau khi giao dịch chính đã commit
TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
    @Override
    public void afterCommit() {
        sagaLogService.saveLogSagaInNewTransaction(sagaLog); // REQUIRES_NEW
        outboundSender.send(event);                          // không phát khi rollback
    }
});`;

export const EDUCATION_HEAD = {
  label: { vi: 'Học vấn', en: 'Education' } as Txt,
  title: { vi: 'Học liên tục', en: 'Always learning' } as Txt,
};

export const EDUCATION: Education[] = [
  { period: { vi: '05/2024 – nay', en: '05/2024 – now' }, school: 'Học viện Công nghệ Bưu chính Viễn thông (PTIT)', detail: { vi: 'Kỹ sư Kỹ thuật phần mềm · hệ eLearning', en: 'B.Eng. Software Engineering · eLearning' } },
  { period: '05/2021 – 11/2023', school: 'Fullstack Edu (F8)', detail: { vi: 'Full-stack Development · Học lập trình để đi làm', en: 'Full-stack Development · job-ready programming' } },
  { period: '08/2020 – 09/2022', school: 'Viện CNTT và Truyền thông ITPlus', detail: { vi: 'Full-stack Development · học qua dự án thực tế', en: 'Full-stack Development · project-based learning' } },
];

export const CONTACT_HEAD = {
  label: { vi: 'Liên hệ', en: 'Contact' } as Txt,
  big: { vi: 'Cùng làm cho đúng.', en: "Let's build it right." } as Txt,
  lead: { vi: 'Tôi sẵn sàng trao đổi về dự án Backend, tích hợp hệ thống hoặc cơ hội nghề nghiệp.', en: "I'm happy to talk about backend projects, system integration or career opportunities." } as Txt,
  copy: { vi: 'Sao chép', en: 'Copy' } as Txt,
  copied: { vi: 'Đã sao chép', en: 'Copied' } as Txt,
  backTop: { vi: 'Lên đầu trang', en: 'Back to top' } as Txt,
  built: { vi: 'Xây bằng Angular · Tailwind CSS · GSAP · Lenis', en: 'Built with Angular · Tailwind CSS · GSAP · Lenis' } as Txt,
};

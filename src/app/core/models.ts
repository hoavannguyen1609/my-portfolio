import type { LucideIconInput } from '@lucide/angular';

export type Lang = 'vi' | 'en';

/** Chuỗi song ngữ; chuỗi thường dùng chung cho cả hai ngôn ngữ. */
export type Txt = string | { vi: string; en: string };

export interface NavItem {
  id: string;
  label: Txt;
}

export interface Stat {
  value: number;
  suffix: string;
  label: Txt;
}

export interface ContactItem {
  icon: LucideIconInput;
  label: Txt;
  value: Txt;
  href?: string;
  copy?: boolean;
}

export interface SkillGroup {
  icon: LucideIconInput;
  title: Txt;
  code: string;
  items: Txt[];
  /** Công nghệ dùng trong công việc hiện tại */
  hot: string[];
  wide?: boolean;
}

export interface Job {
  period: Txt;
  current?: boolean;
  company: string;
  role: Txt;
  items: Txt[];
}

export interface CaseItem {
  title: Txt;
  text: Txt;
}

export interface CaseStudy {
  id: string;
  index: string;
  icon: LucideIconInput;
  name: string;
  summary: Txt;
  client?: Txt;
  tags: Txt[];
  items: CaseItem[];
  metrics: { value: number; label: Txt }[];
  stack: string[];
  diagram?: boolean;
}

export type ProjectKind = 'ai' | 'fs' | 'lead';

export interface Project {
  name: string;
  icon: LucideIconInput;
  org: string;
  role: Txt;
  description: Txt;
  stack: string;
  kinds: ProjectKind[];
}

export interface Note {
  topic: Txt;
  title: Txt;
  text: Txt;
}

export type IntegrationKind = 'national' | 'internal' | 'partner' | 'platform';

/** Một hệ thống bên ngoài đã tích hợp và các bảo đảm dữ liệu đi kèm. */
export interface Integration {
  id: string;
  name: Txt;
  short: Txt;
  kind: IntegrationKind;
  /** Hệ thống của tôi phía bên kia kết nối */
  hub: 'eDLM' | 'THADS';
  /** Chiều dữ liệu nhìn từ hub */
  direction: 'out' | 'in' | 'both';
  protocol: Txt;
  summary: Txt;
  guarantees: Txt[];
}

/** Một chốt trên đường đi của bản tin giữ cho dữ liệu không mất, không lệch. */
export interface IntegrityStep {
  title: Txt;
  mechanism: Txt;
  risk: Txt;
  tags: string[];
}

export interface CodeSample {
  file: string;
  caption: Txt;
  code: string;
}

export interface Education {
  id: string;
  school: string;
  /** Tên ngắn trên thước thời gian */
  short: string;
  logo: string;
  /** Tháng bắt đầu / kết thúc dạng YYYY-MM; end null = đang học */
  start: string;
  end: string | null;
  program: Txt;
  mode: Txt;
  credential?: Txt;
}

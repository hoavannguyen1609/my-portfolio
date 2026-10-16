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

export interface Education {
  period: Txt;
  school: string;
  detail: Txt;
}

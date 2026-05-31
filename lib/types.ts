/* ============================================================
   CareerOS — domain types
   ============================================================ */

export type JobStatus = "saved" | "applied" | "interview" | "offer" | "rejected";
export type JobSource = "LinkedIn" | "Indeed" | "Glassdoor" | "RSS";

export interface Company {
  color: string;
  loc: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  loc: string;
  remote: "Remote" | "Hybrid" | "On-site";
  type: string;
  salary: string;
  posted: string;
  source: JobSource;
  score: number;
  status: JobStatus;
  tailored: boolean;
  rationale: string;
  matched: string[];
  missing: string[];
  desc: string;
}

export interface Watcher {
  id: string;
  name: string;
  countries: string[];
  keywords: string[];
  types: string[];
  platforms: JobSource[];
  interval: string;
  nextRun: string;
  lastFound: number;
  active: boolean;
  total: number;
}

export interface Repo {
  id: string;
  name: string;
  desc: string;
  stars: string;
  lang: string;
  openIssues: number;
  color: string;
}

export interface Issue {
  id: string;
  repo: string;
  title: string;
  labels: string[];
  score: number;
  est: string;
  level: string;
  working: boolean;
  body: string;
  plan: string[];
  files: string[];
  progress?: number;
}

export type VerifyState = "verified" | "risky" | "unknown";
export type CrmStatus = "drafted" | "sent" | "replied" | "followed-up";

export interface HistoryEntry {
  t: string;
  date: string;
  tone?: "ai" | "info" | "success";
}

export interface Contact {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  verify: VerifyState;
  linkedin: boolean;
  status: CrmStatus;
  template: string;
  draft: string;
  history: HistoryEntry[];
}

export type SocialPlatform = "Twitter" | "LinkedIn" | "Instagram";

export interface SocialItem {
  id: string;
  platform: SocialPlatform;
  author: string;
  handle: string;
  time: string;
  keyword: string;
  verified: boolean;
  text: string;
  reply: string;
}

export interface CoachStat {
  label: string;
  value: string;
  delta: string;
  tone: string;
  spark: number[];
}

export interface SkillGap {
  skill: string;
  seen: number;
  have: boolean;
  resource: string | null;
}

export interface Nudge {
  text: string;
  done: number;
  total: number;
}

export interface Coach {
  insight: string;
  insightBody: string;
  stats: CoachStat[];
  appsOverTime: number[];
  matchTrend: number[];
  weekLabels: string[];
  skillGaps: SkillGap[];
  nudges: Nudge[];
  mockQuestions: string[];
}

export interface ActivityItem {
  id: string;
  type: string;
  icon: string;
  tone: string;
  text: string;
  detail: string;
  time: string;
}

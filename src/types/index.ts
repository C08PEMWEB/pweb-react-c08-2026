export type WorkMode = "Remote" | "Hybrid" | "Onsite";

export type ApplicationStatus =
  | "WISHLIST"
  | "APPLIED"
  | "SCREENING"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTED"
  | "GHOSTED";

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string; // ISO string
  message: string;
}

export interface Application {
  id: string;
  company: string;
  role: string;
  workMode: WorkMode;
  status: ApplicationStatus;
  requiredSkills: string[];
  cvVersion?: string;
  appliedDate?: string;
  interviewDateTime?: string; // Format: YYYY-MM-DDTHH:mm
  salaryOffer?: number;
  lastUpdatedAt: string; // ISO string
  checklist: ChecklistItem[];
  activityLogs: ActivityLog[];
}

export interface JobListing {
  id: number;
  title: string;
  company_name: string;
  category: string;
  candidate_required_location: string;
  salary: string;
  tags: string[];
}

// Shared UI & App State Contracts (untuk Anggota 1, 2, dan 3)
export type JobSource = "live" | "local";
export type ActiveTab = "explore" | "pipeline" | "comparator";
export type ThemeMode = "light" | "dark";
export type JobSortOption = "match-desc" | "match-asc" | "title-asc" | "company-asc";
export type MatchLevel = "high" | "medium" | "low";
export type SemanticTone = "success" | "warning" | "danger" | "primary" | "neutral";

export interface SkillMatchResult {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  level: MatchLevel;
}

export interface BackupData {
  version: 1;
  exportedAt: string;
  kaptenSkills: string[];
  applications: Application[];
}

export const STORAGE_KEYS = {
  APPLICATIONS: "aku-mw-magang:applications",
  SKILLS: "aku-mw-magang:kapten-skills",
  THEME: "aku-mw-magang:theme",
} as const;

export const DEFAULT_KAPTEN_SKILLS: string[] = [
  "React",
  "TypeScript",
  "CSS",
];

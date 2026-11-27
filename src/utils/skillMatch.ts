import type {
  Application,
  JobListing,
  MatchLevel,
  SemanticTone,
  SkillMatchResult,
  WorkMode,
} from "../types";

export function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

export function getMatchLevel(score: number): MatchLevel {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

export function getMatchTone(score: number): SemanticTone {
  if (score >= 70) return "success";
  if (score >= 40) return "warning";
  return "danger";
}

/**
 * Menghitung Skill Match Score (%) sebagai derived state (case-insensitive).
 * Rumus wajib: Math.round((jumlahCocok / totalRequired) * 100)
 */
export function calculateSkillMatch(
  requiredSkills: readonly string[],
  kaptenSkills: readonly string[],
): SkillMatchResult {
  const seen = new Set<string>();
  const cleanedRequired: string[] = [];

  for (const skill of requiredSkills) {
    const trimmed = skill.trim();
    const key = normalizeText(trimmed);
    if (trimmed.length > 0 && !seen.has(key)) {
      seen.add(key);
      cleanedRequired.push(trimmed);
    }
  }

  const kaptenSet = new Set(
    kaptenSkills.map((skill) => normalizeText(skill)).filter((s) => s.length > 0),
  );

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const skill of cleanedRequired) {
    if (kaptenSet.has(normalizeText(skill))) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  const score =
    cleanedRequired.length === 0
      ? 0
      : Math.round((matchedSkills.length / cleanedRequired.length) * 100);

  return {
    score,
    matchedSkills,
    missingSkills,
    level: getMatchLevel(score),
  };
}

/**
 * Aturan anti-duplikat lamaran:
 * Pasangan company + role yang sama tidak boleh dilamar dua kali (case-insensitive).
 */
export function isDuplicateApplication(
  applications: readonly Application[],
  company: string,
  role: string,
): boolean {
  const targetCompany = normalizeText(company);
  const targetRole = normalizeText(role);

  if (!targetCompany || !targetRole) return false;

  return applications.some(
    (app) =>
      normalizeText(app.company) === targetCompany &&
      normalizeText(app.role) === targetRole,
  );
}

/**
 * Menebak WorkMode dari teks lokasi lowongan (Remotive / dataset lokal).
 */
export function inferWorkMode(location: string): WorkMode {
  const lower = normalizeText(location);
  if (lower.includes("hybrid")) return "Hybrid";
  if (lower.includes("onsite") || lower.includes("on-site") || lower.includes("wfo")) {
    return "Onsite";
  }
  return "Remote";
}

/**
 * Membuat objek Application baru berstatus WISHLIST dari JobListing.
 */
export function createApplicationFromJob(job: JobListing): Application {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    company: job.company_name.trim(),
    role: job.title.trim(),
    workMode: inferWorkMode(job.candidate_required_location),
    status: "WISHLIST",
    requiredSkills: job.tags.map((tag) => tag.trim()).filter(Boolean),
    lastUpdatedAt: now,
    checklist: [],
    activityLogs: [
      {
        id: crypto.randomUUID(),
        timestamp: now,
        message: "Disimpan ke Wishlist dari Katalog Lowongan",
      },
    ],
  };
}

/**
 * Mengambil inisial 2 huruf perusahaan untuk emblem kartu lowongan.
 */
export function getCompanyInitials(companyName: string): string {
  const words = companyName
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  if (words.length === 0) return "AM";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

export interface SkillGapItem {
  skill: string;
  count: number;
}

/**
 * Derived state: menghitung missing skills yang paling sering diminta
 * oleh seluruh lamaran Kapten agar Kapten tahu prioritas skill yang perlu dipelajari.
 */
export function getTopMissingSkills(
  applications: readonly Application[],
  kaptenSkills: readonly string[],
  limit = 4,
): SkillGapItem[] {
  const kaptenSet = new Set(
    kaptenSkills.map((s) => normalizeText(s)).filter(Boolean),
  );
  const frequency = new Map<string, { label: string; count: number }>();

  for (const app of applications) {
    const seenInApp = new Set<string>();
    for (const rawSkill of app.requiredSkills) {
      const trimmed = rawSkill.trim();
      const key = normalizeText(trimmed);
      if (!key || kaptenSet.has(key) || seenInApp.has(key)) continue;
      seenInApp.add(key);

      const existing = frequency.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        frequency.set(key, { label: trimmed, count: 1 });
      }
    }
  }

  return Array.from(frequency.values())
    .sort((a, b) =>
      b.count !== a.count ? b.count - a.count : a.label.localeCompare(b.label),
    )
    .slice(0, limit)
    .map((item) => ({ skill: item.label, count: item.count }));
}

import type { Application } from "../types";

export const GHOSTING_THRESHOLD_DAYS = 14;
export const INTERVIEW_CONFLICT_MINUTES = 60;

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_DAY = 24 * 60 * MS_PER_MINUTE;

export interface InterviewConflict {
  first: Application;
  second: Application;
  diffMinutes: number;
}

/**
 * Menghitung jumlah hari sejak `lastUpdatedAt` (nilai pecahan untuk perbandingan > 14 hari).
 */
export function getElapsedDays(
  lastUpdatedAt: string,
  now: Date = new Date(),
): number {
  const updatedMs = Date.parse(lastUpdatedAt);
  if (Number.isNaN(updatedMs)) return 0;
  const diffMs = Math.max(0, now.getTime() - updatedMs);
  return diffMs / MS_PER_DAY;
}

/**
 * Menghitung jumlah hari bulat untuk ditampilkan di UI.
 */
export function getDaysSinceUpdate(
  lastUpdatedAt: string,
  now: Date = new Date(),
): number {
  return Math.floor(getElapsedDays(lastUpdatedAt, now));
}

/**
 * Aturan Rawan Ghosting:
 * Status APPLIED atau SCREENING dengan `lastUpdatedAt` > 14 hari dari waktu sekarang.
 */
export function isRawanGhosting(
  application: Application,
  now: Date = new Date(),
): boolean {
  if (application.status !== "APPLIED" && application.status !== "SCREENING") {
    return false;
  }
  return getElapsedDays(application.lastUpdatedAt, now) > GHOSTING_THRESHOLD_DAYS;
}

/**
 * Menghitung total lamaran yang masuk kategori Rawan Ghosting.
 */
export function countRawanGhosting(
  applications: readonly Application[],
  now: Date = new Date(),
): number {
  return applications.filter((app) => isRawanGhosting(app, now)).length;
}

/**
 * Memundurkan `lastUpdatedAt` sebanyak `days` hari secara immutable
 * untuk kebutuhan pengujian "Simulasi +15 Hari".
 */
export function shiftLastUpdatedDays(
  lastUpdatedAt: string,
  days: number,
): string {
  const baseMs = Date.parse(lastUpdatedAt);
  const anchorMs = Number.isNaN(baseMs) ? Date.now() : baseMs;
  return new Date(anchorMs - days * MS_PER_DAY).toISOString();
}

/**
 * Mendeteksi bentrok jadwal interview:
 * >= 2 lamaran berstatus INTERVIEW yang selisih `interviewDateTime`-nya < 60 menit.
 * Dihitung dari seluruh data `applications` (lintas filter).
 */
export function findInterviewConflicts(
  applications: readonly Application[],
): InterviewConflict[] {
  const scheduledInterviews: Array<{ app: Application; timeMs: number }> = [];

  for (const app of applications) {
    if (app.status !== "INTERVIEW" || !app.interviewDateTime) continue;
    const timeMs = Date.parse(app.interviewDateTime);
    if (!Number.isNaN(timeMs)) {
      scheduledInterviews.push({ app, timeMs });
    }
  }

  scheduledInterviews.sort((a, b) => a.timeMs - b.timeMs);

  const conflicts: InterviewConflict[] = [];

  for (let i = 0; i < scheduledInterviews.length; i += 1) {
    for (let j = i + 1; j < scheduledInterviews.length; j += 1) {
      const firstItem = scheduledInterviews[i];
      const secondItem = scheduledInterviews[j];
      const diffMinutesExact =
        Math.abs(secondItem.timeMs - firstItem.timeMs) / MS_PER_MINUTE;

      if (diffMinutesExact < INTERVIEW_CONFLICT_MINUTES) {
        conflicts.push({
          first: firstItem.app,
          second: secondItem.app,
          diffMinutes: Math.round(diffMinutesExact),
        });
      }
    }
  }

  return conflicts;
}

/**
 * Mengembalikan Set ID lamaran yang terlibat bentrok jadwal interview.
 */
export function getConflictingApplicationIds(
  conflicts: readonly InterviewConflict[],
): Set<string> {
  const ids = new Set<string>();
  for (const conflict of conflicts) {
    ids.add(conflict.first.id);
    ids.add(conflict.second.id);
  }
  return ids;
}

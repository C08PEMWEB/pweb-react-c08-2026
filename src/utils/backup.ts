import type {
  ActivityLog,
  Application,
  ApplicationStatus,
  BackupData,
  ChecklistItem,
  CvDocument,
  WorkMode,
} from "../types";

const VALID_WORK_MODES: ReadonlySet<string> = new Set<WorkMode>([
  "Remote",
  "Hybrid",
  "Onsite",
]);

const VALID_STATUSES: ReadonlySet<string> = new Set<ApplicationStatus>([
  "WISHLIST",
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "GHOSTED",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isChecklistItem(value: unknown): value is ChecklistItem {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.text === "string" &&
    typeof value.done === "boolean"
  );
}

function isActivityLog(value: unknown): value is ActivityLog {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.timestamp === "string" &&
    typeof value.message === "string"
  );
}

function isApplication(value: unknown): value is Application {
  if (!isRecord(value)) return false;

  const hasRequiredStrings =
    typeof value.id === "string" &&
    typeof value.company === "string" &&
    typeof value.role === "string" &&
    typeof value.lastUpdatedAt === "string";

  if (!hasRequiredStrings) return false;
  if (typeof value.workMode !== "string" || !VALID_WORK_MODES.has(value.workMode)) {
    return false;
  }
  if (typeof value.status !== "string" || !VALID_STATUSES.has(value.status)) {
    return false;
  }
  if (!isStringArray(value.requiredSkills)) return false;
  if (!Array.isArray(value.checklist) || !value.checklist.every(isChecklistItem)) {
    return false;
  }
  if (!Array.isArray(value.activityLogs) || !value.activityLogs.every(isActivityLog)) {
    return false;
  }

  if (value.cvVersion !== undefined && typeof value.cvVersion !== "string") return false;
  if (value.appliedDate !== undefined && typeof value.appliedDate !== "string") return false;
  if (value.interviewDateTime !== undefined && typeof value.interviewDateTime !== "string") {
    return false;
  }
  if (value.salaryOffer !== undefined && typeof value.salaryOffer !== "number") return false;

  return true;
}

function isCvDocument(value: unknown): value is CvDocument {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.versionLabel === "string" &&
    typeof value.fileName === "string" &&
    typeof value.mimeType === "string" &&
    typeof value.sizeBytes === "number" &&
    typeof value.uploadedAt === "string" &&
    typeof value.dataUrl === "string" &&
    isStringArray(value.detectedSkills)
  );
}

export function createBackupPayload(
  kaptenSkills: string[],
  applications: Application[],
  cvVault: CvDocument[] = [],
): BackupData {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    kaptenSkills,
    applications,
    cvVault,
  };
}

export function downloadBackupJson(
  kaptenSkills: string[],
  applications: Application[],
  cvVault: CvDocument[] = [],
): void {
  const payload = createBackupPayload(kaptenSkills, applications, cvVault);
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const dateStamp = new Date().toISOString().slice(0, 10);
  anchor.href = url;
  anchor.download = `aku-mw-magang-backup-${dateStamp}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function parseBackupJson(rawText: string): BackupData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error("File bukan format JSON yang valid.");
  }

  if (!isRecord(parsed)) {
    throw new Error("Struktur file backup tidak sesuai.");
  }

  if (!isStringArray(parsed.kaptenSkills)) {
    throw new Error("Field 'kaptenSkills' tidak ditemukan atau tidak valid.");
  }

  if (!Array.isArray(parsed.applications) || !parsed.applications.every(isApplication)) {
    throw new Error("Field 'applications' tidak valid atau korup.");
  }

  const cvVault =
    Array.isArray(parsed.cvVault) && parsed.cvVault.every(isCvDocument)
      ? parsed.cvVault
      : undefined;

  return {
    version: 1,
    exportedAt:
      typeof parsed.exportedAt === "string"
        ? parsed.exportedAt
        : new Date().toISOString(),
    kaptenSkills: parsed.kaptenSkills.map((s) => s.trim()).filter(Boolean),
    applications: parsed.applications,
    cvVault,
  };
}

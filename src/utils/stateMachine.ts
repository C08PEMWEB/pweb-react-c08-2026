import type {
  ActivityLog,
  Application,
  ApplicationStatus,
  WorkMode,
} from "../types";

/**
 * Peta transisi status lamaran yang sah sesuai Diagram State Machine:
 * - WISHLIST -> APPLIED (wajib cvVersion & appliedDate)
 * - APPLIED -> SCREENING, REJECTED, GHOSTED
 * - SCREENING -> INTERVIEW (wajib interviewDateTime), REJECTED, GHOSTED
 * - INTERVIEW -> OFFER (wajib salaryOffer > 0 & workMode), REJECTED, GHOSTED
 * - GHOSTED -> SCREENING
 * - OFFER & REJECTED -> Final (tidak dapat berpindah ke status lain)
 */
export const ALLOWED_TRANSITIONS: Readonly<
  Record<ApplicationStatus, readonly ApplicationStatus[]>
> = {
  WISHLIST: ["APPLIED"],
  APPLIED: ["SCREENING", "REJECTED", "GHOSTED"],
  SCREENING: ["INTERVIEW", "REJECTED", "GHOSTED"],
  INTERVIEW: ["OFFER", "REJECTED", "GHOSTED"],
  GHOSTED: ["SCREENING"],
  OFFER: [],
  REJECTED: [],
};

const VALID_WORK_MODES: ReadonlySet<WorkMode> = new Set<WorkMode>([
  "Remote",
  "Hybrid",
  "Onsite",
]);

export interface StatusTransitionPayload {
  cvVersion?: string;
  appliedDate?: string;
  interviewDateTime?: string;
  salaryOffer?: number;
  workMode?: WorkMode;
}

export interface TransitionValidationResult {
  valid: boolean;
  error?: string;
}

export function getAllowedNextStatuses(
  currentStatus: ApplicationStatus,
): readonly ApplicationStatus[] {
  return ALLOWED_TRANSITIONS[currentStatus];
}

export function isFinalStatus(status: ApplicationStatus): boolean {
  return ALLOWED_TRANSITIONS[status].length === 0;
}

export function canTransitionStatus(
  from: ApplicationStatus,
  to: ApplicationStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/**
 * Memvalidasi apakah perpindahan status sah secara State Machine
 * beserta kelengkapan field kondisional yang diwajibkan.
 */
export function validateStatusTransition(
  currentStatus: ApplicationStatus,
  targetStatus: ApplicationStatus,
  payload: StatusTransitionPayload = {},
): TransitionValidationResult {
  if (currentStatus === targetStatus) {
    return {
      valid: false,
      error: `Lamaran sudah berada pada status ${currentStatus}.`,
    };
  }

  if (isFinalStatus(currentStatus)) {
    return {
      valid: false,
      error: `Status ${currentStatus} bersifat final dan tidak dapat diubah lagi.`,
    };
  }

  if (!canTransitionStatus(currentStatus, targetStatus)) {
    return {
      valid: false,
      error: `Transisi status dari ${currentStatus} ke ${targetStatus} tidak diizinkan.`,
    };
  }

  if (targetStatus === "APPLIED") {
    if (!payload.cvVersion || payload.cvVersion.trim().length === 0) {
      return {
        valid: false,
        error: "Versi CV wajib diisi saat memindahkan status ke APPLIED.",
      };
    }
    if (!payload.appliedDate || payload.appliedDate.trim().length === 0) {
      return {
        valid: false,
        error: "Tanggal melamar wajib diisi saat memindahkan status ke APPLIED.",
      };
    }
  }

  if (targetStatus === "INTERVIEW") {
    if (
      !payload.interviewDateTime ||
      payload.interviewDateTime.trim().length === 0
    ) {
      return {
        valid: false,
        error:
          "Jadwal interview (tanggal & jam) wajib diisi saat pindah ke INTERVIEW.",
      };
    }
    if (Number.isNaN(Date.parse(payload.interviewDateTime))) {
      return {
        valid: false,
        error: "Format tanggal & jam interview tidak valid.",
      };
    }
  }

  if (targetStatus === "OFFER") {
    if (
      typeof payload.salaryOffer !== "number" ||
      !Number.isFinite(payload.salaryOffer) ||
      payload.salaryOffer <= 0
    ) {
      return {
        valid: false,
        error: "Nominal gaji offer (> 0) wajib diisi saat pindah ke OFFER.",
      };
    }
    if (!payload.workMode || !VALID_WORK_MODES.has(payload.workMode)) {
      return {
        valid: false,
        error: "Mode kerja wajib dipilih saat pindah ke OFFER.",
      };
    }
  }

  return { valid: true };
}

/**
 * Menerapkan transisi status secara immutable dan mencatat ActivityLog otomatis.
 * Melempar Error jika transisi tidak valid.
 */
export function applyStatusTransition(
  application: Application,
  targetStatus: ApplicationStatus,
  payload: StatusTransitionPayload = {},
): Application {
  const mergedPayload: StatusTransitionPayload = {
    cvVersion: payload.cvVersion ?? application.cvVersion,
    appliedDate: payload.appliedDate ?? application.appliedDate,
    interviewDateTime:
      payload.interviewDateTime ?? application.interviewDateTime,
    salaryOffer: payload.salaryOffer ?? application.salaryOffer,
    workMode: payload.workMode ?? application.workMode,
  };

  const validation = validateStatusTransition(
    application.status,
    targetStatus,
    mergedPayload,
  );

  if (!validation.valid) {
    throw new Error(validation.error ?? "Transisi status tidak valid.");
  }

  const now = new Date().toISOString();
  const logEntry: ActivityLog = {
    id: crypto.randomUUID(),
    timestamp: now,
    message: `Status berubah: ${application.status} → ${targetStatus}`,
  };

  const nextApplication: Application = {
    ...application,
    status: targetStatus,
    lastUpdatedAt: now,
    activityLogs: [...application.activityLogs, logEntry],
  };

  if (targetStatus === "APPLIED" && mergedPayload.cvVersion && mergedPayload.appliedDate) {
    nextApplication.cvVersion = mergedPayload.cvVersion.trim();
    nextApplication.appliedDate = mergedPayload.appliedDate.trim();
  }

  if (targetStatus === "INTERVIEW" && mergedPayload.interviewDateTime) {
    nextApplication.interviewDateTime = mergedPayload.interviewDateTime.trim();
  }

  if (
    targetStatus === "OFFER" &&
    mergedPayload.salaryOffer !== undefined &&
    mergedPayload.workMode
  ) {
    nextApplication.salaryOffer = mergedPayload.salaryOffer;
    nextApplication.workMode = mergedPayload.workMode;
  }

  return nextApplication;
}

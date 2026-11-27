import { useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRightLeft,
  ArrowUpDown,
  CalendarClock,
  CalendarPlus,
  Check,
  CheckSquare,
  Clock,
  Compass,
  Eye,
  FileText,
  Filter,
  Ghost,
  Plus,
  Search,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import type {
  Application,
  ApplicationStatus,
  CvDocument,
  WorkMode,
} from "../../types";
import { formatIdrInput, parseIdrInput } from "../../utils/currency";
import {
  getDaysSinceUpdate,
  isRawanGhosting,
} from "../../utils/scheduleChecker";
import {
  calculateSkillMatch,
  getCompanyInitials,
  getMatchTone,
  normalizeText,
} from "../../utils/skillMatch";
import {
  getAllowedNextStatuses,
  isFinalStatus,
  validateStatusTransition,
  type StatusTransitionPayload,
} from "../../utils/stateMachine";
import {
  APPLICATION_STATUS_LABELS,
  Badge,
  getStatusBadgeTone,
} from "../ui/Badge";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

export type PipelineSortOption = "newest" | "interview-asc" | "offer-desc";

interface PipelineViewProps {
  applications: Application[];
  kaptenSkills: string[];
  cvVault: readonly CvDocument[];
  conflictingIds: ReadonlySet<string>;
  onOpenManualForm: () => void;
  onGoToExplore: () => void;
  onOpenDetail: (id: string) => void;
  onSimulateGhosting: (id: string) => void;
  onDeleteApplication: (id: string) => void;
  onDownloadIcs: (app: Application) => void;
  onTransitionStatus: (
    id: string,
    targetStatus: ApplicationStatus,
    payload?: StatusTransitionPayload,
  ) => void;
}

const ALL_STATUSES: readonly ApplicationStatus[] = [
  "WISHLIST",
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "GHOSTED",
];

function formatCurrencyIdr(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function formatInterviewDate(value?: string): string {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * War Room Pipeline (Fitur 3 — Anggota 2):
 * Menampilkan daftar/kartu lamaran, filter gabungan, sorting, badge Rawan Ghosting,
 * tombol Simulasi +15 Hari, Ubah Status (State Machine), dan Hapus (dengan Undo 5 detik).
 */
export function PipelineView({
  applications,
  kaptenSkills,
  cvVault,
  conflictingIds,
  onOpenManualForm,
  onGoToExplore,
  onOpenDetail,
  onSimulateGhosting,
  onDeleteApplication,
  onDownloadIcs,
  onTransitionStatus,
}: PipelineViewProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "ALL">(
    "ALL",
  );
  const [onlyGhosting, setOnlyGhosting] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<PipelineSortOption>("newest");

  // State modal transisi status cepat berbasis State Machine
  const [transitionTargetApp, setTransitionTargetApp] =
    useState<Application | null>(null);
  const [nextStatus, setNextStatus] = useState<ApplicationStatus>("APPLIED");
  const [cvVersion, setCvVersion] = useState<string>("");
  const [appliedDate, setAppliedDate] = useState<string>(getTodayDateString);
  const [interviewDateTime, setInterviewDateTime] = useState<string>("");
  const [salaryOfferText, setSalaryOfferText] = useState<string>("");
  const [offerWorkMode, setOfferWorkMode] = useState<WorkMode>("Remote");
  const [transitionError, setTransitionError] = useState<string | null>(null);

  const openTransitionModal = (app: Application) => {
    const allowed = getAllowedNextStatuses(app.status);
    const defaultNext = allowed[0] ?? app.status;
    setTransitionTargetApp(app);
    setNextStatus(defaultNext);
    setCvVersion(app.cvVersion ?? "");
    setAppliedDate(app.appliedDate ?? getTodayDateString());
    setInterviewDateTime(app.interviewDateTime ?? "");
    setSalaryOfferText(
      app.salaryOffer !== undefined
        ? formatIdrInput(String(app.salaryOffer))
        : "",
    );
    setOfferWorkMode(app.workMode);
    setTransitionError(null);
  };

  const closeTransitionModal = () => {
    setTransitionTargetApp(null);
    setTransitionError(null);
  };

  const handleConfirmTransition = () => {
    if (!transitionTargetApp) return;

    const payload: StatusTransitionPayload = {
      cvVersion: cvVersion.trim() || undefined,
      appliedDate: appliedDate.trim() || undefined,
      interviewDateTime: interviewDateTime.trim() || undefined,
      salaryOffer: parseIdrInput(salaryOfferText),
      workMode: offerWorkMode,
    };

    const validation = validateStatusTransition(
      transitionTargetApp.status,
      nextStatus,
      payload,
    );

    if (!validation.valid) {
      setTransitionError(validation.error ?? "Transisi status tidak valid.");
      return;
    }

    onTransitionStatus(transitionTargetApp.id, nextStatus, payload);
    closeTransitionModal();
  };

  const ghostingCount = useMemo(
    () => applications.filter((app) => isRawanGhosting(app)).length,
    [applications],
  );

  const filteredAndSortedApps = useMemo(() => {
    const query = normalizeText(searchQuery);

    const filtered = applications.filter((app) => {
      if (statusFilter !== "ALL" && app.status !== statusFilter) {
        return false;
      }
      if (onlyGhosting && !isRawanGhosting(app)) {
        return false;
      }
      if (!query) return true;

      const haystack = [
        app.company,
        app.role,
        app.workMode,
        app.cvVersion ?? "",
        ...app.requiredSkills,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      switch (sortBy) {
        case "newest": {
          return Date.parse(b.lastUpdatedAt) - Date.parse(a.lastUpdatedAt);
        }
        case "interview-asc": {
          const timeA = a.interviewDateTime
            ? Date.parse(a.interviewDateTime)
            : Number.POSITIVE_INFINITY;
          const timeB = b.interviewDateTime
            ? Date.parse(b.interviewDateTime)
            : Number.POSITIVE_INFINITY;
          if (timeA !== timeB) {
            return timeA - timeB;
          }
          return Date.parse(b.lastUpdatedAt) - Date.parse(a.lastUpdatedAt);
        }
        case "offer-desc": {
          const salaryA = a.salaryOffer ?? -1;
          const salaryB = b.salaryOffer ?? -1;
          if (salaryA !== salaryB) {
            return salaryB - salaryA;
          }
          return Date.parse(b.lastUpdatedAt) - Date.parse(a.lastUpdatedAt);
        }
      }
    });

    return sorted;
  }, [applications, searchQuery, statusFilter, onlyGhosting, sortBy]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 || statusFilter !== "ALL" || onlyGhosting;

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setOnlyGhosting(false);
    setSortBy("newest");
  };

  return (
    <div className="space-y-5">
      {/* Header Panel */}
      <section className="mc-panel flex flex-col justify-between gap-4 px-5 py-4 sm:flex-row sm:items-center sm:px-6 sm:py-5">
        <div>
          <h1 className="font-pixel text-xl font-bold text-[#171615] uppercase sm:text-2xl dark:text-white">
            War Room{" "}
            <span className="text-[#1F5314] dark:text-[#78D95F]">Pipeline</span>
          </h1>
          <p className="mt-1 text-sm text-[#57524B] dark:text-[#B5AFA7]">
            Pantau progres seluruh lamaran, deteksi potensi ghosting &amp;
            bentrok jadwal, lalu kelola transisi status.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="primary" size="sm" onClick={onOpenManualForm}>
            <Plus className="h-4 w-4" />
            <span>Catat Lamaran</span>
          </Button>
          <Button variant="secondary" size="sm" onClick={onGoToExplore}>
            <Compass className="h-4 w-4" />
            <span>Eksplorasi</span>
          </Button>
        </div>
      </section>

      {/* Filter & Sort Toolbar */}
      <section className="mc-panel p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          {/* Pencarian Teks */}
          <div className="relative md:col-span-5">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#615B53] dark:text-[#A39C93]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari perusahaan, posisi, CV, atau skill..."
              aria-label="Cari lamaran di pipeline"
              className="mc-input py-2 pr-9 pl-9"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Hapus pencarian"
                className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer rounded-[2px] p-1 text-[#57524B] hover:bg-[#ECE7DD] hover:text-[#171615] dark:text-[#B5AFA7] dark:hover:bg-[#33312F] dark:hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter Status */}
          <div className="relative md:col-span-3">
            <Filter className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#615B53] dark:text-[#A39C93]" />
            <select
              aria-label="Filter status lamaran"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as ApplicationStatus | "ALL")
              }
              className="mc-input cursor-pointer py-2 pr-3 pl-9"
            >
              <option value="ALL">Semua Status</option>
              {ALL_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {APPLICATION_STATUS_LABELS[st]}
                </option>
              ))}
            </select>
          </div>

          {/* Sorting */}
          <div className="relative md:col-span-4">
            <ArrowUpDown className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#615B53] dark:text-[#A39C93]" />
            <select
              aria-label="Urutkan lamaran"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as PipelineSortOption)}
              className="mc-input cursor-pointer py-2 pr-3 pl-9"
            >
              <option value="newest">Terbaru Diperbarui</option>
              <option value="interview-asc">Jadwal Interview Terdekat</option>
              <option value="offer-desc">Offer Tertinggi</option>
            </select>
          </div>
        </div>

        {/* Toggle Rawan Ghosting & Metadata */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#E4DDD1] pt-3 text-sm text-[#57524B] dark:border-[#302D2B] dark:text-[#B5AFA7]">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-[3px] border border-[#D7CFC2] bg-white px-3 py-1.5 text-xs font-semibold text-[#3A3631] transition hover:border-[#E4B853] dark:border-[#3E3B38] dark:bg-[#22201F] dark:text-[#DDD7CF]">
              <input
                type="checkbox"
                checked={onlyGhosting}
                onChange={(e) => setOnlyGhosting(e.target.checked)}
                className="h-3.5 w-3.5 accent-[#B45309] dark:accent-[#F59E0B]"
              />
              <Ghost className="h-3.5 w-3.5 text-[#B45309] dark:text-[#FCD34D]" />
              <span>Hanya Rawan Ghosting</span>
              <span className="mc-tabular rounded-[2px] bg-[#FDF1D2] px-1.5 py-0.5 font-mono text-xs font-bold text-[#7A4404] dark:bg-[#38270A] dark:text-[#FCD34D]">
                {ghostingCount}
              </span>
            </label>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="cursor-pointer text-xs font-bold text-[#1D4ED8] hover:underline dark:text-[#93C5FD]"
              >
                Reset filter
              </button>
            )}
          </div>

          <span>
            Menampilkan{" "}
            <strong className="mc-tabular font-mono text-[#171615] dark:text-white">
              {filteredAndSortedApps.length}
            </strong>{" "}
            dari{" "}
            <strong className="mc-tabular font-mono text-[#171615] dark:text-white">
              {applications.length}
            </strong>{" "}
            lamaran
          </span>
        </div>
      </section>

      {/* Empty State */}
      {applications.length === 0 ? (
        <div className="mc-panel p-8 text-center">
          <p className="font-pixel text-base font-bold text-[#171615] dark:text-white">
            Pipeline Lamaran Masih Kosong
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#57524B] dark:text-[#B5AFA7]">
            Catat lamaran manual lewat tombol di atas atau simpan lowongan dari
            tab Eksplorasi Lowongan.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Button variant="primary" size="md" onClick={onOpenManualForm}>
              <Plus className="h-4 w-4" />
              <span>Catat Lamaran Manual</span>
            </Button>
            <Button variant="secondary" size="md" onClick={onGoToExplore}>
              <Compass className="h-4 w-4" />
              <span>Eksplorasi Lowongan</span>
            </Button>
          </div>
        </div>
      ) : filteredAndSortedApps.length === 0 ? (
        <div className="mc-panel p-8 text-center">
          <p className="font-pixel text-base font-bold text-[#171615] dark:text-white">
            Tidak Ada Lamaran Sesuai Filter
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#57524B] dark:text-[#B5AFA7]">
            Coba ubah kata kunci pencarian, status filter, atau matikan filter
            Rawan Ghosting.
          </p>
          <div className="mt-4">
            <Button variant="secondary" size="sm" onClick={handleResetFilters}>
              <X className="h-4 w-4" />
              <span>Reset Filter</span>
            </Button>
          </div>
        </div>
      ) : (
        /* Grid Kartu Lamaran */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredAndSortedApps.map((app) => {
            const match = calculateSkillMatch(app.requiredSkills, kaptenSkills);
            const rawanGhosting = isRawanGhosting(app);
            const isConflicting = conflictingIds.has(app.id);
            const daysAgo = getDaysSinceUpdate(app.lastUpdatedAt);
            const completedChecklist = app.checklist.filter(
              (item) => item.done,
            ).length;
            const totalChecklist = app.checklist.length;
            const checklistPercent =
              totalChecklist === 0
                ? 0
                : Math.round((completedChecklist / totalChecklist) * 100);
            const canSimulateGhosting =
              app.status === "APPLIED" || app.status === "SCREENING";
            const finalStatus = isFinalStatus(app.status);

            return (
              <article
                key={app.id}
                className="mc-surface mc-surface-interactive flex flex-col justify-between p-5"
              >
                <div>
                  {/* Top Badges & Match Score */}
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge tone={getStatusBadgeTone(app.status)} dot>
                        {APPLICATION_STATUS_LABELS[app.status]}
                      </Badge>
                      <span className="rounded-[3px] border border-[#D4CBBF] bg-[#F2EEE7] px-2 py-0.5 text-xs font-semibold text-[#3E3933] dark:border-[#44403C] dark:bg-[#2C2A28] dark:text-[#DCD6CE]">
                        {app.workMode}
                      </span>
                      {rawanGhosting && (
                        <Badge tone="warning" dot>
                          <Ghost className="h-3 w-3" />
                          <span>Rawan Ghosting</span>
                        </Badge>
                      )}
                      {isConflicting && (
                        <Badge tone="danger" dot>
                          <AlertTriangle className="h-3 w-3" />
                          <span>Bentrok Jadwal</span>
                        </Badge>
                      )}
                    </div>

                    <Badge
                      tone={getMatchTone(match.score)}
                      className="mc-tabular shrink-0 font-mono"
                    >
                      {match.score}% Match
                    </Badge>
                  </div>

                  {/* Company & Role */}
                  <div className="mt-3.5 flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[3px] border border-[#3E7834] bg-[#213B22] font-mono text-xs font-bold text-[#A8F096]"
                      aria-hidden="true"
                    >
                      {getCompanyInitials(app.company)}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-bold text-[#171615] dark:text-white">
                        {app.role}
                      </h2>
                      <p className="truncate text-sm text-[#57524B] dark:text-[#B5AFA7]">
                        {app.company}
                      </p>
                    </div>
                  </div>

                  {/* Metadata Row: CV Version, Update Age, Interview, Salary */}
                  <div className="mt-3.5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-[#57524B] dark:text-[#B5AFA7]">
                    {app.cvVersion && (
                      <span className="inline-flex items-center gap-1 font-medium">
                        <FileText className="h-3.5 w-3.5 text-[#1D4ED8] dark:text-[#60A5FA]" />
                        <span>CV: {app.cvVersion}</span>
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="mc-tabular font-mono">
                        {daysAgo} hari lalu
                      </span>
                    </span>
                    {app.interviewDateTime && (
                      <span className="inline-flex items-center gap-1 font-semibold text-[#7A4404] dark:text-[#FCD34D]">
                        <CalendarClock className="h-3.5 w-3.5" />
                        <span className="mc-tabular font-mono">
                          {formatInterviewDate(app.interviewDateTime)}
                        </span>
                      </span>
                    )}
                    {app.salaryOffer !== undefined && (
                      <span className="inline-flex items-center gap-1 font-semibold text-[#1F5314] dark:text-[#91EB7A]">
                        <Wallet className="h-3.5 w-3.5" />
                        <span className="mc-tabular font-mono">
                          {formatCurrencyIdr(app.salaryOffer)}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Progress Checklist */}
                  <div className="mt-3.5">
                    <div className="mb-1 flex items-center justify-between text-xs font-semibold text-[#57524B] dark:text-[#B5AFA7]">
                      <span className="inline-flex items-center gap-1">
                        <CheckSquare className="h-3.5 w-3.5" />
                        <span>Checklist Persiapan</span>
                      </span>
                      <span className="mc-tabular font-mono text-[#171615] dark:text-white">
                        {completedChecklist}/{totalChecklist}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-[2px] bg-[#E5DFD5] dark:bg-[#2E2C2A]">
                      <div
                        className="h-full bg-[#3C8527] transition-all duration-200 dark:bg-[#6CC349]"
                        style={{ width: `${checklistPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Skill Match Breakdown */}
                  {app.requiredSkills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {match.matchedSkills.map((skill) => (
                        <span
                          key={`m-${skill}`}
                          className="inline-flex items-center gap-1 rounded-[3px] border border-[#8EC980] bg-[#E3F4DE] px-2 py-0.5 text-xs font-semibold text-[#1F5314] dark:border-[#3D8230] dark:bg-[#193516] dark:text-[#91EB7A]"
                        >
                          <Check className="h-3 w-3 shrink-0" />
                          <span>{skill}</span>
                        </span>
                      ))}
                      {match.missingSkills.slice(0, 4).map((skill) => (
                        <span
                          key={`x-${skill}`}
                          className="inline-flex items-center gap-1 rounded-[3px] border border-[#E89B96] bg-[#FDE7E6] px-2 py-0.5 text-xs font-semibold text-[#921616] dark:border-[#962A2A] dark:bg-[#3A1616] dark:text-[#FCA5A5]"
                        >
                          <X className="h-3 w-3 shrink-0" />
                          <span>{skill}</span>
                        </span>
                      ))}
                      {match.missingSkills.length > 4 && (
                        <span className="rounded-[3px] border border-[#D4CBBF] bg-[#F2EEE7] px-2 py-0.5 text-xs font-semibold text-[#57524B] dark:border-[#44403C] dark:bg-[#2C2A28] dark:text-[#B5AFA7]">
                          +{match.missingSkills.length - 4} lainnya
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#E6DFD4] pt-3.5 dark:border-[#34312F]">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onOpenDetail(app.id)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Detail</span>
                    </Button>

                    {!finalStatus && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => openTransitionModal(app)}
                      >
                        <ArrowRightLeft className="h-3.5 w-3.5" />
                        <span>Ubah Status</span>
                      </Button>
                    )}

                    {canSimulateGhosting && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onSimulateGhosting(app.id)}
                        title="Mundurkan lastUpdatedAt sebanyak 15 hari untuk simulasi Rawan Ghosting"
                      >
                        <Ghost className="h-3.5 w-3.5" />
                        <span>Simulasi +15 Hari</span>
                      </Button>
                    )}

                    {app.status === "INTERVIEW" && app.interviewDateTime && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onDownloadIcs(app)}
                        title="Unduh jadwal interview dalam format kalender (.ics)"
                      >
                        <CalendarPlus className="h-3.5 w-3.5" />
                        <span>Simpan .ics</span>
                      </Button>
                    )}
                  </div>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDeleteApplication(app.id)}
                    aria-label={`Hapus lamaran ${app.role} di ${app.company}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Hapus</span>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal Transisi Status (State Machine Engine) */}
      <Modal
        isOpen={transitionTargetApp !== null}
        onClose={closeTransitionModal}
        title="Perbarui Status Lamaran"
        subtitle={
          transitionTargetApp
            ? `${transitionTargetApp.role} — ${transitionTargetApp.company}`
            : undefined
        }
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              size="md"
              onClick={closeTransitionModal}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleConfirmTransition}
            >
              Simpan Perubahan
            </Button>
          </>
        }
      >
        {transitionTargetApp && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-[#57524B] dark:text-[#B5AFA7]">
              <span>Status saat ini:</span>
              <Badge tone={getStatusBadgeTone(transitionTargetApp.status)} dot>
                {APPLICATION_STATUS_LABELS[transitionTargetApp.status]}
              </Badge>
            </div>

            <div>
              <label
                htmlFor="pipeline-next-status"
                className="mb-1.5 block text-xs font-bold tracking-wider text-[#3A3631] uppercase dark:text-[#DDD7CF]"
              >
                Status Tujuan (Sesuai State Machine)
              </label>
              <select
                id="pipeline-next-status"
                value={nextStatus}
                onChange={(e) => {
                  setNextStatus(e.target.value as ApplicationStatus);
                  setTransitionError(null);
                }}
                className="mc-input cursor-pointer px-3 py-2"
              >
                {getAllowedNextStatuses(transitionTargetApp.status).map(
                  (allowed) => (
                    <option key={allowed} value={allowed}>
                      {APPLICATION_STATUS_LABELS[allowed]}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* Input kondisional untuk APPLIED */}
            {nextStatus === "APPLIED" && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="transition-cv"
                    className="mb-1.5 block text-xs font-bold tracking-wider text-[#3A3631] uppercase dark:text-[#DDD7CF]"
                  >
                    Versi CV *
                  </label>
                  <input
                    id="transition-cv"
                    type="text"
                    value={cvVersion}
                    onChange={(e) => {
                      setCvVersion(e.target.value);
                      setTransitionError(null);
                    }}
                    placeholder="Contoh: CV-FE-v2"
                    className="mc-input px-3 py-2"
                  />
                  {cvVault.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {cvVault.map((doc) => (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => {
                            setCvVersion(doc.versionLabel);
                            setTransitionError(null);
                          }}
                          className="cursor-pointer rounded-[2px] border border-[#94BEFB] bg-[#E4F0FF] px-2 py-0.5 text-xs font-semibold text-[#1742A8] transition hover:bg-[#D2E5FF] dark:border-[#2F5DA0] dark:bg-[#162845] dark:text-[#93C5FD]"
                        >
                          {doc.versionLabel}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="transition-date"
                    className="mb-1.5 block text-xs font-bold tracking-wider text-[#3A3631] uppercase dark:text-[#DDD7CF]"
                  >
                    Tanggal Melamar *
                  </label>
                  <input
                    id="transition-date"
                    type="date"
                    value={appliedDate}
                    onChange={(e) => {
                      setAppliedDate(e.target.value);
                      setTransitionError(null);
                    }}
                    className="mc-input px-3 py-2"
                  />
                </div>
              </div>
            )}

            {/* Input kondisional untuk INTERVIEW */}
            {nextStatus === "INTERVIEW" && (
              <div>
                <label
                  htmlFor="transition-interview"
                  className="mb-1.5 block text-xs font-bold tracking-wider text-[#3A3631] uppercase dark:text-[#DDD7CF]"
                >
                  Jadwal Interview (Tanggal &amp; Jam) *
                </label>
                <input
                  id="transition-interview"
                  type="datetime-local"
                  value={interviewDateTime}
                  onChange={(e) => {
                    setInterviewDateTime(e.target.value);
                    setTransitionError(null);
                  }}
                  className="mc-input px-3 py-2"
                />
              </div>
            )}

            {/* Input kondisional untuk OFFER */}
            {nextStatus === "OFFER" && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="transition-salary"
                    className="mb-1.5 block text-xs font-bold tracking-wider text-[#3A3631] uppercase dark:text-[#DDD7CF]"
                  >
                    Gaji Offer (Rp / bulan) *
                  </label>
                  <div className="relative">
                    <span
                      className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 font-mono text-xs font-bold text-[#615B53] dark:text-[#A39C93]"
                      aria-hidden="true"
                    >
                      Rp
                    </span>
                    <input
                      id="transition-salary"
                      type="text"
                      inputMode="numeric"
                      value={salaryOfferText}
                      onChange={(e) => {
                        setSalaryOfferText(formatIdrInput(e.target.value));
                        setTransitionError(null);
                      }}
                      placeholder="5.500.000"
                      className="mc-input mc-tabular py-2 pr-3 pl-9 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="transition-workmode"
                    className="mb-1.5 block text-xs font-bold tracking-wider text-[#3A3631] uppercase dark:text-[#DDD7CF]"
                  >
                    Mode Kerja *
                  </label>
                  <select
                    id="transition-workmode"
                    value={offerWorkMode}
                    onChange={(e) =>
                      setOfferWorkMode(e.target.value as WorkMode)
                    }
                    className="mc-input cursor-pointer px-3 py-2"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Onsite">Onsite</option>
                  </select>
                </div>
              </div>
            )}

            {transitionError && (
              <p
                role="alert"
                className="flex items-center gap-2 rounded-[3px] border border-[#E89B96] bg-[#FDE7E6] px-3 py-2 text-xs font-semibold text-[#921616] dark:border-[#962A2A] dark:bg-[#3A1616] dark:text-[#FCA5A5]"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{transitionError}</span>
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

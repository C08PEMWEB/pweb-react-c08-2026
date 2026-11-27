import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Ghost, RotateCcw, Trash2 } from "lucide-react";
import { BackupModal } from "./components/bonus/BackupModal";
import { StatsCards } from "./components/dashboard/StatsCards";
import { ApplicationDetail } from "./components/detail/ApplicationDetail";
import { OfferComparator } from "./components/dashboard/OfferComparator";
import { JobExplorer } from "./components/explore/JobExplorer";
import { MinecraftWorldBackdrop } from "./components/layout/MinecraftWorldBackdrop";
import { Navbar } from "./components/layout/Navbar";
import {
  ApplicationForm,
  type NewApplicationInput,
} from "./components/pipeline/ApplicationForm";
import { InterviewConflictBanner } from "./components/pipeline/InterviewConflictBanner";
import { PipelineView } from "./components/pipeline/PipelineView";
import { Button } from "./components/ui/Button";
import { Modal } from "./components/ui/Modal";
import { useLocalStorage } from "./hooks/useLocalStorage";
import {
  DEFAULT_KAPTEN_SKILLS,
  STORAGE_KEYS,
  type ActiveTab,
  type Application,
  type ApplicationStatus,
  type JobListing,
  type ThemeMode,
} from "./types";
import {
  findInterviewConflicts,
  getConflictingApplicationIds,
  shiftLastUpdatedDays,
} from "./utils/scheduleChecker";
import {
  createApplicationFromJob,
  isDuplicateApplication,
  normalizeText,
} from "./utils/skillMatch";
import {
  applyStatusTransition,
  type StatusTransitionPayload,
} from "./utils/stateMachine";

interface PendingUndoDelete {
  application: Application;
  index: number;
}

export default function App() {
  // Root Persistent State via Custom Hook useLocalStorage<T>
  const [applications, setApplications] = useLocalStorage<Application[]>(
    STORAGE_KEYS.APPLICATIONS,
    [],
  );
  const [kaptenSkills, setKaptenSkills] = useLocalStorage<string[]>(
    STORAGE_KEYS.SKILLS,
    DEFAULT_KAPTEN_SKILLS,
  );
  // Bonus: Dark Mode default bergaya Minecraft.net Obsidian, bisa toggle ke Overworld Light
  const [theme, setTheme] = useLocalStorage<ThemeMode>(
    STORAGE_KEYS.THEME,
    "dark",
  );

  const [activeTab, setActiveTab] = useState<ActiveTab>("explore");
  const [isManualFormOpen, setIsManualFormOpen] = useState<boolean>(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [pendingUndo, setPendingUndo] = useState<PendingUndoDelete | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const undoTimerRef = useRef<number | null>(null);

  // Sinkronisasi class 'dark' pada elemen <html>
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Cleanup toast & undo timers saat unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
      if (undoTimerRef.current !== null) {
        window.clearTimeout(undoTimerRef.current);
      }
    };
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 3200);
  };

  // Derived state untuk Navbar & Banner Bentrok (lintas filter)
  const totalOffers = applications.filter((app) => app.status === "OFFER").length;
  const interviewConflicts = useMemo(
    () => findInterviewConflicts(applications),
    [applications],
  );
  const conflictingIds = useMemo(
    () => getConflictingApplicationIds(interviewConflicts),
    [interviewConflicts],
  );

  // Handlers Profil Skill Kapten (immutable)
  const handleAddSkill = (rawSkill: string): boolean => {
    const trimmed = rawSkill.trim();
    if (!trimmed) return false;

    const alreadyExists = kaptenSkills.some(
      (existing) => normalizeText(existing) === normalizeText(trimmed),
    );
    if (alreadyExists) return false;

    setKaptenSkills((prev) => [...prev, trimmed]);
    return true;
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setKaptenSkills((prev) =>
      prev.filter(
        (skill) => normalizeText(skill) !== normalizeText(skillToRemove),
      ),
    );
  };

  const handleResetSkills = () => {
    setKaptenSkills(DEFAULT_KAPTEN_SKILLS);
  };

  // Handler Simpan ke Wishlist dari Fitur 1 (immutable + anti-duplikat)
  const handleSaveToWishlist = (job: JobListing) => {
    if (isDuplicateApplication(applications, job.company_name, job.title)) {
      return;
    }
    const newApplication = createApplicationFromJob(job);
    setApplications((prev) => [newApplication, ...prev]);
    showToast(`"${job.title}" (${job.company_name}) disimpan ke Wishlist.`);
  };

  // Handler Tambah Lamaran Manual dari Fitur 2 (Anggota 2)
  const handleAddManualApplication = (input: NewApplicationInput) => {
    if (isDuplicateApplication(applications, input.company, input.role)) {
      return;
    }
    const now = new Date().toISOString();
    const newApplication: Application = {
      id: crypto.randomUUID(),
      company: input.company,
      role: input.role,
      workMode: input.workMode,
      status: input.status,
      requiredSkills: input.requiredSkills,
      cvVersion: input.cvVersion,
      appliedDate: input.appliedDate,
      lastUpdatedAt: now,
      checklist: [],
      activityLogs: [
        {
          id: crypto.randomUUID(),
          timestamp: now,
          message: `Lamaran ditambahkan manual dengan status ${input.status}`,
        },
      ],
    };

    setApplications((prev) => [newApplication, ...prev]);
    setIsManualFormOpen(false);
    setActiveTab("pipeline");
    showToast(
      `"${input.role}" (${input.company}) ditambahkan ke Pipeline (${input.status}).`,
    );
  };

  // Handler Simulasi +15 Hari untuk pengujian Rawan Ghosting (Fitur 3 — Anggota 2)
  const handleSimulateGhosting = (id: string) => {
    const now = new Date().toISOString();
    setApplications((prev) =>
      prev.map((app) => {
        if (
          app.id !== id ||
          (app.status !== "APPLIED" && app.status !== "SCREENING")
        ) {
          return app;
        }
        return {
          ...app,
          lastUpdatedAt: shiftLastUpdatedDays(app.lastUpdatedAt, 15),
          activityLogs: [
            ...app.activityLogs,
            {
              id: crypto.randomUUID(),
              timestamp: now,
              message: "Simulasi +15 hari dijalankan (uji Rawan Ghosting)",
            },
          ],
        };
      }),
    );
    showToast("Simulasi +15 hari diterapkan pada lamaran.");
  };

  // Handler Transisi Status via State Machine Engine (Anggota 2)
  const handleTransitionStatus = (
    id: string,
    targetStatus: ApplicationStatus,
    payload?: StatusTransitionPayload,
  ) => {
    const currentApp = applications.find((app) => app.id === id);
    if (!currentApp) return;

    try {
      const transitioned = applyStatusTransition(
        currentApp,
        targetStatus,
        payload,
      );
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? transitioned : app)),
      );
      showToast(`Status lamaran diperbarui menjadi ${targetStatus}.`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal memperbarui status lamaran.";
      showToast(msg);
    }
  };

  // Handler Hapus Lamaran + Undo 5 Detik via useRef & clearTimeout (Fitur 6 — Anggota 2)
  const handleDeleteApplication = (id: string) => {
    const targetIndex = applications.findIndex((app) => app.id === id);
    if (targetIndex === -1) return;
    const targetApp = applications[targetIndex];

    if (undoTimerRef.current !== null) {
      window.clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }

    if (selectedApplicationId === id) {
      setSelectedApplicationId(null);
    }

    setApplications((prev) => prev.filter((app) => app.id !== id));
    setPendingUndo({ application: targetApp, index: targetIndex });

    undoTimerRef.current = window.setTimeout(() => {
      setPendingUndo(null);
      undoTimerRef.current = null;
    }, 5000);
  };

  const handleUndoDelete = () => {
    if (!pendingUndo) return;

    if (undoTimerRef.current !== null) {
      window.clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }

    const { application, index } = pendingUndo;
    setApplications((prev) => {
      if (prev.some((item) => item.id === application.id)) {
        return prev;
      }
      const clampedIndex = Math.min(Math.max(0, index), prev.length);
      const next = [...prev];
      next.splice(clampedIndex, 0, application);
      return next;
    });

    setPendingUndo(null);
    showToast(`Lamaran "${application.role}" (${application.company}) dikembalikan.`);
  };

  // Handler Bonus Import JSON Backup
  const handleImportBackup = (
    importedSkills: string[],
    importedApplications: Application[],
  ) => {
    setKaptenSkills(
      importedSkills.length > 0 ? importedSkills : DEFAULT_KAPTEN_SKILLS,
    );
    setApplications(importedApplications);
    showToast(
      `Data dipulihkan: ${importedApplications.length} lamaran & ${importedSkills.length} skill.`,
    );
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const selectedApplication = applications.find(
    (app) => app.id === selectedApplicationId,
  );
  const handleUpdateApplication = (next: Application) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === next.id ? next : app)),
    );
  };

  return (
    <div className="relative min-h-screen">
      <MinecraftWorldBackdrop theme={theme} />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        totalApplications={applications.length}
        totalOffers={totalOffers}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenManualForm={() => setIsManualFormOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {/* Banner Peringatan Bentrok Jadwal Interview (lintas filter, tampil di atas semua tab) */}
        <InterviewConflictBanner
          conflicts={interviewConflicts}
          isPipelineActive={activeTab === "pipeline"}
          onGoToPipeline={() => setActiveTab("pipeline")}
        />

        <StatsCards applications={applications} />

        {activeTab === "explore" && (
          <JobExplorer
            kaptenSkills={kaptenSkills}
            applications={applications}
            onAddSkill={handleAddSkill}
            onRemoveSkill={handleRemoveSkill}
            onResetSkills={handleResetSkills}
            onSaveToWishlist={handleSaveToWishlist}
          />
        )}

        {activeTab === "pipeline" && (
          <PipelineView
            applications={applications}
            kaptenSkills={kaptenSkills}
            conflictingIds={conflictingIds}
            onOpenManualForm={() => setIsManualFormOpen(true)}
            onGoToExplore={() => setActiveTab("explore")}
            onOpenDetail={setSelectedApplicationId}
            onSimulateGhosting={handleSimulateGhosting}
            onDeleteApplication={handleDeleteApplication}
            onTransitionStatus={handleTransitionStatus}
          />
        )}

        {activeTab === "comparator" && (
          <OfferComparator
            applications={applications}
            kaptenSkills={kaptenSkills}
            onGoToPipeline={() => setActiveTab("pipeline")}
          />
        )}
      </main>

      <footer className="mt-10 border-t border-[#CFC6B8] bg-[#FAF8F4]/92 py-5 text-sm text-[#45403B] backdrop-blur-sm dark:border-[#2E2C2A] dark:bg-[#141312]/90 dark:text-[#B5AFA7]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p>
            <span className="font-pixel font-bold text-[#171615] dark:text-white">
              AKU MW{" "}
              <span className="text-[#276118] dark:text-[#78D95F]">MAGANG</span>
            </span>{" "}
            &middot; Praktikum Pemweb Modul 5
          </p>
          <p>
            Tekan{" "}
            <kbd className="rounded-[2px] border border-[#BEB5A7] bg-white px-1.5 py-0.5 font-mono text-xs font-bold text-[#262320] dark:border-[#494542] dark:bg-[#22201F] dark:text-[#EAE5DE]">
              /
            </kbd>{" "}
            untuk fokus pencarian
          </p>
        </div>
      </footer>

      {/* Modal Detail Lamaran (Fitur 4 & 5 — Anggota 3) */}
      {selectedApplication && (
        <ApplicationDetail
          application={selectedApplication}
          onUpdate={handleUpdateApplication}
          onTransition={(targetStatus, payload) =>
            handleTransitionStatus(selectedApplication.id, targetStatus, payload)
          }
          onClose={() => setSelectedApplicationId(null)}
          headerActions={
            <>
              {(selectedApplication.status === "APPLIED" ||
                selectedApplication.status === "SCREENING") && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSimulateGhosting(selectedApplication.id)}
                >
                  <Ghost className="h-3.5 w-3.5" />
                  <span>Simulasi +15 Hari</span>
                </Button>
              )}
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDeleteApplication(selectedApplication.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Hapus</span>
              </Button>
            </>
          }
        />
      )}

      <Modal
        isOpen={isManualFormOpen}
        onClose={() => setIsManualFormOpen(false)}
        title="Catat Lamaran Manual"
        subtitle="Tambahkan lamaran magang di luar katalog Remotive ke dalam War Room Pipeline."
        size="md"
      >
        <ApplicationForm
          applications={applications}
          onSubmit={handleAddManualApplication}
          onCancel={() => setIsManualFormOpen(false)}
        />
      </Modal>

      {/* Bonus Modal: Export / Import JSON */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        kaptenSkills={kaptenSkills}
        applications={applications}
        onImportBackup={handleImportBackup}
      />

      {/* Toast Container (Undo Delete 5 Detik + Feedback Biasa) */}
      {(pendingUndo || toastMessage) && (
        <div className="fixed right-4 bottom-4 z-50 flex max-w-md flex-col items-end gap-2">
          {pendingUndo && (
            <div
              role="status"
              aria-live="assertive"
              className="flex w-full items-center justify-between gap-3 rounded-[3px] border-2 border-[#E4B853] bg-[#171615] px-4 py-3 text-sm font-semibold text-[#F5F4F0] shadow-xl"
            >
              <span className="min-w-0">
                Lamaran{" "}
                <strong className="text-[#FCD34D]">
                  {pendingUndo.application.role}
                </strong>{" "}
                ({pendingUndo.application.company}) dihapus.
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={handleUndoDelete}
                className="shrink-0"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Undo (5d)</span>
              </Button>
            </div>
          )}

          {toastMessage && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-center gap-2.5 rounded-[3px] border-2 border-[#52A535] bg-[#171615] px-4 py-3 text-sm font-semibold text-[#F5F4F0] shadow-xl"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#78D95F]" />
              <span>{toastMessage}</span>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}

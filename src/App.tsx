import { useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { BackupModal } from "./components/bonus/BackupModal";
import { JobExplorer } from "./components/explore/JobExplorer";
import { MinecraftWorldBackdrop } from "./components/layout/MinecraftWorldBackdrop";
import { Navbar } from "./components/layout/Navbar";
import {
  ComparatorSlotView,
  ManualFormSlotContent,
  PipelineSlotView,
} from "./components/placeholders/TeamSlotViews";
import { Button } from "./components/ui/Button";
import { Modal } from "./components/ui/Modal";
import { useLocalStorage } from "./hooks/useLocalStorage";
import {
  DEFAULT_KAPTEN_SKILLS,
  STORAGE_KEYS,
  type ActiveTab,
  type Application,
  type JobListing,
  type ThemeMode,
} from "./types";
import {
  createApplicationFromJob,
  isDuplicateApplication,
  normalizeText,
} from "./utils/skillMatch";

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
  const toastTimerRef = useRef<number | null>(null);

  // Sinkronisasi class 'dark' pada elemen <html>
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Cleanup toast timer saat unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
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

  // Derived count untuk Navbar badges
  const totalOffers = applications.filter((app) => app.status === "OFFER").length;

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
        {/*
          [SLOT INTEGRASI ANGGOTA 2]: Banner Peringatan Bentrok Jadwal Interview
          Dihitung dari seluruh data `applications` (tetap tampil di atas semua tab).
        */}

        {/*
          [SLOT INTEGRASI ANGGOTA 3]: Dashboard 5 Kartu Statistik (Derived State)
          Total Lamaran, Response Rate %, Interview Rate %, Rawan Ghosting, Total Offer.
        */}

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
          <PipelineSlotView
            applications={applications}
            kaptenSkills={kaptenSkills}
            onGoToExplore={() => setActiveTab("explore")}
          />
        )}

        {activeTab === "comparator" && (
          <ComparatorSlotView
            offersCount={totalOffers}
            onGoToExplore={() => setActiveTab("explore")}
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

      {/* Modal Slot untuk Form Manual Anggota 2 */}
      <Modal
        isOpen={isManualFormOpen}
        onClose={() => setIsManualFormOpen(false)}
        title="Catat Lamaran Manual"
        subtitle="Gunakan komponen Modal standar Design System (Fitur 2 — Anggota 2)."
        size="md"
        footer={
          <Button
            variant="secondary"
            size="md"
            onClick={() => setIsManualFormOpen(false)}
          >
            Tutup
          </Button>
        }
      >
        <ManualFormSlotContent />
      </Modal>

      {/* Bonus Modal: Export / Import JSON */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        kaptenSkills={kaptenSkills}
        applications={applications}
        onImportBackup={handleImportBackup}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-4 bottom-4 z-50 flex max-w-sm items-center gap-2.5 rounded-[3px] border-2 border-[#52A535] bg-[#171615] px-4 py-3 text-sm font-semibold text-[#F5F4F0] shadow-xl"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#78D95F]" />
          <span>{toastMessage}</span>
        </div>
      )}
      </div>
    </div>
  );
}

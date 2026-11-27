import {
  ChevronRight,
  Compass,
  DatabaseBackup,
  FileText,
  KanbanSquare,
  Moon,
  Plus,
  Scale,
  Sun,
} from "lucide-react";
import type { ActiveTab, ThemeMode } from "../../types";
import { GrassBlockLogo } from "../ui/MinecraftIcons";

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  totalApplications: number;
  totalOffers: number;
  cvCount: number;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenManualForm: () => void;
  onOpenBackupModal: () => void;
  onOpenCvVault: () => void;
}

/**
 * Signature Obsidian Navigation Bar terinspirasi langsung dari minecraft.net:
 * gelap tegas (#171615), navigasi uppercase yang bersih, tombol aksi Mojang hijau
 * dengan sudut tajam, dan responsif tanpa overflow pada viewport 390px.
 */
export function Navbar({
  activeTab,
  onTabChange,
  totalApplications,
  totalOffers,
  cvCount,
  theme,
  onToggleTheme,
  onOpenManualForm,
  onOpenBackupModal,
  onOpenCvVault,
}: NavbarProps) {
  const navItems: Array<{
    id: ActiveTab;
    label: string;
    shortLabel: string;
    count?: number;
    icon: typeof Compass;
  }> = [
    {
      id: "explore",
      label: "Eksplorasi",
      shortLabel: "Eksplorasi",
      icon: Compass,
    },
    {
      id: "pipeline",
      label: "Pipeline Lamaran",
      shortLabel: "Pipeline",
      count: totalApplications,
      icon: KanbanSquare,
    },
    {
      id: "comparator",
      label: "Bandingkan Offer",
      shortLabel: "Offer",
      count: totalOffers,
      icon: Scale,
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#2E2C2A] bg-[#171615] text-[#F5F4F0]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-6 lg:px-8">
        {/* Left: Brand Wordmark (Minecraft.net blocky logo style) */}
        <button
          type="button"
          onClick={() => onTabChange("explore")}
          className="group flex min-w-0 shrink cursor-pointer items-center gap-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6CC349] sm:gap-2.5"
        >
          <GrassBlockLogo className="h-7 w-7 shrink-0 transition-transform duration-150 group-hover:-translate-y-0.5 sm:h-8 sm:w-8" />
          <span className="truncate font-pixel text-xs font-bold tracking-tight text-white sm:text-base">
            AKU MW <span className="text-[#78D95F]">MAGANG</span>
          </span>
        </button>

        {/* Center: Uppercase Architectural Navigation (Desktop) */}
        <nav
          aria-label="Navigasi utama"
          className="hidden items-center gap-1 lg:flex"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex cursor-pointer items-center gap-2 px-3.5 py-2 text-xs font-bold tracking-wider uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6CC349] ${
                  isActive
                    ? "text-[#8CEB73]"
                    : "text-[#D4CEC6] hover:text-white"
                }`}
              >
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span
                    className={`mc-tabular rounded-[2px] px-1.5 py-0.5 font-mono text-xs font-bold ${
                      isActive
                        ? "bg-[#244D1B] text-[#98F281]"
                        : "bg-[#2C2A28] text-[#D4CEC6]"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
                {isActive && (
                  <span
                    className="absolute right-3 bottom-0 left-3 h-[3px] bg-[#52A535]"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: CV Vault + Backup + Theme Toggle + Signature Minecraft.net CTA */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={onOpenCvVault}
            title="CV Vault — Unggah & kelola versi CV"
            aria-label={`Buka CV Vault (${cvCount} file tersimpan)`}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-[3px] border border-[#3B3835] bg-[#22201F] p-1.5 text-xs font-semibold text-[#DDD7CF] transition hover:border-[#6CC349] hover:text-white focus-visible:outline-2 focus-visible:outline-[#6CC349] sm:px-2.5 sm:py-2"
          >
            <FileText className="h-4 w-4 shrink-0 text-[#86E270]" />
            <span className="hidden xl:inline">CV Vault</span>
            {cvCount > 0 && (
              <span className="mc-tabular rounded-[2px] bg-[#244D1B] px-1.5 py-0.5 font-mono text-xs font-bold text-[#98F281]">
                {cvCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenBackupModal}
            title="Export / Import Backup JSON"
            aria-label="Buka backup dan restore JSON"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-[3px] border border-[#3B3835] bg-[#22201F] p-1.5 text-xs font-semibold text-[#DDD7CF] transition hover:border-[#6CC349] hover:text-white focus-visible:outline-2 focus-visible:outline-[#6CC349] sm:px-2.5 sm:py-2"
          >
            <DatabaseBackup className="h-4 w-4 shrink-0" />
            <span className="hidden xl:inline">Backup</span>
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            title={
              theme === "dark"
                ? "Ubah ke Overworld Light Mode"
                : "Ubah ke Deepslate Dark Mode"
            }
            aria-label={
              theme === "dark"
                ? "Aktifkan Overworld Light Mode"
                : "Aktifkan Deepslate Dark Mode"
            }
            className="inline-flex cursor-pointer items-center justify-center rounded-[3px] border border-[#3B3835] bg-[#22201F] p-1.5 text-[#FCD34D] transition hover:border-[#6CC349] hover:bg-[#2C2A28] focus-visible:outline-2 focus-visible:outline-[#6CC349] sm:p-2"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4 text-[#A7D8FF]" />
            )}
          </button>

          {/* Signature Minecraft.net Green CTA (mirrors "BUY NOW >" on minecraft.net) */}
          <button
            type="button"
            onClick={onOpenManualForm}
            className="mc-bevel-green inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-[3px] px-2.5 py-2 text-xs font-bold tracking-wider text-white uppercase transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6CC349] sm:gap-1.5 sm:px-3.5"
          >
            <Plus className="h-3.5 w-3.5 shrink-0 stroke-[2.75]" />
            <span className="hidden sm:inline">Catat Lamaran</span>
            <span className="sm:hidden">Catat</span>
            <ChevronRight className="hidden h-3.5 w-3.5 shrink-0 sm:inline" />
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Navigation Tabs (Zero horizontal overflow at 390px) */}
      <nav
        aria-label="Navigasi mobile"
        className="grid grid-cols-3 border-t border-[#2B2927] bg-[#1E1C1B] lg:hidden"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex cursor-pointer items-center justify-center gap-1.5 px-2 py-2.5 text-xs font-bold transition-colors ${
                isActive
                  ? "bg-[#262423] text-[#8CEB73]"
                  : "text-[#C6C0B8] hover:text-white"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{item.shortLabel}</span>
              {item.count !== undefined && (
                <span
                  className={`mc-tabular rounded-[2px] px-1.5 py-0.5 font-mono text-xs font-bold ${
                    isActive
                      ? "bg-[#244D1B] text-[#98F281]"
                      : "bg-[#2E2C2A] text-[#D4CEC6]"
                  }`}
                >
                  {item.count}
                </span>
              )}
              {isActive && (
                <span
                  className="absolute right-0 bottom-0 left-0 h-[3px] bg-[#52A535]"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}

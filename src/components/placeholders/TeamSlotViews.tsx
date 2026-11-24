import { Compass, KanbanSquare, Scale, Wrench } from "lucide-react";
import type { Application } from "../../types";
import { calculateSkillMatch, getMatchTone } from "../../utils/skillMatch";
import {
  APPLICATION_STATUS_LABELS,
  Badge,
  getStatusBadgeTone,
} from "../ui/Badge";
import { Button } from "../ui/Button";

interface PipelineSlotViewProps {
  applications: Application[];
  kaptenSkills: string[];
  onGoToExplore: () => void;
}

/**
 * Placeholder terintegrasi untuk Slot Anggota 2 (Fitur 3 & 6: War Room Pipeline,
 * Filter/Sort, Simulasi +15 Hari, Banner Bentrok, Undo Delete) dan Anggota 3
 * (Fitur 4 & 5: Detail Lamaran & Prep Timer).
 */
export function PipelineSlotView({
  applications,
  kaptenSkills,
  onGoToExplore,
}: PipelineSlotViewProps) {
  return (
    <div className="space-y-5">
      <div className="mc-panel flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[3px] border border-[#94BEFB] bg-[#E4F0FF] text-[#1742A8] dark:border-[#2F5DA0] dark:bg-[#162845] dark:text-[#93C5FD]">
            <KanbanSquare className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-pixel text-lg font-bold text-[#171615] uppercase dark:text-white">
                War Room Pipeline
              </h1>
              <Badge tone="primary">Slot Anggota 2 &amp; 3</Badge>
            </div>
            <p className="mt-1 text-sm text-[#57524B] dark:text-[#B5AFA7]">
              Halaman ini siap menerima komponen War Room Pipeline (Filter,
              Simulasi +15 Hari, Banner Bentrok, Undo Delete) dari Anggota 2
              serta Modal Detail &amp; Interview Prep Timer dari Anggota 3.
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={onGoToExplore}
          className="shrink-0"
        >
          <Compass className="h-4 w-4" />
          <span>Kembali ke Eksplorasi</span>
        </Button>
      </div>

      {/* Preview Data Wishlist Tersimpan di LocalStorage */}
      {applications.length === 0 ? (
        <div className="mc-panel p-8 text-center">
          <p className="font-pixel text-base font-bold text-[#171615] dark:text-white">
            Belum Ada Lamaran Tersimpan
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#57524B] dark:text-[#B5AFA7]">
            Klik <strong>Simpan ke Wishlist</strong> pada tab Eksplorasi
            Lowongan — data langsung masuk ke state utama dan localStorage.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {applications.map((app) => {
            const match = calculateSkillMatch(app.requiredSkills, kaptenSkills);
            return (
              <div
                key={app.id}
                className="mc-surface flex items-start justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={getStatusBadgeTone(app.status)} dot>
                      {APPLICATION_STATUS_LABELS[app.status]}
                    </Badge>
                    <span className="text-xs font-semibold text-[#57524B] dark:text-[#B5AFA7]">
                      {app.workMode}
                    </span>
                  </div>
                  <h2 className="mt-2 truncate text-base font-bold text-[#171615] dark:text-white">
                    {app.role}
                  </h2>
                  <p className="text-sm text-[#57524B] dark:text-[#B5AFA7]">
                    {app.company}
                  </p>
                </div>
                <Badge
                  tone={getMatchTone(match.score)}
                  className="mc-tabular shrink-0 font-mono"
                >
                  {match.score}%
                </Badge>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface ComparatorSlotViewProps {
  offersCount: number;
  onGoToExplore: () => void;
}

/**
 * Placeholder terintegrasi untuk Slot Anggota 3 (Fitur 7: Offer Comparator).
 */
export function ComparatorSlotView({
  offersCount,
  onGoToExplore,
}: ComparatorSlotViewProps) {
  return (
    <div className="mc-panel p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[3px] border border-[#8EC980] bg-[#E3F4DE] text-[#1F5314] dark:border-[#3D8230] dark:bg-[#193516] dark:text-[#91EB7A]">
        <Scale className="h-6 w-6" />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <h1 className="font-pixel text-lg font-bold text-[#171615] uppercase dark:text-white">
          Offer Comparator
        </h1>
        <Badge tone="success">Slot Anggota 3</Badge>
      </div>
      <p className="mx-auto mt-2 max-w-lg text-sm text-[#57524B] dark:text-[#B5AFA7]">
        Saat ini terdapat{" "}
        <strong className="mc-tabular font-mono text-[#171615] dark:text-white">
          {offersCount}
        </strong>{" "}
        lamaran berstatus <code className="font-mono">OFFER</code>. Fitur
        perbandingan Offer A vs Offer B (Gaji 50%, Mode Kerja 25%, Skill Match
        25%) akan diintegrasikan oleh Anggota 3 di slot ini.
      </p>
      <div className="mt-5">
        <Button variant="primary" size="md" onClick={onGoToExplore}>
          <Compass className="h-4 w-4" />
          <span>Eksplorasi Lowongan</span>
        </Button>
      </div>
    </div>
  );
}

export function ManualFormSlotContent() {
  return (
    <div className="space-y-3 py-2 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[3px] border border-[#D4CBBF] bg-[#F5F1E9] text-[#8F5930] dark:border-[#4A3B2D] dark:bg-[#2B231C] dark:text-[#E0A170]">
        <Wrench className="h-5 w-5" />
      </div>
      <h3 className="text-base font-bold text-[#171615] dark:text-white">
        Slot Form Tambah Lamaran Manual (Anggota 2)
      </h3>
      <p className="mx-auto max-w-md text-sm text-[#57524B] dark:text-[#B5AFA7]">
        Komponen pembungkus <code className="font-mono">Modal</code> ini sudah
        siap pakai. Anggota 2 cukup mengganti isi modal ini dengan komponen{" "}
        <code className="font-mono">ApplicationForm</code> (controlled form,
        input kondisional <code className="font-mono">APPLIED</code>, validasi
        anti-duplikat &amp; auto-focus via{" "}
        <code className="font-mono">useRef</code>).
      </p>
    </div>
  );
}

import { AlertTriangle, CalendarClock, KanbanSquare } from "lucide-react";
import type { InterviewConflict } from "../../utils/scheduleChecker";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

interface InterviewConflictBannerProps {
  conflicts: readonly InterviewConflict[];
  isPipelineActive: boolean;
  onGoToPipeline: () => void;
}

function formatDateTime(value?: string): string {
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

/**
 * Banner Peringatan Bentrok Jadwal Interview (Fitur 3 — Anggota 2).
 * Dihitung dari seluruh data `applications` (lintas filter) dan tampil di atas semua tab.
 */
export function InterviewConflictBanner({
  conflicts,
  isPipelineActive,
  onGoToPipeline,
}: InterviewConflictBannerProps) {
  if (conflicts.length === 0) {
    return null;
  }

  return (
    <section
      role="alert"
      aria-live="assertive"
      className="mb-5 rounded-[3px] border-2 border-[#D96B66] bg-[#FDE7E6] p-4 text-[#7F1D1D] shadow-sm dark:border-[#962A2A] dark:bg-[#2E1414] dark:text-[#FECACA]"
    >
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[3px] border border-[#E89B96] bg-white text-[#B91C1C] dark:border-[#962A2A] dark:bg-[#3E1B1B] dark:text-[#FCA5A5]">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-bold text-[#7F1D1D] sm:text-base dark:text-[#FECACA]">
                Peringatan Bentrok Jadwal Interview
              </h2>
              <Badge tone="danger" className="mc-tabular font-mono">
                {conflicts.length} Bentrok
              </Badge>
            </div>
            <p className="text-sm text-[#7F1D1D] dark:text-[#FCA5A5]">
              Ditemukan jadwal interview yang berselisih kurang dari 60 menit.
              Segera atur ulang salah satu jadwal agar tidak bertabrakan:
            </p>

            <ul className="space-y-1.5 text-sm">
              {conflicts.map((conflict) => (
                <li
                  key={`${conflict.first.id}-${conflict.second.id}`}
                  className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-[3px] border border-[#E89B96] bg-white/80 px-3 py-1.5 text-xs font-medium text-[#7F1D1D] dark:border-[#7F2424] dark:bg-[#1E0E0E]/80 dark:text-[#FECACA]"
                >
                  <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    <strong>{conflict.first.company}</strong> ({conflict.first.role},{" "}
                    <span className="mc-tabular font-mono">
                      {formatDateTime(conflict.first.interviewDateTime)}
                    </span>
                    )
                  </span>
                  <span className="font-bold">vs</span>
                  <span>
                    <strong>{conflict.second.company}</strong> ({conflict.second.role},{" "}
                    <span className="mc-tabular font-mono">
                      {formatDateTime(conflict.second.interviewDateTime)}
                    </span>
                    )
                  </span>
                  <Badge tone="danger" className="mc-tabular font-mono">
                    Selisih {conflict.diffMinutes} menit
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {!isPipelineActive && (
          <Button
            variant="danger"
            size="sm"
            onClick={onGoToPipeline}
            className="shrink-0 self-start"
          >
            <KanbanSquare className="h-4 w-4" />
            <span>Lihat di Pipeline</span>
          </Button>
        )}
      </div>
    </section>
  );
}

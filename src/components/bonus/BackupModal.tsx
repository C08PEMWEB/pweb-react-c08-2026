import { useRef, useState, type ChangeEvent } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileJson,
  Upload,
} from "lucide-react";
import type { Application, CvDocument } from "../../types";
import { downloadBackupJson, parseBackupJson } from "../../utils/backup";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  kaptenSkills: string[];
  applications: Application[];
  cvVault: CvDocument[];
  onImportBackup: (
    skills: string[],
    apps: Application[],
    cvVault?: CvDocument[],
  ) => void;
}

export function BackupModal({
  isOpen,
  onClose,
  kaptenSkills,
  applications,
  cvVault,
  onImportBackup,
}: BackupModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleExport = () => {
    downloadBackupJson(kaptenSkills, applications, cvVault);
    setFeedback({
      type: "success",
      text: `Backup berhasil diunduh (${kaptenSkills.length} skill, ${applications.length} lamaran, ${cvVault.length} CV).`,
    });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const content = typeof reader.result === "string" ? reader.result : "";
        const data = parseBackupJson(content);
        onImportBackup(data.kaptenSkills, data.applications, data.cvVault);
        const cvCountText =
          data.cvVault !== undefined ? `, ${data.cvVault.length} CV` : "";
        setFeedback({
          type: "success",
          text: `Berhasil memulihkan ${data.kaptenSkills.length} skill, ${data.applications.length} lamaran${cvCountText} dari JSON.`,
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Gagal membaca file backup JSON.";
        setFeedback({ type: "error", text: message });
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsText(file);
  };

  const handleClose = () => {
    setFeedback(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Backup & Restore Data"
      subtitle="Simpan atau pulihkan profil skill dan daftar lamaran Kapten dalam format JSON."
      size="md"
      footer={
        <Button variant="secondary" size="md" onClick={handleClose}>
          Tutup
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Snapshot Summary */}
        <div className="flex items-center gap-3 rounded-[3px] border border-[#D7CFC2] bg-[#FAF8F4] p-4 dark:border-[#3A3735] dark:bg-[#171615]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[3px] border border-[#8EC980] bg-[#E3F4DE] text-[#1F5314] dark:border-[#3D8230] dark:bg-[#193516] dark:text-[#91EB7A]">
            <FileJson className="h-5 w-5" />
          </div>
          <div className="text-sm">
            <p className="font-bold text-[#171615] dark:text-white">
              Data LocalStorage Saat Ini
            </p>
            <p className="mt-0.5 text-[#57524B] dark:text-[#B5AFA7]">
              <strong className="mc-tabular font-mono text-[#171615] dark:text-white">
                {kaptenSkills.length}
              </strong>{" "}
              skill Kapten &middot;{" "}
              <strong className="mc-tabular font-mono text-[#171615] dark:text-white">
                {applications.length}
              </strong>{" "}
              lamaran magang &middot;{" "}
              <strong className="mc-tabular font-mono text-[#171615] dark:text-white">
                {cvVault.length}
              </strong>{" "}
              CV tersimpan
            </p>
          </div>
        </div>

        {/* Export & Import Actions */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-[3px] border border-[#D7CFC2] bg-white p-4 dark:border-[#383533] dark:bg-[#262423]">
            <h3 className="text-sm font-bold text-[#171615] dark:text-white">
              Export Backup
            </h3>
            <p className="mt-1 text-sm text-[#57524B] dark:text-[#B5AFA7]">
              Unduh file <code className="font-mono">.json</code> berisi profil
              skill &amp; daftar lamaran.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExport}
              className="mt-4 w-full"
            >
              <Download className="h-4 w-4" />
              <span>Unduh JSON</span>
            </Button>
          </div>

          <div className="rounded-[3px] border border-[#D7CFC2] bg-white p-4 dark:border-[#383533] dark:bg-[#262423]">
            <h3 className="text-sm font-bold text-[#171615] dark:text-white">
              Import Backup
            </h3>
            <p className="mt-1 text-sm text-[#57524B] dark:text-[#B5AFA7]">
              Muat file backup <code className="font-mono">.json</code> valid
              untuk memulihkan data.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 w-full"
            >
              <Upload className="h-4 w-4" />
              <span>Pilih File JSON</span>
            </Button>
          </div>
        </div>

        {/* Status Feedback */}
        {feedback && (
          <div
            role="status"
            className={`flex items-start gap-2 rounded-[3px] border p-3 text-sm font-medium ${
              feedback.type === "success"
                ? "border-[#8EC980] bg-[#E3F4DE] text-[#1F5314] dark:border-[#3D8230] dark:bg-[#193516] dark:text-[#91EB7A]"
                : "border-[#E89B96] bg-[#FDE7E6] text-[#921616] dark:border-[#962A2A] dark:bg-[#3A1616] dark:text-[#FCA5A5]"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}
      </div>
    </Modal>
  );
}

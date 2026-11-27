import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import type { Application, CvDocument } from "../../types";
import {
  createBlobUrlFromDataUrl,
  formatFileSize,
  getCvUsageStats,
  MAX_CV_VAULT_TOTAL_BYTES,
  processCvFile,
  suggestVersionLabel,
  validateCvFile,
} from "../../utils/cvVault";
import { normalizeText } from "../../utils/skillMatch";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

interface CvVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvVault: CvDocument[];
  applications: Application[];
  kaptenSkills: string[];
  initialPreviewCvId?: string | null;
  onAddCv: (doc: CvDocument) => void;
  onDeleteCv: (id: string) => void;
  onAddSkillsToProfile: (skills: string[]) => number;
}

export function CvVaultModal({
  isOpen,
  onClose,
  cvVault,
  applications,
  kaptenSkills,
  initialPreviewCvId = null,
  onAddCv,
  onDeleteCv,
  onAddSkillsToProfile,
}: CvVaultModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [versionLabel, setVersionLabel] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [previewCvId, setPreviewCvId] = useState<string | null>(
    initialPreviewCvId,
  );
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);

  // Sinkronkan preview awal setiap kali modal dibuka dari Detail Lamaran
  useEffect(() => {
    if (isOpen) {
      setPreviewCvId(initialPreviewCvId);
    }
  }, [isOpen, initialPreviewCvId]);

  const previewDoc = cvVault.find((doc) => doc.id === previewCvId) ?? null;

  // Buat Blob URL untuk preview CV dan wajib bersihkan via revokeObjectURL saat unmount/ganti
  useEffect(() => {
    if (!isOpen || !previewDoc) {
      setPreviewBlobUrl(null);
      return;
    }

    const blobUrl = createBlobUrlFromDataUrl(previewDoc.dataUrl);
    setPreviewBlobUrl(blobUrl);

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [isOpen, previewDoc]);

  const kaptenSkillSet = new Set(kaptenSkills.map((s) => normalizeText(s)));

  const handleFile = async (file: File) => {
    setErrorMsg(null);
    setStatusMsg(null);

    const validationError = validateCvFile(file);
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    const currentTotalBytes = cvVault.reduce(
      (sum, doc) => sum + doc.sizeBytes,
      0,
    );
    if (currentTotalBytes + file.size > MAX_CV_VAULT_TOTAL_BYTES) {
      setErrorMsg(
        "Total kapasitas CV Vault (maks. 3.2 MB) akan terlampaui. Hapus salah satu CV lama terlebih dahulu agar tetap tersimpan saat refresh.",
      );
      return;
    }

    const labelToUse =
      versionLabel.trim() || suggestVersionLabel(file.name, cvVault.length);

    const duplicateLabel = cvVault.some(
      (doc) => normalizeText(doc.versionLabel) === normalizeText(labelToUse),
    );
    if (duplicateLabel) {
      setErrorMsg(
        `Label versi "${labelToUse}" sudah dipakai di CV Vault. Gunakan nama versi lain (mis. ${labelToUse}-v2).`,
      );
      return;
    }

    setIsProcessing(true);
    try {
      const { dataUrl, detectedSkills } = await processCvFile(file);
      const newDoc: CvDocument = {
        id: crypto.randomUUID(),
        versionLabel: labelToUse,
        fileName: file.name,
        mimeType: file.type || "application/pdf",
        sizeBytes: file.size,
        uploadedAt: new Date().toISOString(),
        dataUrl,
        detectedSkills,
      };
      onAddCv(newDoc);
      setVersionLabel("");
      setPreviewCvId(newDoc.id);
      setStatusMsg(
        detectedSkills.length > 0
          ? `CV "${labelToUse}" tersimpan · ${detectedSkills.length} skill terdeteksi otomatis!`
          : `CV "${labelToUse}" berhasil disimpan ke CV Vault.`,
      );
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal memproses file CV.",
      );
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void handleFile(file);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      void handleFile(file);
    }
  };

  const handleDownloadCv = (doc: CvDocument) => {
    const anchor = document.createElement("a");
    anchor.href = doc.dataUrl;
    anchor.download = doc.fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handleAddDetected = (skills: string[]) => {
    const addedCount = onAddSkillsToProfile(skills);
    if (addedCount > 0) {
      setStatusMsg(
        `${addedCount} skill baru dari CV ditambahkan ke Profil Skill Kapten.`,
      );
    } else {
      setStatusMsg("Semua skill yang dipilih sudah ada di Profil Skill Kapten.");
    }
  };

  const handleClose = () => {
    setErrorMsg(null);
    setStatusMsg(null);
    setPreviewCvId(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="CV Vault & Auto-Scan Skill"
      subtitle="Unggah beberapa versi CV (PDF/TXT/MD), deteksi skill otomatis, dan pilih cepat saat melamar."
      size="xl"
      footer={
        <Button variant="secondary" size="md" onClick={handleClose}>
          Tutup
        </Button>
      }
    >
      <div className="space-y-5">
        {/* Upload Zone */}
        <section className="rounded-[3px] border border-[#D7CFC2] bg-[#FAF8F4] p-4 dark:border-[#3A3735] dark:bg-[#181716]">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-end">
            <div className="md:col-span-5">
              <label
                htmlFor="cv-version-label"
                className="mb-1.5 block text-xs font-bold tracking-wider text-[#3A3631] uppercase dark:text-[#DDD7CF]"
              >
                Label Versi CV (Opsional)
              </label>
              <input
                id="cv-version-label"
                type="text"
                value={versionLabel}
                onChange={(e) => {
                  setVersionLabel(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="Contoh: CV-Frontend-v2"
                className="mc-input px-3 py-2"
              />
            </div>

            <div className="md:col-span-7">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
                onChange={handleInputChange}
                className="hidden"
              />
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`flex flex-wrap items-center justify-between gap-3 rounded-[3px] border-2 border-dashed px-4 py-3 transition ${
                  isDragging
                    ? "border-[#2F7020] bg-[#E3F4DE] dark:border-[#6CC349] dark:bg-[#193516]"
                    : "border-[#C9C0B2] bg-white dark:border-[#44403D] dark:bg-[#22201F]"
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#171615] dark:text-white">
                    Tarik file CV ke sini atau pilih dari perangkat
                  </p>
                  <p className="text-xs text-[#57524B] dark:text-[#B5AFA7]">
                    Mendukung PDF, TXT, atau MD (maks. 1.5 MB per file).
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={isProcessing}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  <span>{isProcessing ? "Memindai..." : "Unggah CV"}</span>
                </Button>
              </div>
            </div>
          </div>

          {errorMsg && (
            <p
              role="alert"
              className="mt-3 flex items-start gap-2 rounded-[3px] border border-[#E89B96] bg-[#FDE7E6] px-3 py-2 text-xs font-semibold text-[#921616] dark:border-[#962A2A] dark:bg-[#3A1616] dark:text-[#FCA5A5]"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </p>
          )}

          {statusMsg && (
            <p
              role="status"
              className="mt-3 flex items-start gap-2 rounded-[3px] border border-[#8EC980] bg-[#E3F4DE] px-3 py-2 text-xs font-semibold text-[#1F5314] dark:border-[#3D8230] dark:bg-[#193516] dark:text-[#91EB7A]"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{statusMsg}</span>
            </p>
          )}
        </section>

        {/* Main Content: Saved CVs + Live Preview */}
        {cvVault.length === 0 ? (
          <div className="rounded-[3px] border border-dashed border-[#C9C0B2] p-8 text-center dark:border-[#44403D]">
            <FileText className="mx-auto h-8 w-8 text-[#8F5930] dark:text-[#D99B6B]" />
            <p className="mt-2 font-pixel text-sm font-bold text-[#171615] uppercase dark:text-white">
              CV Vault Masih Kosong
            </p>
            <p className="mx-auto mt-1 max-w-md text-sm text-[#57524B] dark:text-[#B5AFA7]">
              Unggah file CV PDF atau TXT agar Kapten tidak lupa versi CV mana
              yang dikirim dan bisa langsung memilihnya saat mencatat lamaran.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            {/* Daftar CV Tersimpan */}
            <div className="space-y-3 lg:col-span-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold tracking-wider text-[#3A3631] uppercase dark:text-[#DDD7CF]">
                  Daftar Versi CV ({cvVault.length})
                </h3>
              </div>

              {cvVault.map((doc) => {
                const usage = getCvUsageStats(doc, applications);
                const newSkills = doc.detectedSkills.filter(
                  (skill) => !kaptenSkillSet.has(normalizeText(skill)),
                );
                const isSelected = previewDoc?.id === doc.id;

                return (
                  <article
                    key={doc.id}
                    className={`rounded-[3px] border p-4 transition ${
                      isSelected
                        ? "border-[#2F7020] bg-[#EDF7EA]/80 dark:border-[#52A535] dark:bg-[#1A2F17]/75"
                        : "border-[#D7CFC2] bg-white dark:border-[#383533] dark:bg-[#242221]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="truncate text-sm font-bold text-[#171615] dark:text-white">
                            {doc.versionLabel}
                          </h4>
                          <Badge tone="neutral" className="mc-tabular font-mono">
                            {formatFileSize(doc.sizeBytes)}
                          </Badge>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-[#57524B] dark:text-[#B5AFA7]">
                          {doc.fileName}
                        </p>
                        <p className="mt-1.5 text-xs font-medium text-[#3A3631] dark:text-[#CFC9C1]">
                          Dipakai di{" "}
                          <strong className="mc-tabular font-mono">
                            {usage.totalUsed}
                          </strong>{" "}
                          lamaran &middot;{" "}
                          <strong className="mc-tabular font-mono text-[#1F5314] dark:text-[#91EB7A]">
                            {usage.interviewOrOffer}
                          </strong>{" "}
                          tembus Interview/Offer
                        </p>
                      </div>
                    </div>

                    {/* Auto-detected Skills dari CV */}
                    {doc.detectedSkills.length > 0 && (
                      <div className="mt-3 border-t border-[#E6DFD4] pt-2.5 dark:border-[#34312F]">
                        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1F5314] dark:text-[#91EB7A]">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>
                              Skill terdeteksi ({doc.detectedSkills.length})
                            </span>
                          </span>
                          {newSkills.length > 0 && (
                            <button
                              type="button"
                              onClick={() => handleAddDetected(newSkills)}
                              className="cursor-pointer text-xs font-bold text-[#1D4ED8] hover:underline dark:text-[#93C5FD]"
                            >
                              + Tambah {newSkills.length} skill baru ke Profil
                            </button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {doc.detectedSkills.map((skill) => {
                            const alreadyOwned = kaptenSkillSet.has(
                              normalizeText(skill),
                            );
                            return alreadyOwned ? (
                              <span
                                key={skill}
                                className="rounded-[3px] border border-[#8EC980] bg-[#E3F4DE] px-2 py-0.5 text-xs font-semibold text-[#1F5314] dark:border-[#3D8230] dark:bg-[#193516] dark:text-[#91EB7A]"
                              >
                                {skill}
                              </span>
                            ) : (
                              <button
                                key={skill}
                                type="button"
                                onClick={() => handleAddDetected([skill])}
                                title={`Tambahkan ${skill} ke Profil Skill Kapten`}
                                className="inline-flex cursor-pointer items-center gap-1 rounded-[3px] border border-[#94BEFB] bg-[#E4F0FF] px-2 py-0.5 text-xs font-semibold text-[#1742A8] transition hover:bg-[#D2E5FF] dark:border-[#2F5DA0] dark:bg-[#162845] dark:text-[#93C5FD]"
                              >
                                <Plus className="h-3 w-3" />
                                <span>{skill}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#E6DFD4] pt-3 dark:border-[#34312F]">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant={isSelected ? "primary" : "secondary"}
                          size="sm"
                          onClick={() =>
                            setPreviewCvId(isSelected ? null : doc.id)
                          }
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>{isSelected ? "Sedang Dibuka" : "Preview"}</span>
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDownloadCv(doc)}
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Unduh</span>
                        </Button>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          if (previewDoc?.id === doc.id) {
                            setPreviewCvId(null);
                          }
                          onDeleteCv(doc.id);
                        }}
                        aria-label={`Hapus CV ${doc.versionLabel}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Hapus</span>
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Panel Preview Dokumen CV */}
            <div className="flex flex-col lg:col-span-6">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold tracking-wider text-[#3A3631] uppercase dark:text-[#DDD7CF]">
                  Preview Dokumen
                </h3>
                {previewDoc && (
                  <button
                    type="button"
                    onClick={() => setPreviewCvId(null)}
                    className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-[#57524B] hover:text-[#171615] dark:text-[#B5AFA7] dark:hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Tutup preview</span>
                  </button>
                )}
              </div>

              {previewDoc && previewBlobUrl ? (
                <div className="flex min-h-[380px] flex-1 flex-col overflow-hidden rounded-[3px] border border-[#D7CFC2] bg-white dark:border-[#383533] dark:bg-[#171615]">
                  <div className="flex items-center justify-between gap-2 border-b border-[#E6DFD4] bg-[#FAF8F4] px-3 py-2 text-xs dark:border-[#34312F] dark:bg-[#22201F]">
                    <span className="truncate font-semibold text-[#171615] dark:text-white">
                      {previewDoc.versionLabel} ({previewDoc.fileName})
                    </span>
                    <a
                      href={previewBlobUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 font-bold text-[#1D4ED8] hover:underline dark:text-[#93C5FD]"
                    >
                      Buka tab baru
                    </a>
                  </div>
                  <iframe
                    title={`Preview ${previewDoc.versionLabel}`}
                    src={previewBlobUrl}
                    className="min-h-[340px] w-full flex-1 bg-white"
                  />
                </div>
              ) : (
                <div className="flex min-h-[320px] flex-1 flex-col items-center justify-center rounded-[3px] border border-dashed border-[#C9C0B2] bg-[#FAF8F4] p-6 text-center dark:border-[#44403D] dark:bg-[#181716]">
                  <Eye className="h-7 w-7 text-[#8F5930] dark:text-[#D99B6B]" />
                  <p className="mt-2 text-sm font-semibold text-[#171615] dark:text-white">
                    Pilih tombol Preview pada salah satu CV
                  </p>
                  <p className="mt-1 max-w-xs text-xs text-[#57524B] dark:text-[#B5AFA7]">
                    Dokumen PDF atau teks akan ditampilkan langsung di sini
                    secara aman menggunakan Blob URL lokal.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

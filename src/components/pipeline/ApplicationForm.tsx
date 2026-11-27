import { useRef, useState, type FormEvent } from "react";
import { AlertCircle, Plus } from "lucide-react";
import type { Application, CvDocument, WorkMode } from "../../types";
import { isDuplicateApplication } from "../../utils/skillMatch";
import { Button } from "../ui/Button";

export interface NewApplicationInput {
  company: string;
  role: string;
  workMode: WorkMode;
  status: "WISHLIST" | "APPLIED";
  requiredSkills: string[];
  cvVersion?: string;
  appliedDate?: string;
}

interface ApplicationFormProps {
  applications: readonly Application[];
  cvVault?: readonly CvDocument[];
  onSubmit: (input: NewApplicationInput) => void;
  onCancel: () => void;
}

type FormField =
  | "company"
  | "role"
  | "requiredSkills"
  | "cvVersion"
  | "appliedDate";

type FormErrors = Partial<Record<FormField, string>>;

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseSkillsInput(raw: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const part of raw.split(",")) {
    const trimmed = part.trim();
    const key = trimmed.toLowerCase();
    if (trimmed.length > 0 && !seen.has(key)) {
      seen.add(key);
      result.push(trimmed);
    }
  }

  return result;
}

/**
 * Form Tambah Lamaran Manual (Fitur 2 — Anggota 2).
 * Controlled form penuh dengan validasi input wajib, input kondisional APPLIED,
 * anti-duplikat company + role, serta auto-focus ke field error pertama via useRef.
 */
export function ApplicationForm({
  applications,
  cvVault = [],
  onSubmit,
  onCancel,
}: ApplicationFormProps) {
  const [company, setCompany] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [workMode, setWorkMode] = useState<WorkMode>("Remote");
  const [status, setStatus] = useState<"WISHLIST" | "APPLIED">("WISHLIST");
  const [skillsText, setSkillsText] = useState<string>("");
  const [cvVersion, setCvVersion] = useState<string>("");
  const [appliedDate, setAppliedDate] = useState<string>(getTodayDateString);
  const [errors, setErrors] = useState<FormErrors>({});

  // useRef untuk auto-focus ke input pertama yang mengalami error
  const companyRef = useRef<HTMLInputElement>(null);
  const roleRef = useRef<HTMLInputElement>(null);
  const skillsRef = useRef<HTMLInputElement>(null);
  const cvVersionRef = useRef<HTMLInputElement>(null);
  const appliedDateRef = useRef<HTMLInputElement>(null);

  const parsedSkills = parseSkillsInput(skillsText);

  const clearFieldError = (field: FormField) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const focusFirstError = (nextErrors: FormErrors) => {
    if (nextErrors.company) {
      companyRef.current?.focus();
      return;
    }
    if (nextErrors.role) {
      roleRef.current?.focus();
      return;
    }
    if (nextErrors.requiredSkills) {
      skillsRef.current?.focus();
      return;
    }
    if (nextErrors.cvVersion) {
      cvVersionRef.current?.focus();
      return;
    }
    if (nextErrors.appliedDate) {
      appliedDateRef.current?.focus();
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedCompany = company.trim();
    const trimmedRole = role.trim();
    const trimmedCv = cvVersion.trim();
    const trimmedDate = appliedDate.trim();
    const nextErrors: FormErrors = {};

    if (!trimmedCompany) {
      nextErrors.company = "Nama perusahaan wajib diisi.";
    }

    if (!trimmedRole) {
      nextErrors.role = "Posisi / role magang wajib diisi.";
    }

    if (
      trimmedCompany &&
      trimmedRole &&
      isDuplicateApplication(applications, trimmedCompany, trimmedRole)
    ) {
      nextErrors.company = `Lamaran "${trimmedRole}" di ${trimmedCompany} sudah tercatat (anti-duplikat).`;
    }

    if (parsedSkills.length === 0) {
      nextErrors.requiredSkills =
        "Masukkan minimal 1 skill yang dibutuhkan (pisahkan dengan koma).";
    }

    if (status === "APPLIED") {
      if (!trimmedCv) {
        nextErrors.cvVersion =
          "Versi CV wajib diisi jika status awal APPLIED.";
      }
      if (!trimmedDate) {
        nextErrors.appliedDate =
          "Tanggal melamar wajib diisi jika status awal APPLIED.";
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      focusFirstError(nextErrors);
      return;
    }

    onSubmit({
      company: trimmedCompany,
      role: trimmedRole,
      workMode,
      status,
      requiredSkills: parsedSkills,
      cvVersion: status === "APPLIED" ? trimmedCv : undefined,
      appliedDate: status === "APPLIED" ? trimmedDate : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Perusahaan */}
      <div>
        <label
          htmlFor="manual-company"
          className="mb-1.5 block text-xs font-bold tracking-wider text-[#3A3631] uppercase dark:text-[#DDD7CF]"
        >
          Nama Perusahaan <span className="text-[#B91C1C] dark:text-[#FCA5A5]">*</span>
        </label>
        <input
          ref={companyRef}
          id="manual-company"
          type="text"
          value={company}
          onChange={(e) => {
            setCompany(e.target.value);
            clearFieldError("company");
          }}
          aria-invalid={Boolean(errors.company)}
          placeholder="Contoh: Nusantara Cloud Tech"
          className="mc-input px-3 py-2"
        />
        {errors.company && (
          <p
            role="alert"
            className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#921616] dark:text-[#FCA5A5]"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{errors.company}</span>
          </p>
        )}
      </div>

      {/* Posisi / Role */}
      <div>
        <label
          htmlFor="manual-role"
          className="mb-1.5 block text-xs font-bold tracking-wider text-[#3A3631] uppercase dark:text-[#DDD7CF]"
        >
          Posisi / Role <span className="text-[#B91C1C] dark:text-[#FCA5A5]">*</span>
        </label>
        <input
          ref={roleRef}
          id="manual-role"
          type="text"
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            clearFieldError("role");
            clearFieldError("company");
          }}
          aria-invalid={Boolean(errors.role)}
          placeholder="Contoh: Frontend Engineer Intern"
          className="mc-input px-3 py-2"
        />
        {errors.role && (
          <p
            role="alert"
            className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#921616] dark:text-[#FCA5A5]"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{errors.role}</span>
          </p>
        )}
      </div>

      {/* Mode Kerja & Status Awal */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="manual-work-mode"
            className="mb-1.5 block text-xs font-bold tracking-wider text-[#3A3631] uppercase dark:text-[#DDD7CF]"
          >
            Mode Kerja
          </label>
          <select
            id="manual-work-mode"
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value as WorkMode)}
            className="mc-input cursor-pointer px-3 py-2"
          >
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Onsite">Onsite</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="manual-status"
            className="mb-1.5 block text-xs font-bold tracking-wider text-[#3A3631] uppercase dark:text-[#DDD7CF]"
          >
            Status Awal
          </label>
          <select
            id="manual-status"
            value={status}
            onChange={(e) => {
              const nextStatus = e.target.value as "WISHLIST" | "APPLIED";
              setStatus(nextStatus);
              if (nextStatus === "WISHLIST") {
                clearFieldError("cvVersion");
                clearFieldError("appliedDate");
              }
            }}
            className="mc-input cursor-pointer px-3 py-2"
          >
            <option value="WISHLIST">WISHLIST (Target)</option>
            <option value="APPLIED">APPLIED (Sudah Melamar)</option>
          </select>
        </div>
      </div>

      {/* Input Kondisional untuk Status APPLIED */}
      {status === "APPLIED" && (
        <div className="grid grid-cols-1 gap-4 rounded-[3px] border border-[#94BEFB] bg-[#E4F0FF]/60 p-3.5 sm:grid-cols-2 dark:border-[#2F5DA0] dark:bg-[#162845]/55">
          <div>
            <label
              htmlFor="manual-cv-version"
              className="mb-1.5 block text-xs font-bold tracking-wider text-[#1742A8] uppercase dark:text-[#93C5FD]"
            >
              Versi CV <span className="text-[#B91C1C] dark:text-[#FCA5A5]">*</span>
            </label>
            <input
              ref={cvVersionRef}
              id="manual-cv-version"
              type="text"
              value={cvVersion}
              onChange={(e) => {
                setCvVersion(e.target.value);
                clearFieldError("cvVersion");
              }}
              aria-invalid={Boolean(errors.cvVersion)}
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
                      clearFieldError("cvVersion");
                    }}
                    className="cursor-pointer rounded-[2px] border border-[#94BEFB] bg-white px-2 py-0.5 text-xs font-semibold text-[#1742A8] transition hover:bg-[#E4F0FF] dark:border-[#2F5DA0] dark:bg-[#1E2E47] dark:text-[#93C5FD]"
                  >
                    {doc.versionLabel}
                  </button>
                ))}
              </div>
            )}
            {errors.cvVersion && (
              <p
                role="alert"
                className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#921616] dark:text-[#FCA5A5]"
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errors.cvVersion}</span>
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="manual-applied-date"
              className="mb-1.5 block text-xs font-bold tracking-wider text-[#1742A8] uppercase dark:text-[#93C5FD]"
            >
              Tanggal Melamar <span className="text-[#B91C1C] dark:text-[#FCA5A5]">*</span>
            </label>
            <input
              ref={appliedDateRef}
              id="manual-applied-date"
              type="date"
              value={appliedDate}
              onChange={(e) => {
                setAppliedDate(e.target.value);
                clearFieldError("appliedDate");
              }}
              aria-invalid={Boolean(errors.appliedDate)}
              className="mc-input px-3 py-2"
            />
            {errors.appliedDate && (
              <p
                role="alert"
                className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#921616] dark:text-[#FCA5A5]"
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errors.appliedDate}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Required Skills */}
      <div>
        <label
          htmlFor="manual-skills"
          className="mb-1.5 block text-xs font-bold tracking-wider text-[#3A3631] uppercase dark:text-[#DDD7CF]"
        >
          Required Skills (pisahkan dengan koma){" "}
          <span className="text-[#B91C1C] dark:text-[#FCA5A5]">*</span>
        </label>
        <input
          ref={skillsRef}
          id="manual-skills"
          type="text"
          value={skillsText}
          onChange={(e) => {
            setSkillsText(e.target.value);
            clearFieldError("requiredSkills");
          }}
          aria-invalid={Boolean(errors.requiredSkills)}
          placeholder="Contoh: React, TypeScript, Tailwind, Git"
          className="mc-input px-3 py-2"
        />
        {parsedSkills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {parsedSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-[3px] border border-[#8EC980] bg-[#E3F4DE] px-2 py-0.5 text-xs font-semibold text-[#1F5314] dark:border-[#3D8230] dark:bg-[#193516] dark:text-[#91EB7A]"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
        {errors.requiredSkills && (
          <p
            role="alert"
            className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#921616] dark:text-[#FCA5A5]"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{errors.requiredSkills}</span>
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-[#E3DCD0] pt-4 dark:border-[#34312F]">
        <Button variant="secondary" size="md" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" variant="primary" size="md">
          <Plus className="h-4 w-4" />
          <span>Simpan Lamaran</span>
        </Button>
      </div>
    </form>
  );
}

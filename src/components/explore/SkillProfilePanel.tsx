import { useState, type FormEvent } from "react";
import {
  AlertCircle,
  Database,
  Globe,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import { DEFAULT_KAPTEN_SKILLS, type JobSource } from "../../types";
import { normalizeText } from "../../utils/skillMatch";
import { Button } from "../ui/Button";
import { VoxelPickaxeIcon } from "../ui/MinecraftIcons";

interface SkillProfilePanelProps {
  skills: string[];
  onAddSkill: (skill: string) => boolean;
  onRemoveSkill: (skill: string) => void;
  onResetSkills: () => void;
  source: JobSource;
  onSourceChange: (source: JobSource) => void;
}

const SUGGESTED_SKILLS = [
  "Docker",
  "Git",
  "REST API",
  "Node.js",
  "PostgreSQL",
  "Tailwind",
  "Python",
  "Next.js",
];

export function SkillProfilePanel({
  skills,
  onAddSkill,
  onRemoveSkill,
  onResetSkills,
  source,
  onSourceChange,
}: SkillProfilePanelProps) {
  const [skillInput, setSkillInput] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const normalizedSet = new Set(skills.map((s) => normalizeText(s)));
  const availableSuggestions = SUGGESTED_SKILLS.filter(
    (item) => !normalizedSet.has(normalizeText(item)),
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = skillInput.trim();

    if (!trimmed) {
      setErrorMsg("Masukkan nama skill terlebih dahulu.");
      return;
    }

    if (normalizedSet.has(normalizeText(trimmed))) {
      setErrorMsg(`Skill "${trimmed}" sudah ada di profil Kapten.`);
      return;
    }

    const added = onAddSkill(trimmed);
    if (added) {
      setSkillInput("");
      setErrorMsg(null);
    }
  };

  const handleQuickAdd = (suggested: string) => {
    setErrorMsg(null);
    onAddSkill(suggested);
  };

  const isDefaultMatch =
    skills.length === DEFAULT_KAPTEN_SKILLS.length &&
    DEFAULT_KAPTEN_SKILLS.every((item) =>
      normalizedSet.has(normalizeText(item)),
    );

  return (
    <aside className="space-y-5 lg:sticky lg:top-20">
      {/* Panel 1: Profil Skill Kapten */}
      <section className="mc-panel overflow-hidden">
        <div className="mc-biome-rule" />
        <div className="border-b border-[#DDD5C9] px-4 py-3.5 dark:border-[#34312F]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <VoxelPickaxeIcon className="h-5 w-5 shrink-0" />
              <h2 className="text-base font-bold text-[#171615] dark:text-white">
                Profil Skill Kapten
              </h2>
            </div>
            <span className="mc-tabular rounded-[3px] border border-[#8EC980] bg-[#E3F4DE] px-2 py-0.5 font-mono text-xs font-bold text-[#1F5314] dark:border-[#3D8230] dark:bg-[#193516] dark:text-[#91EB7A]">
              {skills.length}
            </span>
          </div>
          <p className="mt-1 text-sm text-[#57524B] dark:text-[#B5AFA7]">
            Dipakai untuk menghitung skor kecocokan tiap lowongan.
          </p>
        </div>

        <div className="space-y-4 p-4">
          {/* Form Tambah Skill */}
          <form onSubmit={handleSubmit} className="space-y-2" noValidate>
            <label htmlFor="kapten-skill-input" className="sr-only">
              Tambah skill baru Kapten
            </label>
            <div className="flex gap-2">
              <input
                id="kapten-skill-input"
                type="text"
                value={skillInput}
                onChange={(e) => {
                  setSkillInput(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="Contoh: Docker"
                className="mc-input px-3 py-2"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="shrink-0 px-3"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span>Tambah</span>
              </Button>
            </div>

            {errorMsg && (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-[3px] border border-[#E89B96] bg-[#FDE7E6] px-3 py-2 text-xs font-semibold text-[#921616] dark:border-[#962A2A] dark:bg-[#3A1616] dark:text-[#FCA5A5]"
              >
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </p>
            )}
          </form>

          {/* Daftar Skill Aktif */}
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-bold tracking-wider text-[#57524B] uppercase dark:text-[#B5AFA7]">
                Skill Dikuasai
              </span>
              {!isDefaultMatch && (
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    onResetSkills();
                  }}
                  className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-[#276118] hover:underline dark:text-[#86E270]"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {skills.length === 0 ? (
              <p className="rounded-[3px] border border-dashed border-[#C9C0B2] bg-white px-3 py-3 text-sm text-[#57524B] dark:border-[#464340] dark:bg-[#171615] dark:text-[#B5AFA7]">
                Belum ada skill. Tambahkan skill agar kecocokan lowongan bisa
                dihitung.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 rounded-[3px] border border-[#8EC980] bg-[#E3F4DE] py-1 pr-1.5 pl-2.5 text-xs font-semibold text-[#1F5314] dark:border-[#3D8230] dark:bg-[#193516] dark:text-[#91EB7A]"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => onRemoveSkill(skill)}
                      aria-label={`Hapus skill ${skill}`}
                      className="cursor-pointer rounded-[2px] p-0.5 text-[#1F5314] transition hover:bg-[#CBEAC3] focus-visible:outline-2 focus-visible:outline-[#2F7020] dark:text-[#91EB7A] dark:hover:bg-[#275122] dark:hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Tambah Cepat */}
          {availableSuggestions.length > 0 && (
            <div className="border-t border-[#E4DDD1] pt-3 dark:border-[#302D2B]">
              <span className="mb-2 block text-xs font-bold tracking-wider text-[#57524B] uppercase dark:text-[#B5AFA7]">
                Tambah Cepat
              </span>
              <div className="flex flex-wrap gap-1.5">
                {availableSuggestions.slice(0, 6).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleQuickAdd(item)}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-[3px] border border-[#CFC7B9] bg-white px-2.5 py-1 text-xs font-medium text-[#35312D] transition hover:border-[#2F7020] hover:bg-[#EBF7E8] hover:text-[#1F5314] focus-visible:outline-2 focus-visible:outline-[#52A535] dark:border-[#44403D] dark:bg-[#262423] dark:text-[#DDD7CF] dark:hover:border-[#5EB841] dark:hover:bg-[#193516] dark:hover:text-[#91EB7A]"
                  >
                    <Plus className="h-3 w-3" />
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Panel 2: Sumber Data Lowongan */}
      <section className="mc-panel overflow-hidden">
        <div className="border-b border-[#DDD5C9] px-4 py-3 dark:border-[#34312F]">
          <h2 className="text-base font-bold text-[#171615] dark:text-white">
            Sumber Data Lowongan
          </h2>
          <p className="mt-0.5 text-sm text-[#57524B] dark:text-[#B5AFA7]">
            Pilih Remotive Live API atau dataset lokal.
          </p>
        </div>

        <div
          className="space-y-2.5 p-4"
          role="radiogroup"
          aria-label="Sumber data lowongan"
        >
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-[3px] border p-3 transition ${
              source === "live"
                ? "border-[#2F7020] bg-[#EDF7EA] dark:border-[#52A535] dark:bg-[#1A2F17]"
                : "border-[#D7CFC2] bg-white hover:border-[#9E9487] dark:border-[#3A3735] dark:bg-[#242221] dark:hover:border-[#5B5753]"
            }`}
          >
            <input
              type="radio"
              name="job-source"
              value="live"
              checked={source === "live"}
              onChange={() => onSourceChange("live")}
              className="mt-1 h-4 w-4 accent-[#2F7020] dark:accent-[#52A535]"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-sm font-bold text-[#171615] dark:text-white">
                <Globe className="h-4 w-4 shrink-0 text-[#1D4ED8] dark:text-[#60A5FA]" />
                <span>Remotive API (Live)</span>
              </div>
              <p className="mt-0.5 text-sm text-[#57524B] dark:text-[#B5AFA7]">
                Lowongan Software Dev remote global secara langsung.
              </p>
            </div>
          </label>

          <label
            className={`flex cursor-pointer items-start gap-3 rounded-[3px] border p-3 transition ${
              source === "local"
                ? "border-[#2F7020] bg-[#EDF7EA] dark:border-[#52A535] dark:bg-[#1A2F17]"
                : "border-[#D7CFC2] bg-white hover:border-[#9E9487] dark:border-[#3A3735] dark:bg-[#242221] dark:hover:border-[#5B5753]"
            }`}
          >
            <input
              type="radio"
              name="job-source"
              value="local"
              checked={source === "local"}
              onChange={() => onSourceChange("local")}
              className="mt-1 h-4 w-4 accent-[#2F7020] dark:accent-[#52A535]"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-sm font-bold text-[#171615] dark:text-white">
                <Database className="h-4 w-4 shrink-0 text-[#8F5930] dark:text-[#E0A170]" />
                <span>Dataset Magang ID (Lokal)</span>
              </div>
              <p className="mt-0.5 text-sm text-[#57524B] dark:text-[#B5AFA7]">
                15 lowongan magang tech Indonesia siap pakai offline.
              </p>
            </div>
          </label>
        </div>
      </section>
    </aside>
  );
}

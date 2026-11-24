import { Keyboard } from "lucide-react";
import type { JobSource } from "../../types";

interface HeroBannerProps {
  skillsCount: number;
  savedCount: number;
  source: JobSource;
  onFocusSearch: () => void;
}

/**
 * Header halaman Operate bergaya editorial Minecraft.net:
 * ringkas, tegas, tanpa eyebrow/kicker dekoratif, langsung membawa
 * katalog lowongan naik ke above-the-fold pada desktop & mobile.
 */
export function HeroBanner({
  skillsCount,
  savedCount,
  source,
  onFocusSearch,
}: HeroBannerProps) {
  return (
    <section className="mc-panel px-5 py-4 sm:px-6 sm:py-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <h1 className="font-pixel text-2xl leading-tight font-bold tracking-tight text-[#171615] uppercase sm:text-3xl dark:text-white">
            Eksplorasi{" "}
            <span className="text-[#1F5314] dark:text-[#78D95F]">Lowongan</span>
          </h1>

          <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-[#45403B] sm:text-[15px] dark:text-[#C8C2BA]">
            Sesuaikan daftar skill Kapten untuk melihat kecocokan tiap lowongan
            secara langsung, lalu simpan target terbaik ke Wishlist.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#45403B] dark:text-[#C8C2BA]">
          <div className="flex items-center gap-4">
            <span>
              Skill:{" "}
              <strong className="mc-tabular font-mono font-bold text-[#171615] dark:text-white">
                {skillsCount}
              </strong>
            </span>
            <span className="text-[#B8AFA2] dark:text-[#524E4A]" aria-hidden="true">
              /
            </span>
            <span>
              Wishlist:{" "}
              <strong className="mc-tabular font-mono font-bold text-[#171615] dark:text-white">
                {savedCount}
              </strong>
            </span>
            <span className="text-[#B8AFA2] dark:text-[#524E4A]" aria-hidden="true">
              /
            </span>
            <span className="font-semibold text-[#1F5314] dark:text-[#86E270]">
              {source === "live" ? "Remotive Live" : "Dataset Magang ID"}
            </span>
          </div>

          <button
            type="button"
            onClick={onFocusSearch}
            className="mc-bevel-stone inline-flex cursor-pointer items-center gap-2 rounded-[3px] px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-[#52A535]"
          >
            <Keyboard className="h-3.5 w-3.5" />
            <span>Cari cepat</span>
            <kbd className="rounded-[2px] border border-[#BEB5A7] bg-white px-1.5 py-0.5 font-mono text-xs font-bold text-[#262320] dark:border-[#524E4A] dark:bg-[#171615] dark:text-[#EAE5DE]">
              /
            </kbd>
          </button>
        </div>
      </div>
    </section>
  );
}

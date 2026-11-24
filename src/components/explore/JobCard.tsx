import { useState } from "react";
import {
  BookmarkPlus,
  Check,
  CheckCircle2,
  MapPin,
  Wallet,
  X,
} from "lucide-react";
import type { JobListing, SkillMatchResult } from "../../types";
import {
  getCompanyInitials,
  getMatchTone,
  inferWorkMode,
} from "../../utils/skillMatch";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

interface JobCardProps {
  job: JobListing;
  match: SkillMatchResult;
  isAlreadyApplied: boolean;
  onSaveToWishlist: (job: JobListing) => void;
}

const MAX_VISIBLE_MISSING_SKILLS = 6;
const XP_SEGMENTS = 10;

const EMBLEM_PALETTES = [
  "bg-[#213B22] text-[#A8F096] border-[#3E7834]",
  "bg-[#3B2B1E] text-[#F5DEC2] border-[#785538]",
  "bg-[#1A2D4A] text-[#B8D9FF] border-[#355D96]",
  "bg-[#2E2C29] text-[#E6E0D6] border-[#595550]",
  "bg-[#3D241C] text-[#FBD5C5] border-[#824B38]",
];

function getEmblemClass(companyName: string): string {
  let hash = 0;
  for (let i = 0; i < companyName.length; i += 1) {
    hash = (hash * 31 + companyName.charCodeAt(i)) % EMBLEM_PALETTES.length;
  }
  return EMBLEM_PALETTES[Math.abs(hash) % EMBLEM_PALETTES.length];
}

export function JobCard({
  job,
  match,
  isAlreadyApplied,
  onSaveToWishlist,
}: JobCardProps) {
  const [showAllMissing, setShowAllMissing] = useState(false);

  const matchTone = getMatchTone(match.score);
  const workMode = inferWorkMode(job.candidate_required_location);
  const initials = getCompanyInitials(job.company_name);
  const totalSkills = match.matchedSkills.length + match.missingSkills.length;

  const filledSegments = Math.round((match.score / 100) * XP_SEGMENTS);
  const hiddenMissingCount = Math.max(
    0,
    match.missingSkills.length - MAX_VISIBLE_MISSING_SKILLS,
  );
  const visibleMissingSkills = showAllMissing
    ? match.missingSkills
    : match.missingSkills.slice(0, MAX_VISIBLE_MISSING_SKILLS);

  const xpSegmentColor =
    match.level === "high"
      ? "bg-[#3C8527] dark:bg-[#6CC349]"
      : match.level === "medium"
        ? "bg-[#C27803] dark:bg-[#F59E0B]"
        : "bg-[#B91C1C] dark:bg-[#EF4444]";

  return (
    <article className="mc-surface mc-surface-interactive flex flex-col justify-between p-5">
      <div>
        {/* Top Row: Company Identity + Match Score & Minecraft XP-Bar */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[3px] border font-mono text-sm font-bold tracking-wider ${getEmblemClass(job.company_name)}`}
              aria-hidden="true"
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#171615] dark:text-white">
                {job.company_name}
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#57524B] dark:text-[#B5AFA7]">
                <span className="inline-flex min-w-0 items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-[#8F5930] dark:text-[#D99B6B]" />
                  <span className="truncate">
                    {job.candidate_required_location}
                  </span>
                </span>
                <span className="rounded-[2px] border border-[#D4CBBF] bg-[#F2EEE7] px-1.5 py-0.5 text-xs font-semibold text-[#3E3933] dark:border-[#44403C] dark:bg-[#2C2A28] dark:text-[#DCD6CE]">
                  {workMode}
                </span>
              </div>
            </div>
          </div>

          {/* Match Score Badge + 10-Block Minecraft XP Bar */}
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <Badge tone={matchTone} dot className="mc-tabular font-mono">
              {match.score}% Match
            </Badge>
            <div
              className="grid w-24 grid-cols-10 gap-[2px] rounded-[2px] bg-[#DDD5C9] p-[2px] dark:bg-[#141312]"
              aria-hidden="true"
            >
              {Array.from({ length: XP_SEGMENTS }).map((_, index) => (
                <span
                  key={index}
                  className={`h-1.5 transition-colors duration-200 ${
                    index < filledSegments
                      ? xpSegmentColor
                      : "bg-[#EFEAE2] dark:bg-[#2C2A28]"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Job Title & Category */}
        <div className="mt-4">
          <h3 className="text-base leading-snug font-bold text-[#171615] dark:text-white">
            {job.title}
          </h3>
          <p className="mt-1 text-xs font-medium text-[#5C564E] dark:text-[#ABA49B]">
            {job.category}
          </p>
        </div>

        {/* Skill Breakdown: Matched (Hijau) vs Missing (Merah) dengan Progressive Disclosure */}
        <div className="mt-4 space-y-2.5">
          {totalSkills === 0 ? (
            <p className="rounded-[3px] border border-dashed border-[#D1C8BB] bg-[#FAF8F4] px-3 py-2 text-sm text-[#57524B] dark:border-[#3E3B38] dark:bg-[#191817] dark:text-[#B5AFA7]">
              Tidak ada tag skill spesifik dari sumber lowongan.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-1.5">
                {match.matchedSkills.map((skill) => (
                  <span
                    key={`match-${skill}`}
                    title="Skill cocok dengan profil Kapten"
                    className="inline-flex items-center gap-1 rounded-[3px] border border-[#8EC980] bg-[#E3F4DE] px-2 py-0.5 text-xs font-semibold text-[#1F5314] dark:border-[#3D8230] dark:bg-[#193516] dark:text-[#91EB7A]"
                  >
                    <Check className="h-3 w-3 shrink-0 stroke-[2.75]" />
                    <span>{skill}</span>
                  </span>
                ))}

                {visibleMissingSkills.map((skill) => (
                  <span
                    key={`miss-${skill}`}
                    title="Missing skill — belum dimiliki Kapten"
                    className="inline-flex items-center gap-1 rounded-[3px] border border-[#E89B96] bg-[#FDE7E6] px-2 py-0.5 text-xs font-semibold text-[#921616] dark:border-[#962A2A] dark:bg-[#3A1616] dark:text-[#FCA5A5]"
                  >
                    <X className="h-3 w-3 shrink-0 stroke-[2.5]" />
                    <span>{skill}</span>
                  </span>
                ))}

                {hiddenMissingCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAllMissing((prev) => !prev)}
                    aria-expanded={showAllMissing}
                    className="cursor-pointer rounded-[3px] border border-[#CFC7B9] bg-[#F4F0E8] px-2 py-0.5 text-xs font-semibold text-[#3A3631] transition hover:border-[#2F7020] hover:text-[#1F5314] focus-visible:outline-2 focus-visible:outline-[#52A535] dark:border-[#494542] dark:bg-[#2C2A28] dark:text-[#DDD7CF] dark:hover:border-[#6CC349] dark:hover:text-white"
                  >
                    {showAllMissing
                      ? "Ringkas skill"
                      : `+${hiddenMissingCount} lainnya`}
                  </button>
                )}
              </div>

              <p className="text-xs font-medium text-[#57524B] dark:text-[#B5AFA7]">
                <span className="mc-tabular font-semibold text-[#1F5314] dark:text-[#91EB7A]">
                  {match.matchedSkills.length} dari {totalSkills}
                </span>{" "}
                skill cocok
                {match.missingSkills.length > 0
                  ? ` · ${match.missingSkills.length} perlu dipelajari`
                  : " · semua terpenuhi"}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Footer: Salary & Action Button */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#E6DFD4] pt-4 dark:border-[#34312F]">
        <div className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-[#2B2825] dark:text-[#EAE5DE]">
          <Wallet className="h-4 w-4 shrink-0 text-[#8F5930] dark:text-[#D99B6B]" />
          <span className="mc-tabular truncate font-mono text-xs sm:text-sm">
            {job.salary}
          </span>
        </div>

        {isAlreadyApplied ? (
          <Button
            variant="secondary"
            size="sm"
            disabled
            className="shrink-0"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Sudah Dilamar</span>
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onSaveToWishlist(job)}
            className="shrink-0"
          >
            <BookmarkPlus className="h-4 w-4" />
            <span>Simpan ke Wishlist</span>
          </Button>
        )}
      </div>
    </article>
  );
}

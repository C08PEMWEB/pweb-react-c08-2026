import type { ReactNode } from "react";
import type { ApplicationStatus, SemanticTone } from "../../types";

interface BadgeProps {
  tone?: SemanticTone;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}

const TONE_CLASSES: Record<SemanticTone, string> = {
  success:
    "bg-[#E3F4DE] text-[#1F5314] border-[#8EC980] dark:bg-[#193516] dark:text-[#91EB7A] dark:border-[#3D8230]",
  warning:
    "bg-[#FDF1D2] text-[#7A4404] border-[#E4B853] dark:bg-[#38270A] dark:text-[#FCD34D] dark:border-[#A46B13]",
  danger:
    "bg-[#FDE7E6] text-[#921616] border-[#E89B96] dark:bg-[#3A1616] dark:text-[#FCA5A5] dark:border-[#962A2A]",
  primary:
    "bg-[#E4F0FF] text-[#1742A8] border-[#94BEFB] dark:bg-[#162845] dark:text-[#93C5FD] dark:border-[#2F5DA0]",
  neutral:
    "bg-[#ECE8E1] text-[#3E3A35] border-[#C9C0B3] dark:bg-[#2E2C2A] dark:text-[#D9D4CD] dark:border-[#4D4945]",
};

const DOT_CLASSES: Record<SemanticTone, string> = {
  success: "bg-[#2A6E1C] dark:bg-[#7EE065]",
  warning: "bg-[#B45309] dark:bg-[#FBBF24]",
  danger: "bg-[#B91C1C] dark:bg-[#F87171]",
  primary: "bg-[#1D4ED8] dark:bg-[#60A5FA]",
  neutral: "bg-[#615B53] dark:bg-[#B0AAA1]",
};

/**
 * Komponen Badge standar Design System (Section 4 Pembagian Tugas)
 * dengan kontras WCAG AA (>= 4.5:1) di Light & Dark Mode:
 * - success (Hijau): Skill Match >= 70%, status OFFER, Rekomendasi Terbaik
 * - warning (Kuning/Amber): Skill Match 40-69%, status INTERVIEW, Rawan Ghosting
 * - danger (Merah): Skill Match < 40%, status REJECTED, Missing Skills, Banner Bentrok
 * - primary (Biru): Status APPLIED / SCREENING, indikator aktif
 * - neutral (Abu-abu): Status WISHLIST / GHOSTED, tombol disabled
 */
export function Badge({
  tone = "neutral",
  children,
  className = "",
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[3px] border px-2.5 py-0.5 text-xs font-semibold tracking-tight ${TONE_CLASSES[tone]} ${className}`}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-none ${DOT_CLASSES[tone]}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export function getStatusBadgeTone(status: ApplicationStatus): SemanticTone {
  switch (status) {
    case "OFFER":
      return "success";
    case "INTERVIEW":
      return "warning";
    case "REJECTED":
      return "danger";
    case "APPLIED":
    case "SCREENING":
      return "primary";
    case "WISHLIST":
    case "GHOSTED":
      return "neutral";
  }
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  WISHLIST: "Wishlist",
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
  GHOSTED: "Ghosted",
};

import type { ActiveTab, Application, CvDocument } from "../types";
import {
  countRawanGhosting,
  findInterviewConflicts,
} from "./scheduleChecker";
import { getTopMissingSkills } from "./skillMatch";

export type MascotActionType =
  | "tab:explore"
  | "tab:pipeline"
  | "tab:comparator"
  | "modal:cv"
  | "modal:manual";

export interface MascotQuickAction {
  label: string;
  action: MascotActionType;
}

export interface MascotContextData {
  applications: readonly Application[];
  kaptenSkills: readonly string[];
  cvVault: readonly CvDocument[];
  activeTab: ActiveTab;
}

export interface MascotFaqTemplate {
  id: string;
  question: string;
  shortLabel: string;
  keywords: readonly string[];
  buildAnswer: (ctx: MascotContextData) => {
    text: string;
    action?: MascotQuickAction;
  };
}

export const MASCOT_TEMPLATES: readonly MascotFaqTemplate[] = [
  {
    id: "status-summary",
    question: "Bagaimana ringkasan status lamaranku sekarang?",
    shortLabel: "Cek Statusku",
    keywords: ["status", "ringkasan", "progress", "progres", "cek", "kondisi", "alarm"],
    buildAnswer: (ctx) => {
      const total = ctx.applications.length;
      const ghosting = countRawanGhosting(ctx.applications);
      const conflicts = findInterviewConflicts(ctx.applications).length;
      const offers = ctx.applications.filter((a) => a.status === "OFFER").length;

      if (total === 0) {
        return {
          text: `Hrmm! Saat ini kamu belum punya lamaran tersimpan dan memiliki ${ctx.kaptenSkills.length} skill aktif serta ${ctx.cvVault.length} file di CV Vault. Mulai dengan menyimpan lowongan dari tab Eksplorasi atau klik Catat Lamaran.`,
          action: { label: "Ke Eksplorasi", action: "tab:explore" },
        };
      }

      const alerts: string[] = [];
      if (conflicts > 0) {
        alerts.push(`${conflicts} jadwal interview bentrok (< 60 menit)`);
      }
      if (ghosting > 0) {
        alerts.push(`${ghosting} lamaran Rawan Ghosting (> 14 hari)`);
      }

      const alertLine =
        alerts.length > 0
          ? `Perhatian: ${alerts.join(" dan ")}.`
          : "Aman! Tidak ada jadwal bentrok atau lamaran rawan ghosting saat ini.";

      return {
        text: `Hrmm! Kamu punya ${total} lamaran, ${offers} Offer diterima, ${ctx.kaptenSkills.length} skill Kapten, dan ${ctx.cvVault.length} file di CV Vault. ${alertLine}`,
        action: { label: "Buka Pipeline", action: "tab:pipeline" },
      };
    },
  },
  {
    id: "compare-offers",
    question: "Bagaimana cara membandingkan Offer magang?",
    shortLabel: "Bandingkan Offer",
    keywords: ["offer", "banding", "bandingkan", "comparator", "gaji", "skor", "rekomendasi"],
    buildAnswer: (ctx) => {
      const offers = ctx.applications.filter((a) => a.status === "OFFER").length;
      if (offers >= 2) {
        return {
          text: `Mantap! Kamu sudah punya ${offers} Offer. Langsung buka tab Bandingkan Offer lalu pilih Offer A dan Offer B. Bobot penilaiannya: Uang Saku 50%, Mode Kerja 25% (Remote 100 / Hybrid 75 / Onsite 50), dan Kecocokan Skill 25%.`,
          action: { label: "Buka Offer Comparator", action: "tab:comparator" },
        };
      }
      return {
        text: `Butuh minimal 2 lamaran berstatus OFFER (saat ini ${offers}). Di tab Pipeline Lamaran, naikkan status bertahap: WISHLIST -> APPLIED -> SCREENING -> INTERVIEW -> OFFER (isi nominal gaji > 0 & mode kerja).`,
        action: { label: "Ke Pipeline Lamaran", action: "tab:pipeline" },
      };
    },
  },
  {
    id: "state-machine",
    question: "Apa aturan pindah status (State Machine)?",
    shortLabel: "Aturan Status",
    keywords: ["state", "machine", "transisi", "pindah", "tahap", "wishlist", "applied", "screening", "interview"],
    buildAnswer: () => ({
      text: "Alur sah State Machine: WISHLIST -> APPLIED (wajib Versi CV & Tanggal), APPLIED -> SCREENING / REJECTED / GHOSTED, SCREENING -> INTERVIEW (wajib Jadwal) / REJECTED / GHOSTED, INTERVIEW -> OFFER (wajib Gaji > 0 & Mode Kerja) / REJECTED / GHOSTED. Khusus GHOSTED boleh kembali ke SCREENING; OFFER & REJECTED bersifat final.",
      action: { label: "Kelola di Pipeline", action: "tab:pipeline" },
    }),
  },
  {
    id: "ghosting-followup",
    question: "Kenapa muncul Rawan Ghosting & cara follow-up HRD?",
    shortLabel: "Ghosting & Follow-Up",
    keywords: ["ghosting", "hrd", "follow", "email", "14", "15", "simulasi"],
    buildAnswer: () => ({
      text: "Badge Rawan Ghosting muncul otomatis bila status APPLIED atau SCREENING tidak diperbarui lebih dari 14 hari. Untuk demo cepat, klik tombol Simulasi +15 Hari. Lalu buka Detail Lamaran untuk memakai Generator Follow-Up HRD (Formal ID, Singkat DM, atau English) dengan 1-klik salin!",
      action: { label: "Cek Pipeline", action: "tab:pipeline" },
    }),
  },
  {
    id: "cv-vault",
    question: "Bagaimana cara pakai CV Vault & Auto-Scan Skill?",
    shortLabel: "Upload & CV Vault",
    keywords: ["cv", "upload", "unggah", "pdf", "vault", "scan", "berkas", "file"],
    buildAnswer: (ctx) => ({
      text: `Klik tombol CV Vault di kanan atas Navbar (tersimpan ${ctx.cvVault.length} file) untuk mengunggah CV berformat PDF, TXT, atau MD (maks. 2 MB). Sistem otomatis memindai skill teknologi di dalam CV agar bisa ditambah 1 klik ke profil, menampilkan preview langsung, dan menyediakan pilihan cepat saat mengisi Versi CV.`,
      action: { label: "Buka CV Vault", action: "modal:cv" },
    }),
  },
  {
    id: "skill-match",
    question: "Bagaimana cara menaikkan Skill Match %?",
    shortLabel: "Skill Match %",
    keywords: ["skill", "match", "cocok", "persen", "docker", "missing", "belajar"],
    buildAnswer: (ctx) => {
      const topGaps = getTopMissingSkills(ctx.applications, ctx.kaptenSkills, 3);
      const gapHint =
        topGaps.length > 0
          ? ` Prioritas skill dari lamaranmu saat ini: ${topGaps.map((g) => `${g.skill} (${g.count}x)`).join(", ")}.`
          : "";
      return {
        text: `Rumus Match Score = Math.round((skill cocok / total required skills) x 100), case-insensitive. Hijau >= 70%, Kuning 40-69%, Merah < 40%. Tambah skill baru di sidebar Profil Skill Kapten dan skor langsung naik otomatis.${gapHint}`,
        action: { label: "Ke Profil Skill", action: "tab:explore" },
      };
    },
  },
  {
    id: "bonus-shortcuts",
    question: "Apa saja fitur bonus, timer, dan shortcut?",
    shortLabel: "Shortcut & Bonus",
    keywords: ["bonus", "shortcut", "timer", "undo", "backup", "json", "kalender", "ics", "tema", "dark", "malam", "siang"],
    buildAnswer: () => ({
      text: "Shortcut '/' langsung memfokuskan kolom pencarian. Fitur tambahan lain: Tema Desa Minecraft Siang/Malam di Navbar, Export/Import Backup JSON, Undo Delete 5 detik, Latihan Interview Timer 02:00 di Detail Lamaran, dan tombol Simpan .ics untuk ekspor jadwal interview ke Google/Apple Calendar.",
    }),
  },
];

/**
 * Mencocokkan pertanyaan ketikan pengguna dengan template jawaban paling relevan
 * tanpa membutuhkan API AI eksternal.
 */
export function matchTemplateByQuery(
  rawQuery: string,
): MascotFaqTemplate | null {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return null;

  let bestTemplate: MascotFaqTemplate | null = null;
  let bestScore = 0;

  for (const template of MASCOT_TEMPLATES) {
    let score = 0;
    for (const kw of template.keywords) {
      if (query.includes(kw)) {
        score += kw.length >= 5 ? 3 : 2;
      }
    }
    if (template.question.toLowerCase().includes(query)) {
      score += 4;
    }
    if (score > bestScore) {
      bestScore = score;
      bestTemplate = template;
    }
  }

  return bestScore > 0 ? bestTemplate : null;
}

import type { Application, CvDocument } from "../types";
import { normalizeText } from "./skillMatch";

export const MAX_CV_FILE_SIZE_BYTES = Math.floor(1.5 * 1024 * 1024); // 1.5 MB per file
export const MAX_CV_VAULT_TOTAL_BYTES = Math.floor(3.2 * 1024 * 1024); // 3.2 MB total agar aman di localStorage

const ACCEPTED_EXTENSIONS = [".pdf", ".txt", ".md"];

const KNOWN_TECH_SKILLS: readonly string[] = [
  "React",
  "TypeScript",
  "JavaScript",
  "CSS",
  "HTML",
  "Tailwind",
  "Next.js",
  "Vue",
  "Node.js",
  "Express",
  "Prisma",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "SQL",
  "Redis",
  "Docker",
  "Kubernetes",
  "Linux",
  "Git",
  "CI/CD",
  "REST API",
  "GraphQL",
  "Python",
  "Java",
  "Go",
  "Rust",
  "PHP",
  "Laravel",
  "React Native",
  "Flutter",
  "Playwright",
  "Jest",
  "Figma",
  "AWS",
  "GCP",
  "WebGL",
  "Machine Learning",
  "Networking",
];

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Memindai teks CV untuk mendeteksi daftar skill teknologi yang tercantum.
 */
export function extractSkillsFromText(rawText: string): string[] {
  if (!rawText.trim()) return [];

  const detected: string[] = [];
  for (const skill of KNOWN_TECH_SKILLS) {
    const pattern = new RegExp(`(^|[^a-zA-Z0-9+#.])${escapeRegex(skill)}($|[^a-zA-Z0-9+#.])`, "i");
    if (pattern.test(rawText)) {
      detected.push(skill);
    }
  }
  return detected;
}

export function validateCvFile(file: File): string | null {
  const lowerName = file.name.toLowerCase();
  const hasValidExt = ACCEPTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  const isValidMime =
    file.type === "application/pdf" ||
    file.type.startsWith("text/") ||
    file.type === "";

  if (!hasValidExt || !isValidMime) {
    return "Format file harus PDF (.pdf), TXT (.txt), atau Markdown (.md).";
  }

  if (file.size === 0) {
    return "File CV kosong dan tidak dapat diunggah.";
  }

  if (file.size > MAX_CV_FILE_SIZE_BYTES) {
    return "Ukuran file melebihi batas 1.5 MB agar tetap aman disimpan di browser.";
  }

  return null;
}

export function suggestVersionLabel(
  fileName: string,
  existingCount: number,
): string {
  const withoutExt = fileName.replace(/\.[^.]+$/, "").trim();
  if (withoutExt.length >= 2 && withoutExt.length <= 36) {
    return withoutExt;
  }
  return `CV-Magang-v${existingCount + 1}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Gagal membaca konten file CV."));
      }
    };
    reader.onerror = () => reject(new Error("Gagal membaca file CV."));
    reader.readAsDataURL(file);
  });
}

function readAsTextSafe(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(typeof reader.result === "string" ? reader.result : "");
    };
    reader.onerror = () => resolve("");
    reader.readAsText(file);
  });
}

/**
 * Membaca file CV sebagai Data URL (untuk penyimpanan & preview lokal)
 * sekaligus mengekstrak skill teknologi yang terdeteksi dari teksnya.
 */
export async function processCvFile(file: File): Promise<{
  dataUrl: string;
  detectedSkills: string[];
}> {
  const [dataUrl, rawText] = await Promise.all([
    readAsDataUrl(file),
    readAsTextSafe(file),
  ]);

  const combinedText = `${file.name.replace(/[-_]/g, " ")}\n${rawText}`;
  const detectedSkills = extractSkillsFromText(combinedText);

  return { dataUrl, detectedSkills };
}

/**
 * Mengubah Data URL tersimpan menjadi Blob URL untuk preview PDF/TXT di browser.
 * Caller wajib membersihkan Blob URL dengan URL.revokeObjectURL saat unmount.
 */
export function createBlobUrlFromDataUrl(dataUrl: string): string | null {
  try {
    const [header, base64] = dataUrl.split(",");
    if (!header || !base64) return null;
    const mimeMatch = header.match(/data:([^;]+);/);
    const mimeType = mimeMatch ? mimeMatch[1] : "application/octet-stream";
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mimeType });
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

export interface CvUsageStats {
  totalUsed: number;
  interviewOrOffer: number;
}

/**
 * Derived state: menghitung seberapa efektif setiap versi CV berdasarkan
 * riwayat lamaran yang memakai versi CV tersebut.
 */
export function getCvUsageStats(
  cv: CvDocument,
  applications: readonly Application[],
): CvUsageStats {
  const targetLabel = normalizeText(cv.versionLabel);
  const targetFile = normalizeText(cv.fileName);

  let totalUsed = 0;
  let interviewOrOffer = 0;

  for (const app of applications) {
    if (!app.cvVersion) continue;
    const normalizedAppCv = normalizeText(app.cvVersion);
    if (normalizedAppCv === targetLabel || normalizedAppCv === targetFile) {
      totalUsed += 1;
      if (app.status === "INTERVIEW" || app.status === "OFFER") {
        interviewOrOffer += 1;
      }
    }
  }

  return { totalUsed, interviewOrOffer };
}

export function findMatchingCvDocument(
  cvVault: readonly CvDocument[],
  cvVersion?: string,
): CvDocument | undefined {
  if (!cvVersion) return undefined;
  const target = normalizeText(cvVersion);
  return cvVault.find(
    (doc) =>
      normalizeText(doc.versionLabel) === target ||
      normalizeText(doc.fileName) === target,
  );
}

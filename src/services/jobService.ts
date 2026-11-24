import type { JobListing, JobSource } from "../types";

export const REMOTIVE_API_URL =
  "https://remotive.com/api/remote-jobs?category=software-dev&limit=30";

export const LOCAL_FALLBACK_URL = "/magang-fallback.json";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeJobListing(item: unknown, fallbackId: number): JobListing | null {
  if (!isRecord(item)) return null;

  const title = typeof item.title === "string" ? item.title.trim() : "";
  const companyName =
    typeof item.company_name === "string" ? item.company_name.trim() : "";

  if (!title || !companyName) return null;

  const id = typeof item.id === "number" ? item.id : fallbackId;
  const category =
    typeof item.category === "string" && item.category.trim().length > 0
      ? item.category.trim()
      : "Software Development";
  const location =
    typeof item.candidate_required_location === "string" &&
    item.candidate_required_location.trim().length > 0
      ? item.candidate_required_location.trim()
      : "Remote";
  const salary =
    typeof item.salary === "string" && item.salary.trim().length > 0
      ? item.salary.trim()
      : "Kompetitif";

  const rawTags = Array.isArray(item.tags) ? item.tags : [];
  const tags = rawTags
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

  return {
    id,
    title,
    company_name: companyName,
    category,
    candidate_required_location: location,
    salary,
    tags,
  };
}

function extractRawJobs(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (isRecord(payload) && Array.isArray(payload.jobs)) {
    return payload.jobs;
  }
  throw new Error("Format respons lowongan tidak valid.");
}

/**
 * Mengambil daftar lowongan dari Remotive Live API atau fallback JSON lokal
 * dengan dukungan penuh AbortController.
 */
export async function fetchJobs(
  source: JobSource,
  signal?: AbortSignal,
): Promise<JobListing[]> {
  const url = source === "live" ? REMOTIVE_API_URL : LOCAL_FALLBACK_URL;

  const response = await fetch(url, {
    signal,
    cache: source === "live" ? "no-store" : "default",
  });

  if (!response.ok) {
    throw new Error(
      source === "live"
        ? `Gagal menghubungi Remotive API (HTTP ${response.status}).`
        : `Gagal memuat dataset lokal (HTTP ${response.status}).`,
    );
  }

  const json: unknown = await response.json();
  const rawList = extractRawJobs(json);

  const normalized: JobListing[] = [];
  rawList.forEach((item, index) => {
    const job = normalizeJobListing(item, 9000 + index);
    if (job) {
      normalized.push(job);
    }
  });

  return normalized;
}

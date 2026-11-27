import type { Application } from "../types";

function formatIcsUtc(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
    "T",
    pad(date.getUTCHours()),
    pad(date.getUTCMinutes()),
    pad(date.getUTCSeconds()),
    "Z",
  ].join("");
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Menghasilkan file kalender standar RFC 5545 (.ics) berdurasi 60 menit
 * dengan pengingat 30 menit sebelumnya untuk jadwal interview Kapten.
 */
export function buildInterviewIcs(application: Application): string | null {
  if (!application.interviewDateTime) return null;
  const start = new Date(application.interviewDateTime);
  if (Number.isNaN(start.getTime())) return null;

  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const now = new Date();

  const summary = `Interview Magang: ${application.role} (${application.company})`;
  const descriptionParts = [
    `Perusahaan: ${application.company}`,
    `Posisi: ${application.role}`,
    `Mode Kerja: ${application.workMode}`,
  ];
  if (application.cvVersion) {
    descriptionParts.push(`Versi CV: ${application.cvVersion}`);
  }
  if (application.requiredSkills.length > 0) {
    descriptionParts.push(
      `Skill Utama: ${application.requiredSkills.join(", ")}`,
    );
  }

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Aku Mw Magang//Portal Magang Kapten//ID",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${application.id}@aku-mw-magang`,
    `DTSTAMP:${formatIcsUtc(now)}`,
    `DTSTART:${formatIcsUtc(start)}`,
    `DTEND:${formatIcsUtc(end)}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    `DESCRIPTION:${escapeIcsText(descriptionParts.join("\n"))}`,
    `LOCATION:${escapeIcsText(application.workMode)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Pengingat Interview Magang 30 menit lagi",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadInterviewIcs(application: Application): boolean {
  const icsContent = buildInterviewIcs(application);
  if (!icsContent) return false;

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const slug = `${application.company}-${application.role}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

  anchor.href = url;
  anchor.download = `interview-${slug || "magang"}.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
  return true;
}

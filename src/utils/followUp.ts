import type { Application } from "../types";

export type FollowUpTone = "formal-id" | "ringkas-id" | "english";

export interface FollowUpDraft {
  subject: string;
  body: string;
}

function formatReadableDate(dateStr?: string): string {
  if (!dateStr) return "beberapa waktu lalu";
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Menghasilkan draft pesan follow-up HRD yang dipersonalisasi sesuai data
 * lamaran & skill cocok Kapten (sangat membantu saat status Rawan Ghosting).
 */
export function generateFollowUpDraft(
  application: Application,
  matchedSkills: readonly string[],
  tone: FollowUpTone,
): FollowUpDraft {
  const skillHighlight =
    matchedSkills.length > 0
      ? matchedSkills.slice(0, 3).join(", ")
      : application.requiredSkills.slice(0, 3).join(", ") ||
        "pengembangan perangkat lunak";

  const cvNote = application.cvVersion
    ? ` (${application.cvVersion})`
    : "";
  const appliedDateText = formatReadableDate(application.appliedDate);

  if (tone === "ringkas-id") {
    return {
      subject: `Follow-Up Lamaran ${application.role} - ${application.company}`,
      body: [
        `Halo Tim Rekrutmen ${application.company},`,
        "",
        `Saya ingin menindaklanjuti lamaran saya untuk posisi ${application.role} yang dikirim pada ${appliedDateText}${cvNote}.`,
        `Saya sangat antusias berkontribusi dengan latar belakang saya di ${skillHighlight}. Apakah ada pembaruan terkait tahapan seleksi berikutnya?`,
        "",
        "Terima kasih banyak atas waktunya.",
        "Salam hangat,",
        "Kapten",
      ].join("\n"),
    };
  }

  if (tone === "english") {
    return {
      subject: `Application Follow-Up: ${application.role} at ${application.company}`,
      body: [
        `Dear ${application.company} Hiring Team,`,
        "",
        `I hope you are doing well. I am writing to kindly follow up on my application for the ${application.role} position submitted on ${appliedDateText}${cvNote}.`,
        `I remain very enthusiastic about the opportunity to contribute my skills in ${skillHighlight} to your team. Please let me know if you need any additional information or portfolio samples from my side.`,
        "",
        "Thank you for your time and consideration.",
        "",
        "Best regards,",
        "Kapten",
      ].join("\n"),
    };
  }

  return {
    subject: `Tindak Lanjut Lamaran Magang: ${application.role} - ${application.company}`,
    body: [
      `Yth. Tim Rekrutmen ${application.company},`,
      "",
      `Semoga Bapak/Ibu dalam keadaan sehat. Melalui pesan ini, saya bermaksud menindaklanjuti status lamaran saya untuk posisi ${application.role} (${application.workMode}) yang telah saya kirimkan pada ${appliedDateText}${cvNote}.`,
      "",
      `Saya masih sangat berminat untuk bergabung dan berkontribusi dalam tim ${application.company}, khususnya melalui pengalaman saya di ${skillHighlight}. Apabila diperlukan dokumen tambahan atau informasi portofolio, saya siap segera mengirimkannya.`,
      "",
      "Terima kasih atas waktu dan perhatian Bapak/Ibu.",
      "",
      "Hormat saya,",
      "Kapten",
    ].join("\n"),
  };
}

export function buildMailtoHref(subject: string, body: string): string {
  const params = new URLSearchParams({ subject, body });
  return `mailto:?${params.toString()}`;
}

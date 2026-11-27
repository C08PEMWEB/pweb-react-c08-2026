import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, ChevronUp, Copy, Mail } from "lucide-react";
import type { Application } from "../../types";
import {
  buildMailtoHref,
  generateFollowUpDraft,
  type FollowUpTone,
} from "../../utils/followUp";
import { isRawanGhosting } from "../../utils/scheduleChecker";
import { calculateSkillMatch } from "../../utils/skillMatch";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

interface FollowUpGeneratorProps {
  application: Application;
  kaptenSkills: string[];
  onLogCopy: (message: string) => void;
}

const TONE_OPTIONS: ReadonlyArray<{ id: FollowUpTone; label: string }> = [
  { id: "formal-id", label: "Formal (ID)" },
  { id: "ringkas-id", label: "Singkat DM" },
  { id: "english", label: "English" },
];

export function FollowUpGenerator({
  application,
  kaptenSkills,
  onLogCopy,
}: FollowUpGeneratorProps) {
  const isEligible =
    application.status === "APPLIED" ||
    application.status === "SCREENING" ||
    application.status === "GHOSTED";

  const rawanGhosting = isRawanGhosting(application);
  const [isOpen, setIsOpen] = useState<boolean>(rawanGhosting);
  const [tone, setTone] = useState<FollowUpTone>("formal-id");
  const [copied, setCopied] = useState<boolean>(false);
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  if (!isEligible) return null;

  const { matchedSkills } = calculateSkillMatch(
    application.requiredSkills,
    kaptenSkills,
  );
  const draft = generateFollowUpDraft(application, matchedSkills, tone);
  const mailtoHref = buildMailtoHref(draft.subject, draft.body);

  const copyToClipboardSafe = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Lanjut ke fallback textarea
    }

    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const copiedOk = document.execCommand("copy");
      document.body.removeChild(textarea);
      return copiedOk;
    } catch {
      return false;
    }
  };

  const handleCopy = async () => {
    const fullText = `Subjek: ${draft.subject}\n\n${draft.body}`;
    const ok = await copyToClipboardSafe(fullText);
    if (!ok) return;

    setCopied(true);
    const toneLabel =
      TONE_OPTIONS.find((item) => item.id === tone)?.label ?? tone;
    onLogCopy(`Menyalin template follow-up HRD (${toneLabel})`);
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = window.setTimeout(() => {
      setCopied(false);
      copyTimerRef.current = null;
    }, 2400);
  };

  return (
    <section className="rounded-[3px] border border-[#D7CFC2] bg-[#FAF8F4] p-4 dark:border-[#3A3735] dark:bg-[#191817]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-bold text-[#171615] dark:text-white">
            Generator Follow-Up HRD
          </h2>
          {rawanGhosting && <Badge tone="warning">Disarankan (&gt;14 hari)</Badge>}
        </div>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          className="inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-[#1F5314] hover:underline dark:text-[#86E270]"
        >
          <span>{isOpen ? "Sembunyikan" : "Buat Pesan"}</span>
          {isOpen ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 space-y-3 border-t border-[#E6DFD4] pt-3 dark:border-[#34312F]">
          <div className="flex flex-wrap gap-1.5">
            {TONE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setTone(option.id)}
                className={`cursor-pointer rounded-[3px] border px-2.5 py-1 text-xs font-semibold transition ${
                  tone === option.id
                    ? "border-[#2F7020] bg-[#E3F4DE] text-[#1F5314] dark:border-[#52A535] dark:bg-[#193516] dark:text-[#91EB7A]"
                    : "border-[#D4CBBF] bg-white text-[#4A453F] hover:border-[#9E9487] dark:border-[#44403C] dark:bg-[#242221] dark:text-[#CFC9C1]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="space-y-2 rounded-[3px] border border-[#D7CFC2] bg-white p-3 text-xs dark:border-[#3A3735] dark:bg-[#22201F]">
            <p className="font-semibold text-[#171615] dark:text-white">
              Subjek: <span className="font-normal">{draft.subject}</span>
            </p>
            <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-[#3A3631] dark:text-[#DDD7CF]">
              {draft.body}
            </pre>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="primary" size="sm" onClick={() => void handleCopy()}>
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Tersalin &amp; Tercatat di Log</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Salin Pesan</span>
                </>
              )}
            </Button>

            <a
              href={mailtoHref}
              className="mc-bevel-stone inline-flex items-center gap-1.5 rounded-[3px] px-3 py-1.5 text-xs font-bold tracking-tight transition focus-visible:outline-2 focus-visible:outline-[#52A535]"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Buka Email</span>
            </a>
          </div>
        </div>
      )}
    </section>
  );
}

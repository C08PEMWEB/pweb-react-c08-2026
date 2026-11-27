import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  MessageSquare,
  RotateCcw,
  Send,
  X,
} from "lucide-react";
import type { ActiveTab, Application, CvDocument } from "../../types";
import {
  MASCOT_TEMPLATES,
  matchTemplateByQuery,
  type MascotActionType,
  type MascotContextData,
  type MascotFaqTemplate,
  type MascotQuickAction,
} from "../../utils/assistantTemplates";
import {
  countRawanGhosting,
  findInterviewConflicts,
} from "../../utils/scheduleChecker";

interface ChatMessage {
  id: string;
  sender: "mascot" | "user";
  text: string;
  action?: MascotQuickAction;
}

interface MascotAssistantProps {
  applications: readonly Application[];
  kaptenSkills: readonly string[];
  cvVault: readonly CvDocument[];
  activeTab: ActiveTab;
  onAction: (action: MascotActionType) => void;
}

function createGreetingMessage(): ChatMessage {
  return {
    id: "mascot-greeting",
    sender: "mascot",
    text: "Hrmm! Halo Kapten! Aku Pak Villager, pemandu quest magangmu. Pilih salah satu pertanyaan template di bawah atau ketik kata kunci (misal: offer, cv, ghosting, skill).",
  };
}

/**
 * Floating Minecraft Villager Mentor Mascot di pojok kanan bawah
 * dengan chatbox tanya-jawab template berbasis live derived state (tanpa API AI).
 */
export function MascotAssistant({
  applications,
  kaptenSkills,
  cvVault,
  activeTab,
  onAction,
}: MascotAssistantProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    createGreetingMessage(),
  ]);
  const [queryInput, setQueryInput] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const alertCount =
    findInterviewConflicts(applications).length +
    countRawanGhosting(applications);

  const contextData: MascotContextData = {
    applications,
    kaptenSkills,
    cvVault,
    activeTab,
  };

  // Auto-scroll ke pesan terbaru tiap ada jawaban baru
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Tutup chatbox dengan tombol Escape (dengan cleanup)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const askTemplate = (template: MascotFaqTemplate) => {
    const answer = template.buildAnswer(contextData);
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      text: template.question,
    };
    const mascotMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "mascot",
      text: answer.text,
      action: answer.action,
    };
    setMessages((prev) => [...prev, userMsg, mascotMsg]);
  };

  const handleSubmitQuery = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = queryInput.trim();
    if (!trimmed) return;

    const matched = matchTemplateByQuery(trimmed);
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      text: trimmed,
    };

    const mascotMsg: ChatMessage = matched
      ? (() => {
          const answer = matched.buildAnswer(contextData);
          return {
            id: crypto.randomUUID(),
            sender: "mascot",
            text: answer.text,
            action: answer.action,
          };
        })()
      : {
          id: crypto.randomUUID(),
          sender: "mascot",
          text: "Hrmm! Aku asisten template tanpa AI, jadi coba pilih salah satu tombol pertanyaan di bawah atau ketik kata kunci seperti: status, offer, cv, ghosting, skill, atau shortcut.",
        };

    setMessages((prev) => [...prev, userMsg, mascotMsg]);
    setQueryInput("");
  };

  const handleResetChat = () => {
    setMessages([createGreetingMessage()]);
    setQueryInput("");
  };

  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3 sm:right-5 sm:bottom-5">
      {/* Chatbox Panel */}
      {isOpen && (
        <section
          role="dialog"
          aria-label="Chatbox Asisten Pak Villager"
          className="flex max-h-[74vh] w-[calc(100vw-2rem)] max-w-[380px] flex-col overflow-hidden rounded-[3px] border-2 border-[#C7BEB0] bg-[#FFFFFF] shadow-2xl dark:border-[#494542] dark:bg-[#1E1C1B]"
        >
          <div className="mc-biome-rule shrink-0" />

          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-[#E3DCD0] bg-[#171615] px-4 py-3 text-white dark:border-[#34312F]">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[3px] border border-[#52A535] bg-[#242221] p-0.5">
                <img
                  src="/mascot-villager.png"
                  alt="Pak Villager Mentor"
                  className="h-full w-full object-contain"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>
              <div className="min-w-0">
                <h2 className="truncate font-pixel text-xs font-bold tracking-tight text-[#8CEB73]">
                  PAK VILLAGER
                </h2>
                <p className="truncate text-xs text-[#C6C0B8]">
                  Pemandu Magang · Template Q&amp;A
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                title="Reset percakapan"
                aria-label="Reset percakapan"
                className="cursor-pointer rounded-[3px] p-1.5 text-[#C6C0B8] transition hover:bg-[#2C2A28] hover:text-white focus-visible:outline-2 focus-visible:outline-[#6CC349]"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Tutup asisten"
                aria-label="Tutup chatbox asisten"
                className="cursor-pointer rounded-[3px] p-1.5 text-[#C6C0B8] transition hover:bg-[#2C2A28] hover:text-white focus-visible:outline-2 focus-visible:outline-[#6CC349]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages History */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-[#F8F5EF] p-3.5 dark:bg-[#161514]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[88%] space-y-2 rounded-[3px] border px-3 py-2 text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "border-[#204F15] bg-[#2F7020] text-white"
                      : "border-[#D7CFC2] bg-white text-[#171615] dark:border-[#3A3735] dark:bg-[#242221] dark:text-[#F0EDE7]"
                  }`}
                >
                  <p>{msg.text}</p>
                  {msg.action && (
                    <button
                      type="button"
                      onClick={() => {
                        onAction(msg.action!.action);
                        setIsOpen(false);
                      }}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-[2px] border border-[#8EC980] bg-[#E3F4DE] px-2.5 py-1 text-xs font-bold text-[#1F5314] transition hover:bg-[#D1EDC9] dark:border-[#3D8230] dark:bg-[#193516] dark:text-[#91EB7A] dark:hover:bg-[#22471E]"
                    >
                      <span>{msg.action.label}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Template Quick-Question Chips */}
          <div className="border-t border-[#E3DCD0] bg-[#FAF8F4] px-3.5 py-2.5 dark:border-[#34312F] dark:bg-[#1D1B1A]">
            <p className="mb-2 text-xs font-bold tracking-wider text-[#57524B] uppercase dark:text-[#B5AFA7]">
              Pilih Pertanyaan Cepat
            </p>
            <div className="flex flex-wrap gap-1.5">
              {MASCOT_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => askTemplate(tpl)}
                  className="cursor-pointer rounded-[3px] border border-[#CFC7B9] bg-white px-2.5 py-1 text-xs font-semibold text-[#2B2825] transition hover:border-[#2F7020] hover:bg-[#E3F4DE] hover:text-[#1F5314] focus-visible:outline-2 focus-visible:outline-[#52A535] dark:border-[#44403D] dark:bg-[#262423] dark:text-[#DDD7CF] dark:hover:border-[#5EB841] dark:hover:bg-[#193516] dark:hover:text-[#91EB7A]"
                >
                  {tpl.shortLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Keyword Input */}
          <form
            onSubmit={handleSubmitQuery}
            className="flex items-center gap-2 border-t border-[#E3DCD0] bg-white p-3 dark:border-[#34312F] dark:bg-[#191817]"
          >
            <label htmlFor="mascot-query-input" className="sr-only">
              Ketik kata kunci pertanyaan untuk Pak Villager
            </label>
            <input
              id="mascot-query-input"
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Ketik kata kunci (offer, cv, skill)..."
              className="mc-input min-w-0 flex-1 px-3 py-1.5"
            />
            <button
              type="submit"
              aria-label="Kirim pertanyaan"
              className="mc-bevel-green inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[3px] p-2 text-white transition focus-visible:outline-2 focus-visible:outline-[#6CC349]"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      )}

      {/* Floating Side Mascot Launcher Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={
          isOpen
            ? "Tutup asisten Pak Villager"
            : "Buka asisten Pak Villager"
        }
        className="group relative flex cursor-pointer items-center gap-2.5 rounded-[3px] border-2 border-[#3C8527] bg-[#171615] py-1.5 pr-3.5 pl-2 text-left text-white shadow-xl transition hover:border-[#6CC349] hover:bg-[#22201F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6CC349]"
      >
        <span className="mc-mascot-bob relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[2px] border border-[#494542] bg-[#262423] p-0.5">
          <img
            src="/mascot-villager.png"
            alt=""
            className="h-full w-full object-contain"
            style={{ imageRendering: "pixelated" }}
          />
        </span>

        <span className="hidden flex-col sm:flex">
          <span className="font-pixel text-xs font-bold tracking-tight text-[#8CEB73]">
            {isOpen ? "TUTUP GUIDE" : "TANYA MENTOR"}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-[#CFC9C1]">
            <MessageSquare className="h-3 w-3 shrink-0" />
            <span>Pak Villager</span>
          </span>
        </span>

        {alertCount > 0 && !isOpen && (
          <span
            title={`${alertCount} peringatan aktif`}
            className="mc-tabular absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-[2px] border border-[#FCA5A5] bg-[#B91C1C] px-1 font-mono text-xs font-bold text-white shadow"
          >
            {alertCount}
          </span>
        )}
      </button>
    </div>
  );
}

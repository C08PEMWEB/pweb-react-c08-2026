import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

type ModalSize = "sm" | "md" | "lg" | "xl";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: ModalSize;
  children: ReactNode;
  footer?: ReactNode;
}

const SIZE_MAP: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
};

/**
 * Komponen pembungkus Modal reusable untuk Anggota 1 (Backup JSON),
 * Anggota 2 (Form Manual), dan Anggota 3 (Detail Lamaran & Prep Timer).
 */
export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  size = "md",
  children,
  footer,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mc-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0D0C0B]/75 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sharp Architectural Minecraft Modal */}
      <div
        className={`relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-[3px] border-2 border-[#C7BEB0] bg-[#FFFFFF] shadow-2xl dark:border-[#494542] dark:bg-[#211F1E] ${SIZE_MAP[size]}`}
      >
        <div className="mc-biome-rule shrink-0" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#E3DCD0] bg-[#F8F5EF] px-5 py-4 dark:border-[#34312F] dark:bg-[#191817]">
          <div className="min-w-0">
            <h2
              id="mc-modal-title"
              className="font-pixel text-base font-bold tracking-tight text-[#171615] sm:text-lg dark:text-[#F5F4F0]"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-sm text-[#57524B] dark:text-[#B5AFA7]">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="shrink-0 cursor-pointer rounded-[3px] border border-transparent p-1.5 text-[#57524B] transition hover:border-[#C9C0B2] hover:bg-[#ECE7DD] hover:text-[#171615] focus-visible:outline-2 focus-visible:outline-[#52A535] dark:text-[#B5AFA7] dark:hover:border-[#4A4643] dark:hover:bg-[#2C2927] dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-[#E3DCD0] bg-[#F8F5EF] px-5 py-3.5 dark:border-[#34312F] dark:bg-[#191817]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

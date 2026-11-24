import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "outline-green" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "mc-bevel-green disabled:bg-[#D4CEC4] disabled:text-[#5B554E] disabled:border-[#BFB8AC] disabled:shadow-none dark:disabled:bg-[#312E2C] dark:disabled:text-[#9D978F] dark:disabled:border-[#43403D]",
  "outline-green":
    "mc-bevel-outline-green disabled:opacity-50",
  secondary:
    "mc-bevel-stone disabled:opacity-60 disabled:shadow-none",
  danger:
    "mc-bevel-danger disabled:opacity-50 disabled:shadow-none",
  ghost:
    "bg-transparent text-[#3A3631] hover:bg-[#EAE4DA] dark:text-[#D7D1C9] dark:hover:bg-[#2E2C2A]",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-5 py-2.5 text-sm gap-2",
};

/**
 * Komponen Button standar Minecraft.net Design System untuk seluruh tim.
 */
export function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex cursor-pointer items-center justify-center rounded-[3px] font-bold tracking-tight transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#52A535] disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

import type { ThemeMode } from "../../types";

interface MinecraftWorldBackdropProps {
  theme: ThemeMode;
}

const TWINKLE_STARS: ReadonlyArray<{
  top: string;
  left: string;
  size: number;
  delay: string;
  duration: string;
}> = [
  { top: "9%", left: "11%", size: 4, delay: "0s", duration: "3.4s" },
  { top: "14%", left: "26%", size: 3, delay: "1.1s", duration: "4.2s" },
  { top: "7%", left: "44%", size: 4, delay: "0.6s", duration: "3.8s" },
  { top: "18%", left: "61%", size: 3, delay: "1.8s", duration: "4.6s" },
  { top: "11%", left: "73%", size: 4, delay: "0.3s", duration: "3.2s" },
  { top: "24%", left: "89%", size: 3, delay: "2.1s", duration: "4.0s" },
  { top: "21%", left: "16%", size: 3, delay: "1.4s", duration: "3.9s" },
  { top: "16%", left: "93%", size: 4, delay: "0.9s", duration: "3.5s" },
];

const FIREFLIES: ReadonlyArray<{
  bottom: string;
  left: string;
  delay: string;
  duration: string;
}> = [
  { bottom: "16%", left: "14%", delay: "0s", duration: "5.2s" },
  { bottom: "13%", left: "38%", delay: "1.6s", duration: "6.0s" },
  { bottom: "18%", left: "76%", delay: "0.8s", duration: "5.6s" },
  { bottom: "15%", left: "88%", delay: "2.4s", duration: "4.9s" },
];

/**
 * Latar belakang penuh (fixed viewport backdrop) bertema Desa Minecraft:
 * - Light Mode: Langit cerah Overworld, matahari kotak, awan voxel, desa & kincir angin.
 * - Dark Mode: Langit malam berbintang, bulan kotak, desa dengan jendela & lentera berpendar.
 * Transisi halus antar tema tanpa mengganggu keterbacaan UI (scrim lembut + kartu frosted).
 */
export function MinecraftWorldBackdrop({ theme }: MinecraftWorldBackdropProps) {
  const isDark = theme === "dark";

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Daytime Minecraft Overworld Village Layer */}
      <div
        className={`absolute inset-0 bg-cover bg-bottom bg-no-repeat transition-opacity duration-700 ease-out ${
          isDark ? "opacity-0" : "opacity-100"
        }`}
        style={{
          backgroundImage: "url('/village-day.png')",
          imageRendering: "pixelated",
        }}
      />

      {/* Nighttime Starry Minecraft Village Layer */}
      <div
        className={`absolute inset-0 bg-cover bg-bottom bg-no-repeat transition-opacity duration-700 ease-out ${
          isDark ? "opacity-100" : "opacity-0"
        }`}
        style={{
          backgroundImage: "url('/village-night.png')",
          imageRendering: "pixelated",
        }}
      />

      {/* Living Night Sky Twinkling Stars & Lantern Fireflies */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          isDark ? "opacity-100" : "opacity-0"
        }`}
      >
        {TWINKLE_STARS.map((star, index) => (
          <span
            key={index}
            className="mc-star-twinkle absolute bg-[#F4F8FF]"
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
          />
        ))}
        {FIREFLIES.map((fly, index) => (
          <span
            key={index}
            className="mc-firefly absolute h-1 w-1 bg-[#FFE28A] shadow-[0_0_8px_2px_rgba(255,204,88,0.85)]"
            style={{
              bottom: fly.bottom,
              left: fly.left,
              animationDelay: fly.delay,
              animationDuration: fly.duration,
            }}
          />
        ))}
      </div>

      {/* Subtle Atmospheric Scrim: preserves crisp sky/sun/moon/village while guaranteeing WCAG AA readability */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          isDark ? "opacity-0" : "opacity-100"
        }`}
        style={{
          background:
            "linear-gradient(180deg, rgba(244, 241, 235, 0.36) 0%, rgba(244, 241, 235, 0.50) 48%, rgba(244, 241, 235, 0.28) 82%, rgba(244, 241, 235, 0.42) 100%)",
        }}
      />
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          isDark ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "linear-gradient(180deg, rgba(13, 15, 22, 0.30) 0%, rgba(18, 18, 20, 0.44) 52%, rgba(16, 16, 17, 0.26) 84%, rgba(18, 17, 16, 0.54) 100%)",
        }}
      />
    </div>
  );
}

# Minecraft Design System — Aku Mw Magang

Panduan standar antarmuka (UI/UX) dari **Anggota 1 (Lead FE Design System)** bergaya **Minecraft.net Obsidian & Overworld** yang sudah lulus audit anti-slop **Impeccable** (WCAG AA kontras >= 4.5:1, lantai ukuran teks >= 12px UI / >= 14px body, sudut arsitektural `3px`, tanpa eyebrow dekoratif).

---

## 1. Palet Warna & Mode Tema

Default aplikasi adalah **Minecraft.net Deepslate Dark Mode** (`#171615`), dengan toggle bonus ke **Overworld Sandstone Light Mode** (`#F4F1EB`) via `useLocalStorage`.

| Token / Peran | Dark Mode (Default) | Light Mode | Kegunaan |
| :--- | :--- | :--- | :--- |
| **Canvas / Surface** | `#171615` / `#22201F` | `#F4F1EB` / `#FFFFFF` | Latar halaman & kartu `.mc-surface` |
| **Mojang Emerald (Success)** | `#2F7020` / `#91EB7A` | `#2F7020` / `#1F5314` | Skill Match >= 70%, status `OFFER`, *Rekomendasi Terbaik*, tombol CTA utama |
| **Gold Amber (Warning)** | `#38270A` / `#FCD34D` | `#FDF1D2` / `#7A4404` | Skill Match 40–69%, status `INTERVIEW`, badge *Rawan Ghosting* |
| **Redstone (Danger)** | `#3A1616` / `#FCA5A5` | `#FDE7E6` / `#921616` | Skill Match < 40%, status `REJECTED`, *Missing Skills*, *Banner Bentrok* |
| **Lapis Blue (Primary)** | `#162845` / `#93C5FD` | `#E4F0FF` / `#1742A8` | Status `APPLIED` & `SCREENING`, indikator info |
| **Stone (Neutral)** | `#2E2C2A` / `#D9D4CD` | `#ECE8E1` / `#3E3A35` | Status `WISHLIST` & `GHOSTED`, tombol disabled (`"Sudah Dilamar"`) |

---

## 2. Tipografi & Aturan Lantai Ukuran

- `font-pixel` (`Silkscreen`) → Wordmark brand, judul halaman `<h1>`, judul modal, dan monogram perusahaan (`font-variant-ligatures: none`).
- `font-sans` (`Noto Sans`) → Seluruh heading kartu, label, tombol, dan isi paragraf (identik dengan body typeface `minecraft.net`).
- `font-mono` + `.mc-tabular` (`JetBrains Mono`) → Khusus data numerik (Match %, gaji, countdown timer, angka statistik, shortcut `/`).
- **Lantai ukuran wajib:** Teks body minimal `text-sm` (`14px`); badge/label/tombol fungsional minimal `text-xs` (`12px`). Jangan gunakan `10px` atau `11px`.
- **Aturan anti-slop:** Jangan menaruh label eyebrow/kicker kecil di atas heading, dan hindari kartu bersarang di dalam kartu.

---

## 3. Komponen UI Siap Pakai (`src/components/ui/`)

- **`<Button variant="primary | outline-green | secondary | danger | ghost" size="sm | md | lg" />`** — Tombol beveled khas Mojang (`rounded-[3px]`).
- **`<Badge tone="success | warning | danger | primary | neutral" dot />`** — Tersedia helper `getStatusBadgeTone(status)` & `APPLICATION_STATUS_LABELS`.
- **`<Modal isOpen onClose title subtitle size="sm | md | lg | xl" footer />`** — Reusable modal untuk Anggota 2 (Form Manual) & Anggota 3 (Detail Lamaran & Prep Timer).

### Class Utilitas Global (`src/index.css`)
- `.mc-surface` & `.mc-surface-interactive` — Kartu arsitektural `3px` (light & dark otomatis).
- `.mc-panel` — Container sidebar / toolbar.
- `.mc-input` — Styling standar `<input>`, `<select>`, dan `<textarea>` dengan placeholder kontras >= 4.5:1.
- `.mc-biome-rule` — Aksen strip rumput-tanah 4px.

---

## 4. Kontrak Integrasi Anggota 2 & 3

- Import tipe dari [src/types/index.ts](src/types/index.ts), helper dari [src/utils/skillMatch.ts](src/utils/skillMatch.ts), dan Custom Hooks dari [src/hooks/](src/hooks/).
- Slot integrasi di [src/App.tsx](src/App.tsx) sudah ditandai jelas (`[SLOT INTEGRASI ANGGOTA 2]` dan `[SLOT INTEGRASI ANGGOTA 3]`).

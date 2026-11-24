# Aku Mw Magang — Praktikum Pemweb Modul 5

Aplikasi Frontend SPA **React 19 + TypeScript (strict, tanpa `any`) + Vite + Tailwind CSS** bertema **Minecraft Overworld / Deepslate** untuk membantu Kapten mengelola proses pencarian magang dari eksplorasi lowongan hingga memilih offer terbaik.

## Tech Stack & Aturan Teknis
- **React 19** + **TypeScript** (`"strict": true`, tanpa `any`)
- **Vite** + **Tailwind CSS v4** + **Lucide React**
- **100% React Hooks bawaan & Custom Hooks sendiri** (`useLocalStorage<T>`, `useDebounce<T>`) — tanpa Redux, Zustand, TanStack Query, React Hook Form, maupun Formik.

## Struktur Folder
```text
public/
├── grass-block.svg           # Ikon favicon blok rumput Minecraft
├── magang-fallback.json      # 15 lowongan magang tech Indonesia (format Remotive)
├── village-day.png           # Latar desa Minecraft siang (Overworld Light Mode)
└── village-night.png         # Latar desa Minecraft malam berbintang (Deepslate Dark Mode)
src/
├── components/
│   ├── bonus/                # BackupModal (Export & Import JSON)
│   ├── explore/              # Fitur 1: HeroBanner, SkillProfilePanel, JobCard, JobExplorer
│   ├── layout/               # Navbar bergaya minecraft.net & MinecraftWorldBackdrop siang/malam
│   ├── placeholders/         # Slot integrasi siap pakai untuk Anggota 2 & 3
│   └── ui/                   # Design System reusable: Button, Badge, Modal, MinecraftIcons
├── hooks/
│   ├── useDebounce.ts        # Custom Hook wajib (delay 400ms)
│   └── useLocalStorage.ts    # Custom Hook wajib (persistensi state)
├── services/
│   └── jobService.ts         # Fetch Remotive API & fallback lokal + AbortController
├── types/
│   └── index.ts              # Kontrak interface Application, JobListing, dll.
├── utils/
│   ├── backup.ts             # Validasi & Export/Import JSON type-safe
│   └── skillMatch.ts         # Derived state Skill Match %, anti-duplikat, workMode
├── App.tsx
├── index.css                 # Minecraft Overworld / Deepslate theme tokens
└── main.tsx
```

## Fitur Bagian Anggota 1 (Selesai)
- **Setup & Core Infrastructure:** Vite + React 19 + TypeScript strict + Tailwind CSS v4, `src/types/index.ts`, `useLocalStorage<T>`, `useDebounce<T>`, `public/magang-fallback.json` (15 lowongan), `src/services/jobService.ts`.
- **Minecraft Design System & Shell:** `Navbar`, `Modal`, `Button`, `Badge`, `MinecraftIcons`, serta panduan tim di `DESIGN_SYSTEM.md`.
- **Fitur 1 (Profil Skill Kapten & Eksplorasi Lowongan):**
  - Manajemen skill Kapten (default `React`, `TypeScript`, `CSS`, tolak duplikat case-insensitive, persistensi `localStorage`).
  - Fetch Remotive API & Fallback Lokal dengan `useEffect` + `fetch()` + `AbortController` serta state **Loading**, **Error (+ Coba Lagi & Pakai Fallback Lokal)**, dan **Empty**.
  - Pencarian dengan `useDebounce(keyword, 400)`, filter kategori dinamis, dan sorting (default **Match Tertinggi**).
  - Live **Skill Match Score %** (hijau >= 70%, kuning 40–69%, merah < 40%), highlight skill cocok vs missing skills, dan tombol **Simpan ke Wishlist** (otomatis disabled `"Sudah Dilamar"` bila `company + role` sudah ada).
- **Fitur Bonus:**
  - **Dark Mode** (*Overworld Day* ↔ *Deepslate Night*) menggunakan `useLocalStorage`.
  - **Keyboard Shortcut `/`** untuk fokus otomatis ke search bar via `useRef`.
  - **Export & Import Backup JSON** dengan validasi tipe ketat.

## Menjalankan Proyek
```bash
npm install
npm run dev
```

## Verifikasi Type-Check & Build
```bash
npx tsc --noEmit
npm run build
```


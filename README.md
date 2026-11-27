# Aku Mw Magang — Praktikum Pemweb Modul 5 (Kelompok C08)

Aplikasi Frontend SPA **React 19 + TypeScript (`strict: true`, tanpa `any`) + Vite + Tailwind CSS** bertema **Minecraft Overworld / Deepslate** untuk membantu Kapten mengelola seluruh proses pencarian magang — dari eksplorasi lowongan, War Room pipeline, latihan interview, hingga membandingkan offer terbaik.

---

## Tech Stack & Aturan Teknis
- **React 19** + **TypeScript** (`"strict": true`, 0 pemakaian `any`)
- **Vite** + **Tailwind CSS v4** + **Lucide React**
- **100% React Hooks bawaan & Custom Hooks sendiri** (`useLocalStorage<T>`, `useDebounce<T>`) — tanpa library state management eksternal (Redux/Zustand/TanStack Query) maupun library form (React Hook Form/Formik).

---

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
│   ├── dashboard/            # Fitur 7: StatsCards (5 kartu derived state) & OfferComparator
│   ├── detail/               # Fitur 4 & 5: ApplicationDetail, StatusTransitionPanel, ChecklistSection, ActivityLogSection, InterviewTimer
│   ├── explore/              # Fitur 1: HeroBanner, SkillProfilePanel, JobCard, JobExplorer
│   ├── layout/               # Navbar bergaya minecraft.net & MinecraftWorldBackdrop siang/malam
│   ├── pipeline/             # Fitur 2 & 3: ApplicationForm, InterviewConflictBanner, PipelineView
│   └── ui/                   # Design System reusable: Button, Badge, Modal, MinecraftIcons
├── hooks/
│   ├── useDebounce.ts        # Custom Hook wajib (delay 400ms)
│   └── useLocalStorage.ts    # Custom Hook wajib (persistensi state)
├── services/
│   └── jobService.ts         # Fetch Remotive API & fallback lokal + AbortController
├── types/
│   └── index.ts              # Kontrak interface Application, JobListing, ChecklistItem, ActivityLog
├── utils/
│   ├── activityLog.ts        # Helper Activity Log & format timestamp
│   ├── backup.ts             # Validasi & Export/Import JSON type-safe
│   ├── checklist.ts          # Helper Nested Checklist 100% immutable
│   ├── offerScore.ts         # Perhitungan skor berbobot Offer Comparator (50/25/25)
│   ├── scheduleChecker.ts    # Deteksi Rawan Ghosting (> 14 hari) & Bentrok Interview (< 60 menit)
│   ├── skillMatch.ts         # Derived state Skill Match %, anti-duplikat, workMode
│   ├── stateMachine.ts       # Engine & validasi transisi status ketat
│   └── stats.ts              # Derived state 5 kartu statistik dashboard
├── App.tsx
├── index.css
└── main.tsx
```

---

## Ringkasan 7 Fitur Utama & 3 Fitur Bonus

1. **Fitur 1 — Profil Skill Kapten & Eksplorasi Lowongan:**
   - Manajemen skill Kapten (default `React`, `TypeScript`, `CSS`, tolak duplikat *case-insensitive*, persisten di `localStorage`).
   - Fetch Remotive Live API & Fallback Lokal (`public/magang-fallback.json`) via `useEffect` + `fetch()` + `AbortController` lengkap dengan state **Loading**, **Error (+ Coba Lagi & Pakai Fallback Lokal)**, dan **Empty**.
   - Search dengan `useDebounce(keyword, 400)`, filter kategori dinamis, sorting default **Match Tertinggi**, live **Skill Match Score %** (hijau >= 70%, kuning 40–69%, merah < 40%) + Minecraft XP-Bar, dan tombol **Simpan ke Wishlist** (otomatis disabled `"Sudah Dilamar"` bila duplikat `company + role`).
2. **Fitur 2 — Form Tambah Lamaran Manual:**
   - Controlled form penuh (`value` + `onChange`), input kondisional `cvVersion` & `appliedDate` wajib saat status awal `APPLIED`, validasi kosong & anti-duplikat, serta auto-focus otomatis ke input pertama yang error via `useRef`.
3. **Fitur 3 — War Room Pipeline, Ghosting & Bentrok Jadwal:**
   - Filter gabungan (pencarian teks, filter status, toggle *Hanya Rawan Ghosting*) + sorting (*Terbaru*, *Jadwal Interview Terdekat*, *Offer Tertinggi*).
   - Tombol **Simulasi +15 Hari** pada status `APPLIED`/`SCREENING` untuk memicu badge *Rawan Ghosting* (> 14 hari).
   - **Banner Peringatan Bentrok** (>= 2 lamaran `INTERVIEW` selisih < 60 menit) dihitung dari seluruh data dan tetap tampil lintas filter di semua tab.
4. **Fitur 4 — Detail Lamaran (State Machine, Nested Checklist & Activity Log):**
   - Perpindahan status ketat mengikuti State Machine (`OFFER` & `REJECTED` final, `GHOSTED` boleh kembali ke `SCREENING`) dengan validasi input kondisional.
   - Nested Checklist 100% immutable dengan progress bar (`X / Y selesai`) dan Activity Log otomatis + catatan manual Kapten.
5. **Fitur 5 — Interview Prep Timer:**
   - 6 pertanyaan latihan interview magang IT, countdown `02:00` dengan tombol **Mulai/Jeda**, **Reset**, dan **Soal Berikutnya**, serta `useEffect` cleanup (`clearInterval`) saat panel ditutup.
6. **Fitur 6 — Undo Delete (5 Detik) & Persistensi LocalStorage:**
   - Toast Undo 5 detik mengembalikan lamaran utuh (termasuk checklist & activity logs); ID `setTimeout` disimpan di `useRef` dan dibersihkan via `clearTimeout` bila menghapus 2× berturut-turut dalam < 5 detik.
7. **Fitur 7 — Dashboard Statistik & Offer Comparator:**
   - 5 Kartu Statistik (*Total Lamaran*, *Response Rate %*, *Interview Rate %*, *Rawan Ghosting*, *Total Offer*) sebagai derived state.
   - Perbandingan **Offer A vs Offer B** saat Offer >= 2 dengan rumus berbobot (Uang Saku 50%, Mode Kerja 25%, Kecocokan Skill 25%) + badge **Rekomendasi Terbaik**.
8. **Fitur Bonus & Unik:**
   - **Asisten Maskot "Pak Villager" (Template Q&A Chatbox):** Maskot Minecraft Villager Librarian mengambang di kanan bawah dengan chatbox tanya-jawab template interaktif + pencocokan kata kunci yang membaca kondisi live lamaran, skill, dan CV Vault Kapten (tanpa API AI eksternal).
   - **CV Vault & Auto-Scan Skill:** Unggah beberapa versi CV (`.pdf`, `.txt`, `.md`) ke `localStorage`, preview langsung lewat Blob URL (`URL.revokeObjectURL` cleanup), deteksi skill otomatis dari isi CV untuk 1-klik tambah ke Profil Kapten, lacak statistik performa tiap versi CV, dan pilih cepat versi CV saat melamar (`APPLIED`).
   - **Generator Follow-Up HRD (Anti-Ghosting):** Buat draf pesan tindak lanjut HRD otomatis (Formal ID / Singkat DM / English) yang terisi data lamaran & skill cocok, lengkap dengan 1-klik Salin (otomatis tercatat di `activityLogs`) dan tombol buka email (`mailto:`).
   - **Export Jadwal Interview (`.ics`):** Unduh file kalender standar RFC 5545 (durasi 60 menit + pengingat 30 menit sebelumnya) langsung untuk Google/Apple Calendar.
   - **Radar Prioritas Belajar (Skill Gap):** Derived state di sidebar yang merangkum missing skills paling sering diminta di seluruh lamaran Kapten.
   - **Tema Siang ↔ Malam** (*Overworld Day* ↔ *Deepslate Night* lengkap dengan latar desa Minecraft berubah sesuai tema) menggunakan `useLocalStorage`.
   - **Keyboard Shortcut `/`** untuk fokus otomatis ke search bar via `useRef`.
   - **Export & Import Backup JSON** (termasuk CV Vault) dengan validasi tipe ketat.

---

## Menjalankan & Memverifikasi Proyek
```bash
npm install
npm run dev
```

Cek type-check dan production build:
```bash
npx tsc --noEmit
npm run build
```

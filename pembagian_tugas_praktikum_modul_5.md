# Pembagian Tugas & Panduan Kerja Tim — Praktikum Pemweb Modul 5 ("Aku Mw Magang")

Dokumen ini menjadi acuan pembagian beban kerja, kontrak struktur data, standar desain antarmuka (UI/UX), serta jadwal pengerjaan agar seluruh anggota kelompok memiliki kontribusi yang seimbang dan siap menghadapi sesi demo serta *mini live-coding*.

---

## 1. Informasi Umum & Aturan Teknis Proyek

* **Nama Repository GitHub (Public):** `pweb-react-p01-2026`
* **Link Pengumpulan:** `https://its.id/m/SubmitPemweb2026`
* **Deadline Pengumpulan:** Jumat, 27 November 2026 pukul 23:59 WIB
* **Jadwal Demo Offline:** Mulai Senin, 30 November 2026
* **Tech Stack Wajib:**
  * React 19 + TypeScript (`"strict": true` di `tsconfig.json`, **dilarang** menggunakan tipe `any`)
  * Vite (template `react-ts`)
  * Styling: Tailwind CSS atau CSS Murni (ikon ringan seperti `lucide-react` diperbolehkan)
* **Batasan Library & Penyimpanan Data:**
  * **Dilarang** memakai library *state management* eksternal (Redux, Zustand, TanStack Query) maupun library *form* (React Hook Form, Formik).
  * **Arsitektur Data Lokal:** Aplikasi berjalan sebagai 100% Frontend SPA. Data lowongan dibaca dari Remotive API dan file statis `public/magang-fallback.json`, sedangkan seluruh data lamaran dan profil skill disimpan secara persisten di browser menggunakan Custom Hook `useLocalStorage<T>`.

---

## 2. Ringkasan Pembagian Peran (3 Anggota)

| Anggota | Peran & Fokus Utama | Fitur yang Dipegang | Fokus Konsep React & Hooks (Untuk Demo) |
| :--- | :--- | :--- | :--- |
| **Anggota 1** | **Lead FE Design System, Core Setup & Eksplorasi Lowongan** | Setup Proyek, Design System, Hooks Wajib, Service API/JSON, **Fitur 1** | `useLocalStorage<T>`, `useDebounce<T>`, `useEffect` + `fetch()` + `AbortController`, *Derived State* (Skill Match %) |
| **Anggota 2** | **State Machine Engine, Form Manual, War Room & Undo** | Root State (`App.tsx`), Aturan Bisnis, **Fitur 2, Fitur 3, Fitur 6** | Controlled Form, `useRef` (auto-focus error & `clearTimeout`), *Derived State* (Ghosting & Bentrok lintas filter) |
| **Anggota 3** | **Detail Lamaran, Interview Prep Timer & Offer Comparator** | **Fitur 4, Fitur 5, Fitur 7** | *Nested Immutability* (checklist & logs), `useEffect` cleanup (`clearInterval`), *Derived State* Statistik & Skor Offer |

---

## 3. Rincian Tugas & Checklist Deliverable

### Anggota 1: Lead FE Design System, Core Infrastructure & Fitur 1
* **Setup & Arsitektur Awal:**
  - [ ] Membuat repository GitHub public `pweb-react-p01-2026` dan menginisiasi proyek Vite `react-ts` dengan `strict: true`.
  - [ ] Membuat struktur folder di dalam `src/`: `components/`, `hooks/`, `services/`, `types/`, dan `utils/`.
  - [ ] Mendefinisikan seluruh kontrak interface di `src/types/index.ts`.
* **Standar Desain Frontend (UI/UX):**
  - [ ] Menentukan palet warna, tipografi, gaya tombol/input standar, dan tata letak responsif aplikasi.
  - [ ] Membuat komponen kerangka utama (`Navbar` navigasi antar-tab: *Eksplorasi Lowongan*, *Pipeline Lamaran*, *Bandingkan Offer*, serta komponen pembungkus `Modal`).
  - [ ] Mendokumentasikan aturan warna badge dan komponen UI agar tampilan buatan Anggota 2 dan Anggota 3 seragam.
* **Dataset, Service & Custom Hooks Wajib:**
  - [ ] Menyusun 15 data lowongan magang tech Indonesia sesuai format Remotive di `public/magang-fallback.json`.
  - [ ] Mengimplementasikan `useLocalStorage<T>(key, initialValue)` dan `useDebounce<T>(value, delay)` di `src/hooks/`.
  - [ ] Membuat `src/services/jobService.ts` dengan `fetch()` + `AbortController` untuk mengambil data dari Remotive API maupun fallback JSON lokal.
* **Fitur 1 — Profil Skill Kapten & Eksplorasi Lowongan:**
  - [ ] Manajemen skill Kapten (default minimal 3 skill, tolak duplikat *case-insensitive*, simpan ke `localStorage`).
  - [ ] Menghitung **Skill Match Score (%)** secara langsung (*derived state*) serta menandai skill yang cocok vs *missing skills*.
  - [ ] Pencarian dengan `useDebounce(keyword, 400)`, filter kategori, urutkan berdasarkan Match tertinggi, dan toggle sumber data (Live API vs Fallback Lokal).
  - [ ] Menampilkan state **Loading**, state **Error + tombol Coba Lagi / Fallback Lokal**, dan state **Kosong**, serta tombol *Simpan ke Wishlist* (otomatis *disabled* menjadi `"Sudah Dilamar"` jika perusahaan + posisi sudah ada).

---

### Anggota 2: State Machine Engine, Form Manual, War Room & Undo (Fitur 2, 3, 6)
* **Root State & Utilitas Aturan Main:**
  - [ ] Mengelola state utama `applications` (via `useLocalStorage`) dan `kaptenSkills` di `src/App.tsx`.
  - [ ] Membuat `src/utils/stateMachine.ts` untuk memvalidasi transisi status yang sah.
  - [ ] Membuat `src/utils/scheduleChecker.ts` untuk mendeteksi **Rawan Ghosting** ($> 14$ hari pada status `APPLIED`/`SCREENING`) dan **Bentrok Jadwal Interview** ($\ge 2$ lamaran `INTERVIEW` berselisih $< 60$ menit).
* **Fitur 2 — Form Tambah Lamaran Manual:**
  - [ ] Membuat form terkontrol penuh (`value` + `onChange`) untuk Perusahaan, Posisi/Role, Mode Kerja, Status Awal (`WISHLIST` / `APPLIED`), dan Required Skills.
  - [ ] Menampilkan input kondisional `cvVersion` dan `appliedDate` yang wajib diisi jika Status Awal = `APPLIED`.
  - [ ] Menerapkan validasi input kosong dan validasi anti-duplikat (`company + role`, *case-insensitive*), serta mengarahkan fokus kursor otomatis ke input pertama yang error menggunakan **`useRef`**.
* **Fitur 3 — War Room Pipeline, Ghosting & Bentrok Jadwal:**
  - [ ] Menampilkan **Banner Peringatan Bentrok** di bagian atas halaman (dihitung dari seluruh data lamaran, tetap tampil meskipun filter sedang aktif).
  - [ ] Menampilkan daftar/kartu lamaran lengkap dengan status, versi CV, progress checklist ($X/Y$), Skill Match %, dan badge *Rawan Ghosting*.
  - [ ] Menyediakan filter gabungan (pencarian teks, filter status, toggle *"Hanya Rawan Ghosting"*) dan sorting (Terbaru, Jadwal Interview Terdekat, Offer Tertinggi).
  - [ ] Menyediakan tombol **"Simulasi +15 Hari"** pada lamaran berstatus `APPLIED` atau `SCREENING` untuk memundurkan `lastUpdatedAt` sebanyak 15 hari saat pengujian demo.
* **Fitur 6 — Undo Delete (5 Detik):**
  - [ ] Menampilkan Toast Undo selama 5 detik saat lamaran dihapus, dan mengembalikan lamaran secara utuh (termasuk checklist dan activity log) jika tombol Undo diklik.
  - [ ] Menyimpan ID `setTimeout` di dalam **`useRef`** dan menjalankan `clearTimeout` pada timer lama apabila Kapten menghapus 2 lamaran berturut-turut dalam waktu $< 5$ detik.

---

### Anggota 3: Detail Lamaran, Interview Prep Timer, Statistik & Comparator (Fitur 4, 5, 7)
* **Fitur 4 — Detail Lamaran (State Machine, Nested Checklist & Activity Log):**
  - [ ] Menampilkan opsi perpindahan status yang valid sesuai Diagram State Machine beserta input kondisional wajib (`cvVersion` & `appliedDate` untuk `APPLIED`; `interviewDateTime` untuk `INTERVIEW`; `salaryOffer > 0` & `workMode` untuk `OFFER`).
  - [ ] Mengimplementasikan **Nested Checklist** (tambah item, centang selesai, hapus item) dengan progress bar ($X/Y$ selesai) secara **100% immutable** (menggunakan `.map()` dan `.filter()`, tanpa `.push()` atau mutasi langsung).
  - [ ] Mencatat **Activity Log** secara otomatis saat lamaran dibuat atau berpindah status, ditambah fitur input catatan manual Kapten.
* **Fitur 5 — Interview Prep Timer:**
  - [ ] Menyediakan minimal 5 pertanyaan latihan interview magang IT.
  - [ ] Mengimplementasikan *countdown timer* `02:00` (120 detik) per soal dengan tombol **Start/Pause**, **Reset**, dan **Soal Berikutnya** (otomatis reset ke `02:00`).
  - [ ] Menerapkan **`useEffect` cleanup** (`return () => clearInterval(...)`) agar timer berhenti bersih saat panel/modal ditutup (*unmount*) dan tidak mempercepat hitungan detik saat dibuka kembali.
* **Fitur 7 — Dashboard Statistik & Offer Comparator:**
  - [ ] Menampilkan **5 Kartu Statistik** (*Total Lamaran*, *Response Rate %*, *Interview Rate %*, *Rawan Ghosting*, dan *Total Offer*) yang seluruhnya dihitung sebagai *derived state*.
  - [ ] Membuat halaman **Offer Comparator** untuk membandingkan **Offer A** dan **Offer B** jika terdapat $\ge 2$ lamaran berstatus `OFFER` (menampilkan Gaji, Mode Kerja, Skill Match %, total skor berbobot, dan badge *"Rekomendasi Terbaik"*), atau menampilkan pesan kosong yang jelas jika Offer $< 2$.

---

## 4. Kesepakatan Standar Desain FE (Panduan Anggota 1)

Agar komponen yang dikerjakan Anggota 2 dan Anggota 3 menyatu dengan desain dari Anggota 1:

1. **Konsistensi Kode Warna Status & Badge:**
   * **Hijau (Success):** Skill Match $\ge 70\%$, status `OFFER`, badge *Rekomendasi Terbaik*.
   * **Kuning/Amber (Warning):** Skill Match $40\text{--}69\%$, status `INTERVIEW`, badge *Rawan Ghosting*.
   * **Merah (Danger):** Skill Match $< 40\%$, status `REJECTED`, *Missing Skills*, dan *Banner Bentrok Jadwal*.
   * **Biru/Indigo (Primary/Active):** Tombol aksi utama, status `APPLIED` / `SCREENING`, tab navigasi aktif.
   * **Abu-abu (Neutral):** Status `WISHLIST` / `GHOSTED`, tombol *disabled* (`"Sudah Dilamar"`).
2. **Isolasi CSS:** Jika menggunakan CSS murni, wajib memakai **CSS Modules** (`NamaKomponen.module.css`) agar nama *class* antaranggota tidak saling menimpa saat proses *merge*.

---

## 5. Kontrak Data & Rumus Perhitungan Wajib

### A. Struktur Tipe Data (`src/types/index.ts`)

```typescript
export type WorkMode = "Remote" | "Hybrid" | "Onsite";

export type ApplicationStatus =
  | "WISHLIST"
  | "APPLIED"
  | "SCREENING"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTED"
  | "GHOSTED";

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string; // ISO string
  message: string;
}

export interface Application {
  id: string;
  company: string;
  role: string;
  workMode: WorkMode;
  status: ApplicationStatus;
  requiredSkills: string[];
  cvVersion?: string;
  appliedDate?: string;
  interviewDateTime?: string; // Format: YYYY-MM-DDTHH:mm
  salaryOffer?: number;
  lastUpdatedAt: string; // ISO string
  checklist: ChecklistItem[];
  activityLogs: ActivityLog[];
}

export interface JobListing {
  id: number;
  title: string;
  company_name: string;
  category: string;
  candidate_required_location: string;
  salary: string;
  tags: string[];
}
```

### B. Acuan Logika & Rumus Matematis

1. **Transisi Status State Machine:**
   * `WISHLIST` $\rightarrow$ `APPLIED` *(wajib isi `cvVersion` dan `appliedDate`)*
   * `APPLIED` $\rightarrow$ `SCREENING`, `REJECTED`, `GHOSTED`
   * `SCREENING` $\rightarrow$ `INTERVIEW`, `REJECTED`, `GHOSTED` *(ke `INTERVIEW` wajib isi `interviewDateTime`)*
   * `INTERVIEW` $\rightarrow$ `OFFER`, `REJECTED`, `GHOSTED` *(ke `OFFER` wajib isi `salaryOffer > 0` dan `workMode`)*
   * `GHOSTED` $\rightarrow$ `SCREENING`
   * `OFFER` dan `REJECTED` bersifat **final** (tidak dapat berpindah ke status lain).

2. **Perhitungan Skill Match Score (%):**
   $$\text{Skill Match (\%)} = \text{Math.round}\left(\frac{\text{Jumlah Skill Cocok (case-insensitive)}}{\text{Total Required Skills}} \times 100\right)$$

3. **Perhitungan Offer Comparator:**
   * **Skor Gaji (Bobot 50%):**
     $$\text{Skor Gaji} = \left(\frac{\text{Gaji Offer}}{\max(\text{Gaji Offer A}, \text{Gaji Offer B})}\right) \times 50$$
   * **Skor Mode Kerja (Bobot 25%):** `Remote` $= 100$ (nilai $25.0$), `Hybrid` $= 75$ (nilai $18.75$), `Onsite` $= 50$ (nilai $12.5$).
   * **Skor Kecocokan Skill (Bobot 25%):**
     $$\text{Skor Skill} = \text{Skill Match (\%)} \times 0.25$$
   * **Total Skor Berbobot:**
     $$\text{Total Skor} = \text{Skor Gaji} + \text{Skor Mode Kerja} + \text{Skor Skill}$$

---

## 6. Timeline Pengerjaan & Checklist Uji Demo

### Alur Git & Jadwal Harian
* **Senin, 23 Nov 2026 (Hari 1 — Fondasi):** Anggota 1 menyelesaikan inisiasi proyek, desain sistem dasar, `src/types/`, Custom Hooks, dan `public/magang-fallback.json`, lalu *push* ke `main`. Anggota 2 (`feat/pipeline-undo`) dan Anggota 3 (`feat/detail-comparator`) mulai membuat branch kerja.
* **Selasa–Rabu, 24–25 Nov 2026 (Hari 2–3 — Pengembangan Paralel):** Setiap anggota menyelesaikan komponen UI dan fungsi utilitas masing-masing sesuai kontrak data.
* **Kamis, 26 Nov 2026 (Hari 4 — Integrasi & Build Check):** Melakukan *pull request* dan *merge* ke branch `main`, menghubungkan seluruh komponen ke `App.tsx`, dan memastikan perintah berikut bebas error:
  ```bash
  npx tsc --noEmit
  npm run build
  ```
* **Jumat, 27 Nov 2026 (Hari 5 — Pengujian 10 Testcase & Submit):** Menguji seluruh 10 skenario testcase di bawah ini, menambahkan fitur bonus opsional (misalnya *Export/Import JSON* atau shortcut `/` untuk fokus search bar), dan mengumpulkan link GitHub sebelum pukul 23:59 WIB.
* **Sabtu–Minggu, 28–29 Nov 2026 (Persiapan Demo):** Sesi *code review* internal agar setiap anggota memahami alur kode, state, dan hooks yang dikerjakan untuk persiapan *mini live-coding*.

### Checklist 10 Skenario Testcase Wajib
- [ ] **TC 1 (Fetch & Offline Error):** Loading muncul lalu lowongan tampil; saat DevTools diubah ke *Offline* dan klik Retry, muncul pesan error + tombol fallback lokal.
- [ ] **TC 2 (Skill Match Live):** Menambah skill `"Docker"` di Profil Kapten langsung menaikkan persentase Match lowongan terkait.
- [ ] **TC 3 (Debounce Search):** Mengetik cepat di pencarian baru memicu filter setelah jeda $\approx 400\text{ ms}$.
- [ ] **TC 4 (Anti-Duplikat & Focus):** Simpan lowongan mengubah tombol menjadi `"Sudah Dilamar"`; input perusahaan + posisi yang sama di Form Manual ditolak dan fokus otomatis ke input error via `useRef`.
- [ ] **TC 5 (State Machine):** Alur `WISHLIST` $\rightarrow$ `APPLIED` $\rightarrow$ `SCREENING` $\rightarrow$ `INTERVIEW` berjalan dengan validasi input wajib; `WISHLIST` tidak bisa langsung ke `OFFER`.
- [ ] **TC 6 (Simulasi Ghosting):** Klik `"Simulasi +15 Hari"` pada status `APPLIED` memunculkan badge *Rawan Ghosting* dan menambah angka statistik.
- [ ] **TC 7 (Bentrok Interview):** Membuat 2 lamaran `INTERVIEW` berselisih $30$ menit memunculkan Banner Bentrok, dan banner tetap tampil meski filter status lain dipilih.
- [ ] **TC 8 (Checklist & Refresh):** Tambah 2 checklist, centang 1 ($1/2$), lalu Refresh (`F5`) $\rightarrow$ seluruh data tetap tersimpan utuh.
- [ ] **TC 9 (Timer Cleanup):** Start Prep Timer, tutup modal sebelum waktu habis, lalu buka lagi $\rightarrow$ tidak ada error console dan detak detik tetap normal ($1\times$).
- [ ] **TC 10 (Undo & Comparator):** Hapus 1 lamaran lalu klik Undo dalam $< 5$ detik $\rightarrow$ data kembali utuh; pindahkan 2 lamaran ke `OFFER` $\rightarrow$ cek skor berbobot di Offer Comparator.
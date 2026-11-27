import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowUpDown,
  Compass,
  Database,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useDebounce } from "../../hooks/useDebounce";
import { fetchJobs } from "../../services/jobService";
import type {
  Application,
  JobListing,
  JobSortOption,
  JobSource,
} from "../../types";
import {
  calculateSkillMatch,
  getTopMissingSkills,
  isDuplicateApplication,
  normalizeText,
} from "../../utils/skillMatch";
import { Button } from "../ui/Button";
import { HeroBanner } from "./HeroBanner";
import { JobCard } from "./JobCard";
import { SkillProfilePanel } from "./SkillProfilePanel";

interface JobExplorerProps {
  kaptenSkills: string[];
  applications: Application[];
  onAddSkill: (skill: string) => boolean;
  onRemoveSkill: (skill: string) => void;
  onResetSkills: () => void;
  onSaveToWishlist: (job: JobListing) => void;
}

export function JobExplorer({
  kaptenSkills,
  applications,
  onAddSkill,
  onRemoveSkill,
  onResetSkills,
  onSaveToWishlist,
}: JobExplorerProps) {
  const [source, setSource] = useState<JobSource>("live");
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState<number>(0);

  // Search (with useDebounce 400ms), Category Filter, and Sort
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<JobSortOption>("match-desc");

  const debouncedKeyword = useDebounce(searchKeyword, 400);
  const isDebouncing = searchKeyword !== debouncedKeyword;

  // Bonus: useRef untuk keyboard shortcut '/' fokus ke Search Bar
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }
      event.preventDefault();
      searchInputRef.current?.focus();
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);

  // Fetch data lowongan wajib dengan useEffect + fetch() + AbortController
  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    const loadJobs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchJobs(source, controller.signal);
        if (!isActive) return;
        setJobs(result);
      } catch (err: unknown) {
        if (!isActive) return;
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        const message =
          err instanceof Error
            ? err.message
            : "Gagal memuat daftar lowongan. Periksa koneksi internet Anda.";
        setError(message);
        setJobs([]);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadJobs();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [source, retryToken]);

  const handleSourceChange = (nextSource: JobSource) => {
    setSource(nextSource);
    setSelectedCategory("ALL");
  };

  const handleRetry = () => {
    setRetryToken((prev) => prev + 1);
  };

  const handleUseLocalFallback = () => {
    setSource("local");
    setSelectedCategory("ALL");
  };

  const handleResetFilters = () => {
    setSearchKeyword("");
    setSelectedCategory("ALL");
    setSortBy("match-desc");
  };

  // Derived state: Top missing skills dari lamaran Kapten untuk Skill Gap Radar
  const topMissingSkills = useMemo(
    () => getTopMissingSkills(applications, kaptenSkills, 4),
    [applications, kaptenSkills],
  );

  // Derived state: daftar kategori unik dari lowongan yang dimuat
  const categories = useMemo(() => {
    const unique = new Set<string>();
    for (const job of jobs) {
      if (job.category.trim()) {
        unique.add(job.category.trim());
      }
    }
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [jobs]);

  // Derived state: Skill Match Score % dihitung langsung dari kaptenSkills + filter + sort
  const filteredAndSortedJobs = useMemo(() => {
    const normalizedQuery = normalizeText(debouncedKeyword);

    const enriched = jobs.map((job) => ({
      job,
      match: calculateSkillMatch(job.tags, kaptenSkills),
    }));

    const filtered = enriched.filter(({ job }) => {
      const categoryOk =
        selectedCategory === "ALL" || job.category === selectedCategory;

      if (!categoryOk) return false;
      if (!normalizedQuery) return true;

      const haystack = [
        job.title,
        job.company_name,
        job.category,
        job.candidate_required_location,
        ...job.tags,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "match-desc":
          if (b.match.score !== a.match.score) {
            return b.match.score - a.match.score;
          }
          return a.job.title.localeCompare(b.job.title);
        case "match-asc":
          if (a.match.score !== b.match.score) {
            return a.match.score - b.match.score;
          }
          return a.job.title.localeCompare(b.job.title);
        case "title-asc":
          return a.job.title.localeCompare(b.job.title);
        case "company-asc":
          return a.job.company_name.localeCompare(b.job.company_name);
      }
    });

    return filtered;
  }, [jobs, kaptenSkills, debouncedKeyword, selectedCategory, sortBy]);

  const hasActiveFilters =
    searchKeyword.trim().length > 0 || selectedCategory !== "ALL";

  return (
    <div className="space-y-6">
      <HeroBanner
        skillsCount={kaptenSkills.length}
        savedCount={applications.length}
        source={source}
        onFocusSearch={() => searchInputRef.current?.focus()}
      />

      {/* Main 2-Column Operate Workspace */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* Sidebar: Profil Skill Kapten & Sumber Data */}
        <div className="lg:col-span-4 xl:col-span-3">
          <SkillProfilePanel
            skills={kaptenSkills}
            topMissingSkills={topMissingSkills}
            onAddSkill={onAddSkill}
            onRemoveSkill={onRemoveSkill}
            onResetSkills={onResetSkills}
            source={source}
            onSourceChange={handleSourceChange}
          />
        </div>

        {/* Main Column: Filter Controls + States + Job Grid */}
        <div className="space-y-4 lg:col-span-8 xl:col-span-9">
          {/* Search, Category Filter, Sort, & Retry Toolbar */}
          <div className="mc-panel p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
              {/* Search Bar with Debounce 400ms & '/' Shortcut */}
              <div className="relative sm:col-span-6">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#615B53] dark:text-[#A39C93]" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      searchInputRef.current?.blur();
                    }
                  }}
                  placeholder="Cari posisi, perusahaan, atau skill..."
                  aria-label="Cari lowongan"
                  className="mc-input py-2 pr-14 pl-9"
                />
                <div className="absolute top-1/2 right-2.5 flex -translate-y-1/2 items-center gap-1">
                  {searchKeyword && (
                    <button
                      type="button"
                      onClick={() => setSearchKeyword("")}
                      aria-label="Hapus pencarian"
                      className="cursor-pointer rounded-[2px] p-1 text-[#57524B] hover:bg-[#ECE7DD] hover:text-[#171615] dark:text-[#B5AFA7] dark:hover:bg-[#33312F] dark:hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <kbd
                    title="Tekan / untuk fokus pencarian"
                    className="hidden rounded-[2px] border border-[#C7BEB0] bg-[#F3EFE8] px-1.5 py-0.5 font-mono text-xs font-bold text-[#46413B] sm:inline-block dark:border-[#494542] dark:bg-[#262423] dark:text-[#D1CBC3]"
                  >
                    /
                  </kbd>
                </div>
              </div>

              {/* Filter Kategori */}
              <div className="relative sm:col-span-3">
                <Filter className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#615B53] dark:text-[#A39C93]" />
                <select
                  aria-label="Filter kategori lowongan"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="mc-input cursor-pointer py-2 pr-3 pl-9"
                >
                  <option value="ALL">Semua Kategori</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sorting */}
              <div className="relative sm:col-span-3">
                <ArrowUpDown className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#615B53] dark:text-[#A39C93]" />
                <select
                  aria-label="Urutkan lowongan"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as JobSortOption)}
                  className="mc-input cursor-pointer py-2 pr-3 pl-9"
                >
                  <option value="match-desc">Match Tertinggi</option>
                  <option value="match-asc">Match Terendah</option>
                  <option value="title-asc">Posisi (A–Z)</option>
                  <option value="company-asc">Perusahaan (A–Z)</option>
                </select>
              </div>
            </div>

            {/* Results Metadata & Retry Control */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#E4DDD1] pt-3 text-sm text-[#57524B] dark:border-[#302D2B] dark:text-[#B5AFA7]">
              <div className="flex flex-wrap items-center gap-3">
                <span>
                  Menampilkan{" "}
                  <strong className="mc-tabular font-mono text-[#171615] dark:text-white">
                    {filteredAndSortedJobs.length}
                  </strong>{" "}
                  dari{" "}
                  <strong className="mc-tabular font-mono text-[#171615] dark:text-white">
                    {jobs.length}
                  </strong>{" "}
                  lowongan
                </span>

                {isDebouncing && (
                  <span className="inline-flex items-center gap-1.5 rounded-[3px] border border-[#E4B853] bg-[#FDF1D2] px-2 py-0.5 text-xs font-semibold text-[#7A4404] dark:border-[#A46B13] dark:bg-[#38270A] dark:text-[#FCD34D]">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Menyaring (400ms)...</span>
                  </span>
                )}

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="cursor-pointer text-xs font-bold text-[#1D4ED8] hover:underline dark:text-[#93C5FD]"
                  >
                    Reset filter
                  </button>
                )}
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleRetry}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
                />
                <span>Muat Ulang</span>
              </Button>
            </div>
          </div>

          {/* STATE 1: LOADING */}
          {isLoading && (
            <div className="space-y-4" aria-live="polite" aria-busy="true">
              <div className="flex items-center gap-2.5 rounded-[3px] border border-[#8EC980] bg-[#E3F4DE] px-4 py-3 text-sm font-semibold text-[#1F5314] dark:border-[#3D8230] dark:bg-[#193516] dark:text-[#91EB7A]">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>
                  {source === "live"
                    ? "Memuat lowongan terbaru dari Remotive API..."
                    : "Memuat 15 lowongan magang tech Indonesia..."}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="mc-surface animate-pulse space-y-4 p-5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-[3px] bg-[#E5DFD5] dark:bg-[#33312F]" />
                        <div className="space-y-2">
                          <div className="h-4 w-32 rounded-[2px] bg-[#E5DFD5] dark:bg-[#33312F]" />
                          <div className="h-3 w-24 rounded-[2px] bg-[#EFEAE2] dark:bg-[#2A2826]" />
                        </div>
                      </div>
                      <div className="h-6 w-20 rounded-[3px] bg-[#E5DFD5] dark:bg-[#33312F]" />
                    </div>
                    <div className="h-5 w-3/4 rounded-[2px] bg-[#E5DFD5] dark:bg-[#33312F]" />
                    <div className="flex gap-2">
                      <div className="h-6 w-16 rounded-[3px] bg-[#EFEAE2] dark:bg-[#2A2826]" />
                      <div className="h-6 w-20 rounded-[3px] bg-[#EFEAE2] dark:bg-[#2A2826]" />
                      <div className="h-6 w-16 rounded-[3px] bg-[#EFEAE2] dark:bg-[#2A2826]" />
                    </div>
                    <div className="flex items-center justify-between border-t border-[#E6DFD4] pt-4 dark:border-[#34312F]">
                      <div className="h-4 w-28 rounded-[2px] bg-[#E5DFD5] dark:bg-[#33312F]" />
                      <div className="h-8 w-36 rounded-[3px] bg-[#E5DFD5] dark:bg-[#33312F]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STATE 2: ERROR + Coba Lagi + Pakai Fallback Lokal */}
          {!isLoading && error && (
            <div
              role="alert"
              className="rounded-[3px] border-2 border-[#D96B66] bg-[#FDE7E6] p-6 text-center dark:border-[#962A2A] dark:bg-[#2E1414]"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[3px] border border-[#E89B96] bg-white text-[#B91C1C] dark:border-[#962A2A] dark:bg-[#3E1B1B] dark:text-[#FCA5A5]">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="mt-3 font-pixel text-base font-bold text-[#7F1D1D] dark:text-[#FECACA]">
                Koneksi Sumber Lowongan Gagal
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-[#7F1D1D] dark:text-[#FCA5A5]">
                {error}
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <Button variant="danger" size="md" onClick={handleRetry}>
                  <RefreshCw className="h-4 w-4" />
                  <span>Coba Lagi</span>
                </Button>
                {source === "live" && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleUseLocalFallback}
                  >
                    <Database className="h-4 w-4" />
                    <span>Pakai Fallback Lokal</span>
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* STATE 3: EMPTY */}
          {!isLoading && !error && filteredAndSortedJobs.length === 0 && (
            <div className="mc-panel p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[3px] border border-[#D4CBBF] bg-white text-[#8F5930] dark:border-[#44403C] dark:bg-[#262423] dark:text-[#D99B6B]">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="mt-3 font-pixel text-base font-bold text-[#171615] dark:text-white">
                Tidak Ada Lowongan Cocok
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-[#57524B] dark:text-[#B5AFA7]">
                {hasActiveFilters
                  ? "Tidak ada lowongan yang sesuai dengan kata kunci atau kategori yang dipilih."
                  : "Sumber data sedang tidak mengembalikan daftar lowongan."}
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                {hasActiveFilters && (
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={handleResetFilters}
                  >
                    <X className="h-4 w-4" />
                    <span>Reset Pencarian &amp; Filter</span>
                  </Button>
                )}
                {source === "live" && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleUseLocalFallback}
                  >
                    <Database className="h-4 w-4" />
                    <span>Gunakan Dataset Magang ID</span>
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* STATE 4: JOB LISTING GRID */}
          {!isLoading && !error && filteredAndSortedJobs.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredAndSortedJobs.map(({ job, match }) => (
                <JobCard
                  key={`${source}-${job.id}`}
                  job={job}
                  match={match}
                  isAlreadyApplied={isDuplicateApplication(
                    applications,
                    job.company_name,
                    job.title,
                  )}
                  onSaveToWishlist={onSaveToWishlist}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import type { Application } from '../../types'
import { isRawanGhosting } from '../../utils/scheduleChecker'
import { computeStats } from '../../utils/stats'

interface StatsCardsProps {
  applications: Application[]
}

export function StatsCards({ applications }: StatsCardsProps) {
  const stats = computeStats(applications, (application) =>
    isRawanGhosting(application),
  )

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <article className="mc-surface space-y-2 p-4">
        <p className="text-sm font-semibold text-[#57524B] dark:text-[#B5AFA7]">
          Total Lamaran
        </p>
        <p className="mc-tabular font-mono text-3xl font-bold text-[#171615] dark:text-white">
          {stats.total}
        </p>
        <p className="text-xs text-[#777168] dark:text-[#A7A198]">
          {stats.active} aktif di pipeline
        </p>
      </article>

      <article className="mc-surface space-y-2 p-4">
        <p className="text-sm font-semibold text-[#57524B] dark:text-[#B5AFA7]">
          Response Rate
        </p>
        <p className="mc-tabular font-mono text-3xl font-bold text-[#171615] dark:text-white">
          {stats.responseRate}%
        </p>
        <p className="text-xs text-[#777168] dark:text-[#A7A198]">
          {stats.responded} dari {stats.total} diproses
        </p>
      </article>

      <article className="mc-surface space-y-2 p-4">
        <p className="text-sm font-semibold text-[#57524B] dark:text-[#B5AFA7]">
          Interview Rate
        </p>
        <p className="mc-tabular font-mono text-3xl font-bold text-[#171615] dark:text-white">
          {stats.interviewRate}%
        </p>
        <p className="text-xs text-[#777168] dark:text-[#A7A198]">
          {stats.interviewed} masuk wawancara
        </p>
      </article>

      <article className="mc-surface space-y-2 p-4">
        <p className="text-sm font-semibold text-[#57524B] dark:text-[#B5AFA7]">
          Rawan Ghosting
        </p>
        <p
          className={`mc-tabular font-mono text-3xl font-bold ${
            stats.ghostingRisk > 0
              ? 'text-[#7A4404] dark:text-[#FCD34D]'
              : 'text-[#171615] dark:text-white'
          }`}
        >
          {stats.ghostingRisk}
        </p>
        <p className="text-xs text-[#777168] dark:text-[#A7A198]">
          &gt; 14 hari tanpa kabar
        </p>
      </article>

      <article className="mc-surface space-y-2 p-4">
        <p className="text-sm font-semibold text-[#57524B] dark:text-[#B5AFA7]">
          Total Offer
        </p>
        <p
          className={`mc-tabular font-mono text-3xl font-bold ${
            stats.offers > 0
              ? 'text-[#1F5314] dark:text-[#91EB7A]'
              : 'text-[#171615] dark:text-white'
          }`}
        >
          {stats.offers}
        </p>
        <p className="text-xs text-[#777168] dark:text-[#A7A198]">
          {stats.offers >= 2
            ? 'Siap dibandingkan'
            : 'Minimal 2 untuk dibandingkan'}
        </p>
      </article>
    </div>
  )
}

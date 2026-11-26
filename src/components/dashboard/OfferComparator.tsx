import { useId, useState } from 'react'
import type { Application } from '../../types'
import { calculateSkillMatch } from '../../utils/skillMatch'
import { computeOfferScores, formatScore, pickBestOffer } from '../../utils/offerScore'
import { Badge } from '../ui/Badge'

interface OfferComparatorProps {
  applications: Application[]
  kaptenSkills: string[]
}

export function OfferComparator({
  applications,
  kaptenSkills,
}: OfferComparatorProps) {
  const [idA, setIdA] = useState<string | null>(null)
  const [idB, setIdB] = useState<string | null>(null)
  const uid = useId()

  const offers = applications.filter((app) => app.status === 'OFFER')

  if (offers.length < 2) {
    return (
      <p className="text-sm text-[#57524B] dark:text-[#B5AFA7]">
        {`Belum bisa membandingkan: butuh minimal 2 lamaran berstatus OFFER (saat ini ${offers.length}).`}
      </p>
    )
  }

  const a = offers.find((o) => o.id === idA) ?? offers[0]
  const b =
    offers.find((o) => o.id === idB && o.id !== a.id) ??
    offers.find((o) => o.id !== a.id)

  if (b === undefined) return null

  const matchA = calculateSkillMatch(a.requiredSkills, kaptenSkills)
  const matchB = calculateSkillMatch(b.requiredSkills, kaptenSkills)
  const totalSkillsA = matchA.matchedSkills.length + matchA.missingSkills.length
  const totalSkillsB = matchB.matchedSkills.length + matchB.missingSkills.length
  const scores = computeOfferScores(
    { application: a, skillMatchPercent: matchA.score },
    { application: b, skillMatchPercent: matchB.score },
  )
  const best = pickBestOffer(scores)

  return (
    <section className="mc-surface space-y-5 p-5">
      <div>
        <h2 className="text-base font-bold text-[#171615] dark:text-white">
          Bandingkan Offer Magang
        </h2>
        <p className="mt-1 text-sm text-[#57524B] dark:text-[#B5AFA7]">
          Bobot penilaian: Uang Saku 50% • Mode Kerja 25% • Kecocokan Skill 25%
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor={`${uid}-a`}
            className="block text-xs font-semibold text-[#57524B] dark:text-[#B5AFA7]"
          >
            Offer A
          </label>
          <select
            id={`${uid}-a`}
            className="mc-input px-3 py-2"
            value={a.id}
            onChange={(event) => setIdA(event.target.value)}
          >
            {offers
              .filter((offer) => offer.id !== b.id)
              .map((offer) => (
                <option key={offer.id} value={offer.id}>
                  {offer.company} — {offer.role}
                </option>
              ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor={`${uid}-b`}
            className="block text-xs font-semibold text-[#57524B] dark:text-[#B5AFA7]"
          >
            Offer B
          </label>
          <select
            id={`${uid}-b`}
            className="mc-input px-3 py-2"
            value={b.id}
            onChange={(event) => setIdB(event.target.value)}
          >
            {offers
              .filter((offer) => offer.id !== a.id)
              .map((offer) => (
                <option key={offer.id} value={offer.id}>
                  {offer.company} — {offer.role}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 lg:divide-x lg:divide-[#E6DFD4] dark:lg:divide-[#34312F]">
        <div className="space-y-4 lg:pr-5">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#171615] dark:text-white">
              {a.company}
            </h3>
            <p className="text-sm text-[#57524B] dark:text-[#B5AFA7]">
              {a.role}
            </p>
            {best === 0 && <Badge tone="success">Rekomendasi Terbaik</Badge>}
          </div>

          <dl className="space-y-3">
            <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-baseline gap-2">
              <dt className="text-sm text-[#57524B] dark:text-[#B5AFA7]">
                Uang Saku / Bulan
              </dt>
              <dd className="mc-tabular text-right font-mono text-sm text-[#2B2825] dark:text-[#EAE5DE]">
                {`Rp ${scores[0].salary.toLocaleString('id-ID')}`}
              </dd>
              <dd className="mc-tabular text-right font-mono text-xs text-[#57524B] dark:text-[#B5AFA7]">
                {formatScore(scores[0].salaryScore)} / 50
              </dd>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-baseline gap-2">
              <dt className="text-sm text-[#57524B] dark:text-[#B5AFA7]">
                Mode Kerja
              </dt>
              <dd className="text-right text-sm text-[#2B2825] dark:text-[#EAE5DE]">
                {a.workMode} ({scores[0].workModeValue})
              </dd>
              <dd className="mc-tabular text-right font-mono text-xs text-[#57524B] dark:text-[#B5AFA7]">
                {formatScore(scores[0].workModeScore)} / 25
              </dd>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-baseline gap-2">
              <dt className="text-sm text-[#57524B] dark:text-[#B5AFA7]">
                Kecocokan Skill
              </dt>
              <dd className="text-right text-sm text-[#2B2825] dark:text-[#EAE5DE]">
                {matchA.score}% ({matchA.matchedSkills.length} dari {totalSkillsA} skill)
              </dd>
              <dd className="mc-tabular text-right font-mono text-xs text-[#57524B] dark:text-[#B5AFA7]">
                {formatScore(scores[0].skillScore)} / 25
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-t border-[#E6DFD4] bg-[#F5F1E9] px-3 py-2 dark:border-[#34312F] dark:bg-[#242221]">
              <dt className="text-sm font-bold text-[#171615] dark:text-white">
                Total Skor Berbobot
              </dt>
              <dd className="mc-tabular font-mono text-lg font-bold text-[#171615] dark:text-white">
                {formatScore(scores[0].total)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="space-y-4 border-t border-[#E6DFD4] pt-5 dark:border-[#34312F] lg:border-t-0 lg:pl-5 lg:pt-0">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#171615] dark:text-white">
              {b.company}
            </h3>
            <p className="text-sm text-[#57524B] dark:text-[#B5AFA7]">
              {b.role}
            </p>
            {best === 1 && <Badge tone="success">Rekomendasi Terbaik</Badge>}
          </div>

          <dl className="space-y-3">
            <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-baseline gap-2">
              <dt className="text-sm text-[#57524B] dark:text-[#B5AFA7]">
                Uang Saku / Bulan
              </dt>
              <dd className="mc-tabular text-right font-mono text-sm text-[#2B2825] dark:text-[#EAE5DE]">
                {`Rp ${scores[1].salary.toLocaleString('id-ID')}`}
              </dd>
              <dd className="mc-tabular text-right font-mono text-xs text-[#57524B] dark:text-[#B5AFA7]">
                {formatScore(scores[1].salaryScore)} / 50
              </dd>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-baseline gap-2">
              <dt className="text-sm text-[#57524B] dark:text-[#B5AFA7]">
                Mode Kerja
              </dt>
              <dd className="text-right text-sm text-[#2B2825] dark:text-[#EAE5DE]">
                {b.workMode} ({scores[1].workModeValue})
              </dd>
              <dd className="mc-tabular text-right font-mono text-xs text-[#57524B] dark:text-[#B5AFA7]">
                {formatScore(scores[1].workModeScore)} / 25
              </dd>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-baseline gap-2">
              <dt className="text-sm text-[#57524B] dark:text-[#B5AFA7]">
                Kecocokan Skill
              </dt>
              <dd className="text-right text-sm text-[#2B2825] dark:text-[#EAE5DE]">
                {matchB.score}% ({matchB.matchedSkills.length} dari {totalSkillsB} skill)
              </dd>
              <dd className="mc-tabular text-right font-mono text-xs text-[#57524B] dark:text-[#B5AFA7]">
                {formatScore(scores[1].skillScore)} / 25
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-t border-[#E6DFD4] bg-[#F5F1E9] px-3 py-2 dark:border-[#34312F] dark:bg-[#242221]">
              <dt className="text-sm font-bold text-[#171615] dark:text-white">
                Total Skor Berbobot
              </dt>
              <dd className="mc-tabular font-mono text-lg font-bold text-[#171615] dark:text-white">
                {formatScore(scores[1].total)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {best === null && (
        <p className="text-sm text-[#57524B] dark:text-[#B5AFA7]">
          Skor seri, tidak ada rekomendasi.
        </p>
      )}
    </section>
  )
}

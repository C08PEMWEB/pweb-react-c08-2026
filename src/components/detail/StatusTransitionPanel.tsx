import { useId, useState } from 'react'
import type { Application, ApplicationStatus, WorkMode } from '../../types'
import { formatIdrInput, parseIdrInput } from '../../utils/currency'
import {
  getAllowedNextStatuses,
  isFinalStatus,
  validateStatusTransition,
  type StatusTransitionPayload,
} from '../../utils/stateMachine'
import {
  APPLICATION_STATUS_LABELS,
  Badge,
  getStatusBadgeTone,
} from '../ui/Badge'
import { Button } from '../ui/Button'

interface StatusTransitionPanelProps {
  application: Application
  onTransition: (target: ApplicationStatus, payload: StatusTransitionPayload) => void
}

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10)
}

export function StatusTransitionPanel({
  application,
  onTransition,
}: StatusTransitionPanelProps) {
  const uid = useId()
  const [target, setTarget] = useState<ApplicationStatus | null>(null)
  const [cvVersion, setCvVersion] = useState(application.cvVersion ?? '')
  const [appliedDate, setAppliedDate] = useState(
    application.appliedDate ?? getTodayDateString(),
  )
  const [interviewDateTime, setInterviewDateTime] = useState(
    application.interviewDateTime ?? '',
  )
  const [salaryOfferText, setSalaryOfferText] = useState(
    application.salaryOffer !== undefined
      ? formatIdrInput(String(application.salaryOffer))
      : '',
  )
  const [workMode, setWorkMode] = useState<WorkMode>(application.workMode)
  const [error, setError] = useState<string | null>(null)

  const heading = (
    <div className="flex flex-wrap items-center gap-2">
      <h2 className="text-base font-bold text-[#171615] dark:text-white">
        Status Lamaran
      </h2>
      <Badge tone={getStatusBadgeTone(application.status)} dot>
        {APPLICATION_STATUS_LABELS[application.status]}
      </Badge>
    </div>
  )

  if (isFinalStatus(application.status)) {
    return (
      <section className="space-y-3">
        {heading}
        <p className="text-sm text-[#57524B] dark:text-[#B5AFA7]">
          Status final, tidak dapat diubah.
        </p>
      </section>
    )
  }

  const allowedStatuses = getAllowedNextStatuses(application.status)

  const handleConfirm = () => {
    if (target === null) return

    const payload: StatusTransitionPayload = {
      cvVersion: cvVersion.trim() || undefined,
      appliedDate: appliedDate.trim() || undefined,
      interviewDateTime: interviewDateTime.trim() || undefined,
      salaryOffer: parseIdrInput(salaryOfferText),
      workMode,
    }

    const validation = validateStatusTransition(application.status, target, payload)
    if (!validation.valid) {
      setError(validation.error ?? 'Transisi status tidak valid.')
      return
    }

    onTransition(target, payload)
    setTarget(null)
    setError(null)
  }

  return (
    <section className="space-y-4">
      {heading}

      <div className="flex flex-wrap gap-2">
        {allowedStatuses.map((status) => (
          <Button
            key={status}
            type="button"
            size="sm"
            variant={target === status ? 'primary' : 'secondary'}
            onClick={() => {
              setTarget(status)
              setError(null)
            }}
          >
            {APPLICATION_STATUS_LABELS[status]}
          </Button>
        ))}
      </div>

      {target === 'APPLIED' && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor={`${uid}-cv-version`}
              className="mb-1.5 block text-xs font-bold text-[#3A3631] dark:text-[#DDD7CF]"
            >
              Versi CV *
            </label>
            <input
              id={`${uid}-cv-version`}
              type="text"
              value={cvVersion}
              onChange={(event) => {
                setCvVersion(event.target.value)
                setError(null)
              }}
              placeholder="Contoh: CV-FE-v2"
              className="mc-input px-3 py-2"
            />
          </div>
          <div>
            <label
              htmlFor={`${uid}-applied-date`}
              className="mb-1.5 block text-xs font-bold text-[#3A3631] dark:text-[#DDD7CF]"
            >
              Tanggal Melamar *
            </label>
            <input
              id={`${uid}-applied-date`}
              type="date"
              value={appliedDate}
              onChange={(event) => {
                setAppliedDate(event.target.value)
                setError(null)
              }}
              className="mc-input px-3 py-2"
            />
          </div>
        </div>
      )}

      {target === 'INTERVIEW' && (
        <div>
          <label
            htmlFor={`${uid}-interview-date-time`}
            className="mb-1.5 block text-xs font-bold text-[#3A3631] dark:text-[#DDD7CF]"
          >
            Jadwal Interview (Tanggal &amp; Jam) *
          </label>
          <input
            id={`${uid}-interview-date-time`}
            type="datetime-local"
            value={interviewDateTime}
            onChange={(event) => {
              setInterviewDateTime(event.target.value)
              setError(null)
            }}
            className="mc-input px-3 py-2"
          />
        </div>
      )}

      {target === 'OFFER' && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor={`${uid}-salary-offer`}
              className="mb-1.5 block text-xs font-bold text-[#3A3631] dark:text-[#DDD7CF]"
            >
              Gaji Offer (Rp / bulan) *
            </label>
            <div className="relative">
              <span
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 font-mono text-xs font-bold text-[#615B53] dark:text-[#A39C93]"
                aria-hidden="true"
              >
                Rp
              </span>
              <input
                id={`${uid}-salary-offer`}
                type="text"
                inputMode="numeric"
                value={salaryOfferText}
                onChange={(event) => {
                  setSalaryOfferText(formatIdrInput(event.target.value))
                  setError(null)
                }}
                placeholder="5.500.000"
                className="mc-input mc-tabular py-2 pr-3 pl-9 font-mono"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor={`${uid}-work-mode`}
              className="mb-1.5 block text-xs font-bold text-[#3A3631] dark:text-[#DDD7CF]"
            >
              Mode Kerja *
            </label>
            <select
              id={`${uid}-work-mode`}
              value={workMode}
              onChange={(event) => {
                setWorkMode(event.target.value as WorkMode)
                setError(null)
              }}
              className="mc-input cursor-pointer px-3 py-2"
            >
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Onsite">Onsite</option>
            </select>
          </div>
        </div>
      )}

      {error !== null && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-[3px] border border-[#E89B96] bg-[#FDE7E6] px-3 py-2 text-xs font-semibold text-[#921616] dark:border-[#962A2A] dark:bg-[#3A1616] dark:text-[#FCA5A5]"
        >
          {error}
        </p>
      )}

      <Button
        type="button"
        size="sm"
        onClick={handleConfirm}
        disabled={target === null}
      >
        Konfirmasi
      </Button>
    </section>
  )
}

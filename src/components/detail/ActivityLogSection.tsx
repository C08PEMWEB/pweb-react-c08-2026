import { useState, type FormEvent } from 'react'
import type { ActivityLog } from '../../types'
import { formatLogTimestamp, sortLogsNewestFirst } from '../../utils/activityLog'
import { Button } from '../ui/Button'

interface ActivityLogSectionProps {
  logs: ActivityLog[]
  onAddNote: (message: string) => void
}

export function ActivityLogSection({ logs, onAddNote }: ActivityLogSectionProps) {
  const [note, setNote] = useState('')
  const sortedLogs = sortLogsNewestFirst(logs)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (note.trim() === '') return
    onAddNote(note)
    setNote('')
  }

  return (
    <section className="space-y-4">
      <h2 className="text-base font-bold text-[#171615] dark:text-white">
        Riwayat Aktivitas
      </h2>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <label htmlFor="activity-note" className="sr-only">
          Tambah catatan aktivitas
        </label>
        <input
          id="activity-note"
          type="text"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Tambah catatan..."
          className="mc-input min-w-0 flex-1 px-3 py-2"
        />
        <Button type="submit" size="sm" className="shrink-0">
          Catat
        </Button>
      </form>

      {sortedLogs.length === 0 ? (
        <p className="text-sm text-[#57524B] dark:text-[#B5AFA7]">
          Belum ada aktivitas.
        </p>
      ) : (
        <ol className="divide-y divide-[#E6DFD4] dark:divide-[#34312F]">
          {sortedLogs.map((log) => (
            <li key={log.id} className="space-y-1 py-3 first:pt-0 last:pb-0">
              <time
                dateTime={log.timestamp}
                className="mc-tabular block text-xs text-[#777168] dark:text-[#A7A198]"
              >
                {formatLogTimestamp(log.timestamp)}
              </time>
              <p className="text-sm text-[#2B2825] dark:text-[#EAE5DE]">
                {log.message}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

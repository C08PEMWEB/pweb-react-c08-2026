import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import type { ChecklistItem } from '../../types'
import { getChecklistProgress } from '../../utils/checklist'
import { Button } from '../ui/Button'

interface ChecklistSectionProps {
  checklist: ChecklistItem[]
  onAdd: (text: string) => void
  onToggle: (id: string) => void
  onRemove: (id: string) => void
}

export function ChecklistSection({
  checklist,
  onAdd,
  onToggle,
  onRemove,
}: ChecklistSectionProps) {
  const [draft, setDraft] = useState('')
  const { done, total, percent } = getChecklistProgress(checklist)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (draft.trim() === '') return
    onAdd(draft)
    setDraft('')
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-[#171615] dark:text-white">
          Daftar Persiapan
        </h2>
        <span className="mc-tabular shrink-0 font-mono text-sm font-semibold text-[#57524B] dark:text-[#B5AFA7]">
          {done} / {total} selesai
        </span>
      </div>

      <div
        role="progressbar"
        aria-label="Progres daftar persiapan"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-2 overflow-hidden rounded-[3px] bg-[#DDD5C9] dark:bg-[#2E2C2A]"
      >
        <div
          className="h-full bg-[#2A6E1C] transition-[width] dark:bg-[#7EE065]"
          style={{ width: `${percent}%` }}
        />
      </div>

      {checklist.length === 0 ? (
        <p className="text-sm text-[#57524B] dark:text-[#B5AFA7]">
          Belum ada item persiapan.
        </p>
      ) : (
        <ul className="divide-y divide-[#E6DFD4] dark:divide-[#34312F]">
          {checklist.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => onToggle(item.id)}
                className="h-4 w-4 shrink-0 accent-[#2F7020] dark:accent-[#52A535]"
              />
              <span
                className={`min-w-0 flex-1 text-sm ${
                  item.done
                    ? 'text-[#777168] line-through dark:text-[#8E8880]'
                    : 'text-[#2B2825] dark:text-[#EAE5DE]'
                }`}
              >
                {item.text}
              </span>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                aria-label="Hapus item"
                className="shrink-0 cursor-pointer rounded-[3px] p-1.5 text-[#57524B] transition hover:bg-[#FDE7E6] hover:text-[#921616] focus-visible:outline-2 focus-visible:outline-[#52A535] dark:text-[#B5AFA7] dark:hover:bg-[#3A1616] dark:hover:text-[#FCA5A5]"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <label htmlFor="checklist-draft" className="sr-only">
          Tambah tugas persiapan baru
        </label>
        <input
          id="checklist-draft"
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Tambah tugas persiapan baru..."
          className="mc-input min-w-0 flex-1 px-3 py-2"
        />
        <Button type="submit" size="sm" className="shrink-0">
          Tambah
        </Button>
      </form>
    </section>
  )
}

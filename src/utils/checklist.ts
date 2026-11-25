import type { Application, ChecklistItem } from '../types'

export function addChecklistItem(application: Application, text: string): Application {
  const trimmed = text.trim()
  if (trimmed === '') return application
  const item: ChecklistItem = { id: crypto.randomUUID(), text: trimmed, done: false }
  return { ...application, checklist: [...application.checklist, item] }
}

export function toggleChecklistItem(application: Application, itemId: string): Application {
  return {
    ...application,
    checklist: application.checklist.map((item) =>
      item.id === itemId ? { ...item, done: !item.done } : item,
    ),
  }
}

export function removeChecklistItem(application: Application, itemId: string): Application {
  return { ...application, checklist: application.checklist.filter((item) => item.id !== itemId) }
}

export function getChecklistProgress(checklist: ChecklistItem[]): {
  done: number
  total: number
  percent: number
} {
  const total = checklist.length
  const done = checklist.filter((item) => item.done).length
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) }
}

import type { ActivityLog, Application } from '../types'

export function createActivityLog(message: string): ActivityLog {
  return { id: crypto.randomUUID(), timestamp: new Date().toISOString(), message }
}

export function appendActivityLog(application: Application, message: string): Application {
  const trimmed = message.trim()
  if (trimmed === '') return application
  return { ...application, activityLogs: [...application.activityLogs, createActivityLog(trimmed)] }
}

export function sortLogsNewestFirst(logs: ActivityLog[]): ActivityLog[] {
  return [...logs].sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}

export function formatLogTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

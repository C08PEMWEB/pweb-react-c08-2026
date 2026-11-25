import type { Application, ApplicationStatus } from '../types'

const ACTIVE_STATUSES: readonly ApplicationStatus[] = ['APPLIED', 'SCREENING', 'INTERVIEW']
const RESPONDED_STATUSES: readonly ApplicationStatus[] = ['SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED']
const INTERVIEWED_STATUSES: readonly ApplicationStatus[] = ['INTERVIEW', 'OFFER']

export interface ApplicationStats {
  total: number
  active: number
  responded: number
  interviewed: number
  responseRate: number
  interviewRate: number
  ghostingRisk: number
  offers: number
}

export function computeStats(
  applications: Application[],
  isGhostingRisk: (application: Application) => boolean,
): ApplicationStats {
  const total = applications.length
  const countBy = (statuses: readonly ApplicationStatus[]) =>
    applications.filter((a) => statuses.includes(a.status)).length
  const percent = (count: number) => (total === 0 ? 0 : Math.round((count / total) * 100))
  const responded = countBy(RESPONDED_STATUSES)
  const interviewed = countBy(INTERVIEWED_STATUSES)
  return {
    total,
    active: countBy(ACTIVE_STATUSES),
    responded,
    interviewed,
    responseRate: percent(responded),
    interviewRate: percent(interviewed),
    ghostingRisk: applications.filter((application) => isGhostingRisk(application)).length,
    offers: countBy(['OFFER']),
  }
}

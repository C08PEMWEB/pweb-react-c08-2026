import type { Application, WorkMode } from '../types'

const WORK_MODE_VALUE: Record<WorkMode, number> = { Remote: 100, Hybrid: 75, Onsite: 50 }

export interface OfferScoreInput {
  application: Application
  skillMatchPercent: number
}

export interface OfferScore {
  salary: number
  salaryScore: number
  workModeValue: number
  workModeScore: number
  skillMatchPercent: number
  skillScore: number
  total: number
}

function buildScore(input: OfferScoreInput, maxSalary: number): OfferScore {
  const salary = input.application.salaryOffer ?? 0
  const workModeValue = WORK_MODE_VALUE[input.application.workMode]
  const salaryScore = maxSalary === 0 ? 0 : (salary / maxSalary) * 50
  const workModeScore = workModeValue * 0.25
  const skillScore = input.skillMatchPercent * 0.25
  return {
    salary,
    salaryScore,
    workModeValue,
    workModeScore,
    skillMatchPercent: input.skillMatchPercent,
    skillScore,
    total: salaryScore + workModeScore + skillScore,
  }
}

export function computeOfferScores(a: OfferScoreInput, b: OfferScoreInput): [OfferScore, OfferScore] {
  const maxSalary = Math.max(a.application.salaryOffer ?? 0, b.application.salaryOffer ?? 0)
  return [buildScore(a, maxSalary), buildScore(b, maxSalary)]
}

export function pickBestOffer(scores: [OfferScore, OfferScore]): 0 | 1 | null {
  if (scores[0].total === scores[1].total) return null
  return scores[0].total > scores[1].total ? 0 : 1
}

export function formatScore(value: number): string {
  return value.toFixed(1)
}

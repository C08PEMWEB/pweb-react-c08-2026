import { useEffect, useState } from 'react'
import { Button } from '../ui/Button'
import { INTERVIEW_QUESTIONS } from './interviewQuestions'

const DURATION = 120

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function InterviewTimer() {
  const [questionIndex, setQuestionIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(DURATION)
  const [isRunning, setIsRunning] = useState(false)
  const isTicking = isRunning && secondsLeft > 0

  useEffect(() => {
    if (!isTicking) return
    const intervalId = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1))
    }, 1000)
    return () => window.clearInterval(intervalId)
  }, [isTicking])

  function handleToggle() {
    if (secondsLeft === 0) return
    setIsRunning((r) => !r)
  }

  function handleReset() {
    setSecondsLeft(DURATION)
    setIsRunning(false)
  }

  function handleNext() {
    setQuestionIndex((i) => (i + 1) % INTERVIEW_QUESTIONS.length)
    setSecondsLeft(DURATION)
    setIsRunning(false)
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-[#171615] dark:text-white">
          Latihan Interview
        </h2>
        <span className="mc-tabular shrink-0 font-mono text-sm font-semibold text-[#57524B] dark:text-[#B5AFA7]">
          Soal {questionIndex + 1} / {INTERVIEW_QUESTIONS.length}
        </span>
      </div>

      <p className="text-sm text-[#2B2825] dark:text-[#EAE5DE]">
        {INTERVIEW_QUESTIONS[questionIndex]}
      </p>

      <div className="flex flex-col items-center gap-2 py-2">
        <span
          role="timer"
          className="mc-tabular font-mono text-4xl font-bold tracking-wide text-[#171615] dark:text-white"
        >
          {formatTime(secondsLeft)}
        </span>
        {secondsLeft === 0 && (
          <p className="text-sm font-semibold text-[#921616] dark:text-[#FCA5A5]">
            Waktu habis
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          onClick={handleToggle}
          disabled={secondsLeft === 0}
        >
          {isTicking ? 'Jeda' : 'Mulai'}
        </Button>
        <Button
          type="button"
          variant="outline-green"
          size="sm"
          onClick={handleReset}
        >
          Reset
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleNext}
        >
          Soal Berikutnya
        </Button>
      </div>
    </section>
  )
}

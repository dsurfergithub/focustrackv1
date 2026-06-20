import { format, eachDayOfInterval, startOfYear, endOfYear, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { DayStatus, Habit, PomodoroSession, TimeSession } from './types'

export function getDayKey(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function getDaysOfYear(year: number): Date[] {
  return eachDayOfInterval({
    start: startOfYear(new Date(year, 0, 1)),
    end: endOfYear(new Date(year, 0, 1)),
  })
}

export function getMonthDayMatrix(year: number): (Date | null)[][] {
  const matrix: (Date | null)[][] = Array.from({ length: 31 }, () => Array(12).fill(null))
  for (let m = 0; m < 12; m++) {
    const daysInMonth = new Date(year, m + 1, 0).getDate()
    for (let d = 0; d < daysInMonth; d++) {
      matrix[d][m] = new Date(year, m, d + 1)
    }
  }
  return matrix
}

export function calculateStreak(history: Record<string, DayStatus>): { current: number; best: number } {
  const today = getDayKey(new Date())
  const sorted = Object.entries(history)
    .filter(([, s]) => s === 'completed' || s === 'break')
    .map(([d]) => d)
    .sort()
    .reverse()

  let current = 0
  let best = 0
  let streak = 0
  let prev: string | null = null

  for (const d of sorted) {
    if (prev === null) {
      if (d === today || isYesterday(d, today)) {
        streak = 1
      } else {
        break
      }
    } else {
      if (isConsecutive(d, prev)) {
        streak++
      } else {
        break
      }
    }
    prev = d
  }
  current = streak

  let runStreak = 0
  let runPrev: string | null = null
  for (const d of [...sorted].reverse()) {
    if (runPrev === null || isConsecutive(runPrev, d)) {
      runStreak++
    } else {
      if (runStreak > best) best = runStreak
      runStreak = 1
    }
    runPrev = d
  }
  if (runStreak > best) best = runStreak

  return { current, best }
}

function isYesterday(d: string, today: string): boolean {
  const date = parseISO(d)
  const todayDate = parseISO(today)
  const diff = todayDate.getTime() - date.getTime()
  return diff === 86400000
}

function isConsecutive(earlier: string, later: string): boolean {
  const e = parseISO(earlier)
  const l = parseISO(later)
  return l.getTime() - e.getTime() === 86400000
}

export function getCompletionRate(habit: Habit, days: number = 30): number {
  const today = new Date()
  let completed = 0
  let total = 0
  for (let i = 0; i < days; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = getDayKey(d)
    if (new Date(key) < new Date(habit.createdAt.substring(0, 10))) continue
    const s = habit.history[key]
    total++
    if (s === 'completed') completed++
  }
  return total > 0 ? Math.round((completed / total) * 100) : 0
}

export function getTodayPomodoroCount(sessions: PomodoroSession[]): number {
  const today = getDayKey(new Date())
  return sessions.filter(s => s.date === today && s.phase === 'work' && s.completed).length
}

export function getWeeklyStats(habits: Habit[]): { day: string; completed: number }[] {
  const result = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = getDayKey(d)
    const raw = format(d, 'EEE', { locale: es })
    const label = raw.charAt(0).toUpperCase() + raw.slice(1, 3)
    const completed = habits.filter(h => h.history[key] === 'completed').length
    result.push({ day: label, completed })
  }
  return result
}

export function getMonthlyPomodoros(sessions: PomodoroSession[]): { week: string; count: number }[] {
  const today = new Date()
  const result = []
  for (let w = 3; w >= 0; w--) {
    const start = new Date(today)
    start.setDate(start.getDate() - (w + 1) * 7)
    const end = new Date(today)
    end.setDate(end.getDate() - w * 7)
    const count = sessions.filter(s => {
      const d = parseISO(s.startedAt)
      return d >= start && d < end && s.phase === 'work' && s.completed
    }).length
    result.push({ week: `S-${w + 1}`, count })
  }
  return result
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

export function formatDurationHuman(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  if (m > 0) return `${m}m`
  return `${seconds}s`
}

export function getTodayTrackedSeconds(sessions: TimeSession[]): number {
  const today = getDayKey(new Date())
  return sessions.filter(s => s.date === today).reduce((acc, s) => acc + s.duration, 0)
}

export function getWeeklyTimeStats(habits: Habit[]): { day: string; seconds: number }[] {
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    const key = getDayKey(d)
    const raw = format(d, 'EEE', { locale: es })
    const label = raw.charAt(0).toUpperCase() + raw.slice(1, 3)
    const seconds = habits.flatMap(h => h.timeSessions ?? [])
      .filter(s => s.date === key)
      .reduce((acc, s) => acc + s.duration, 0)
    return { day: label, seconds }
  })
}

export function autoGenerateMilestones(habit: Habit): void {
  if (!habit.cumulativeTarget) return
  const completed = Object.values(habit.history).filter(s => s === 'completed').length
  const target = habit.cumulativeTarget
  const maxMilestone = Math.floor(completed / target)
  for (let i = 1; i <= maxMilestone; i++) {
    const exists = habit.milestones.find(m => m.dayIndex === i * target)
    if (!exists) {
      habit.milestones.push({
        id: `auto-${i}`,
        dayIndex: i * target,
        label: `${i * target} días`,
        date: getDayKey(new Date()),
        emoji: habit.emojiTemplate || '🏆',
        reward: habit.rewardTemplate,
        auto: true,
      })
    }
  }
}

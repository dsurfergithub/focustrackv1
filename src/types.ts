export type DayStatus = 'completed' | 'failed' | 'break' | 'none'

export type ViewMode = 'overview' | 'pomodoro' | 'individual' | 'stats' | 'trophies'

export type PomodoroPhase = 'work' | 'short_break' | 'long_break' | 'idle'

export interface Milestone {
  id: string
  dayIndex: number
  label: string
  date: string
  emoji?: string
  reward?: string
  auto: boolean
}

export interface PomodoroSession {
  id: string
  habitId: string | null
  date: string
  startedAt: string
  completedAt: string
  duration: number
  phase: 'work' | 'short_break' | 'long_break'
  completed: boolean
}

export interface Habit {
  id: string
  name: string
  color: string
  description?: string
  history: Record<string, DayStatus>
  milestones: Milestone[]
  pomodoroSessions: PomodoroSession[]
  cumulativeTarget?: number
  rewardTemplate?: string
  emojiTemplate?: string
  createdAt: string
  archivedAt?: string
}

export interface PomodoroSettings {
  workDuration: number
  shortBreak: number
  longBreak: number
  sessionsBeforeLong: number
  soundBell: boolean
  soundMilestone: boolean
  soundTick: boolean
  autoStartBreaks: boolean
}

export interface AppData {
  habits: Habit[]
  pomodoroSettings: PomodoroSettings
  exportedAt: string
}

export const NEON_COLORS = [
  '#a3e635',
  '#22d3ee',
  '#7c3aed',
  '#ec4899',
  '#f97316',
  '#facc15',
  '#34d399',
  '#fb7185',
]

export const MONTHS_ES = [
  'Ene','Feb','Mar','Abr','May','Jun',
  'Jul','Ago','Sep','Oct','Nov','Dic',
]

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreak: 5,
  longBreak: 15,
  sessionsBeforeLong: 4,
  soundBell: true,
  soundMilestone: true,
  soundTick: false,
  autoStartBreaks: false,
}

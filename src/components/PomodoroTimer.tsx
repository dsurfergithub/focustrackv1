import { Play, Pause, RotateCcw, SkipForward, ChevronDown } from 'lucide-react'
import type { PomodoroPhase, Habit } from '../types'

interface PomodoroTimerProps {
  phase: PomodoroPhase
  secondsLeft: number
  isRunning: boolean
  sessionCount: number
  progress: number
  selectedHabitId: string | null
  habits: Habit[]
  sessionsBeforeLong: number
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onSkip: () => void
  onSelectHabit: (id: string | null) => void
}

const PHASE_LABELS: Record<PomodoroPhase, string> = {
  idle: 'Listo para empezar',
  work: 'Sesión de trabajo',
  short_break: 'Descanso corto',
  long_break: 'Descanso largo',
}

const PHASE_COLORS: Record<PomodoroPhase, string> = {
  idle: '#a3e635',
  work: '#a3e635',
  short_break: '#22d3ee',
  long_break: '#7c3aed',
}

function pad(n: number) { return String(n).padStart(2, '0') }

export default function PomodoroTimer({
  phase, secondsLeft, isRunning, sessionCount, progress,
  selectedHabitId, habits, sessionsBeforeLong,
  onStart, onPause, onReset, onSkip, onSelectHabit,
}: PomodoroTimerProps) {
  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const color = PHASE_COLORS[phase]
  const selectedHabit = habits.find(h => h.id === selectedHabitId)

  const RADIUS = 110
  const CIRC = 2 * Math.PI * RADIUS
  const dashOffset = CIRC - (progress / 100) * CIRC

  const dots = Array.from({ length: sessionsBeforeLong }, (_, i) => i)

  return (
    <div className="flex flex-col items-center gap-8 py-8 slide-up">
      <div className="text-sm text-gray-500 tracking-widest uppercase">
        {PHASE_LABELS[phase]}
      </div>

      <div className="relative flex items-center justify-center">
        <svg width="280" height="280" viewBox="0 0 280 280" className="-rotate-90">
          <circle
            cx="140" cy="140" r={RADIUS}
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="6"
          />
          <circle
            cx="140" cy="140" r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.5s linear' }}
          />
        </svg>

        {isRunning && (
          <div
            className="absolute w-[236px] h-[236px] rounded-full timer-pulse"
            style={{ border: `1px solid ${color}40` }}
          />
        )}

        <div className="absolute flex flex-col items-center select-none">
          <span
            className="font-mono text-6xl font-bold tracking-tight"
            style={{ color }}
          >
            {pad(mins)}:{pad(secs)}
          </span>
          {phase !== 'idle' && (
            <span className="text-gray-600 text-xs mt-1">
              {phase === 'work' ? 'trabajo' : 'descanso'}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {dots.map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-all"
            style={{
              backgroundColor: i < (sessionCount % sessionsBeforeLong) ? color : '#2a2a2a',
            }}
          />
        ))}
      </div>

      <div className="relative w-64">
        <select
          value={selectedHabitId ?? ''}
          onChange={e => onSelectHabit(e.target.value || null)}
          className="w-full bg-[#111] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-gray-300 appearance-none cursor-pointer focus:outline-none focus:border-[#a3e635]/40 transition-colors pr-8"
          style={selectedHabit ? { borderColor: selectedHabit.color + '40' } : {}}
        >
          <option value="">Sin hábito vinculado</option>
          {habits.map(h => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
        {selectedHabit && (
          <div
            className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
            style={{ backgroundColor: selectedHabit.color }}
          />
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onReset}
          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-all"
        >
          <RotateCcw size={16} />
        </button>

        <button
          onClick={isRunning ? onPause : onStart}
          className="w-16 h-16 rounded-2xl flex items-center justify-center font-medium transition-all hover:scale-105 active:scale-95"
          style={{ backgroundColor: color + '15', color, border: `1px solid ${color}40` }}
        >
          {isRunning
            ? <Pause size={24} fill="currentColor" />
            : <Play size={24} fill="currentColor" />
          }
        </button>

        <button
          onClick={onSkip}
          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-all"
        >
          <SkipForward size={16} />
        </button>
      </div>

      {sessionCount > 0 && (
        <p className="text-xs text-gray-600">
          {sessionCount} {sessionCount === 1 ? 'sesión completada hoy' : 'sesiones completadas hoy'}
        </p>
      )}
    </div>
  )
}

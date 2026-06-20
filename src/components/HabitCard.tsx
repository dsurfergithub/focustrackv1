import { Flame, CheckCircle, Timer, MoreHorizontal, Pencil, Archive, Trash2, Play, Square } from 'lucide-react'
import { useState } from 'react'
import { getDayKey, calculateStreak, getTodayPomodoroCount, getCompletionRate, formatDuration, formatDurationHuman, getTodayTrackedSeconds } from '../utils'
import YearGrid from './YearGrid'
import type { Habit, DayStatus } from '../types'

interface HabitCardProps {
  habit: Habit
  expanded?: boolean
  onClick: () => void
  onToggleToday: (habitId: string, status: DayStatus) => void
  onEdit: () => void
  onArchive: () => void
  onDelete: () => void
  onStartPomodoro: () => void
  onToggleDay: (key: string) => void
  isTracking: boolean
  elapsedSeconds: number
  onStartTracking: () => void
  onStopTracking: () => void
}

export default function HabitCard({
  habit, expanded, onClick,
  onToggleToday, onEdit, onArchive, onDelete, onStartPomodoro, onToggleDay,
  isTracking, elapsedSeconds, onStartTracking, onStopTracking,
}: HabitCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const today = getDayKey(new Date())
  const todayStatus = habit.history[today] ?? 'none'
  const { current: streakCurrent, best: streakBest } = calculateStreak(habit.history)
  const pomodorosToday = getTodayPomodoroCount(habit.pomodoroSessions)
  const rate = getCompletionRate(habit)
  const completedCount = Object.values(habit.history).filter(s => s === 'completed').length

  const todayTrackedSeconds = getTodayTrackedSeconds(habit.timeSessions ?? [])
  const dailyGoalSeconds = (habit.dailyTimeGoal ?? 0) * 60
  const goalProgress = dailyGoalSeconds > 0
    ? Math.min((todayTrackedSeconds + (isTracking ? elapsedSeconds : 0)) / dailyGoalSeconds, 1)
    : null

  const STATUS_CYCLE: DayStatus[] = ['none', 'completed', 'failed', 'break']
  function toggleToday() {
    const idx = STATUS_CYCLE.indexOf(todayStatus)
    onToggleToday(habit.id, STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length])
  }

  return (
    <div
      className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/10 group relative"
      style={isTracking ? { borderColor: habit.color + '40' } : {}}
    >
      {/* Active tracking indicator */}
      {isTracking && (
        <div
          className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
          style={{ backgroundColor: habit.color }}
        />
      )}

      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={onClick}>
        <div className="relative w-3 h-3 flex-shrink-0">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: habit.color }} />
          {isTracking && (
            <div className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: habit.color, opacity: 0.4 }} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-white truncate">{habit.name}</h3>
            {streakCurrent >= 3 && (
              <span className="flex items-center gap-0.5 text-[10px] text-orange-400 font-medium">
                <Flame size={10} />
                {streakCurrent}
              </span>
            )}
          </div>
          {isTracking ? (
            <p className="text-xs font-mono mt-0.5" style={{ color: habit.color }}>
              ● {formatDuration(elapsedSeconds)}
            </p>
          ) : todayTrackedSeconds > 0 ? (
            <p className="text-xs text-gray-600 mt-0.5">{formatDurationHuman(todayTrackedSeconds)} hoy</p>
          ) : habit.description ? (
            <p className="text-xs text-gray-600 truncate mt-0.5">{habit.description}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {pomodorosToday > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
              <Timer size={10} />
              {pomodorosToday}
            </span>
          )}

          {/* Time tracker button */}
          <button
            onClick={e => { e.stopPropagation(); isTracking ? onStopTracking() : onStartTracking() }}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={isTracking
              ? { backgroundColor: habit.color + '20', color: habit.color, border: `1px solid ${habit.color}40` }
              : { color: '#444', border: '1px solid #2a2a2a' }
            }
            title={isTracking ? 'Detener tracker' : 'Iniciar tracker'}
          >
            {isTracking ? <Square size={11} fill="currentColor" /> : <Play size={11} fill="currentColor" />}
          </button>

          <button
            onClick={e => { e.stopPropagation(); toggleToday() }}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all text-sm"
            style={{
              backgroundColor: todayStatus === 'completed' ? habit.color + '20' : 'transparent',
              color: todayStatus === 'completed' ? habit.color : '#444',
              border: `1px solid ${todayStatus === 'completed' ? habit.color + '40' : '#2a2a2a'}`,
            }}
            title="Marcar hoy"
          >
            {todayStatus === 'completed' ? <CheckCircle size={13} /> : '○'}
          </button>

          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* Daily goal progress bar */}
      {goalProgress !== null && (
        <div className="mx-4 mb-2 mt-0">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] text-gray-600">Meta diaria</span>
            <span className="text-[9px]" style={{ color: goalProgress >= 1 ? '#a3e635' : habit.color }}>
              {formatDurationHuman(todayTrackedSeconds + (isTracking ? elapsedSeconds : 0))} / {formatDurationHuman(dailyGoalSeconds)}
            </span>
          </div>
          <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${goalProgress * 100}%`,
                backgroundColor: goalProgress >= 1 ? '#a3e635' : habit.color + 'cc',
              }}
            />
          </div>
        </div>
      )}

      {menuOpen && (
        <div
          className="absolute right-4 top-12 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-20 py-1 min-w-[150px]"
          onMouseLeave={() => setMenuOpen(false)}
        >
          <button onClick={() => { isTracking ? onStopTracking() : onStartTracking(); setMenuOpen(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            {isTracking ? <Square size={12} /> : <Play size={12} />}
            {isTracking ? 'Detener tracker' : 'Iniciar tracker'}
          </button>
          <button onClick={() => { onStartPomodoro(); setMenuOpen(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <Timer size={12} /> Iniciar Pomodoro
          </button>
          <button onClick={() => { onEdit(); setMenuOpen(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <Pencil size={12} /> Editar
          </button>
          <button onClick={() => { onArchive(); setMenuOpen(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <Archive size={12} /> Archivar
          </button>
          <div className="h-px bg-white/5 my-1" />
          <button onClick={() => { onDelete(); setMenuOpen(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 transition-colors">
            <Trash2 size={12} /> Eliminar
          </button>
        </div>
      )}

      {expanded && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-4 slide-up">
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Racha actual', value: `${streakCurrent}d`, color: streakCurrent > 0 ? '#f97316' : undefined },
              { label: 'Mejor racha', value: `${streakBest}d`, color: undefined },
              { label: 'Completados', value: completedCount, color: habit.color },
              { label: 'Tasa 30d', value: `${rate}%`, color: rate >= 70 ? '#a3e635' : rate >= 40 ? '#facc15' : '#ef4444' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#1a1a1a] rounded-xl p-2.5">
                <p className="text-[9px] text-gray-600 mb-1">{label}</p>
                <p className="text-sm font-semibold" style={{ color: color ?? '#e5e7eb' }}>{value}</p>
              </div>
            ))}
          </div>

          <YearGrid habit={habit} onToggleDay={onToggleDay} />

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={isTracking ? onStopTracking : onStartTracking}
              className="py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={isTracking
                ? { backgroundColor: habit.color + '20', color: habit.color, border: `1px solid ${habit.color}40` }
                : { backgroundColor: '#1a1a1a', color: '#9ca3af', border: '1px solid #2a2a2a' }
              }
            >
              {isTracking ? <><Square size={12} fill="currentColor" /> Detener</> : <><Play size={12} fill="currentColor" /> Iniciar tracker</>}
            </button>
            <button
              onClick={onStartPomodoro}
              className="py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{ backgroundColor: habit.color + '15', color: habit.color, border: `1px solid ${habit.color}30` }}
            >
              <Timer size={13} />
              Pomodoro
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

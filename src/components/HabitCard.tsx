import { Flame, CheckCircle, Timer, MoreHorizontal, Pencil, Archive, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { getDayKey, calculateStreak, getTodayPomodoroCount, getCompletionRate } from '../utils'
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
}

export default function HabitCard({
  habit, expanded, onClick,
  onToggleToday, onEdit, onArchive, onDelete, onStartPomodoro, onToggleDay,
}: HabitCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const today = getDayKey(new Date())
  const todayStatus = habit.history[today] ?? 'none'
  const { current: streakCurrent, best: streakBest } = calculateStreak(habit.history)
  const pomodorosToday = getTodayPomodoroCount(habit.pomodoroSessions)
  const rate = getCompletionRate(habit)

  const STATUS_CYCLE: DayStatus[] = ['none', 'completed', 'failed', 'break']
  function toggleToday() {
    const idx = STATUS_CYCLE.indexOf(todayStatus)
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
    onToggleToday(habit.id, next)
  }

  const completedCount = Object.values(habit.history).filter(s => s === 'completed').length

  return (
    <div
      className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/10 group"
      style={{ '--habit-color': habit.color } as React.CSSProperties}
    >
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={onClick}>
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: habit.color }} />

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
          {habit.description && (
            <p className="text-xs text-gray-600 truncate mt-0.5">{habit.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {pomodorosToday > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
              <Timer size={10} />
              {pomodorosToday}
            </span>
          )}

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

      {menuOpen && (
        <div
          className="absolute right-4 mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-20 py-1 min-w-[140px]"
          onMouseLeave={() => setMenuOpen(false)}
        >
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

          <button
            onClick={onStartPomodoro}
            className="w-full py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{ backgroundColor: habit.color + '15', color: habit.color, border: `1px solid ${habit.color}30` }}
          >
            <Timer size={13} />
            Pomodoro para este hábito
          </button>
        </div>
      )}
    </div>
  )
}

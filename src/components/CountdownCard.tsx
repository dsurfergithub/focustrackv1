import { useEffect } from 'react'
import { Pencil, Trash2, CheckCircle2, CalendarClock } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getTimeRemaining, getCountdownProgress } from '../utils'
import type { Countdown } from '../types'

interface CountdownCardProps {
  countdown: Countdown
  now: number
  onEdit: () => void
  onDelete: () => void
  onComplete: () => void
}

function pad(n: number) { return String(n).padStart(2, '0') }

export default function CountdownCard({ countdown, now, onEdit, onDelete, onComplete }: CountdownCardProps) {
  const remaining = getTimeRemaining(countdown.targetDate, now)
  const progress = getCountdownProgress(countdown.createdAt, countdown.targetDate, now)
  const reached = remaining.past

  // Urgency colour: red < 1 day, amber < 7 days, else the goal colour.
  const accent = reached
    ? '#a3e635'
    : remaining.days < 1 ? '#ef4444'
    : remaining.days < 7 ? '#facc15'
    : countdown.color

  // Fire the celebration the first time a live card crosses zero.
  useEffect(() => {
    if (reached && !countdown.completedAt) onComplete()
  }, [reached, countdown.completedAt, onComplete])

  const units = [
    { value: remaining.days, label: 'días' },
    { value: remaining.hours, label: 'horas' },
    { value: remaining.minutes, label: 'min' },
    { value: remaining.seconds, label: 'seg' },
  ]

  return (
    <div
      className="bg-[#111] border rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/10 group relative"
      style={{ borderColor: reached ? accent + '40' : 'rgba(255,255,255,0.05)' }}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: accent }} />

      <div className="px-4 py-3.5">
        <div className="flex items-start gap-3">
          <div className="text-2xl leading-none mt-0.5">{countdown.emoji ?? '🎯'}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-white truncate">{countdown.title}</h3>
            <p className="text-[11px] text-gray-600 mt-0.5 flex items-center gap-1">
              <CalendarClock size={11} />
              {format(new Date(countdown.targetDate), "d MMM yyyy · HH:mm", { locale: es })}
            </p>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onEdit} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-all">
              <Pencil size={13} />
            </button>
            <button onClick={onDelete} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {reached ? (
          <div className="mt-3 flex items-center gap-2 text-sm font-medium" style={{ color: accent }}>
            <CheckCircle2 size={16} />
            ¡Conseguido! Hace {remaining.days > 0 ? `${remaining.days}d ` : ''}{pad(remaining.hours)}:{pad(remaining.minutes)}:{pad(remaining.seconds)}
          </div>
        ) : (
          <>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {units.map(u => (
                <div key={u.label} className="bg-[#1a1a1a] rounded-xl py-2 text-center">
                  <div className="text-lg font-semibold font-mono tabular-nums" style={{ color: accent }}>
                    {u.label === 'días' ? u.value : pad(u.value)}
                  </div>
                  <div className="text-[9px] text-gray-600 uppercase tracking-wide">{u.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-3">
              <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${progress * 100}%`, backgroundColor: accent + 'cc' }}
                />
              </div>
              {countdown.note && (
                <p className="text-[11px] text-gray-600 mt-2 truncate">{countdown.note}</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

import { useEffect } from 'react'
import { Pencil, Trash2, RotateCcw, Trophy, Flame } from 'lucide-react'
import { getAbstinenceStats, splitDuration, formatCurrency } from '../utils'
import { ABSTINENCE_MILESTONES } from '../types'
import type { AbstinenceTracker } from '../types'

interface AbstinenceCardProps {
  tracker: AbstinenceTracker
  now: number
  onEdit: () => void
  onDelete: () => void
  onRelapse: () => void
  onMilestone: (days: number) => void
}

function pad(n: number) { return String(n).padStart(2, '0') }

export default function AbstinenceCard({ tracker, now, onEdit, onDelete, onRelapse, onMilestone }: AbstinenceCardProps) {
  const stats = getAbstinenceStats(tracker, now)
  const current = splitDuration(stats.currentMs)
  const best = splitDuration(stats.bestMs)
  const accent = tracker.color

  const nextMilestone = ABSTINENCE_MILESTONES.find(m => m > current.days)
  const milestoneProgress = nextMilestone ? Math.min(current.days / nextMilestone, 1) : 1

  // Celebrate the first time we cross a milestone day.
  useEffect(() => {
    const reached = ABSTINENCE_MILESTONES.find(
      m => current.days >= m && !tracker.celebratedMilestones.includes(m)
    )
    if (reached) onMilestone(reached)
  }, [current.days, tracker.celebratedMilestones, onMilestone])

  return (
    <div
      className="bg-[#111] border rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/10 group relative"
      style={{ borderColor: accent + '30' }}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: accent }} />

      <div className="px-4 py-3.5">
        <div className="flex items-start gap-3">
          <div className="text-2xl leading-none mt-0.5">{tracker.emoji ?? '🚫'}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-white truncate">Sin {tracker.name.toLowerCase()}</h3>
            <p className="text-[11px] text-gray-600 mt-0.5">
              {stats.attempts === 0 ? 'Sin recaídas · ¡a por todas!' : `${stats.attempts} recaída${stats.attempts > 1 ? 's' : ''} registrada${stats.attempts > 1 ? 's' : ''}`}
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

        {/* Live clean streak */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold font-mono tabular-nums" style={{ color: accent }}>
            {current.days}
          </span>
          <span className="text-sm text-gray-500">{current.days === 1 ? 'día' : 'días'}</span>
          <span className="text-sm font-mono tabular-nums text-gray-600 ml-auto">
            {pad(current.hours)}:{pad(current.minutes)}:{pad(current.seconds)}
          </span>
        </div>

        {/* Next milestone progress */}
        {nextMilestone && (
          <div className="mt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[9px] text-gray-600">Próximo hito</span>
              <span className="text-[9px]" style={{ color: accent }}>{current.days}/{nextMilestone} días</span>
            </div>
            <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${milestoneProgress * 100}%`, backgroundColor: accent + 'cc' }}
              />
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="bg-[#1a1a1a] rounded-xl p-2.5">
            <p className="text-[9px] text-gray-600 mb-1 flex items-center gap-1"><Trophy size={9} /> Récord</p>
            <p className="text-sm font-semibold" style={{ color: '#facc15' }}>{best.days}d</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-2.5">
            <p className="text-[9px] text-gray-600 mb-1 flex items-center gap-1"><Flame size={9} /> Hitos</p>
            <p className="text-sm font-semibold text-gray-200">{ABSTINENCE_MILESTONES.filter(m => current.days >= m).length}</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-2.5">
            <p className="text-[9px] text-gray-600 mb-1">Ahorro</p>
            <p className="text-sm font-semibold" style={{ color: stats.moneySaved != null ? '#a3e635' : '#444' }}>
              {stats.moneySaved != null ? formatCurrency(stats.moneySaved) : '—'}
            </p>
          </div>
        </div>

        <button
          onClick={onRelapse}
          className="mt-3 w-full py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-2 text-gray-400 border border-white/8 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all"
        >
          <RotateCcw size={12} /> He recaído · reiniciar contador
        </button>
      </div>
    </div>
  )
}

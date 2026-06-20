import { useEffect } from 'react'
import { X } from 'lucide-react'
import type { Milestone, Habit } from '../types'

interface MilestoneCelebrationProps {
  milestone: Milestone
  habit: Habit
  onClose: () => void
}

export default function MilestoneCelebration({ milestone, habit, onClose }: MilestoneCelebrationProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000)
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', k)
    return () => { clearTimeout(t); window.removeEventListener('keydown', k) }
  }, [onClose])

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div
        className="celebrate-in bg-[#111] border rounded-2xl p-8 max-w-xs w-full mx-4 text-center shadow-2xl pointer-events-auto"
        style={{ borderColor: habit.color + '40' }}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-700 hover:text-gray-400 transition-colors">
          <X size={16} />
        </button>

        <div className="text-5xl mb-4 float">{milestone.emoji ?? '🏆'}</div>

        <div
          className="text-xs font-medium tracking-widest uppercase mb-2"
          style={{ color: habit.color }}
        >
          Logro desbloqueado
        </div>

        <h3 className="text-white font-semibold text-lg mb-1">{milestone.label}</h3>
        <p className="text-gray-600 text-sm mb-4">{habit.name}</p>

        {milestone.reward && (
          <div
            className="rounded-xl px-4 py-2.5 text-sm"
            style={{ backgroundColor: habit.color + '10', color: habit.color }}
          >
            🎁 {milestone.reward}
          </div>
        )}

        <div className="mt-4 h-0.5 bg-[#1a1a1a] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-[5000ms] ease-linear"
            style={{ width: '100%', backgroundColor: habit.color + '60' }}
          />
        </div>
      </div>
    </div>
  )
}

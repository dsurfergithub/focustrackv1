import { Trophy, Gift, Award } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Habit } from '../types'
import { calculateStreak } from '../utils'

interface TrophyCabinetProps {
  habits: Habit[]
}

export default function TrophyCabinet({ habits }: TrophyCabinetProps) {
  const allMilestones = habits
    .flatMap(h => h.milestones.map(m => ({ ...m, habit: h })))
    .sort((a, b) => b.date.localeCompare(a.date))

  const totalMilestones = allMilestones.length

  return (
    <div className="space-y-6 slide-up">
      <div className="flex items-center gap-3">
        <Trophy size={20} className="text-yellow-400" />
        <h2 className="text-base font-medium text-white">Vitrina de logros</h2>
        <span className="ml-auto text-sm text-gray-600">{totalMilestones} en total</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {habits.filter(h => !h.archivedAt).map(h => {
          const { current } = calculateStreak(h.history)
          return (
            <div
              key={h.id}
              className="bg-[#111] border border-white/5 rounded-2xl p-3 hover:border-white/10 transition-colors"
              style={{ borderLeftColor: h.color, borderLeftWidth: '2px' }}
            >
              <p className="text-xs font-medium text-white truncate mb-1">{h.name}</p>
              <p className="text-[10px] text-gray-600">{h.milestones.length} logros</p>
              {current > 0 && (
                <p className="text-[10px] mt-1" style={{ color: h.color }}>🔥 {current}d</p>
              )}
            </div>
          )
        })}
      </div>

      {allMilestones.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <Trophy size={48} className="text-gray-800 float" />
          <div>
            <p className="text-gray-500 text-sm">Sin logros todavía</p>
            <p className="text-gray-700 text-xs mt-1">Configura una meta de días en tus hábitos para empezar</p>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {allMilestones.map(m => (
            <div
              key={`${m.habit.id}-${m.id}`}
              className="relative bg-[#111] border border-white/5 rounded-2xl p-4 overflow-hidden group hover:border-white/10 transition-colors"
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ background: `radial-gradient(ellipse at top left, ${m.habit.color}08, transparent 60%)` }}
              />

              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: m.habit.color + '15' }}
                >
                  {m.emoji ?? '🏆'}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{m.label}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.habit.color }} />
                    <p className="text-xs text-gray-600 truncate">{m.habit.name}</p>
                  </div>
                  <p className="text-[10px] text-gray-700 mt-1">
                    {format(new Date(m.date), "d 'de' MMMM yyyy", { locale: es })}
                  </p>
                </div>

                <Award size={32} className="opacity-5 flex-shrink-0" />
              </div>

              {m.reward && (
                <div className="mt-3 flex items-center gap-2 bg-[#1a1a1a] rounded-xl px-3 py-2">
                  <Gift size={12} className="text-gray-600" />
                  <p className="text-xs text-gray-500">{m.reward}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

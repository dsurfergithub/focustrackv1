import { Plus, Target, Ban } from 'lucide-react'
import CountdownCard from './CountdownCard'
import AbstinenceCard from './AbstinenceCard'
import type { Countdown, AbstinenceTracker, GoalsTab } from '../types'

interface GoalsViewProps {
  tab: GoalsTab
  onTabChange: (t: GoalsTab) => void
  countdowns: Countdown[]
  abstinenceTrackers: AbstinenceTracker[]
  now: number
  onAddCountdown: () => void
  onEditCountdown: (c: Countdown) => void
  onDeleteCountdown: (id: string) => void
  onCompleteCountdown: (id: string) => void
  onAddAbstinence: () => void
  onEditAbstinence: (t: AbstinenceTracker) => void
  onDeleteAbstinence: (id: string) => void
  onRelapse: (id: string) => void
  onMilestone: (id: string, days: number) => void
}

const TABS: { id: GoalsTab; label: string; icon: typeof Target }[] = [
  { id: 'countdown', label: 'Cuenta atrás', icon: Target },
  { id: 'abstinence', label: 'Días sin', icon: Ban },
]

function EmptyState({ icon: Icon, title, subtitle, cta, onClick }: {
  icon: typeof Target; title: string; subtitle: string; cta: string; onClick: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#a3e635]/5 border border-[#a3e635]/10 flex items-center justify-center">
        <Icon size={24} className="text-[#a3e635]/40" />
      </div>
      <div>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <p className="text-gray-700 text-xs mt-1">{subtitle}</p>
      </div>
      <button
        onClick={onClick}
        className="px-4 py-2 rounded-xl text-sm bg-[#a3e635]/10 text-[#a3e635] border border-[#a3e635]/20 hover:bg-[#a3e635]/20 transition-all"
      >
        {cta}
      </button>
    </div>
  )
}

export default function GoalsView(props: GoalsViewProps) {
  const { tab, onTabChange, countdowns, abstinenceTrackers, now } = props

  // Active countdowns nearest-first, then the achieved ones.
  const sortedCountdowns = [...countdowns].sort((a, b) => {
    const at = new Date(a.targetDate).getTime() - now
    const bt = new Date(b.targetDate).getTime() - now
    const aPast = at <= 0, bPast = bt <= 0
    if (aPast !== bPast) return aPast ? 1 : -1
    return aPast ? bt - at : at - bt
  })

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#111] border border-white/5 rounded-xl">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all
              ${tab === id ? 'bg-[#a3e635]/10 text-[#a3e635]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab === 'countdown' && (
        countdowns.length === 0 ? (
          <EmptyState
            icon={Target}
            title="Sin metas todavía"
            subtitle="Añade un objetivo con fecha y observa la cuenta atrás"
            cta="Crear cuenta atrás"
            onClick={props.onAddCountdown}
          />
        ) : (
          <>
            <button
              onClick={props.onAddCountdown}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium bg-[#111] border border-dashed border-white/10 text-gray-500 hover:text-[#a3e635] hover:border-[#a3e635]/30 transition-all"
            >
              <Plus size={14} /> Nueva cuenta atrás
            </button>
            {sortedCountdowns.map(c => (
              <CountdownCard
                key={c.id}
                countdown={c}
                now={now}
                onEdit={() => props.onEditCountdown(c)}
                onDelete={() => props.onDeleteCountdown(c.id)}
                onComplete={() => props.onCompleteCountdown(c.id)}
              />
            ))}
          </>
        )
      )}

      {tab === 'abstinence' && (
        abstinenceTrackers.length === 0 ? (
          <EmptyState
            icon={Ban}
            title="Sin retos todavía"
            subtitle="Cuenta los días libre de un hábito nocivo, ej. sin azúcar"
            cta='Crear "días sin"'
            onClick={props.onAddAbstinence}
          />
        ) : (
          <>
            <button
              onClick={props.onAddAbstinence}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium bg-[#111] border border-dashed border-white/10 text-gray-500 hover:text-[#a3e635] hover:border-[#a3e635]/30 transition-all"
            >
              <Plus size={14} /> Nuevo reto
            </button>
            {abstinenceTrackers.map(t => (
              <AbstinenceCard
                key={t.id}
                tracker={t}
                now={now}
                onEdit={() => props.onEditAbstinence(t)}
                onDelete={() => props.onDeleteAbstinence(t.id)}
                onRelapse={() => props.onRelapse(t.id)}
                onMilestone={days => props.onMilestone(t.id, days)}
              />
            ))}
          </>
        )
      )}
    </div>
  )
}

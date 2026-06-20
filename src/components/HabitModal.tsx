import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { NEON_COLORS } from '../types'
import type { Habit } from '../types'
import { getDayKey } from '../utils'

interface HabitModalProps {
  habit?: Habit | null
  onSave: (data: Partial<Habit>) => void
  onClose: () => void
}

export default function HabitModal({ habit, onSave, onClose }: HabitModalProps) {
  const [name, setName] = useState(habit?.name ?? '')
  const [color, setColor] = useState(habit?.color ?? NEON_COLORS[0])
  const [description, setDescription] = useState(habit?.description ?? '')
  const [target, setTarget] = useState(String(habit?.cumulativeTarget ?? ''))
  const [emoji, setEmoji] = useState(habit?.emojiTemplate ?? '🏆')
  const [reward, setReward] = useState(habit?.rewardTemplate ?? '')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSave({
      id: habit?.id ?? crypto.randomUUID(),
      name: name.trim(),
      color,
      description: description.trim() || undefined,
      cumulativeTarget: target ? Number(target) : undefined,
      emojiTemplate: emoji || undefined,
      rewardTemplate: reward.trim() || undefined,
      createdAt: habit?.createdAt ?? new Date().toISOString(),
      history: habit?.history ?? {},
      milestones: habit?.milestones ?? [],
      pomodoroSessions: habit?.pomodoroSessions ?? [],
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-white/8 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-base font-medium text-white">
            {habit ? 'Editar hábito' : 'Nuevo hábito'}
          </h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Nombre</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Meditación, Running, Lectura..."
              autoFocus
              className="w-full bg-[#1a1a1a] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Color</label>
            <div className="flex gap-2 flex-wrap">
              {NEON_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full transition-all hover:scale-110"
                  style={{
                    backgroundColor: c,
                    outline: color === c ? `2px solid ${c}` : 'none',
                    outlineOffset: '2px',
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Descripción <span className="text-gray-700">(opcional)</span></label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="¿Cuál es el objetivo?"
              className="w-full bg-[#1a1a1a] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs text-gray-500 mb-1.5">Meta de días</label>
              <input
                value={target}
                onChange={e => setTarget(e.target.value)}
                type="number"
                min="1"
                placeholder="30"
                className="w-full bg-[#1a1a1a] border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-xs text-gray-500 mb-1.5">Emoji logro</label>
              <input
                value={emoji}
                onChange={e => setEmoji(e.target.value)}
                placeholder="🏆"
                className="w-full bg-[#1a1a1a] border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-xs text-gray-500 mb-1.5">Recompensa</label>
              <input
                value={reward}
                onChange={e => setReward(e.target.value)}
                placeholder="Premio..."
                className="w-full bg-[#1a1a1a] border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/8 text-sm text-gray-400 hover:text-white hover:border-white/20 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: color + '20', color, border: `1px solid ${color}40` }}
            >
              {habit ? 'Guardar cambios' : 'Crear hábito'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

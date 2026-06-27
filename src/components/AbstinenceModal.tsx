import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { format } from 'date-fns'
import { NEON_COLORS } from '../types'
import type { AbstinenceTracker } from '../types'

interface AbstinenceModalProps {
  tracker?: AbstinenceTracker | null
  onSave: (data: AbstinenceTracker) => void
  onClose: () => void
}

function toLocalInput(iso?: string): string {
  return format(iso ? new Date(iso) : new Date(), "yyyy-MM-dd'T'HH:mm")
}

export default function AbstinenceModal({ tracker, onSave, onClose }: AbstinenceModalProps) {
  const [name, setName] = useState(tracker?.name ?? '')
  const [color, setColor] = useState(tracker?.color ?? NEON_COLORS[3])
  const [emoji, setEmoji] = useState(tracker?.emoji ?? '🚫')
  const [cost, setCost] = useState(String(tracker?.costPerDay ?? ''))
  const [since, setSince] = useState(toLocalInput(tracker?.startedAt))

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const startedAt = new Date(since).toISOString()
    onSave({
      id: tracker?.id ?? crypto.randomUUID(),
      name: name.trim(),
      color,
      emoji: emoji || undefined,
      startedAt,
      createdAt: tracker?.createdAt ?? startedAt,
      relapses: tracker?.relapses ?? [],
      costPerDay: cost ? Number(cost) : undefined,
      celebratedMilestones: tracker?.celebratedMilestones ?? [],
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-white/8 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-base font-medium text-white">
            {tracker ? 'Editar reto' : 'Nuevo "días sin"'}
          </h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Hábito a evitar</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Azúcar, Tabaco, Alcohol..."
              autoFocus
              className="w-full bg-[#1a1a1a] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Sin recaer desde</label>
            <input
              value={since}
              onChange={e => setSince(e.target.value)}
              type="datetime-local"
              className="w-full bg-[#1a1a1a] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/20 transition-colors [color-scheme:dark]"
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

          <div className="grid grid-cols-[80px_1fr] gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Emoji</label>
              <input
                value={emoji}
                onChange={e => setEmoji(e.target.value)}
                placeholder="🚫"
                className="w-full bg-[#1a1a1a] border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white text-center placeholder-gray-700 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Ahorro al día <span className="text-gray-700">€ (opcional)</span></label>
              <input
                value={cost}
                onChange={e => setCost(e.target.value)}
                type="number"
                min="0"
                step="0.5"
                placeholder="5"
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
              {tracker ? 'Guardar cambios' : 'Crear reto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { format } from 'date-fns'
import { NEON_COLORS } from '../types'
import type { Countdown } from '../types'

interface CountdownModalProps {
  countdown?: Countdown | null
  onSave: (data: Countdown) => void
  onClose: () => void
}

/** ISO string -> value for <input type="datetime-local"> in local time. */
function toLocalInput(iso?: string): string {
  const d = iso ? new Date(iso) : new Date(Date.now() + 7 * 86400000)
  return format(d, "yyyy-MM-dd'T'HH:mm")
}

export default function CountdownModal({ countdown, onSave, onClose }: CountdownModalProps) {
  const [title, setTitle] = useState(countdown?.title ?? '')
  const [color, setColor] = useState(countdown?.color ?? NEON_COLORS[1])
  const [emoji, setEmoji] = useState(countdown?.emoji ?? '🎯')
  const [note, setNote] = useState(countdown?.note ?? '')
  const [target, setTarget] = useState(toLocalInput(countdown?.targetDate))

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !target) return
    const targetISO = new Date(target).toISOString()
    onSave({
      id: countdown?.id ?? crypto.randomUUID(),
      title: title.trim(),
      targetDate: targetISO,
      color,
      emoji: emoji || undefined,
      note: note.trim() || undefined,
      createdAt: countdown?.createdAt ?? new Date().toISOString(),
      completedAt: new Date(targetISO).getTime() <= Date.now() ? countdown?.completedAt : undefined,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-white/8 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-base font-medium text-white">
            {countdown ? 'Editar meta' : 'Nueva cuenta atrás'}
          </h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Objetivo</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ej: Maratón, Examen, Viaje..."
              autoFocus
              className="w-full bg-[#1a1a1a] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Fecha y hora objetivo</label>
            <input
              value={target}
              onChange={e => setTarget(e.target.value)}
              type="datetime-local"
              className="w-full bg-[#1a1a1a] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-white/20 transition-colors [color-scheme:dark]"
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
                placeholder="🎯"
                className="w-full bg-[#1a1a1a] border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white text-center placeholder-gray-700 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Nota <span className="text-gray-700">(opcional)</span></label>
              <input
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="¿Por qué importa?"
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
              disabled={!title.trim() || !target}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: color + '20', color, border: `1px solid ${color}40` }}
            >
              {countdown ? 'Guardar cambios' : 'Crear meta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

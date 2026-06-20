import { useState, useEffect } from 'react'
import { X, Clock } from 'lucide-react'
import { formatDuration } from '../utils'
import type { Habit } from '../types'

interface StopSessionModalProps {
  elapsedSeconds: number
  habit: Habit
  onConfirm: (note?: string) => void
  onDiscard: () => void
}

export default function StopSessionModal({ elapsedSeconds, habit, onConfirm, onDiscard }: StopSessionModalProps) {
  const [note, setNote] = useState('')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDiscard()
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onConfirm(note)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [note, onConfirm, onDiscard])

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-white/8 rounded-2xl w-full max-w-sm shadow-2xl celebrate-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: habit.color }} />
            <h2 className="text-sm font-medium text-white">{habit.name}</h2>
          </div>
          <button onClick={onDiscard} className="text-gray-600 hover:text-gray-300 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div className="flex items-center justify-center gap-3 py-4 rounded-xl bg-[#1a1a1a]">
            <Clock size={18} style={{ color: habit.color }} />
            <span
              className="font-mono text-3xl font-bold tracking-tight"
              style={{ color: habit.color }}
            >
              {formatDuration(elapsedSeconds)}
            </span>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">
              ¿En qué trabajaste? <span className="text-gray-700">(opcional)</span>
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Ej: Terminé el capítulo 3, resolví el bug de autenticación..."
              rows={2}
              autoFocus
              className="w-full bg-[#1a1a1a] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-white/20 transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onDiscard}
              className="flex-1 py-2.5 rounded-xl border border-white/8 text-sm text-gray-500 hover:text-white hover:border-white/20 transition-all"
            >
              Descartar
            </button>
            <button
              onClick={() => onConfirm(note)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ backgroundColor: habit.color + '20', color: habit.color, border: `1px solid ${habit.color}40` }}
            >
              Guardar sesión
            </button>
          </div>
          <p className="text-[10px] text-gray-700 text-center">⌘ + Enter para guardar</p>
        </div>
      </div>
    </div>
  )
}

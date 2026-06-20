import { AlertTriangle } from 'lucide-react'

interface ConfirmationModalProps {
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmationModal({
  title, message, confirmLabel = 'Confirmar', danger = false,
  onConfirm, onCancel,
}: ConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-white/8 rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle size={18} className={danger ? 'text-red-400 flex-shrink-0 mt-0.5' : 'text-yellow-400 flex-shrink-0 mt-0.5'} />
          <div>
            <h3 className="text-sm font-medium text-white mb-1">{title}</h3>
            <p className="text-xs text-gray-500">{message}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl text-sm text-gray-400 border border-white/8 hover:text-white hover:border-white/20 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              danger
                ? 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
                : 'bg-[#a3e635]/10 text-[#a3e635] border border-[#a3e635]/30 hover:bg-[#a3e635]/20'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

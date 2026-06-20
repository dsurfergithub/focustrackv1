import { X, Bell, Volume2 } from 'lucide-react'
import type { PomodoroSettings } from '../types'

interface SettingsModalProps {
  settings: PomodoroSettings
  onChange: (s: PomodoroSettings) => void
  onClose: () => void
}

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit: string
  color?: string
  onChange: (v: number) => void
}

function Slider({ label, value, min, max, step = 1, unit, color = '#a3e635', onChange }: SliderProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs text-gray-400">{label}</label>
        <span className="text-xs font-mono" style={{ color }}>{value} {unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-[#a3e635] cursor-pointer"
        style={{ accentColor: color }}
      />
    </div>
  )
}

interface ToggleProps {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
}

function Toggle({ label, description, checked, onChange }: ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs text-gray-300">{label}</p>
        {description && <p className="text-[10px] text-gray-600 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-all flex-shrink-0 ${checked ? 'bg-[#a3e635]' : 'bg-[#2a2a2a]'}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${checked ? 'left-4.5' : 'left-0.5'}`}
          style={{ left: checked ? '18px' : '2px' }} />
      </button>
    </div>
  )
}

export default function SettingsModal({ settings, onChange, onClose }: SettingsModalProps) {
  function set<K extends keyof PomodoroSettings>(key: K, value: PomodoroSettings[K]) {
    onChange({ ...settings, [key]: value })
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-white/8 rounded-2xl w-full max-w-sm shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 sticky top-0 bg-[#111] z-10">
          <h2 className="text-sm font-medium text-white">Configuración</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-300 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-6">
          <div className="space-y-4">
            <h3 className="text-[10px] text-gray-600 uppercase tracking-wider">Tiempos Pomodoro</h3>
            <Slider label="Trabajo" value={settings.workDuration} min={5} max={90} unit="min" onChange={v => set('workDuration', v)} />
            <Slider label="Descanso corto" value={settings.shortBreak} min={1} max={30} unit="min" color="#22d3ee" onChange={v => set('shortBreak', v)} />
            <Slider label="Descanso largo" value={settings.longBreak} min={5} max={60} unit="min" color="#7c3aed" onChange={v => set('longBreak', v)} />
            <Slider label="Sesiones antes del descanso largo" value={settings.sessionsBeforeLong} min={2} max={8} unit="ses" onChange={v => set('sessionsBeforeLong', v)} />
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
              <Bell size={10} /> Sonidos
            </h3>
            <Toggle
              label="Campana al terminar sesión"
              checked={settings.soundBell}
              onChange={v => set('soundBell', v)}
            />
            <Toggle
              label="Sonido en logros"
              checked={settings.soundMilestone}
              onChange={v => set('soundMilestone', v)}
            />
            <Toggle
              label="Tick suave de fondo"
              description="Sonido de reloj mientras el timer corre"
              checked={settings.soundTick}
              onChange={v => set('soundTick', v)}
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] text-gray-600 uppercase tracking-wider">Comportamiento</h3>
            <Toggle
              label="Iniciar descanso automáticamente"
              checked={settings.autoStartBreaks}
              onChange={v => set('autoStartBreaks', v)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

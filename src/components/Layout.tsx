import { LayoutGrid, Timer, BarChart2, Trophy, Settings } from 'lucide-react'
import type { ViewMode } from '../types'

interface LayoutProps {
  view: ViewMode
  onNavigate: (v: ViewMode) => void
  onOpenSettings: () => void
  children: React.ReactNode
  pomodoroRunning?: boolean
}

const NAV = [
  { id: 'overview' as ViewMode, icon: LayoutGrid, label: 'Hábitos' },
  { id: 'pomodoro' as ViewMode, icon: Timer, label: 'Pomodoro' },
  { id: 'stats' as ViewMode, icon: BarChart2, label: 'Estadísticas' },
  { id: 'trophies' as ViewMode, icon: Trophy, label: 'Logros' },
]

export default function Layout({ view, onNavigate, onOpenSettings, children, pomodoroRunning }: LayoutProps) {
  return (
    <div className="flex h-full min-h-screen bg-[#0a0a0a]">

      {/* Desktop: left sidebar */}
      <aside className="hidden md:flex flex-col w-16 border-r border-white/5 items-center py-6 gap-1 fixed left-0 h-full z-10 bg-[#0a0a0a]">
        <div className="mb-6">
          <div className="w-8 h-8 rounded-lg bg-[#a3e635]/10 border border-[#a3e635]/30 flex items-center justify-center">
            <Timer size={16} className="text-[#a3e635]" />
          </div>
        </div>
        {NAV.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            title={label}
            className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group
              ${view === id
                ? 'bg-[#a3e635]/10 text-[#a3e635]'
                : 'text-gray-600 hover:text-gray-300 hover:bg-white/5'
              }`}
          >
            <Icon size={18} />
            {id === 'pomodoro' && pomodoroRunning && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#a3e635] animate-pulse" />
            )}
            <span className="absolute left-full ml-2 px-2 py-1 bg-[#1a1a1a] text-xs text-white rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap border border-white/10 transition-opacity">
              {label}
            </span>
          </button>
        ))}
        <button
          onClick={onOpenSettings}
          title="Configuración"
          className="mt-auto w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-all duration-200 group"
        >
          <Settings size={18} />
          <span className="absolute left-full ml-2 px-2 py-1 bg-[#1a1a1a] text-xs text-white rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap border border-white/10 transition-opacity">
            Configuración
          </span>
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-16 flex flex-col min-h-screen">
        {children}
      </div>

      {/* Mobile: bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 md:hidden flex border-t border-white/5 bg-[#0a0a0a] z-10"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {NAV.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`flex-1 py-3 flex flex-col items-center gap-1 text-xs transition-colors
              ${view === id ? 'text-[#a3e635]' : 'text-gray-600'}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
        <button
          onClick={onOpenSettings}
          className="flex-1 py-3 flex flex-col items-center gap-1 text-xs text-gray-600"
        >
          <Settings size={18} />
          <span>Config</span>
        </button>
      </nav>

    </div>
  )
}

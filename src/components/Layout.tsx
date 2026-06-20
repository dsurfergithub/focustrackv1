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

      {/* Main content — leaves room for right sidebar */}
      <div className="flex-1 mr-14 md:mr-16 flex flex-col min-h-screen">
        {children}
      </div>

      {/* Mobile: right vertical sidebar */}
      <nav
        className="md:hidden fixed right-0 top-0 bottom-0 w-14 flex flex-col border-l border-white/5 bg-[#0a0a0a] z-10 items-center gap-1"
        style={{
          paddingTop: 'calc(max(env(safe-area-inset-top), 44px) + 0.5rem)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.5rem)',
        }}
      >
        {NAV.map(({ id, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200
              ${view === id ? 'bg-[#a3e635]/10 text-[#a3e635]' : 'text-gray-600 active:text-gray-300 active:bg-white/5'}`}
          >
            <Icon size={18} />
            {id === 'pomodoro' && pomodoroRunning && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#a3e635] animate-pulse" />
            )}
          </button>
        ))}
        <button
          onClick={onOpenSettings}
          className="mt-auto w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 active:text-gray-300 active:bg-white/5 transition-all duration-200"
        >
          <Settings size={18} />
        </button>
      </nav>

      {/* Desktop: right sidebar */}
      <aside className="hidden md:flex flex-col w-16 border-l border-white/5 items-center py-6 gap-1 fixed right-0 h-full z-10 bg-[#0a0a0a]">
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
            {/* Tooltip appears to the left */}
            <span className="absolute right-full mr-2 px-2 py-1 bg-[#1a1a1a] text-xs text-white rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap border border-white/10 transition-opacity">
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
          <span className="absolute right-full mr-2 px-2 py-1 bg-[#1a1a1a] text-xs text-white rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap border border-white/10 transition-opacity">
            Configuración
          </span>
        </button>
      </aside>

    </div>
  )
}

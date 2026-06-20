import { useState, useCallback, useEffect } from 'react'
import { Plus, Download, Upload } from 'lucide-react'
import Layout from './components/Layout'
import HabitCard from './components/HabitCard'
import PomodoroTimer from './components/PomodoroTimer'
import StatsPanel from './components/StatsPanel'
import TrophyCabinet from './components/TrophyCabinet'
import HabitModal from './components/HabitModal'
import SettingsModal from './components/SettingsModal'
import MilestoneCelebration from './components/MilestoneCelebration'
import ConfirmationModal from './components/ConfirmationModal'
import StopSessionModal from './components/StopSessionModal'
import { usePomodoro } from './hooks/usePomodoro'
import { useSound } from './hooks/useSound'
import { useTimeTracker } from './hooks/useTimeTracker'
import { getDayKey, autoGenerateMilestones } from './utils'
import type { Habit, ViewMode, DayStatus, PomodoroSession, Milestone, AppData, TimeSession } from './types'
import { DEFAULT_POMODORO_SETTINGS } from './types'

const STORAGE_HABITS = 'focustrack_habits'
const STORAGE_SETTINGS = 'focustrack_settings'

function loadHabits(): Habit[] {
  try {
    const raw: Habit[] = JSON.parse(localStorage.getItem(STORAGE_HABITS) ?? '[]')
    return raw.map(h => ({ timeSessions: [], ...h }))
  } catch { return [] }
}

function loadSettings() {
  try { return { ...DEFAULT_POMODORO_SETTINGS, ...JSON.parse(localStorage.getItem(STORAGE_SETTINGS) ?? '{}') } }
  catch { return DEFAULT_POMODORO_SETTINGS }
}

export default function App() {
  const [view, setView] = useState<ViewMode>('overview')
  const [habits, setHabits] = useState<Habit[]>(loadHabits)
  const [pomodoroSettings, setPomodoroSettings] = useState(loadSettings)
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null)
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null)
  const [showHabitModal, setShowHabitModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [celebration, setCelebration] = useState<{ milestone: Milestone; habit: Habit } | null>(null)
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string; message: string; danger?: boolean; onConfirm: () => void
  } | null>(null)
  const [showStopModal, setShowStopModal] = useState(false)

  const { playBell, playMilestone, startTick, stopTick } = useSound(pomodoroSettings)
  const tracker = useTimeTracker()

  const handleSessionComplete = useCallback((session: PomodoroSession) => {
    setHabits(prev => {
      const next = prev.map(h => {
        if (h.id !== session.habitId) return h
        const updated = { ...h, pomodoroSessions: [...h.pomodoroSessions, session] }
        autoGenerateMilestones(updated)
        const newMilestone = updated.milestones.find(m => !h.milestones.find(old => old.id === m.id))
        if (newMilestone) setTimeout(() => { playMilestone(); setCelebration({ milestone: newMilestone, habit: updated }) }, 500)
        return updated
      })
      localStorage.setItem(STORAGE_HABITS, JSON.stringify(next))
      return next
    })
  }, [playMilestone])

  const pomodoro = usePomodoro({
    settings: pomodoroSettings,
    selectedHabitId,
    onSessionComplete: handleSessionComplete,
    onPlayBell: playBell,
    onStartTick: startTick,
    onStopTick: stopTick,
  })

  useEffect(() => { localStorage.setItem(STORAGE_HABITS, JSON.stringify(habits)) }, [habits])
  useEffect(() => { localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(pomodoroSettings)) }, [pomodoroSettings])

  function saveTimeSession(session: TimeSession) {
    setHabits(prev => prev.map(h =>
      h.id === session.habitId
        ? { ...h, timeSessions: [...(h.timeSessions ?? []), session] }
        : h
    ))
  }

  function handleStopTracking() {
    setShowStopModal(true)
  }

  function handleConfirmStop(note?: string) {
    const session = tracker.finishTracking(note)
    if (session) saveTimeSession(session)
    setShowStopModal(false)
  }

  function handleDiscardStop() {
    tracker.cancelTracking()
    setShowStopModal(false)
  }

  function saveHabit(data: Partial<Habit>) {
    setHabits(prev => {
      const exists = prev.find(h => h.id === data.id)
      if (exists) return prev.map(h => h.id === data.id ? { ...h, ...data } as Habit : h)
      return [...prev, data as Habit]
    })
  }

  function toggleDay(habitId: string, key: string) {
    setHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h
      const current = h.history[key] ?? 'none'
      const cycle: DayStatus[] = ['none', 'completed', 'failed', 'break']
      const next = cycle[(cycle.indexOf(current) + 1) % cycle.length]
      const updated = { ...h, history: { ...h.history, [key]: next } }
      autoGenerateMilestones(updated)
      const newM = updated.milestones.find(m => !h.milestones.find(o => o.id === m.id))
      if (newM) setTimeout(() => { playMilestone(); setCelebration({ milestone: newM, habit: updated }) }, 300)
      return updated
    }))
  }

  function toggleToday(habitId: string, status: DayStatus) {
    const today = getDayKey(new Date())
    setHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h
      const updated = { ...h, history: { ...h.history, [today]: status } }
      autoGenerateMilestones(updated)
      const newM = updated.milestones.find(m => !h.milestones.find(o => o.id === m.id))
      if (newM) setTimeout(() => { playMilestone(); setCelebration({ milestone: newM, habit: updated }) }, 300)
      return updated
    }))
  }

  function archiveHabit(id: string) {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, archivedAt: new Date().toISOString() } : h))
  }

  function deleteHabit(id: string) {
    setConfirmConfig({
      title: 'Eliminar hábito',
      message: 'Se eliminará el hábito y todo su historial. Esta acción no se puede deshacer.',
      danger: true,
      onConfirm: () => { setHabits(prev => prev.filter(h => h.id !== id)); setConfirmConfig(null) },
    })
  }

  function startPomodoroForHabit(habitId: string) {
    setSelectedHabitId(habitId)
    setView('pomodoro')
  }

  function exportData() {
    const data: AppData = { habits, pomodoroSettings, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `focustrack-${getDayKey(new Date())}.json`; a.click()
    URL.revokeObjectURL(url)
  }

  function importData() {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = '.json'
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = ev => {
        try {
          const data = JSON.parse(ev.target?.result as string) as AppData
          if (data.habits) setHabits(data.habits)
          if (data.pomodoroSettings) setPomodoroSettings(data.pomodoroSettings)
        } catch { alert('Archivo inválido') }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const activeHabits = habits.filter(h => !h.archivedAt)
  const today = getDayKey(new Date())

  const PAGE_TITLE: Record<ViewMode, string> = {
    overview: 'Mis hábitos',
    pomodoro: 'Pomodoro',
    individual: 'Detalle',
    stats: 'Estadísticas',
    trophies: 'Logros',
  }

  return (
    <Layout view={view} onNavigate={setView} onOpenSettings={() => setShowSettings(true)} pomodoroRunning={pomodoro.isRunning}>
      <header className="flex items-center justify-between px-6 pb-4 border-b border-white/5 sticky top-0 bg-[#0a0a0a] z-10 safe-header-pt">
        <div>
          <h1 className="text-base font-semibold text-white">{PAGE_TITLE[view]}</h1>
          {view === 'overview' && (
            <p className="text-xs text-gray-600 mt-0.5">
              {activeHabits.filter(h => h.history[today] === 'completed').length}/{activeHabits.length} completados hoy
            </p>
          )}
        </div>
        {view === 'overview' && (
          <div className="flex items-center gap-2">
            <button onClick={importData} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-all" title="Importar">
              <Upload size={15} />
            </button>
            <button onClick={exportData} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-all" title="Exportar">
              <Download size={15} />
            </button>
            <button
              onClick={() => { setEditingHabit(null); setShowHabitModal(true) }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#a3e635]/10 text-[#a3e635] border border-[#a3e635]/20 hover:bg-[#a3e635]/20 transition-all"
            >
              <Plus size={14} /> Nuevo
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-4 md:pb-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 5rem)' }}>
        {view === 'overview' && (
          <div className="space-y-2 max-w-2xl mx-auto">
            {activeHabits.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#a3e635]/5 border border-[#a3e635]/10 flex items-center justify-center">
                  <Plus size={24} className="text-[#a3e635]/40" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-medium">Sin hábitos todavía</p>
                  <p className="text-gray-700 text-xs mt-1">Crea tu primer hábito para empezar a trackear</p>
                </div>
                <button
                  onClick={() => { setEditingHabit(null); setShowHabitModal(true) }}
                  className="px-4 py-2 rounded-xl text-sm bg-[#a3e635]/10 text-[#a3e635] border border-[#a3e635]/20 hover:bg-[#a3e635]/20 transition-all"
                >
                  Crear primer hábito
                </button>
              </div>
            ) : (
              <div className="relative space-y-2">
                {activeHabits.map(habit => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    expanded={expandedHabitId === habit.id}
                    onClick={() => setExpandedHabitId(expandedHabitId === habit.id ? null : habit.id)}
                    onToggleToday={toggleToday}
                    onEdit={() => { setEditingHabit(habit); setShowHabitModal(true) }}
                    onArchive={() => archiveHabit(habit.id)}
                    onDelete={() => deleteHabit(habit.id)}
                    onStartPomodoro={() => startPomodoroForHabit(habit.id)}
                    onToggleDay={key => toggleDay(habit.id, key)}
                    isTracking={tracker.activeTracker?.habitId === habit.id}
                    elapsedSeconds={tracker.activeTracker?.habitId === habit.id ? tracker.elapsedSeconds : 0}
                    onStartTracking={() => tracker.startTracking(habit.id)}
                    onStopTracking={handleStopTracking}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'pomodoro' && (
          <div className="max-w-md mx-auto">
            <PomodoroTimer
              phase={pomodoro.phase}
              secondsLeft={pomodoro.secondsLeft}
              isRunning={pomodoro.isRunning}
              sessionCount={pomodoro.sessionCount}
              progress={pomodoro.progress}
              selectedHabitId={selectedHabitId}
              habits={activeHabits}
              sessionsBeforeLong={pomodoroSettings.sessionsBeforeLong}
              onStart={pomodoro.start}
              onPause={pomodoro.pause}
              onReset={pomodoro.reset}
              onSkip={pomodoro.skip}
              onSelectHabit={setSelectedHabitId}
            />
          </div>
        )}

        {view === 'stats' && (
          <div className="max-w-3xl mx-auto">
            <StatsPanel habits={habits} />
          </div>
        )}

        {view === 'trophies' && (
          <div className="max-w-3xl mx-auto">
            <TrophyCabinet habits={habits} />
          </div>
        )}
      </main>

      {showHabitModal && (
        <HabitModal habit={editingHabit} onSave={saveHabit} onClose={() => { setShowHabitModal(false); setEditingHabit(null) }} />
      )}
      {showSettings && (
        <SettingsModal settings={pomodoroSettings} onChange={setPomodoroSettings} onClose={() => setShowSettings(false)} />
      )}
      {celebration && (
        <MilestoneCelebration milestone={celebration.milestone} habit={celebration.habit} onClose={() => setCelebration(null)} />
      )}
      {showStopModal && tracker.activeTracker && (() => {
        const habit = habits.find(h => h.id === tracker.activeTracker!.habitId)
        return habit ? (
          <StopSessionModal
            elapsedSeconds={tracker.elapsedSeconds}
            habit={habit}
            onConfirm={handleConfirmStop}
            onDiscard={handleDiscardStop}
          />
        ) : null
      })()}
      {confirmConfig && (
        <ConfirmationModal
          title={confirmConfig.title}
          message={confirmConfig.message}
          danger={confirmConfig.danger}
          confirmLabel="Eliminar"
          onConfirm={confirmConfig.onConfirm}
          onCancel={() => setConfirmConfig(null)}
        />
      )}
    </Layout>
  )
}

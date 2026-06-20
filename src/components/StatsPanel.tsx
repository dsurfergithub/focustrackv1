import { getWeeklyStats, getMonthlyPomodoros, calculateStreak, getCompletionRate } from '../utils'
import type { Habit } from '../types'

interface StatsPanelProps {
  habits: Habit[]
}

export default function StatsPanel({ habits }: StatsPanelProps) {
  const activeHabits = habits.filter(h => !h.archivedAt)
  const weeklyData = getWeeklyStats(activeHabits)
  const allSessions = activeHabits.flatMap(h => h.pomodoroSessions)
  const monthlyPomodoros = getMonthlyPomodoros(allSessions)

  const maxWeekly = Math.max(...weeklyData.map(d => d.completed), 1)
  const maxMonthly = Math.max(...monthlyPomodoros.map(d => d.count), 1)

  const totalCompletedToday = weeklyData[weeklyData.length - 1]?.completed ?? 0
  const totalPomodoros = allSessions.filter(s => s.phase === 'work' && s.completed).length
  const totalCompletions = activeHabits.reduce((acc, h) => acc + Object.values(h.history).filter(s => s === 'completed').length, 0)
  const avgRate = activeHabits.length > 0
    ? Math.round(activeHabits.reduce((acc, h) => acc + getCompletionRate(h), 0) / activeHabits.length)
    : 0

  return (
    <div className="space-y-6 slide-up">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Hábitos activos', value: activeHabits.length, accent: '#a3e635' },
          { label: 'Completados hoy', value: totalCompletedToday, accent: '#22d3ee' },
          { label: 'Pomodoros totales', value: totalPomodoros, accent: '#7c3aed' },
          { label: 'Tasa media 30d', value: `${avgRate}%`, accent: avgRate >= 70 ? '#a3e635' : avgRate >= 40 ? '#facc15' : '#ef4444' },
        ].map(({ label, value, accent }) => (
          <div key={label} className="bg-[#111] border border-white/5 rounded-2xl p-4">
            <p className="text-xs text-gray-600 mb-1">{label}</p>
            <p className="text-3xl font-bold" style={{ color: accent }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-[#111] border border-white/5 rounded-2xl p-4">
          <h3 className="text-xs text-gray-500 mb-4 uppercase tracking-wider">Hábitos completados · últimos 7 días</h3>
          <div className="flex items-end gap-2 h-32">
            {weeklyData.map(({ day, completed }) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-600">{completed > 0 ? completed : ''}</span>
                <div className="w-full rounded-t-sm transition-all" style={{
                  height: `${(completed / maxWeekly) * 100}%`,
                  minHeight: completed > 0 ? '4px' : '2px',
                  backgroundColor: completed > 0 ? '#a3e635cc' : '#1a1a1a',
                }} />
                <span className="text-[10px] text-gray-600">{day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111] border border-white/5 rounded-2xl p-4">
          <h3 className="text-xs text-gray-500 mb-4 uppercase tracking-wider">Pomodoros · últimas 4 semanas</h3>
          <div className="flex items-end gap-2 h-32">
            {monthlyPomodoros.map(({ week, count }) => (
              <div key={week} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-600">{count > 0 ? count : ''}</span>
                <div className="w-full rounded-t-sm transition-all" style={{
                  height: `${(count / maxMonthly) * 100}%`,
                  minHeight: count > 0 ? '4px' : '2px',
                  backgroundColor: count > 0 ? '#7c3aedcc' : '#1a1a1a',
                }} />
                <span className="text-[10px] text-gray-600">{week}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-2xl p-4">
        <h3 className="text-xs text-gray-500 mb-4 uppercase tracking-wider">Ranking de hábitos · tasa de cumplimiento</h3>
        <div className="space-y-3">
          {activeHabits
            .map(h => ({ h, rate: getCompletionRate(h), ...calculateStreak(h.history) }))
            .sort((a, b) => b.rate - a.rate)
            .map(({ h, rate, current }) => (
              <div key={h.id} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: h.color }} />
                <span className="text-sm text-gray-300 flex-1 truncate">{h.name}</span>
                <span className="text-xs text-gray-600 w-8 text-right">{current}d</span>
                <div className="w-32 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${rate}%`, backgroundColor: h.color + 'cc' }}
                  />
                </div>
                <span className="text-xs font-medium w-10 text-right" style={{
                  color: rate >= 70 ? '#a3e635' : rate >= 40 ? '#facc15' : '#ef4444'
                }}>
                  {rate}%
                </span>
              </div>
            ))}
          {activeHabits.length === 0 && (
            <p className="text-sm text-gray-600 text-center py-4">Sin hábitos activos todavía</p>
          )}
        </div>
      </div>
    </div>
  )
}

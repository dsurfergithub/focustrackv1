import { format } from 'date-fns'
import { Download } from 'lucide-react'
import html2canvas from 'html2canvas'
import { getMonthDayMatrix, getDayKey } from '../utils'
import { MONTHS_ES } from '../types'
import type { Habit, DayStatus, Milestone } from '../types'

interface YearGridProps {
  habit: Habit
  year?: number
  mini?: boolean
  onToggleDay?: (key: string) => void
}


export default function YearGrid({ habit, year, mini = false, onToggleDay }: YearGridProps) {
  const y = year ?? new Date().getFullYear()
  const matrix = getMonthDayMatrix(y)
  const today = getDayKey(new Date())

  const getMilestoneForDate = (key: string): Milestone | undefined =>
    habit.milestones.find(m => m.date === key)

  const getCellStatus = (date: Date | null): DayStatus => {
    if (!date) return 'none'
    const key = getDayKey(date)
    const created = habit.createdAt.substring(0, 10)
    if (key < created) return 'none'
    return habit.history[key] ?? 'none'
  }

  function cellStyle(date: Date | null): string {
    const status = getCellStatus(date)
    if (!date) return 'bg-transparent'
    const key = getDayKey(date)
    const isToday = key === today
    const isFuture = key > today
    if (isFuture) return 'bg-[#1a1a1a] opacity-30 cursor-default'

    const base = 'transition-all duration-150'
    const ring = isToday ? 'ring-1 ring-white/40' : ''

    switch (status) {
      case 'completed':
        return `${base} ${ring} cursor-pointer`
      case 'failed':
        return `${base} ${ring} bg-red-900/60 cursor-pointer`
      case 'break':
        return `${base} ${ring} border border-dashed border-yellow-500/50 cursor-pointer`
      default:
        return `${base} ${ring} bg-[#1a1a1a] hover:bg-[#252525] cursor-pointer`
    }
  }

  function cellInlineStyle(date: Date | null): React.CSSProperties {
    const status = getCellStatus(date)
    if (status === 'completed' && date) {
      return { backgroundColor: habit.color + 'cc' }
    }
    return {}
  }

  const cellSize = mini ? 'w-2.5 h-2.5 rounded-[2px]' : 'w-3.5 h-3.5 rounded-sm'

  async function handleExport() {
    const el = document.getElementById(`grid-${habit.id}`)
    if (!el) return
    const canvas = await html2canvas(el, { backgroundColor: '#111' })
    const link = document.createElement('a')
    link.download = `${habit.name}-${y}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div id={`grid-${habit.id}`} className="select-none">
      {!mini && (
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-500">
            Vista anual {y} · 12 × 31
          </span>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <Download size={12} />
            Exportar
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="min-w-max">
          {!mini && (
            <div className="flex mb-1 ml-0">
              <div className="w-4 mr-1" />
              {MONTHS_ES.map(m => (
                <div key={m} className="text-[9px] text-gray-600 w-4 mr-0.5 text-center leading-none">
                  {m}
                </div>
              ))}
            </div>
          )}

          {matrix.map((row, rowIdx) => (
            <div key={rowIdx} className="flex items-center mb-0.5">
              {!mini && (
                <span className="text-[8px] text-gray-700 w-4 mr-1 text-right leading-none">
                  {rowIdx + 1}
                </span>
              )}
              {row.map((date, colIdx) => {
                const key = date ? getDayKey(date) : null
                const milestone = key ? getMilestoneForDate(key) : undefined
                return (
                  <div
                    key={colIdx}
                    title={date ? `${format(date, 'dd MMM yyyy')} · ${getCellStatus(date)}` : ''}
                    onClick={() => {
                      if (!date || !key || !onToggleDay) return
                      if (key > today) return
                      onToggleDay(key)
                    }}
                    className={`${cellSize} mr-0.5 flex items-center justify-center relative ${cellStyle(date)}`}
                    style={cellInlineStyle(date)}
                  >
                    {milestone && !mini && (
                      <span className="absolute -top-0.5 -right-0.5 text-[8px] leading-none z-10">
                        {milestone.emoji}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {!mini && (
        <div className="flex items-center gap-4 mt-3 text-[10px] text-gray-600">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: habit.color + 'cc' }} />
            Completado
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-red-900/60" />
            Fallado
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-[2px] border border-dashed border-yellow-500/50" />
            Descanso
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#1a1a1a]" />
            Sin registro
          </span>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect, useRef, useCallback } from 'react'
import type { ActiveTracker, TimeSession } from '../types'
import { getDayKey } from '../utils'

const STORAGE_KEY = 'focustrack_active_tracker'

function loadActive(): ActiveTracker | null {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') } catch { return null }
}

interface UseTimeTrackerReturn {
  activeTracker: ActiveTracker | null
  elapsedSeconds: number
  startTracking: (habitId: string) => void
  finishTracking: (note?: string) => TimeSession | null
  cancelTracking: () => void
}

export function useTimeTracker(): UseTimeTrackerReturn {
  const [activeTracker, setActiveTracker] = useState<ActiveTracker | null>(loadActive)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Recalculate elapsed on every tick using real wall-clock time
  // This is the key trick for iOS background: we never count ticks,
  // we always diff Date.now() against the stored startedAt
  useEffect(() => {
    if (!activeTracker) {
      setElapsedSeconds(0)
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    const tick = () => {
      const started = new Date(activeTracker.startedAt).getTime()
      setElapsedSeconds(Math.floor((Date.now() - started) / 1000))
    }

    tick()
    intervalRef.current = setInterval(tick, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [activeTracker])

  const startTracking = useCallback((habitId: string) => {
    const tracker: ActiveTracker = { habitId, startedAt: new Date().toISOString() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tracker))
    setActiveTracker(tracker)
  }, [])

  const finishTracking = useCallback((note?: string): TimeSession | null => {
    if (!activeTracker) return null
    const stoppedAt = new Date().toISOString()
    const duration = Math.floor(
      (new Date(stoppedAt).getTime() - new Date(activeTracker.startedAt).getTime()) / 1000
    )
    const session: TimeSession = {
      id: crypto.randomUUID(),
      habitId: activeTracker.habitId,
      date: getDayKey(new Date()),
      startedAt: activeTracker.startedAt,
      stoppedAt,
      duration,
      note: note?.trim() || undefined,
    }
    localStorage.removeItem(STORAGE_KEY)
    setActiveTracker(null)
    return session
  }, [activeTracker])

  const cancelTracking = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setActiveTracker(null)
  }, [])

  return { activeTracker, elapsedSeconds, startTracking, finishTracking, cancelTracking }
}

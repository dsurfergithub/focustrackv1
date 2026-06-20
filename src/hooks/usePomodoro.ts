import { useState, useEffect, useRef, useCallback } from 'react'
import type { PomodoroPhase, PomodoroSettings, PomodoroSession } from '../types'
import { getDayKey } from '../utils'

interface UsePomodoroOptions {
  settings: PomodoroSettings
  selectedHabitId: string | null
  onSessionComplete: (session: PomodoroSession) => void
  onPlayBell: () => void
  onStartTick: () => void
  onStopTick: () => void
}

export function usePomodoro({
  settings,
  selectedHabitId,
  onSessionComplete,
  onPlayBell,
  onStartTick,
  onStopTick,
}: UsePomodoroOptions) {
  const [phase, setPhase] = useState<PomodoroPhase>('idle')
  const [secondsLeft, setSecondsLeft] = useState(settings.workDuration * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionCount, setSessionCount] = useState(0)
  const sessionStartRef = useRef<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const phaseDuration = useCallback((p: PomodoroPhase) => {
    if (p === 'work') return settings.workDuration * 60
    if (p === 'short_break') return settings.shortBreak * 60
    if (p === 'long_break') return settings.longBreak * 60
    return settings.workDuration * 60
  }, [settings])

  useEffect(() => {
    if (phase === 'idle') {
      setSecondsLeft(settings.workDuration * 60)
    }
  }, [settings.workDuration, phase])

  useEffect(() => {
    if (isRunning) {
      onStartTick()
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!)
            onStopTick()
            handlePhaseEnd()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        onStopTick()
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning])

  function handlePhaseEnd() {
    onPlayBell()
    if (phase === 'work') {
      const completed: PomodoroSession = {
        id: crypto.randomUUID(),
        habitId: selectedHabitId,
        date: getDayKey(new Date()),
        startedAt: sessionStartRef.current!,
        completedAt: new Date().toISOString(),
        duration: settings.workDuration,
        phase: 'work',
        completed: true,
      }
      const newCount = sessionCount + 1
      setSessionCount(newCount)
      onSessionComplete(completed)
      const isLongBreak = newCount % settings.sessionsBeforeLong === 0
      const nextPhase = isLongBreak ? 'long_break' : 'short_break'
      setPhase(nextPhase)
      setSecondsLeft(phaseDuration(nextPhase))
      if (settings.autoStartBreaks) {
        sessionStartRef.current = new Date().toISOString()
        setIsRunning(true)
      } else {
        setIsRunning(false)
      }
    } else {
      setPhase('idle')
      setSecondsLeft(settings.workDuration * 60)
      setIsRunning(false)
    }
  }

  function start() {
    if (phase === 'idle') {
      setPhase('work')
      setSecondsLeft(settings.workDuration * 60)
    }
    sessionStartRef.current = new Date().toISOString()
    setIsRunning(true)
  }

  function pause() {
    setIsRunning(false)
  }

  function reset() {
    setIsRunning(false)
    setPhase('idle')
    setSecondsLeft(settings.workDuration * 60)
    sessionStartRef.current = null
    onStopTick()
  }

  function skip() {
    setIsRunning(false)
    onStopTick()
    if (phase === 'work') {
      const isLongBreak = (sessionCount + 1) % settings.sessionsBeforeLong === 0
      const next: PomodoroPhase = isLongBreak ? 'long_break' : 'short_break'
      setPhase(next)
      setSecondsLeft(phaseDuration(next))
    } else {
      setPhase('idle')
      setSecondsLeft(settings.workDuration * 60)
    }
  }

  const totalSeconds = phase === 'idle' ? settings.workDuration * 60 : phaseDuration(phase)
  const progress = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0

  return { phase, secondsLeft, isRunning, sessionCount, progress, start, pause, reset, skip }
}

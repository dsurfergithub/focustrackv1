import { useCallback, useRef } from 'react'
import type { PomodoroSettings } from '../types'

export function useSound(settings: PomodoroSettings) {
  const ctxRef = useRef<AudioContext | null>(null)

  function getCtx(): AudioContext {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext()
    }
    return ctxRef.current
  }

  const playBell = useCallback(() => {
    if (!settings.soundBell) return
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 1.5)
    gain.gain.setValueAtTime(0.4, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2)
    osc.type = 'sine'
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 2)
  }, [settings.soundBell])

  const playMilestone = useCallback(() => {
    if (!settings.soundMilestone) return
    const ctx = getCtx()
    const notes = [523, 659, 784, 1047]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12)
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.12)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4)
      osc.type = 'sine'
      osc.start(ctx.currentTime + i * 0.12)
      osc.stop(ctx.currentTime + i * 0.12 + 0.4)
    })
  }, [settings.soundMilestone])

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startTick = useCallback(() => {
    if (!settings.soundTick) return
    if (tickRef.current) return
    tickRef.current = setInterval(() => {
      const ctx = getCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(1200, ctx.currentTime)
      gain.gain.setValueAtTime(0.05, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
      osc.type = 'square'
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.05)
    }, 1000)
  }, [settings.soundTick])

  const stopTick = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current)
      tickRef.current = null
    }
  }, [])

  return { playBell, playMilestone, startTick, stopTick }
}

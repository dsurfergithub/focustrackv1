import { useState, useEffect } from 'react'

/**
 * Returns the current epoch time (ms), refreshed on an interval.
 * Used by countdowns and abstinence counters so they tick live without
 * each card owning its own timer. Defaults to a 1s cadence.
 */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return now
}

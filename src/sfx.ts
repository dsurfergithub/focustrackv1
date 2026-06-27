// Futuristic, gamified UI sound effects built on the Web Audio API.
// Exposed as a module-level singleton so any component can trigger a sound
// without threading callbacks through the tree. The AudioContext is created
// lazily on the first user gesture (respecting browser autoplay policies).

let ctx: AudioContext | null = null
let masterGain: GainNode | null = null
let enabled = true

function getCtx(): AudioContext {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new AC()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function master(): AudioNode {
  const c = getCtx()
  if (!masterGain) {
    masterGain = c.createGain()
    masterGain.gain.value = 0.55
    masterGain.connect(c.destination)
  }
  return masterGain
}

export function setSfxEnabled(v: boolean) { enabled = v }

interface BlipOpts {
  freq: number
  freq2?: number
  type?: OscillatorType
  dur: number
  gain?: number
  attack?: number
  delay?: number
  detune?: number
}

function blip({ freq, freq2, type = 'sine', dur, gain = 0.1, attack = 0.005, delay = 0, detune = 0 }: BlipOpts) {
  const c = getCtx()
  const t0 = c.currentTime + delay
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (freq2) osc.frequency.exponentialRampToValueAtTime(freq2, t0 + dur)
  if (detune) osc.detune.setValueAtTime(detune, t0)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(g)
  g.connect(master())
  osc.start(t0)
  osc.stop(t0 + dur + 0.02)
}

export const sfx = {
  /** Crisp blip for any button press. */
  tap() {
    if (!enabled) return
    blip({ freq: 880, freq2: 1320, type: 'triangle', dur: 0.055, gain: 0.045 })
  },

  /** Soft sci-fi sweep for navigation / view changes. */
  nav() {
    if (!enabled) return
    blip({ freq: 480, freq2: 1040, type: 'sine', dur: 0.13, gain: 0.06 })
  },

  /** Bright arpeggio when something is saved/created. */
  success() {
    if (!enabled) return
    ;[660, 880, 1320].forEach((f, i) =>
      blip({ freq: f, type: 'triangle', dur: 0.13, gain: 0.07, delay: i * 0.055 }))
  },

  /** Triumphant power-up when a habit/day is completed. */
  complete() {
    if (!enabled) return
    // rising energy sweep (layered + detuned for richness)
    blip({ freq: 200, freq2: 760, type: 'sawtooth', dur: 0.2, gain: 0.06 })
    blip({ freq: 200, freq2: 760, type: 'sawtooth', dur: 0.2, gain: 0.04, detune: 8 })
    // sparkle on top
    ;[880, 1174, 1568].forEach((f, i) =>
      blip({ freq: f, type: 'sine', dur: 0.2, gain: 0.08, delay: 0.1 + i * 0.07 }))
  },

  /** Descending buzz for a reset / relapse / something negative. */
  error() {
    if (!enabled) return
    blip({ freq: 320, freq2: 130, type: 'sawtooth', dur: 0.28, gain: 0.08 })
    blip({ freq: 160, freq2: 90, type: 'square', dur: 0.28, gain: 0.04, delay: 0.03 })
  },
}

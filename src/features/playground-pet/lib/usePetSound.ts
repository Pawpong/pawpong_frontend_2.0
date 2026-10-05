'use client'

import { useEffect, useRef, useState } from 'react'

/** Local square-wave feedback, muted until a deliberate user gesture. No audio assets or autoplay. */
export function usePetSound() {
  const context = useRef<AudioContext | null>(null)
  const [enabled, setEnabled] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  useEffect(() => {
    const visibility = () => {
      if (document.hidden) void context.current?.suspend()
    }
    document.addEventListener('visibilitychange', visibility)
    return () => {
      document.removeEventListener('visibilitychange', visibility)
      void context.current?.close()
      context.current = null
    }
  }, [])
  useEffect(() => {
    const wake = () => {
      if (enabled && !document.hidden && context.current?.state === 'suspended') {
        void context.current.resume().catch(() => {
          setEnabled(false)
        })
      }
    }
    document.addEventListener('pointerdown', wake)
    document.addEventListener('keydown', wake)
    return () => {
      document.removeEventListener('pointerdown', wake)
      document.removeEventListener('keydown', wake)
    }
  }, [enabled])
  async function toggle() {
    if (enabled) {
      setEnabled(false)
      await context.current?.suspend()
      return
    }
    try {
      context.current ??= new AudioContext()
      await context.current.resume()
      setEnabled(true)
    } catch {
      setUnavailable(true)
      setEnabled(false)
    }
  }
  function play(reward = false) {
    const audio = context.current
    if (!enabled || !audio || audio.state !== 'running' || document.hidden) return
    const at = audio.currentTime
    const frequencies = reward ? [523.25, 659.25, 783.99] : [392, 523.25]
    frequencies.forEach((frequency, index) => {
      const oscillator = audio.createOscillator()
      const gain = audio.createGain()
      oscillator.type = 'square'
      oscillator.frequency.value = frequency
      const start = at + index * 0.07
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.025, start + 0.006)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.09)
      oscillator.connect(gain).connect(audio.destination)
      oscillator.start(start)
      oscillator.stop(start + 0.1)
      oscillator.onended = () => {
        oscillator.disconnect()
        gain.disconnect()
      }
    })
  }
  return { enabled, unavailable, toggle, play }
}

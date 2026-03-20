import { useEffect, useRef, useState } from 'react'

class VITAMetronome {
  constructor({ bpm, vibrate, beep, onBeat }) {
    this.bpm = bpm
    this.vibrate = vibrate
    this.beep = beep
    this.onBeat = onBeat
    this.count = 0
    this.startedAt = null
    this.intervalId = null
    this.audioCtx = null
  }

  initAudio() {
    if (typeof window === 'undefined' || this.audioCtx) {
      return
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext

    if (!AudioContextClass) {
      return
    }

    // CRITICAL: iOS Safari requires AudioContext to be created
    // inside a direct user gesture. Never move this call.
    this.audioCtx = new AudioContextClass()
  }

  start() {
    if (this.intervalId || typeof window === 'undefined') {
      return
    }

    this.startedAt = Date.now()

    const tick = () => {
      this.count += 1

      const elapsedSeconds = Math.floor((Date.now() - this.startedAt) / 1000)
      const flashIntensity = 1 + Math.min(Math.floor(elapsedSeconds / 120) * 0.1, 0.3)

      if (this.vibrate && navigator?.vibrate) {
        navigator.vibrate(30)
      }

      if (this.beep) {
        this.playBeep()
      }

      this.onBeat?.(this.count, flashIntensity)
    }

    tick()
    this.intervalId = window.setInterval(tick, (60 / this.bpm) * 1000)
  }

  stop() {
    if (typeof window === 'undefined') {
      return
    }

    if (this.intervalId) {
      window.clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  playBeep() {
    if (!this.audioCtx) {
      return
    }

    try {
      const oscillator = this.audioCtx.createOscillator()
      const gain = this.audioCtx.createGain()

      oscillator.frequency.value = 880
      gain.gain.value = 0.08

      oscillator.connect(gain)
      gain.connect(this.audioCtx.destination)

      oscillator.start()
      oscillator.stop(this.audioCtx.currentTime + 0.05)
    } catch (_error) {
      // Silent fail by contract.
    }
  }

  close() {
    this.stop()

    if (!this.audioCtx) {
      return
    }

    try {
      const closePromise = this.audioCtx.close()

      if (closePromise?.catch) {
        closePromise.catch(() => {})
      }
    } catch (_error) {
      // Silent fail by contract.
    }

    this.audioCtx = null
  }
}

export default function useMetronome({ bpm, vibrate, beep, onBeat }) {
  const [count, setCount] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [flashIntensity, setFlashIntensity] = useState(1)
  const metronomeRef = useRef(null)

  if (!metronomeRef.current) {
    metronomeRef.current = new VITAMetronome({
      bpm,
      vibrate,
      beep,
      onBeat: (nextCount, nextFlashIntensity) => {
        setCount(nextCount)
        setFlashIntensity(nextFlashIntensity)
        onBeat?.(nextCount, nextFlashIntensity)
      },
    })
  }

  useEffect(() => {
    metronomeRef.current.bpm = bpm
    metronomeRef.current.vibrate = vibrate
    metronomeRef.current.beep = beep
    metronomeRef.current.onBeat = (nextCount, nextFlashIntensity) => {
      setCount(nextCount)
      setFlashIntensity(nextFlashIntensity)
      onBeat?.(nextCount, nextFlashIntensity)
    }
  }, [bpm, vibrate, beep, onBeat])

  useEffect(() => {
    return () => {
      metronomeRef.current?.close()
    }
  }, [])

  const start = () => {
    if (beep) {
      metronomeRef.current?.initAudio()
    }

    metronomeRef.current?.start()
    setIsRunning(true)
  }

  const stop = () => {
    metronomeRef.current?.stop()
    setIsRunning(false)
  }

  return {
    count,
    isRunning,
    flashIntensity,
    start,
    stop,
  }
}

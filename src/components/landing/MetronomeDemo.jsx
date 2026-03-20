import Link from 'next/link'
import { useEffect, useState } from 'react'

import { PRIMARY_BUTTON_CLASS, SECONDARY_BUTTON_CLASS } from '@/constants/design'
import useMetronome from '@/hooks/useMetronome'

export default function MetronomeDemo() {
  const [pulse, setPulse] = useState(false)
  const { count, flashIntensity, isRunning, start, stop } = useMetronome({
    bpm: 104,
    vibrate: true,
    beep: true,
    onBeat: () => setPulse(true),
  })

  useEffect(() => {
    if (!pulse || typeof window === 'undefined') {
      return undefined
    }

    const timerId = window.setTimeout(() => setPulse(false), 50)
    return () => window.clearTimeout(timerId)
  }, [pulse])

  return (
    <section id="metronome-demo" className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-vita-amber">Metronome demo</p>
          <h2 className="mt-4 font-serif text-[clamp(2.2rem,5vw,3rem)] text-white">
            Practice the compression rhythm before you need it.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/85">
            This demo uses the same 104 BPM pacing used in VITA CPR flows, with vibration, audio, and visual pulse working together.
          </p>
          <p className="mt-4 font-mono text-sm uppercase tracking-[0.2em] text-slate-300">
            104 BPM - within AHA 100-120/min range
          </p>
        </div>

        <div
          className="rounded-[2rem] border border-white/10 bg-white/5 p-6 transition-all duration-[50ms]"
          style={{ filter: `brightness(${flashIntensity})` }}
        >
          <div className="flex flex-col items-center gap-6">
            <div
              className={[
                'flex',
                'h-64',
                'w-64',
                'items-center',
                'justify-center',
                'rounded-full',
                'border',
                'border-white/20',
                'bg-vita-red/10',
                'transition-transform',
                'duration-[50ms]',
                pulse ? 'scale-[1.15]' : 'scale-100',
              ].join(' ')}
            >
              <span className="font-mono text-[clamp(3rem,12vw,5rem)] font-bold text-white">{count || 0}</span>
            </div>

            <div className="grid w-full gap-4 sm:grid-cols-2">
              <button
                type="button"
                className={PRIMARY_BUTTON_CLASS}
                onClick={isRunning ? stop : start}
              >
                {isRunning ? 'Pause metronome' : 'Start metronome'}
              </button>
              <Link href="/app" className={SECONDARY_BUTTON_CLASS}>
                Open App
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

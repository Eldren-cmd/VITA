import { useEffect, useState } from 'react'

import {
  DATA_TEXT_CLASS,
  FLOW_BODY_CLASS,
  FLOW_HEADLINE_CLASS,
  PRIMARY_BUTTON_CLASS,
  SECONDARY_BUTTON_CLASS,
} from '@/constants/design'
import useMetronome from '@/hooks/useMetronome'

function getCycleCount(count, total) {
  if (!count) {
    return 0
  }

  return ((count - 1) % total) + 1
}

export default function MetronomeStep({ node, onAdvance }) {
  const [pulse, setPulse] = useState(false)
  const { count, flashIntensity, isRunning, start, stop } = useMetronome({
    bpm: node.bpm,
    vibrate: node.vibrate,
    beep: node.beep,
    onBeat: () => {
      setPulse(true)
    },
  })

  useEffect(() => {
    if (!pulse || typeof window === 'undefined') {
      return undefined
    }

    const timerId = window.setTimeout(() => setPulse(false), 50)
    return () => window.clearTimeout(timerId)
  }, [pulse])

  return (
    <section
      className="flex flex-1 flex-col justify-between gap-8 transition-all duration-[50ms]"
      style={{ filter: `brightness(${flashIntensity})` }}
    >
      <div className="space-y-4">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-vita-amber">Metronome</p>
        <h1 className={FLOW_HEADLINE_CLASS}>{node.headline}</h1>
        <p className={FLOW_BODY_CLASS}>{node.instruction}</p>
        <p className="font-mono text-sm text-slate-300">104 BPM - within AHA 100-120/min range</p>
      </div>

      <div className="flex flex-col items-center justify-center gap-6 py-8">
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
            'bg-white/5',
            'transition-transform',
            'duration-[50ms]',
            pulse ? 'scale-[1.15]' : 'scale-100',
          ].join(' ')}
        >
          <span className={DATA_TEXT_CLASS}>{getCycleCount(count, node.compressions || 30)}</span>
        </div>
      </div>

      <div className="grid gap-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <button
          type="button"
          className={PRIMARY_BUTTON_CLASS}
          onClick={isRunning ? stop : start}
        >
          {isRunning ? 'Pause metronome' : 'Start metronome'}
        </button>

        <button type="button" className={SECONDARY_BUTTON_CLASS} onClick={() => onAdvance(0)}>
          Continue
        </button>
      </div>
    </section>
  )
}

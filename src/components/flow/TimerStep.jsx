import { DATA_TEXT_CLASS, FLOW_BODY_CLASS, FLOW_HEADLINE_CLASS, PRIMARY_BUTTON_CLASS, SECONDARY_BUTTON_CLASS } from '@/constants/design'
import useTimer from '@/hooks/useTimer'

export default function TimerStep({ node, onAdvance, language }) {
  const { remaining, isRunning, start, stop } = useTimer({
    duration: node.duration,
    voiceInterval: node.voiceInterval,
    voiceText: node.voiceText,
    language,
    onComplete: () => onAdvance(0),
  })

  return (
    <section className="flex flex-1 flex-col justify-between gap-8">
      <div className="space-y-4">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-vita-amber">Timer</p>
        <h1 className={FLOW_HEADLINE_CLASS}>{node.headline}</h1>
        {node.instruction ? <p className={FLOW_BODY_CLASS}>{node.instruction}</p> : null}
      </div>

      <div className="flex flex-1 items-center justify-center py-8">
        <span className={`${DATA_TEXT_CLASS} text-[clamp(4rem,15vw,6rem)]`}>{remaining}</span>
      </div>

      <div className="grid gap-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <button
          type="button"
          className={PRIMARY_BUTTON_CLASS}
          onClick={isRunning ? stop : start}
        >
          {isRunning ? 'Pause timer' : 'Resume timer'}
        </button>
        <button type="button" className={SECONDARY_BUTTON_CLASS} onClick={() => onAdvance(0)}>
          Continue now
        </button>
      </div>
    </section>
  )
}

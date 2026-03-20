import { useEffect, useRef, useState } from 'react'

import {
  FLOW_BODY_CLASS,
  FLOW_HEADLINE_CLASS,
  GLARE_CLASS,
  PRIMARY_BUTTON_CLASS,
  SECONDARY_BUTTON_CLASS,
  getFlashClass,
} from '@/constants/design'

export default function ActionStep({ node, onAdvance, practiceMode }) {
  const [isFlashing, setIsFlashing] = useState(false)
  const [showRationaleCard, setShowRationaleCard] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current && typeof window !== 'undefined') {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    setShowRationaleCard(false)
  }, [node.id])

  const handleAdvance = () => {
    setIsFlashing(true)

    if (typeof window !== 'undefined') {
      timeoutRef.current = window.setTimeout(() => {
        setIsFlashing(false)

        if (practiceMode && node.rationale && !showRationaleCard) {
          setShowRationaleCard(true)
          return
        }

        onAdvance(0)
      }, 120)
      return
    }

    if (practiceMode && node.rationale && !showRationaleCard) {
      setShowRationaleCard(true)
      return
    }

    onAdvance(0)
  }

  return (
    <section className="flex flex-1 flex-col justify-between gap-8">
      <div className="space-y-5">
        <div className="space-y-4">
          <p className="font-mono text-sm uppercase tracking-[0.3em] text-vita-amber">Action</p>
          <h1 className={FLOW_HEADLINE_CLASS}>{node.headline}</h1>
          <p className={FLOW_BODY_CLASS}>{node.instruction}</p>
        </div>

        {Array.isArray(node.doNot) && node.doNot.length > 0 ? (
          <div className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-vita-amber">Do not</p>
            {node.doNot.map((item) => (
              <div
                key={item}
                className={[
                  'rounded-2xl',
                  'border',
                  'border-vita-amber/30',
                  'bg-black/15',
                  'px-4',
                  'py-3',
                  'text-base',
                  'text-white/85',
                  GLARE_CLASS,
                ].join(' ')}
              >
                {item}
              </div>
            ))}
          </div>
        ) : null}

        {practiceMode && node.rationale ? (
          <aside
            className={[
              'rounded-2xl',
              'border',
              'border-white/10',
              'bg-white/5',
              'p-4',
              'transition-all',
              'duration-150',
              showRationaleCard
                ? 'translate-y-0 opacity-100'
                : 'pointer-events-none translate-y-4 opacity-0',
            ].join(' ')}
          >
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-vita-amber">Why this step</p>
            <p className="mt-2 text-base text-white/90">{node.rationale}</p>
            <p className="mt-3 font-mono text-xs text-slate-300">{node.rationaleSource}</p>
          </aside>
        ) : null}
      </div>

      <div className="grid gap-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <button
          type="button"
          className={[PRIMARY_BUTTON_CLASS, 'transition-all', getFlashClass(isFlashing)].join(' ')}
          onClick={showRationaleCard ? () => onAdvance(0) : handleAdvance}
        >
          {showRationaleCard ? 'Dismiss rationale' : 'Step done'}
        </button>

        {node.note ? <div className={SECONDARY_BUTTON_CLASS}>{node.note}</div> : null}
      </div>
    </section>
  )
}

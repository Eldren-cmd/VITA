import {
  FLOW_BODY_CLASS,
  FLOW_HEADLINE_CLASS,
  GLARE_CLASS,
  PRIMARY_BUTTON_CLASS,
  SECONDARY_BUTTON_CLASS,
} from '@/constants/design'

export default function SafetyCheckStep({ node, onAdvance }) {
  const options = node.options || [{ label: 'Area is safe' }]

  return (
    <section className="flex flex-1 flex-col justify-between gap-8">
      <div className="space-y-6">
        <header className="space-y-4">
          <p className="font-mono text-sm uppercase tracking-[0.3em] text-vita-amber">Safety first</p>
          <h1 className={FLOW_HEADLINE_CLASS}>{node.headline}</h1>
          <p className={FLOW_BODY_CLASS}>Do not start care until the area is safe for you and the person.</p>
        </header>

        <div className="space-y-4">
          {(node.checks || []).map((check) => (
            <div
              key={check}
              className={[
                'rounded-2xl',
                'border',
                'border-white/10',
                'bg-white/5',
                'px-4',
                'py-4',
                'text-lg',
                'text-white',
                GLARE_CLASS,
              ].join(' ')}
            >
              {check}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        {options.map((option, index) => (
          <button
            key={option.label}
            type="button"
            className={index === 0 ? PRIMARY_BUTTON_CLASS : SECONDARY_BUTTON_CLASS}
            onClick={() => onAdvance(index)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </section>
  )
}

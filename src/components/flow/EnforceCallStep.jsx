import {
  FLOW_BODY_CLASS,
  FLOW_HEADLINE_CLASS,
  PRIMARY_BUTTON_CLASS,
  SECONDARY_BUTTON_CLASS,
} from '@/constants/design'
import useEmergencyCall from '@/hooks/useEmergencyCall'

export default function EnforceCallStep({ node, onAdvance, practiceMode = false }) {
  const { emergencyHref, emergencyNumber } = useEmergencyCall()

  return (
    <section className="flex flex-1 flex-col justify-between gap-8">
      <div className="space-y-4">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-vita-amber">Emergency contact</p>
        <h1 className={FLOW_HEADLINE_CLASS}>{node.headline}</h1>
        <p className={FLOW_BODY_CLASS}>
          Choose how emergency services are being contacted before you continue.
        </p>
      </div>

      <div className="grid gap-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        {(node.options || []).map((option, index) =>
          option.method === 'direct' ? (
            <a
              key={option.id || option.label}
              href={emergencyHref}
              className={PRIMARY_BUTTON_CLASS}
              onClick={() => onAdvance(index)}
            >
              {`${option.label} (${emergencyNumber})`}
            </a>
          ) : (
            <button
              key={option.id || option.label}
              type="button"
              className={index === 0 ? PRIMARY_BUTTON_CLASS : SECONDARY_BUTTON_CLASS}
              onClick={() => onAdvance(index)}
            >
              {option.label}
            </button>
          )
        )}

        {practiceMode && node.skippable ? (
          <button
            type="button"
            className={SECONDARY_BUTTON_CLASS}
            onClick={() => onAdvance((node.options || []).length)}
          >
            Skip call practice
          </button>
        ) : null}
      </div>
    </section>
  )
}

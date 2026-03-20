import { FLOW_BODY_CLASS, FLOW_HEADLINE_CLASS, ICON_BUTTON_CLASS } from '@/constants/design'

function getGridClass(displayMode, optionsCount) {
  if (displayMode === 'iconGrid') {
    return optionsCount > 4 ? 'grid-cols-2' : 'grid-cols-2'
  }

  if (displayMode === 'threeButton') {
    return 'grid-cols-1'
  }

  return 'grid-cols-1'
}

export default function QuestionStep({ node, onAdvance }) {
  const displayMode = node.displayMode || 'default'
  const options = node.options || []

  return (
    <section className="flex flex-1 flex-col justify-between gap-8">
      <div className="space-y-4">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-vita-amber">Question</p>
        <h1 className={FLOW_HEADLINE_CLASS}>{node.headline}</h1>
        {node.instruction ? <p className={FLOW_BODY_CLASS}>{node.instruction}</p> : null}
      </div>

      <div
        className={[
          'grid',
          getGridClass(displayMode, options.length),
          'gap-6',
          'pb-[calc(1.5rem+env(safe-area-inset-bottom))]',
        ].join(' ')}
      >
        {options.map((option, index) => (
          <button
            key={`${option.label}-${index}`}
            type="button"
            className={[
              ICON_BUTTON_CLASS,
              displayMode === 'iconGrid' && options.length % 2 === 1 && index === options.length - 1
                ? 'col-span-2'
                : '',
            ].join(' ')}
            onClick={() => onAdvance(index)}
          >
            <span className="block text-xl font-bold">{option.label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

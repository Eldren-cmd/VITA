import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'

import {
  DESIGN_CSS_VARIABLES,
  FLOW_BODY_CLASS,
  FLOW_HEADLINE_CLASS,
  ICON_BUTTON_CLASS,
  PRIMARY_BUTTON_CLASS,
  SECONDARY_BUTTON_CLASS,
  SOS_HEADER_CLEARANCE_CLASS,
  SOURCE_BAR_CLASS,
  WRAPPED_CARD_LABEL_CLASS,
  getSeverityStyle,
} from '@/constants/design'
import { ALL_PROTOCOL_IDS, EMERGENCY_ROUTE_PREFIX } from '@/constants/protocolIds'
import { loadProtocol } from '@/constants/hardcodedProtocols'
import triageData from '@/data/triage.json'
import TriageEngine from '@/engine/TriageEngine'
import useEmergencyCall from '@/hooks/useEmergencyCall'
import useLanguage from '@/hooks/useLanguage'

import SafetyCheckStep from '@/components/flow/SafetyCheckStep'
import SOSButton from '@/components/layout/SOSButton'
import LanguageFallbackBanner from '@/components/onboarding/LanguageFallbackBanner'

function ProtocolListModal({ open, onClose, onSelect, language }) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60 p-4 sm:items-center sm:justify-center">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-bg-base p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-vita-amber">Protocol list</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Choose a fallback guide.</h2>
          </div>
          <button type="button" className={SECONDARY_BUTTON_CLASS} onClick={onClose}>
            Close
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          {ALL_PROTOCOL_IDS.map((protocolId) => {
            const protocol = loadProtocol(protocolId, language)

            return (
              <button
                key={protocolId}
                type="button"
                className={ICON_BUTTON_CLASS}
                onClick={() => onSelect(protocolId)}
              >
                <span className={WRAPPED_CARD_LABEL_CLASS}>{protocol?.label || protocolId}</span>
                <span className="mt-1 block font-mono text-xs uppercase tracking-[0.2em] text-slate-300">
                  {protocolId}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function TriageTerminal({ node, resolution, emergencyHref, emergencyNumber }) {
  if (resolution) {
    return (
      <section className="flex flex-1 flex-col justify-center gap-6 text-center">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-vita-amber">Routing</p>
        <h1 className={FLOW_HEADLINE_CLASS}>{node.headline}</h1>
        <p className={FLOW_BODY_CLASS}>{node.instruction}</p>
      </section>
    )
  }

  return (
    <section className="flex flex-1 flex-col justify-between gap-8">
      <div className="space-y-4">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-vita-amber">Call now</p>
        <h1 className={FLOW_HEADLINE_CLASS}>{node.headline}</h1>
        <p className={FLOW_BODY_CLASS}>{node.instruction}</p>
      </div>

      <div className="grid gap-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <a href={emergencyHref} className={PRIMARY_BUTTON_CLASS}>
          {`Call emergency services (${emergencyNumber})`}
        </a>
      </div>
    </section>
  )
}

function TriageQuestion({ node, onAdvance }) {
  const isPrimaryGrid = node.id === 't3a'
  const gridOptions = isPrimaryGrid ? node.options.slice(0, 6) : node.options
  const navOption = isPrimaryGrid ? node.options[6] : null

  return (
    <section className="flex flex-1 flex-col justify-between gap-8">
      <div className="space-y-4">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-vita-amber">Triage</p>
        <h1 className={FLOW_HEADLINE_CLASS}>{node.headline}</h1>
        {node.instruction ? <p className={FLOW_BODY_CLASS}>{node.instruction}</p> : null}
      </div>

      <div className="space-y-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <div className={`grid gap-6 ${node.displayMode === 'iconGrid' ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {gridOptions.map((option, index) => (
            <button
              key={option.label}
              type="button"
              className={ICON_BUTTON_CLASS}
              onClick={() => onAdvance(index)}
            >
              <span className={WRAPPED_CARD_LABEL_CLASS}>{option.label}</span>
            </button>
          ))}
        </div>

        {navOption ? (
          <button
            type="button"
            className={SECONDARY_BUTTON_CLASS}
            onClick={() => onAdvance(6)}
          >
            {navOption.label}
          </button>
        ) : null}
      </div>
    </section>
  )
}

function NotSureStep({ node, onOpenProtocols, emergencyHref, emergencyNumber }) {
  return (
    <section className="flex flex-1 flex-col justify-between gap-8">
      <div className="space-y-4">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-vita-amber">Not sure</p>
        <h1 className={FLOW_HEADLINE_CLASS}>{node.headline}</h1>
        <p className={FLOW_BODY_CLASS}>{node.instruction}</p>
      </div>

      <div className="grid gap-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <a href={emergencyHref} className={PRIMARY_BUTTON_CLASS}>
          {`${node.primaryAction.label} (${emergencyNumber})`}
        </a>
        <button type="button" className={SECONDARY_BUTTON_CLASS} onClick={onOpenProtocols}>
          {node.secondaryAction.label}
        </button>
      </div>
    </section>
  )
}

export default function TriageFlow() {
  const router = useRouter()
  const { emergencyHref, emergencyNumber } = useEmergencyCall()
  const { language, fallbackUsed } = useLanguage()
  const engineRef = useRef(null)
  const [currentNode, setCurrentNode] = useState(null)
  const [resolution, setResolution] = useState(null)
  const [showProtocolList, setShowProtocolList] = useState(false)

  useEffect(() => {
    const engine = new TriageEngine(triageData, language)
    engineRef.current = engine
    setCurrentNode(engine.getCurrentNode())
    setResolution(null)
  }, [language])

  useEffect(() => {
    if (!resolution) {
      return
    }

    router.push(`${EMERGENCY_ROUTE_PREFIX}/${resolution}`)
  }, [resolution, router])

  const handleAdvance = (optionIndex) => {
    if (!engineRef.current) {
      return
    }

    const nextNode = engineRef.current.advance(optionIndex)
    setCurrentNode(nextNode)
    setResolution(engineRef.current.getResolution())
  }

  const handleProtocolPick = (protocolId) => {
    setShowProtocolList(false)
    router.push(`${EMERGENCY_ROUTE_PREFIX}/${protocolId}`)
  }

  if (!currentNode) {
    return null
  }

  let content = null

  if (currentNode.type === 'safetyCheck') {
    content = <SafetyCheckStep node={currentNode} onAdvance={handleAdvance} />
  } else if (currentNode.type === 'question') {
    content = <TriageQuestion node={currentNode} onAdvance={handleAdvance} />
  } else if (currentNode.type === 'notSure') {
    content = (
      <NotSureStep
        node={currentNode}
        onOpenProtocols={() => setShowProtocolList(true)}
        emergencyHref={emergencyHref}
        emergencyNumber={emergencyNumber}
      />
    )
  } else if (currentNode.type === 'terminal') {
    content = (
      <TriageTerminal
        node={currentNode}
        resolution={resolution}
        emergencyHref={emergencyHref}
        emergencyNumber={emergencyNumber}
      />
    )
  } else {
    content = (
      <div className="rounded-3xl border border-vita-red/30 bg-bg-critical p-6 text-white">
        Unsupported triage node: {currentNode.type}
      </div>
    )
  }

  return (
    <main
      className="min-h-screen text-white"
      style={{
        ...DESIGN_CSS_VARIABLES,
        ...getSeverityStyle('medium'),
      }}
    >
      <SOSButton />

      <div className="mx-auto flex min-h-screen max-w-[480px] flex-col px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))]">
        {fallbackUsed ? (
          <div className="mb-4">
            <LanguageFallbackBanner visible={fallbackUsed} />
          </div>
        ) : null}

        <header
          className={`mb-6 flex flex-col gap-3 ${SOS_HEADER_CLEARANCE_CLASS} sm:flex-row sm:items-start sm:justify-between`}
        >
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-vita-amber">Universal triage</p>
            <p className={SOURCE_BAR_CLASS}>Route first. Treat second.</p>
          </div>
          <div className={`${SOURCE_BAR_CLASS} max-w-[12rem] text-left sm:text-right`}>
            <div>Routing file</div>
            <div>triage.json</div>
          </div>
        </header>

        <div className="flex flex-1 flex-col justify-between">{content}</div>
      </div>

      <ProtocolListModal
        open={showProtocolList}
        onClose={() => setShowProtocolList(false)}
        onSelect={handleProtocolPick}
        language={language}
      />
    </main>
  )
}

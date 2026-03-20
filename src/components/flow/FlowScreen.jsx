import { useRouter } from 'next/router'

import { DESIGN_CSS_VARIABLES, SECONDARY_BUTTON_CLASS, SOURCE_BAR_CLASS, getSeverityStyle } from '@/constants/design'
import { loadProtocol } from '@/constants/hardcodedProtocols'
import useLanguage from '@/hooks/useLanguage'
import useVITA from '@/hooks/useVITA'
import useWakeLock from '@/hooks/useWakeLock'

import DeferredCallAlert from '@/components/flow/DeferredCallAlert'
import EnforceCallStep from '@/components/flow/EnforceCallStep'
import EscapeHatch from '@/components/flow/EscapeHatch'
import ActionStep from '@/components/flow/ActionStep'
import MetronomeStep from '@/components/flow/MetronomeStep'
import QuestionStep from '@/components/flow/QuestionStep'
import SafetyCheckStep from '@/components/flow/SafetyCheckStep'
import TerminalStep from '@/components/flow/TerminalStep'
import TimerStep from '@/components/flow/TimerStep'
import SOSButton from '@/components/layout/SOSButton'

function LoadingState({ message }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 text-center text-white/80">
      <p className="text-xl">{message}</p>
    </div>
  )
}

function ErrorState({ message }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 text-center">
      <div className="max-w-md rounded-3xl border border-vita-red/30 bg-bg-critical p-6">
        <p className="font-mono text-sm uppercase tracking-[0.2em] text-vita-amber">Unable to load</p>
        <p className="mt-3 text-lg text-white">{message}</p>
      </div>
    </div>
  )
}

export default function FlowScreen({ protocolId, practiceMode = false }) {
  const router = useRouter()
  const { language } = useLanguage()
  const protocol = loadProtocol(protocolId, language)
  const {
    currentNode,
    severity,
    advance,
    goBack,
    getReport,
    terminate,
    error,
    showResumeBanner,
    showDeferredCallAlert,
    dismissDeferredCallAlert,
  } = useVITA(protocolId, language, { practiceMode })

  useWakeLock(!practiceMode)

  if (error) {
    return <ErrorState message={error} />
  }

  if (!protocol || !currentNode) {
    return <LoadingState message="Loading emergency guidance..." />
  }

  const hideSafetyChrome = currentNode.synthetic === true && currentNode.type === 'terminal'
  const showBackButton =
    !hideSafetyChrome && currentNode.type !== 'enforceCall' && currentNode.id !== protocol.entry
  const showEscapeHatch = !hideSafetyChrome && currentNode.type !== 'enforceCall'

  let content = null

  switch (currentNode.type) {
    case 'safetyCheck':
      content = <SafetyCheckStep node={currentNode} onAdvance={advance} />
      break
    case 'enforceCall':
      content = <EnforceCallStep node={currentNode} onAdvance={advance} />
      break
    case 'question':
      content = <QuestionStep node={currentNode} onAdvance={advance} />
      break
    case 'action':
      content = <ActionStep node={currentNode} onAdvance={advance} practiceMode={practiceMode} />
      break
    case 'metronome':
      content = <MetronomeStep node={currentNode} onAdvance={advance} />
      break
    case 'timer':
      content = <TimerStep node={currentNode} onAdvance={advance} language={language} />
      break
    case 'terminal':
      content = <TerminalStep node={currentNode} getReport={getReport} onTerminate={terminate} />
      break
    default:
      content = <ErrorState message={`Unsupported node type: ${currentNode.type}`} />
  }

  return (
    <main
      className="min-h-screen text-white"
      style={{
        ...DESIGN_CSS_VARIABLES,
        ...getSeverityStyle(currentNode.severity || severity, practiceMode),
      }}
    >
      <SOSButton />

      <div className="mx-auto flex min-h-screen max-w-[480px] flex-col px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))]">
        {practiceMode ? (
          <div className="mb-4 rounded-2xl border border-vita-amber/30 bg-vita-amber/15 px-4 py-3 text-sm font-bold text-vita-amber">
            PRACTICE MODE - Not a real emergency
          </div>
        ) : null}

        {showResumeBanner ? (
          <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/90">
            Previous session restored.
          </div>
        ) : null}

        {!hideSafetyChrome ? (
          <header className="mb-6 flex items-center justify-between gap-4">
            {showBackButton ? (
              <button type="button" className={SECONDARY_BUTTON_CLASS} onClick={() => goBack()}>
                Back
              </button>
            ) : (
              <div />
            )}

            {!hideSafetyChrome ? (
              <div className={`${SOURCE_BAR_CLASS} max-w-[16rem] text-right`}>
                <div>{protocol.source.org}</div>
                <div>{protocol.source.doi}</div>
              </div>
            ) : null}
          </header>
        ) : null}

        <div className="flex flex-1 flex-col justify-between">{content}</div>

        {showEscapeHatch ? (
          <div className="mt-8">
            <EscapeHatch fallbackProtocolId={protocol.escapeHatch?.fallback} practiceMode={practiceMode} />
          </div>
        ) : null}

        <DeferredCallAlert open={showDeferredCallAlert} onDismiss={dismissDeferredCallAlert} />
      </div>
    </main>
  )
}

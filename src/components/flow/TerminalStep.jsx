import { useEffect, useRef, useState } from 'react'

import { FLOW_BODY_CLASS, FLOW_HEADLINE_CLASS, PRIMARY_BUTTON_CLASS, SECONDARY_BUTTON_CLASS } from '@/constants/design'
import ReportEngine from '@/engine/ReportEngine'
import VaultEngine from '@/engine/VaultEngine'

export default function TerminalStep({ node, getReport, onTerminate }) {
  const [showRefreshDialog, setShowRefreshDialog] = useState(false)
  const [report, setReport] = useState(null)
  const mountedRef = useRef(false)

  useEffect(() => {
    if (mountedRef.current || typeof window === 'undefined') {
      return undefined
    }

    mountedRef.current = true

    try {
      const session = getReport?.() || null

      if (session) {
        const incidentReport = ReportEngine.generate(session)
        const vault = new VaultEngine()

        vault.addIncident(incidentReport)
        setReport(incidentReport)
      }
    } catch (_error) {
      setReport(getReport?.() || null)
    }

    onTerminate?.()

    const timerId = window.setTimeout(() => {
      const pendingUpdate = window.localStorage.getItem('vita_pending_critical_update')

      if (pendingUpdate) {
        window.localStorage.removeItem('vita_pending_critical_update')
        setShowRefreshDialog(true)
      }
    }, 3000)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [getReport, onTerminate])

  return (
    <section className="flex flex-1 flex-col justify-between gap-8">
      <div className="space-y-5">
        <div className="space-y-4">
          <p className="font-mono text-sm uppercase tracking-[0.3em] text-vita-amber">EMS handoff</p>
          <h1 className={FLOW_HEADLINE_CLASS}>{node.headline}</h1>
          <p className={FLOW_BODY_CLASS}>{node.instruction}</p>
        </div>

        {report ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-300">Session summary</p>
            <p className="mt-3 text-base text-white/90">Protocol: {report.protocolId}</p>
            <p className="text-base text-white/90">Steps logged: {report.steps.length}</p>
            <p className="text-base text-white/90">Call method: {report.callMethod || 'not recorded'}</p>
          </div>
        ) : null}

        {showRefreshDialog ? (
          <div className="rounded-2xl border border-vita-amber/30 bg-bg-high p-4">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-vita-amber">
              Critical update
            </p>
            <p className="mt-2 text-base text-white/90">
              A pending critical update was held until the session ended. Refresh when safe.
            </p>
            <button
              type="button"
              className="mt-4 rounded-xl bg-vita-amber px-4 py-3 font-bold text-white"
              onClick={() => window.location.reload()}
            >
              Refresh now
            </button>
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        {node.primaryAction?.action === 'CALL_EMERGENCY' ? (
          <a href="tel:" className={PRIMARY_BUTTON_CLASS}>
            {node.primaryAction.label}
          </a>
        ) : null}
        {node.secondaryAction ? (
          <button type="button" className={SECONDARY_BUTTON_CLASS}>
            {node.secondaryAction.label}
          </button>
        ) : null}
      </div>
    </section>
  )
}

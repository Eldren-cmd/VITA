import Link from 'next/link'

import { FLOW_BODY_CLASS, FLOW_HEADLINE_CLASS, SECONDARY_BUTTON_CLASS } from '@/constants/design'
import { loadProtocol } from '@/constants/hardcodedProtocols'

import SOSButton from '@/components/layout/SOSButton'
import ShareReport from '@/components/report/ShareReport'

export default function IncidentReport({ report }) {
  const protocol = loadProtocol(report.protocolId)

  return (
    <main className="min-h-screen bg-bg-base text-white">
      <SOSButton />

      <div className="mx-auto max-w-[480px] px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))]">
        <header className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-vita-amber">Incident report</p>
              <h1 className={`${FLOW_HEADLINE_CLASS} mt-3`}>
                {protocol?.label || report.protocolId}
              </h1>
            </div>

            <Link href="/app/vault" className={SECONDARY_BUTTON_CLASS}>
              Vault
            </Link>
          </div>

          <p className={FLOW_BODY_CLASS}>
            Review what happened, what guidance was followed, and what was handed over.
          </p>
        </header>

        <section className="mt-8 space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-300">Summary</p>
          <p className="text-base text-white/90">Report ID: {report.id}</p>
          <p className="text-base text-white/90">Saved: {report.savedAt}</p>
          <p className="text-base text-white/90">Source DOI: {report.sourceDoi}</p>
          <p className="text-base text-white/90">Duration: {report.durationSeconds} seconds</p>
          <p className="text-base text-white/90">Call method: {report.callMethod || 'not recorded'}</p>
          <p className="text-base text-white/90">Severity: {report.severity || 'unknown'}</p>
          <p className="text-base text-white/90">
            Forced escalation: {report.forcedEscalation ? 'Yes' : 'No'}
          </p>
          <p className="text-base text-white/90">
            Naloxone given: {report.naloxoneAdministered ? 'Yes' : 'No'}
          </p>
          <p className="text-base text-white/90">
            Synthetic terminal: {report.syntheticTerminal ? 'Yes' : 'No'}
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-2xl font-bold text-white">Action timeline</h2>
          <div className="space-y-4">
            {(report.steps || []).length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white/75">
                No action steps were recorded.
              </div>
            ) : null}

            {(report.steps || []).map((step) => (
              <div key={`${step.nodeId}-${step.timestamp}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-lg font-bold text-white">{step.headline}</p>
                <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-slate-300">
                  {step.nodeId} | {step.timestamp}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <ShareReport report={report} />
        </section>
      </div>
    </main>
  )
}

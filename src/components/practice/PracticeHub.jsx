import Link from 'next/link'

import {
  FLOW_BODY_CLASS,
  FLOW_HEADLINE_CLASS,
  PRIMARY_BUTTON_CLASS,
  SECONDARY_BUTTON_CLASS,
} from '@/constants/design'
import { ALL_PROTOCOL_IDS, PRACTICE_ROUTE_PREFIX } from '@/constants/protocolIds'
import { loadProtocol } from '@/constants/hardcodedProtocols'
import useLanguage from '@/hooks/useLanguage'

import EmergencyGrid from '@/components/dashboard/EmergencyGrid'

export default function PracticeHub() {
  const { language } = useLanguage()
  const protocols = ALL_PROTOCOL_IDS.map((protocolId) => loadProtocol(protocolId, language)).filter(Boolean)

  return (
    <main className="min-h-screen bg-bg-practice text-white">
      <div className="mx-auto flex min-h-screen max-w-[480px] flex-col px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))]">
        <header className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-vita-amber">Practice mode</p>
              <h1 className={`${FLOW_HEADLINE_CLASS} mt-3`}>Train with the same flows in a safer sandbox.</h1>
            </div>

            <Link href="/app" className={SECONDARY_BUTTON_CLASS}>
              Back
            </Link>
          </div>

          <p className={FLOW_BODY_CLASS}>
            Use practice drills to rehearse routing, CPR timing, and step order without creating a live incident
            session.
          </p>

          <div className="grid gap-6">
            <Link href={`${PRACTICE_ROUTE_PREFIX}/cpr-adult`} className={PRIMARY_BUTTON_CLASS}>
              Start CPR adult practice
            </Link>
          </div>
        </header>

        <section className="mt-8 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-white">Practice drills</h2>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-slate-400">
              Opens training mode
            </span>
          </div>

          <EmergencyGrid
            protocols={protocols}
            routePrefix={PRACTICE_ROUTE_PREFIX}
            modeLabel="Practice drill"
          />
        </section>
      </div>
    </main>
  )
}

import Link from 'next/link'
import { useRef, useState } from 'react'

import {
  FLOW_BODY_CLASS,
  FLOW_HEADLINE_CLASS,
  PRIMARY_BUTTON_CLASS,
  SECONDARY_BUTTON_CLASS,
} from '@/constants/design'
import { ALL_PROTOCOL_IDS } from '@/constants/protocolIds'
import { loadProtocol } from '@/constants/hardcodedProtocols'
import useLanguage from '@/hooks/useLanguage'
import useVault from '@/hooks/useVault'

import EmergencyGrid from '@/components/dashboard/EmergencyGrid'
import SOSButton from '@/components/layout/SOSButton'
import InstallPromptCard from '@/components/onboarding/InstallPromptCard'
import LanguageSelector from '@/components/onboarding/LanguageSelector'
import QuickAccessCard from '@/components/vault/QuickAccessCard'

export default function Dashboard() {
  const { language } = useLanguage()
  const { profile, contacts } = useVault()
  const [showMedicalId, setShowMedicalId] = useState(false)
  const tapTimestampsRef = useRef([])

  const protocols = ALL_PROTOCOL_IDS.map((protocolId) => loadProtocol(protocolId, language)).filter(Boolean)

  const handleTripleTap = () => {
    const now = Date.now()
    const recentTaps = [...tapTimestampsRef.current, now].filter((timestamp) => now - timestamp < 700)

    tapTimestampsRef.current = recentTaps

    if (recentTaps.length >= 3) {
      tapTimestampsRef.current = []
      setShowMedicalId(true)
    }
  }

  return (
    <main className="min-h-screen bg-bg-base text-white" onPointerDown={handleTripleTap}>
      <SOSButton />

      <div className="mx-auto flex min-h-screen max-w-[480px] flex-col px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))]">
        <header className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-vita-amber">Project VITA</p>
              <h1 className={`${FLOW_HEADLINE_CLASS} mt-3`}>Choose the fastest safe path.</h1>
            </div>

            <Link href="/app/vault" className={SECONDARY_BUTTON_CLASS}>
              Vault
            </Link>
          </div>

          <p className={FLOW_BODY_CLASS}>
            Start triage if you are unsure. Jump straight to a protocol only when you already know the emergency.
          </p>

          <div className="grid gap-6">
            <Link href="/app/triage" className={PRIMARY_BUTTON_CLASS}>
              Start universal triage
            </Link>
            <Link href="/app/practice" className={SECONDARY_BUTTON_CLASS}>
              Open practice mode
            </Link>
          </div>
        </header>

        <section className="mt-8 space-y-4">
          <InstallPromptCard compact />
        </section>

        <section className="mt-8 space-y-4">
          <LanguageSelector />
        </section>

        <section className="mt-8 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-white">Direct emergency flows</h2>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-slate-400">
              Triple tap for Medical ID
            </span>
          </div>

          <EmergencyGrid protocols={protocols} />
        </section>
      </div>

      <QuickAccessCard
        open={showMedicalId}
        onClose={() => setShowMedicalId(false)}
        profile={profile}
        contacts={contacts}
      />
    </main>
  )
}

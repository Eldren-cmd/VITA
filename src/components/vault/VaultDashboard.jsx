import Link from 'next/link'
import { useEffect, useState } from 'react'

import {
  FLOW_BODY_CLASS,
  FLOW_HEADLINE_CLASS,
  PRIMARY_BUTTON_CLASS,
  SOS_HEADER_CLEARANCE_CLASS,
  SECONDARY_BUTTON_CLASS,
} from '@/constants/design'
import VaultEngine from '@/engine/VaultEngine'
import useVault from '@/hooks/useVault'

import SOSButton from '@/components/layout/SOSButton'
import ContactsForm from '@/components/vault/ContactsForm'
import ProfileForm from '@/components/vault/ProfileForm'
import QuickAccessCard from '@/components/vault/QuickAccessCard'

export default function VaultDashboard() {
  const { profile, contacts, settings, updateProfile, updateContacts, updateSettings, clearAllData } =
    useVault()
  const [showMedicalId, setShowMedicalId] = useState(false)
  const [incidents, setIncidents] = useState([])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const engine = new VaultEngine()
    setIncidents(engine.getIncidents().slice().reverse())
  }, [profile, contacts, settings])

  return (
    <main className="min-h-screen bg-bg-base text-white">
      <SOSButton />

      <div className="mx-auto max-w-[480px] px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))]">
        <header className="space-y-5">
          <div
            className={`flex flex-col gap-4 ${SOS_HEADER_CLEARANCE_CLASS} sm:flex-row sm:items-start sm:justify-between`}
          >
            <div className="max-w-[20rem] sm:max-w-none">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-vita-amber">Medical vault</p>
              <h1 className={`${FLOW_HEADLINE_CLASS} mt-3`}>Keep critical health details on-device.</h1>
            </div>

            <button
              type="button"
              className={`${SECONDARY_BUTTON_CLASS} sm:min-w-[13rem] sm:w-auto`}
              onClick={() => setShowMedicalId(true)}
            >
              Show Medical ID
            </button>
          </div>

          <p className={FLOW_BODY_CLASS}>
            All data stays on this device. Nothing is sent to a server, analytics provider, or third party.
          </p>

          <div className="grid gap-4">
            <Link href="/app" className={SECONDARY_BUTTON_CLASS}>
              Back to dashboard
            </Link>
          </div>
        </header>

        <section className="mt-8 space-y-4">
          <h2 className="text-2xl font-bold text-white">Profile</h2>
          <ProfileForm profile={profile} onSave={updateProfile} />
        </section>

        <section id="delete-data" className="mt-10 space-y-4">
          <h2 className="text-2xl font-bold text-white">Emergency contacts</h2>
          <ContactsForm contacts={contacts} onSave={updateContacts} />
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4">
            <label className="flex items-center gap-3 text-white">
              <input
                type="checkbox"
                checked={Boolean(settings.voiceEnabled)}
                onChange={(event) => updateSettings({ voiceEnabled: event.target.checked })}
              />
              Voice prompts enabled
            </label>

            <input
              value={settings.language || 'en'}
              onChange={(event) => updateSettings({ language: event.target.value || 'en' })}
              placeholder="Language"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white"
            />

            <input
              value={settings.country || 'NG'}
              onChange={(event) => updateSettings({ country: event.target.value || 'NG' })}
              placeholder="Country"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white"
            />

            <div className="rounded-2xl border border-white/10 bg-black/15 p-4 text-sm text-white/80">
              NDPA 2023: All data is stored only on your device. Never transmitted. No server. No analytics. No
              third parties.
            </div>

            <button type="button" className={PRIMARY_BUTTON_CLASS} onClick={() => clearAllData()}>
              Delete all data
            </button>
          </div>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-bold text-white">Incident reports</h2>
          <div className="space-y-4">
            {incidents.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white/75">
                No saved incident reports yet.
              </div>
            ) : null}

            {incidents.map((incident) => (
              <Link
                key={incident.id}
                href={`/app/report/${incident.id}`}
                className="block rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <p className="text-lg font-bold text-white">{incident.protocolId}</p>
                <p className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-slate-300">
                  {incident.savedAt}
                </p>
                <p className="mt-2 text-sm text-white/75">Open saved incident report</p>
              </Link>
            ))}
          </div>
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

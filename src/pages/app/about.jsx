import Link from 'next/link'

import emergencyNumbers from '@/data/emergency-numbers.json'
import { PROTOCOL_LIBRARY } from '@/constants/hardcodedProtocols'
import { FLOW_HEADLINE_CLASS, SECONDARY_BUTTON_CLASS } from '@/constants/design'
import SOSButton from '@/components/layout/SOSButton'

const PRIMARY_SOURCES = [
  {
    org: 'American Heart Association',
    guideline: '2025 Adult Basic Life Support Guidelines',
    doi: '10.1161/CIR.0000000000001369',
    publishedDate: 'October 21, 2025',
    link: 'https://doi.org/10.1161/CIR.0000000000001369',
  },
  {
    org: 'American Heart Association / American Academy of Pediatrics',
    guideline: '2025 Pediatric Basic Life Support Guidelines',
    doi: '10.1161/CIR.0000000000001370',
    publishedDate: 'October 21, 2025',
    link: 'https://doi.org/10.1161/CIR.0000000000001370',
  },
  {
    org: 'American Heart Association / American Red Cross',
    guideline: '2024 First Aid Guidelines',
    doi: '10.1161/CIR.0000000000001281',
    publishedDate: 'November 14, 2024',
    link: 'https://doi.org/10.1161/CIR.0000000000001281',
  },
  {
    org: 'International Liaison Committee on Resuscitation',
    guideline: '2025 First Aid CoSTR',
    doi: '10.1161/CIR.0000000000001358',
    publishedDate: 'October 21, 2025',
    link: 'https://doi.org/10.1161/CIR.0000000000001358',
  },
]

const FULL_DISCLAIMER =
  'VITA provides general first aid guidance based on publicly available guidelines from the American Heart Association, American Red Cross, and International Liaison Committee on Resuscitation. This application does not replace professional medical training or advice. Always call emergency services first. Protocol accuracy depends on the guidelines available at the time of last review.'

function Section({ eyebrow, title, children }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-vita-amber">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-bold text-white">{title}</h2>
      <div className="mt-5 space-y-4 text-white/85">{children}</div>
    </section>
  )
}

function Table({ headers, rows }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="min-w-full border-collapse text-left text-sm text-white/85">
        <thead className="bg-white/5 text-xs uppercase tracking-[0.15em] text-slate-300">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 font-mono">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t border-white/10 align-top">
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`} className="px-4 py-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function AboutPage() {
  const protocols = Object.values(PROTOCOL_LIBRARY).sort((left, right) => left.label.localeCompare(right.label))
  const emergencyNumberRows = Object.entries(emergencyNumbers).map(([code, entry]) => {
    const lastVerified = entry.numbers.map((number) => number.lastVerified).sort().at(-1)

    return [code, entry.country, lastVerified]
  })

  return (
    <main className="min-h-screen bg-bg-base text-white">
      <SOSButton />

      <div className="mx-auto max-w-5xl px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))] sm:px-6 lg:px-8">
        <header className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-vita-amber">About VITA</p>
              <h1 className={`${FLOW_HEADLINE_CLASS} mt-3`}>Sources, governance, and device-only data policy.</h1>
            </div>

            <Link href="/app" className={SECONDARY_BUTTON_CLASS}>
              Back to app
            </Link>
          </div>
        </header>

        <div className="mt-8 space-y-6">
          <Section eyebrow="1. What VITA is" title="A production-grade, offline-first emergency first-aid PWA.">
            <p>
              VITA is a device-resident emergency guidance tool that helps a lay rescuer route quickly into the safest first-aid protocol available for the situation in front of them.
            </p>
          </Section>

          <Section eyebrow="2. What VITA is not" title="Not a diagnosis tool or substitute for medical training.">
            <p>
              VITA is not a diagnostic engine, not a replacement for emergency services, not professional medical advice, and not a substitute for hands-on first-aid or CPR training.
            </p>
          </Section>

          <Section eyebrow="3. Primary sources" title="All protocol content is traceable to four primary-source guideline records.">
            <Table
              headers={['Organisation', 'Guideline', 'DOI', 'Published']}
              rows={PRIMARY_SOURCES.map((source) => [
                source.org,
                source.guideline,
                <a key={source.doi} href={source.link} className="text-vita-amber underline" target="_blank" rel="noreferrer">
                  {source.doi}
                </a>,
                source.publishedDate,
              ])}
            />
          </Section>

          <Section eyebrow="4. Protocol versions" title="Each shipped protocol carries its own governance metadata.">
            <Table
              headers={['Protocol', 'Version', 'Reviewed', 'Review due', 'Status']}
              rows={protocols.map((protocol) => [
                protocol.label,
                protocol.version,
                protocol.governance.reviewedAt,
                protocol.governance.reviewDue,
                protocol.governance.reviewStatus,
              ])}
            />
          </Section>

          <Section eyebrow="5. Emergency numbers" title="Emergency contact data is date-stamped per country entry.">
            <Table
              headers={['Code', 'Country', 'Last verified']}
              rows={emergencyNumberRows}
            />
          </Section>

          <Section eyebrow="6. Full disclaimer" title="This text must remain visible in any public deployment.">
            <p>{FULL_DISCLAIMER}</p>
          </Section>

          <Section eyebrow="7. Good Samaritan notice" title="Educational only and jurisdiction-dependent.">
            <p>
              Good Samaritan protections may exist in some jurisdictions, but they vary by location and are not guaranteed. VITA does not provide legal advice.
            </p>
          </Section>

          <Section eyebrow="8. NDPA 2023 data statement" title="All health data stays on the device.">
            <p>All data stored only on your device. Never transmitted. No server. No analytics. No third parties.</p>
            <Link href="/app/vault#delete-data" className="text-vita-amber underline">
              Delete all data
            </Link>
          </Section>

          <Section eyebrow="9. ARIA note" title="Accessibility status">
            <p>
              VITA is optimised for one-handed touch use in emergencies. Full screen reader accessibility is on the V2 roadmap. If you require accessible emergency guidance, please call your local emergency services directly.
            </p>
          </Section>

          <Section eyebrow="10. Language fallback note" title="English is the safe fallback until peer review is complete.">
            <p>When a protocol is not yet verified in your selected language, VITA shows English automatically.</p>
          </Section>

          <Section eyebrow="11. Yoruba reviewer credit" title="No Yoruba protocol has been released yet.">
            <p>No Yoruba translation has passed peer review for shipping yet, so no reviewer credit is shown at this stage.</p>
          </Section>

          <Section eyebrow="12. LASAMBUS / LASHMA" title="Lagos emergency number context">
            <p>
              0800 000 LASHMA is operated by Lagos State Health Management Agency. LASAMBUS (Lagos State Ambulance Service) responds to calls.
            </p>
          </Section>
        </div>
      </div>
    </main>
  )
}

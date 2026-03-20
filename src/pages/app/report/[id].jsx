import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import VaultEngine from '@/engine/VaultEngine'
import IncidentReport from '@/components/report/IncidentReport'

export default function ReportPage() {
  const router = useRouter()
  const { id } = router.query
  const [report, setReport] = useState(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof id !== 'string') {
      return
    }

    const engine = new VaultEngine()
    setReport(engine.getIncident(id))
    setChecked(true)
  }, [id])

  if (!router.isReady) {
    return null
  }

  if (!checked && typeof id === 'string') {
    return null
  }

  if (!report) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg-base px-4 text-white">
        <div className="max-w-md rounded-3xl border border-vita-red/30 bg-bg-critical p-6 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-vita-amber">Report missing</p>
          <p className="mt-3 text-lg">This incident report could not be found on this device.</p>
        </div>
      </main>
    )
  }

  return <IncidentReport report={report} />
}

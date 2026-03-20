import { useState } from 'react'

import { loadProtocol } from '@/constants/hardcodedProtocols'
import { PRIMARY_BUTTON_CLASS, SECONDARY_BUTTON_CLASS } from '@/constants/design'

function buildShareText(report) {
  const protocolLabel = loadProtocol(report.protocolId)?.label || report.protocolId
  const keySteps = (report.steps || [])
    .slice(0, 3)
    .map((step) => step.headline)
    .join('; ')

  const parts = [
    `Protocol: ${protocolLabel}`,
    `Start: ${report.startTime}`,
    `Duration: ${report.durationSeconds}s`,
    report.callMethod ? `Call: ${report.callMethod}` : 'EMS not called',
  ]

  if (keySteps) {
    parts.push(`Steps: ${keySteps}`)
  }

  return parts.join(' | ').slice(0, 500)
}

export default function ShareReport({ report }) {
  const [status, setStatus] = useState('')
  const shareText = buildShareText(report)

  const handleShare = async () => {
    if (typeof navigator === 'undefined') {
      return
    }

    try {
      if (navigator.share) {
        await navigator.share({
          text: shareText,
        })
        setStatus('Shared.')
        return
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText)
        setStatus('Copied to clipboard.')
        return
      }

      setStatus('Share unavailable on this device.')
    } catch (_error) {
      setStatus('Share cancelled.')
    }
  }

  return (
    <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-300">Share report</p>
      <textarea
        readOnly
        value={shareText}
        className="min-h-[140px] w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-4 text-white"
      />
      <div className="grid gap-4">
        <button type="button" className={PRIMARY_BUTTON_CLASS} onClick={handleShare}>
          Share incident summary
        </button>
        {status ? <div className={SECONDARY_BUTTON_CLASS}>{status}</div> : null}
      </div>
    </div>
  )
}

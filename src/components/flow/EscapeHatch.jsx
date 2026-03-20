import { useRouter } from 'next/router'

import { PRIMARY_BUTTON_CLASS, SECONDARY_BUTTON_CLASS } from '@/constants/design'
import {
  EMERGENCY_ROUTE_PREFIX,
  FALLBACK_PROTOCOL_ID,
  PRACTICE_ROUTE_PREFIX,
} from '@/constants/protocolIds'
import useEmergencyCall from '@/hooks/useEmergencyCall'

export default function EscapeHatch({ fallbackProtocolId = FALLBACK_PROTOCOL_ID, practiceMode = false }) {
  const router = useRouter()
  const { emergencyHref, emergencyNumber } = useEmergencyCall()

  const handleFallback = () => {
    const prefix = practiceMode ? PRACTICE_ROUTE_PREFIX : EMERGENCY_ROUTE_PREFIX
    router.push(`${prefix}/${fallbackProtocolId}`)
  }

  return (
    <div className="grid gap-4">
      <a href={emergencyHref} className={PRIMARY_BUTTON_CLASS}>
        {`Call emergency services (${emergencyNumber})`}
      </a>
      <button type="button" className={SECONDARY_BUTTON_CLASS} onClick={handleFallback}>
        Generic life support
      </button>
    </div>
  )
}

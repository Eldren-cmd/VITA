import Link from 'next/link'

import { EMERGENCY_ROUTE_PREFIX } from '@/constants/protocolIds'
import { ICON_BUTTON_CLASS, WRAPPED_CARD_LABEL_CLASS } from '@/constants/design'

function getPriorityText(priority) {
  if (priority === 'IMMEDIATE') {
    return 'Immediate'
  }

  if (priority === 'high') {
    return 'High priority'
  }

  if (priority === 'medium') {
    return 'Medium priority'
  }

  return 'Low priority'
}

export default function EmergencyCard({
  protocol,
  routePrefix = EMERGENCY_ROUTE_PREFIX,
  modeLabel = null,
}) {
  return (
    <Link href={`${routePrefix}/${protocol.id}`} className={ICON_BUTTON_CLASS}>
      <span className={WRAPPED_CARD_LABEL_CLASS}>{protocol.label}</span>
      <span className="mt-2 block font-mono text-xs uppercase tracking-[0.2em] text-slate-300">
        {modeLabel || getPriorityText(protocol.priority)}
      </span>
    </Link>
  )
}

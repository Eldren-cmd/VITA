import Link from 'next/link'

import { ICON_BUTTON_CLASS } from '@/constants/design'

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

export default function EmergencyCard({ protocol }) {
  return (
    <Link href={`/app/emergency/${protocol.id}`} className={ICON_BUTTON_CLASS}>
      <span className="block text-lg font-bold">{protocol.label}</span>
      <span className="mt-2 block font-mono text-xs uppercase tracking-[0.2em] text-slate-300">
        {getPriorityText(protocol.priority)}
      </span>
    </Link>
  )
}

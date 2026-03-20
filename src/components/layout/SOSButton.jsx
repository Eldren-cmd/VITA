import { STRONG_GLARE_CLASS } from '@/constants/design'
import useEmergencyCall from '@/hooks/useEmergencyCall'

export default function SOSButton() {
  const { emergencyHref, emergencyNumber } = useEmergencyCall()

  return (
    <a
      href={emergencyHref}
      aria-label={`SOS call ${emergencyNumber}`}
      title={`Call ${emergencyNumber}`}
      className={[
        'fixed',
        'right-4',
        'top-4',
        'z-50',
        'min-h-touch-icon',
        'min-w-[48px]',
        'rounded-full',
        'bg-vita-red',
        'px-4',
        'py-3',
        'font-mono',
        'text-sm',
        'font-bold',
        'uppercase',
        'tracking-[0.3em]',
        'text-white',
        STRONG_GLARE_CLASS,
      ].join(' ')}
    >
      SOS
    </a>
  )
}

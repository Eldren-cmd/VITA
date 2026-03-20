import emergencyNumbers from '@/data/emergency-numbers.json'
import useVault from '@/hooks/useVault'

const COUNTRY_ALIASES = {
  UK: 'GB',
  UNITEDKINGDOM: 'GB',
  GREATBRITAIN: 'GB',
  BRITAIN: 'GB',
  USA: 'US',
  UNITEDSTATES: 'US',
  UNITEDSTATESOFAMERICA: 'US',
  NIGERIA: 'NG',
  GHANA: 'GH',
  KENYA: 'KE',
  SOUTHAFRICA: 'ZA',
  EUROPEANUNION: 'EU',
}

function compactText(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
}

function sanitizePhoneNumber(value) {
  const rawValue = String(value || '').trim()

  if (!rawValue) {
    return ''
  }

  const hasLeadingPlus = rawValue.startsWith('+')
  const digitsOnly = rawValue.replace(/\D/g, '')

  if (!digitsOnly) {
    return ''
  }

  return hasLeadingPlus ? `+${digitsOnly}` : digitsOnly
}

function resolveCountryCode(country) {
  const normalized = compactText(country)

  if (!normalized) {
    return 'NG'
  }

  if (emergencyNumbers[normalized]) {
    return normalized
  }

  if (COUNTRY_ALIASES[normalized]) {
    return COUNTRY_ALIASES[normalized]
  }

  const matchedEntry = Object.entries(emergencyNumbers).find(([, entry]) => compactText(entry.country) === normalized)

  return matchedEntry?.[0] || 'UNKNOWN'
}

export default function useEmergencyCall() {
  const { settings } = useVault()
  const countryCode = resolveCountryCode(settings?.country)
  const countryEntry = emergencyNumbers[countryCode] || emergencyNumbers.UNKNOWN
  const primaryEmergency = countryEntry?.numbers?.find((entry) => sanitizePhoneNumber(entry.number)) || null
  const emergencyNumber = sanitizePhoneNumber(primaryEmergency?.number) || '112'

  return {
    countryCode,
    countryName: countryEntry?.country || 'Unknown',
    emergencyNumber,
    emergencyLabel: primaryEmergency?.label || 'Emergency',
    emergencyHref: `tel:${emergencyNumber}`,
  }
}

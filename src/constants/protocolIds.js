export const HARD_CODED_PROTOCOL_IDS = [
  'cpr-adult',
  'cpr-child',
  'cpr-infant',
  'choking-adult',
  'choking-infant',
  'anaphylaxis',
  'generic-lifesupport',
]

export const STANDARD_PROTOCOL_IDS = [
  'bleeding',
  'heart-attack',
  'stroke',
  'seizure',
  'unconscious',
  'burns',
  'fracture',
  'poisoning',
]

export const ALL_PROTOCOL_IDS = [...HARD_CODED_PROTOCOL_IDS, ...STANDARD_PROTOCOL_IDS]

export const FALLBACK_PROTOCOL_ID = 'generic-lifesupport'
export const EMERGENCY_ROUTE_PREFIX = '/app/emergency'
export const PRACTICE_ROUTE_PREFIX = '/app/practice'

export function isValidProtocolId(protocolId) {
  return ALL_PROTOCOL_IDS.includes(protocolId)
}

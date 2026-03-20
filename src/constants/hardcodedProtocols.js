import anaphylaxis from '@/data/protocols/en/anaphylaxis.json'
import bleeding from '@/data/protocols/en/bleeding.json'
import burns from '@/data/protocols/en/burns.json'
import chokingAdult from '@/data/protocols/en/choking-adult.json'
import chokingInfant from '@/data/protocols/en/choking-infant.json'
import cprAdult from '@/data/protocols/en/cpr-adult.json'
import cprChild from '@/data/protocols/en/cpr-child.json'
import cprInfant from '@/data/protocols/en/cpr-infant.json'
import fracture from '@/data/protocols/en/fracture.json'
import genericLifeSupport from '@/data/protocols/en/generic-lifesupport.json'
import heartAttack from '@/data/protocols/en/heart-attack.json'
import poisoning from '@/data/protocols/en/poisoning.json'
import seizure from '@/data/protocols/en/seizure.json'
import stroke from '@/data/protocols/en/stroke.json'
import unconscious from '@/data/protocols/en/unconscious.json'

function cloneProtocol(protocol) {
  if (!protocol) {
    return null
  }

  return JSON.parse(JSON.stringify(protocol))
}

function buildLocaleMeta(protocol, language) {
  const requestedLanguage = language || 'en'
  const availableLocales = protocol?.governance?.availableLocales || ['en']
  const resolvedLanguage = availableLocales.includes(requestedLanguage) ? requestedLanguage : 'en'

  return {
    requestedLanguage,
    resolvedLanguage,
    fallbackUsed: requestedLanguage !== resolvedLanguage,
  }
}

export const HARDCODED_PROTOCOLS = Object.freeze({
  'cpr-adult': cprAdult,
  'cpr-child': cprChild,
  'cpr-infant': cprInfant,
  'choking-adult': chokingAdult,
  'choking-infant': chokingInfant,
  anaphylaxis,
  'generic-lifesupport': genericLifeSupport,
})

export const STANDARD_PROTOCOLS = Object.freeze({
  bleeding,
  'heart-attack': heartAttack,
  stroke,
  seizure,
  unconscious,
  burns,
  fracture,
  poisoning,
})

export const PROTOCOL_LIBRARY = Object.freeze({
  ...HARDCODED_PROTOCOLS,
  ...STANDARD_PROTOCOLS,
})

export function loadProtocol(protocolId, language = 'en') {
  const protocol = cloneProtocol(PROTOCOL_LIBRARY[protocolId] || null)

  if (!protocol) {
    return null
  }

  protocol.localeMeta = buildLocaleMeta(protocol, language)
  return protocol
}

const en = require('@/i18n/locales/en.json')

const VERIFIED_LANGUAGES = ['en']
const LOCALES = {
  en,
}

let currentLanguage = 'en'

function getPathValue(target, path) {
  return path.split('.').reduce((value, segment) => {
    if (!value || typeof value !== 'object') {
      return undefined
    }

    return value[segment]
  }, target)
}

function getRequestedLanguage() {
  if (typeof window === 'undefined') {
    return 'en'
  }

  const storedLanguage = window.localStorage?.getItem?.('vita_language')

  if (storedLanguage) {
    return storedLanguage
  }

  return window.navigator?.language?.split?.('-')?.[0] || 'en'
}

function resolveLanguage(language) {
  return VERIFIED_LANGUAGES.includes(language) ? language : 'en'
}

function detectLanguage() {
  const requestedLanguage = getRequestedLanguage()
  const resolvedLanguage = resolveLanguage(requestedLanguage)

  return {
    requestedLanguage,
    resolvedLanguage,
    fallbackUsed: requestedLanguage !== resolvedLanguage,
  }
}

function changeLanguage(nextLanguage) {
  currentLanguage = resolveLanguage(nextLanguage)
  return currentLanguage
}

function getLanguage() {
  return currentLanguage
}

function t(key, fallback = key) {
  const locale = LOCALES[getLanguage()] || LOCALES.en
  return getPathValue(locale, key) || fallback
}

const api = {
  VERIFIED_LANGUAGES,
  detectLanguage,
  resolveLanguage,
  changeLanguage,
  getLanguage,
  t,
}

if (typeof window !== 'undefined') {
  window.__vitaI18n = api
}

module.exports = api
module.exports.default = api

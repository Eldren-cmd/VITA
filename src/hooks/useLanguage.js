import { useEffect, useState } from 'react'

const VERIFIED_LANGUAGES = ['en']

function resolveLanguage() {
  if (typeof window === 'undefined') {
    return 'en'
  }

  const storedLanguage = window.localStorage.getItem('vita_language')

  if (VERIFIED_LANGUAGES.includes(storedLanguage)) {
    return storedLanguage
  }

  const navigatorLanguage = window.navigator.language?.split('-')[0] || 'en'

  if (VERIFIED_LANGUAGES.includes(navigatorLanguage)) {
    return navigatorLanguage
  }

  return 'en'
}

export default function useLanguage() {
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    setLanguage(resolveLanguage())
  }, [])

  const changeLanguage = (nextLanguage) => {
    if (!VERIFIED_LANGUAGES.includes(nextLanguage)) {
      return
    }

    setLanguage(nextLanguage)

    if (typeof window === 'undefined') {
      return
    }

    try {
      window.localStorage.setItem('vita_language', nextLanguage)
      window.__vitaI18n?.changeLanguage?.(nextLanguage)
    } catch (_error) {
      // Silent fail by contract.
    }
  }

  return {
    language,
    changeLanguage,
    verifiedLanguages: VERIFIED_LANGUAGES,
  }
}

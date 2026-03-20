import { useEffect, useState } from 'react'

import i18n from '@/i18n'

export default function useLanguage() {
  const [requestedLanguage, setRequestedLanguage] = useState('en')
  const [language, setLanguage] = useState('en')
  const [fallbackUsed, setFallbackUsed] = useState(false)

  useEffect(() => {
    const syncFromDetection = () => {
      const detected = i18n.detectLanguage()

      i18n.changeLanguage(detected.resolvedLanguage)
      setRequestedLanguage(detected.requestedLanguage)
      setLanguage(detected.resolvedLanguage)
      setFallbackUsed(detected.fallbackUsed)
    }

    syncFromDetection()

    if (typeof window === 'undefined') {
      return undefined
    }

    const handleLanguageChanged = (event) => {
      const detail = event.detail || {}
      i18n.changeLanguage(detail.resolvedLanguage || 'en')
      setRequestedLanguage(detail.requestedLanguage || detail.resolvedLanguage || 'en')
      setLanguage(detail.resolvedLanguage || 'en')
      setFallbackUsed(Boolean(detail.fallbackUsed))
    }

    window.addEventListener('vita-language-changed', handleLanguageChanged)
    window.addEventListener('storage', syncFromDetection)

    return () => {
      window.removeEventListener('vita-language-changed', handleLanguageChanged)
      window.removeEventListener('storage', syncFromDetection)
    }
  }, [])

  const changeLanguage = (nextLanguage) => {
    const resolvedLanguage = i18n.resolveLanguage(nextLanguage)
    const nextFallbackUsed = nextLanguage !== resolvedLanguage

    i18n.changeLanguage(resolvedLanguage)
    setRequestedLanguage(nextLanguage)
    setLanguage(resolvedLanguage)
    setFallbackUsed(nextFallbackUsed)

    if (typeof window === 'undefined') {
      return
    }

    try {
      window.localStorage.setItem('vita_language', resolvedLanguage)
      window.__vitaI18n = i18n
      window.dispatchEvent(
        new CustomEvent('vita-language-changed', {
          detail: {
            requestedLanguage: nextLanguage,
            resolvedLanguage,
            fallbackUsed: nextFallbackUsed,
          },
        })
      )
    } catch (_error) {
      // Silent fail by contract.
    }
  }

  return {
    language,
    requestedLanguage,
    fallbackUsed,
    changeLanguage,
    verifiedLanguages: i18n.VERIFIED_LANGUAGES,
  }
}

import { useEffect } from 'react'

export default function useVoice(language = 'en') {
  const speak = (text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) {
      return
    }

    try {
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language
      utterance.rate = 0.85
      utterance.volume = 1

      window.speechSynthesis.speak(utterance)
    } catch (_error) {
      // Silent fail by contract.
    }
  }

  const cancel = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return
    }

    try {
      window.speechSynthesis.cancel()
    } catch (_error) {
      // Silent fail by contract.
    }
  }

  useEffect(() => cancel, [])

  return {
    speak,
    cancel,
    supported: typeof window !== 'undefined' && 'speechSynthesis' in window,
  }
}

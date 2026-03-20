import { useEffect, useRef, useState } from 'react'

function detectPlatformState() {
  if (typeof window === 'undefined') {
    return {
      isInstalled: false,
      isIOS: false,
      isAndroid: false,
      isSafari: false,
    }
  }

  const userAgent = window.navigator.userAgent.toLowerCase()
  const isIOS = /iphone|ipad|ipod/.test(userAgent)
  const isAndroid = /android/.test(userAgent)
  const isSafari = /safari/.test(userAgent) && !/crios|fxios|edgios|chrome|android/.test(userAgent)
  const isInstalled =
    window.matchMedia?.('(display-mode: standalone)')?.matches || window.navigator.standalone === true

  return {
    isInstalled: Boolean(isInstalled),
    isIOS,
    isAndroid,
    isSafari,
  }
}

export default function useInstallPrompt() {
  const deferredPromptRef = useRef(null)
  const [platformState, setPlatformState] = useState(detectPlatformState)
  const [showInstructions, setShowInstructions] = useState(false)
  const [canPromptInstall, setCanPromptInstall] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const syncPlatformState = () => {
      setPlatformState(detectPlatformState())
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault()
      deferredPromptRef.current = event
      setCanPromptInstall(true)
      syncPlatformState()
    }

    const handleAppInstalled = () => {
      deferredPromptRef.current = null
      setCanPromptInstall(false)
      setShowInstructions(false)
      syncPlatformState()
    }

    syncPlatformState()

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    const mediaQuery = window.matchMedia?.('(display-mode: standalone)')
    mediaQuery?.addEventListener?.('change', syncPlatformState)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      mediaQuery?.removeEventListener?.('change', syncPlatformState)
    }
  }, [])

  const promptInstall = async () => {
    if (deferredPromptRef.current && !platformState.isInstalled) {
      const promptEvent = deferredPromptRef.current

      try {
        await promptEvent.prompt()
        await promptEvent.userChoice
      } catch (_error) {
        // Silent fail by contract.
      }

      deferredPromptRef.current = null
      setCanPromptInstall(false)
      setPlatformState(detectPlatformState())
      return
    }

    setShowInstructions(true)
  }

  const openInstructions = () => setShowInstructions(true)
  const closeInstructions = () => setShowInstructions(false)

  return {
    ...platformState,
    canPromptInstall,
    showInstructions,
    promptInstall,
    openInstructions,
    closeInstructions,
  }
}

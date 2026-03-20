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
  const installTimeoutRef = useRef(null)
  const [platformState, setPlatformState] = useState(detectPlatformState)
  const [showInstructions, setShowInstructions] = useState(false)
  const [canPromptInstall, setCanPromptInstall] = useState(false)
  const [installState, setInstallState] = useState('idle')

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
      setInstallState('ready')
      syncPlatformState()
    }

    const handleAppInstalled = () => {
      window.clearTimeout(installTimeoutRef.current)
      deferredPromptRef.current = null
      setCanPromptInstall(false)
      setShowInstructions(false)
      setInstallState('installed')
      syncPlatformState()
    }

    syncPlatformState()

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    const mediaQuery = window.matchMedia?.('(display-mode: standalone)')
    mediaQuery?.addEventListener?.('change', syncPlatformState)

    return () => {
      window.clearTimeout(installTimeoutRef.current)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      mediaQuery?.removeEventListener?.('change', syncPlatformState)
    }
  }, [])

  const promptInstall = async () => {
    if (deferredPromptRef.current && !platformState.isInstalled) {
      const promptEvent = deferredPromptRef.current
      setInstallState('prompting')

      try {
        await promptEvent.prompt()
        const choice = await promptEvent.userChoice

        if (choice?.outcome === 'accepted') {
          setInstallState('pending')
          installTimeoutRef.current = window.setTimeout(() => {
            const nextState = detectPlatformState()

            if (!nextState.isInstalled) {
              setPlatformState(nextState)
              setInstallState('stalled')
              setShowInstructions(true)
            }
          }, 15000)
        } else {
          setInstallState('dismissed')
        }
      } catch (_error) {
        setInstallState('error')
        setShowInstructions(true)
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
    installState,
    showInstructions,
    promptInstall,
    openInstructions,
    closeInstructions,
  }
}

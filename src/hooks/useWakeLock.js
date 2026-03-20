import { useEffect } from 'react'

export default function useWakeLock(active) {
  useEffect(() => {
    if (!active || typeof navigator === 'undefined' || !navigator.wakeLock?.request) {
      return undefined
    }

    let released = false
    let wakeLock = null

    const requestLock = async () => {
      if (released) {
        return
      }

      try {
        wakeLock = await navigator.wakeLock.request('screen')
      } catch (_error) {
        // Silent fail by contract.
      }
    }

    const releaseLock = async () => {
      if (!wakeLock) {
        return
      }

      try {
        await wakeLock.release()
      } catch (_error) {
        // Silent fail by contract.
      }

      wakeLock = null
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestLock()
      }
    }

    requestLock()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      released = true
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      releaseLock()
    }
  }, [active])
}

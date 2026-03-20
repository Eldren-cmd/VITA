import { useEffect, useState } from 'react'

export default function useWakeLock(active) {
  const [status, setStatus] = useState(active ? 'requesting' : 'inactive')

  useEffect(() => {
    if (!active) {
      setStatus('inactive')
      return undefined
    }

    if (typeof navigator === 'undefined' || !navigator.wakeLock?.request) {
      setStatus('unsupported')
      return undefined
    }

    let released = false
    let wakeLock = null
    setStatus('requesting')

    const requestLock = async () => {
      if (released) {
        return
      }

      try {
        wakeLock = await navigator.wakeLock.request('screen')
        wakeLock.addEventListener('release', handleWakeLockRelease)
        setStatus('active')
      } catch (_error) {
        setStatus('denied')
      }
    }

    const handleWakeLockRelease = () => {
      if (released) {
        return
      }

      wakeLock = null

      if (document.visibilityState === 'visible') {
        setStatus('requesting')
        requestLock()
        return
      }

      setStatus('inactive')
    }

    const releaseLock = async () => {
      if (!wakeLock) {
        return
      }

      try {
        wakeLock.removeEventListener('release', handleWakeLockRelease)
        await wakeLock.release()
      } catch (_error) {
        // Silent fail by contract.
      }

      wakeLock = null
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setStatus('requesting')
        requestLock()
      } else if (wakeLock) {
        setStatus('inactive')
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

  return status
}

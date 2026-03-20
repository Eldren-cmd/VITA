import { useEffect, useState } from 'react'

const CURRENT_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0'

function buildPendingUpdate(version, criticalUpdate) {
  return JSON.stringify({
    version,
    criticalUpdate: Boolean(criticalUpdate),
    detectedAt: Date.now(),
  })
}

export default function useVersionCheck() {
  const [updateInfo, setUpdateInfo] = useState(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.navigator.onLine) {
      return undefined
    }

    const processUpdate = (payload) => {
      const version = payload?.version
      const criticalUpdate = Boolean(payload?.criticalUpdate)

      if (!version || version === CURRENT_VERSION) {
        return
      }

      if (window.sessionStorage.getItem('vita_active_session')) {
        window.localStorage.setItem(
          'vita_pending_critical_update',
          buildPendingUpdate(version, criticalUpdate)
        )
        return
      }

      if (criticalUpdate) {
        const shouldRefresh = window.confirm(
          `Critical update ${version} is available. Refresh now?`
        )

        if (shouldRefresh) {
          window.location.reload()
          return
        }
      }

      setUpdateInfo({
        version,
        criticalUpdate,
      })
    }

    const handleMessage = (event) => {
      if (event.data?.type === 'UPDATE_AVAILABLE') {
        processUpdate(event.data)
      }
    }

    const checkDirectly = async () => {
      try {
        const response = await window.fetch('/latest-version.json', {
          cache: 'no-store',
        })

        if (!response.ok) {
          return
        }

        const payload = await response.json()
        processUpdate(payload)
      } catch (_error) {
        // Silent fail by contract.
      }
    }

    window.navigator.serviceWorker?.addEventListener?.('message', handleMessage)

    if (window.navigator.serviceWorker?.controller) {
      window.navigator.serviceWorker.controller.postMessage({
        type: 'CHECK_VERSION',
      })
    } else {
      checkDirectly()
    }

    return () => {
      window.navigator.serviceWorker?.removeEventListener?.('message', handleMessage)
    }
  }, [])

  return updateInfo
}

import { useEffect, useRef, useState } from 'react'

import { loadProtocol } from '@/constants/hardcodedProtocols'
import VITAEngine from '@/engine/VITAEngine'

export default function useVITA(protocolId, language, options = {}) {
  const engineRef = useRef(null)
  const resumeTimeoutRef = useRef(null)
  const [currentNode, setCurrentNode] = useState(null)
  const [severity, setSeverity] = useState('medium')
  const [resumed, setResumed] = useState(false)
  const [showResumeBanner, setShowResumeBanner] = useState(false)
  const [showDeferredCallAlert, setShowDeferredCallAlert] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !protocolId) {
      return undefined
    }

    const protocol = loadProtocol(protocolId, language)

    if (!protocol) {
      setError(`Unknown protocol: ${protocolId}`)
      setCurrentNode(null)
      return undefined
    }

    const engine = new VITAEngine(protocol, language, {
      practiceMode: options.practiceMode,
      onDeferredCall: () => setShowDeferredCallAlert(true),
    })

    engine.onDeferredCall = () => setShowDeferredCallAlert(true)
    engineRef.current = engine
    setError(null)
    setCurrentNode(engine.getCurrentNode())
    setSeverity(engine.currentSeverity || protocol.priority || 'medium')
    setResumed(Boolean(engine.resumed))

    if (engine.resumed) {
      setShowResumeBanner(true)

      if (resumeTimeoutRef.current) {
        window.clearTimeout(resumeTimeoutRef.current)
      }

      resumeTimeoutRef.current = window.setTimeout(() => {
        setShowResumeBanner(false)
      }, 2000)
    } else {
      setShowResumeBanner(false)
    }

    return () => {
      if (resumeTimeoutRef.current) {
        window.clearTimeout(resumeTimeoutRef.current)
      }

      if (engineRef.current?.deferredCallTimer) {
        window.clearTimeout(engineRef.current.deferredCallTimer)
      }
    }
  }, [protocolId, language, options.practiceMode])

  const syncNodeState = (nextNode) => {
    const engine = engineRef.current

    if (!engine) {
      return null
    }

    setCurrentNode(nextNode)
    setSeverity(engine.currentSeverity || engine.protocol?.priority || 'medium')
    return nextNode
  }

  const advance = (optionIndex = 0) => {
    if (!engineRef.current) {
      return null
    }

    return syncNodeState(engineRef.current.advance(optionIndex))
  }

  const goBack = () => {
    if (!engineRef.current) {
      return null
    }

    return syncNodeState(engineRef.current.goBack())
  }

  const terminate = () => {
    engineRef.current?.terminate()
  }

  const getReport = () => {
    return engineRef.current?.getReport() || null
  }

  return {
    currentNode,
    severity,
    advance,
    goBack,
    getReport,
    terminate,
    resumed,
    showDeferredCallAlert,
    showResumeBanner,
    dismissDeferredCallAlert: () => setShowDeferredCallAlert(false),
    error,
  }
}

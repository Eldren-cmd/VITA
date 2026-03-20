import { useEffect, useRef, useState } from 'react'

import useVoice from '@/hooks/useVoice'

function formatVoiceText(voiceText, remaining) {
  if (!voiceText) {
    return `${remaining} seconds remaining.`
  }

  return voiceText.replace('{remaining}', String(remaining))
}

export default function useTimer({
  duration,
  voiceInterval,
  onComplete,
  autoStart = true,
  voiceEnabled = true,
  language = 'en',
  voiceText,
}) {
  const { speak } = useVoice(language)
  const [remaining, setRemaining] = useState(duration)
  const [isRunning, setIsRunning] = useState(autoStart)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    setRemaining(duration)
    setIsRunning(autoStart)
  }, [duration, autoStart])

  useEffect(() => {
    if (!isRunning || typeof window === 'undefined') {
      return undefined
    }

    const timerId = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(timerId)
          setIsRunning(false)
          onCompleteRef.current?.()
          return 0
        }

        const next = current - 1

        if (voiceEnabled && voiceInterval && next > 0 && next % voiceInterval === 0) {
          speak(formatVoiceText(voiceText, next))
        }

        return next
      })
    }, 1000)

    return () => {
      window.clearInterval(timerId)
    }
  }, [isRunning, voiceEnabled, voiceInterval, speak, voiceText])

  const start = () => {
    setIsRunning(true)
  }

  const stop = () => {
    setIsRunning(false)
  }

  const reset = () => {
    setRemaining(duration)
    setIsRunning(autoStart)
  }

  return {
    remaining,
    isRunning,
    start,
    stop,
    reset,
  }
}

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import FlowScreen from '@/components/flow/FlowScreen'

export default function PracticeFlowPage() {
  const router = useRouter()
  const { type } = router.query
  const [allowPractice, setAllowPractice] = useState(false)

  useEffect(() => {
    if (!router.isReady || typeof window === 'undefined' || typeof type !== 'string') {
      return
    }

    if (window.sessionStorage.getItem('vita_active_session')) {
      router.replace(`/app/emergency/${type}`)
      return
    }

    setAllowPractice(true)
  }, [router, type])

  if (!router.isReady || typeof type !== 'string' || !allowPractice) {
    return null
  }

  return <FlowScreen protocolId={type} practiceMode={true} />
}

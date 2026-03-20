import { useRouter } from 'next/router'

import FlowScreen from '@/components/flow/FlowScreen'
import { isValidProtocolId } from '@/constants/protocolIds'

export default function EmergencyFlowPage() {
  const router = useRouter()
  const { type } = router.query

  if (!router.isReady || typeof type !== 'string') {
    return null
  }

  if (!isValidProtocolId(type)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg-base p-6 text-center text-white">
        <div className="max-w-md rounded-3xl border border-vita-red/30 bg-bg-critical p-6">
          <p className="font-mono text-sm uppercase tracking-[0.2em] text-vita-amber">Unknown protocol</p>
          <p className="mt-3 text-lg">This emergency flow does not exist.</p>
        </div>
      </main>
    )
  }

  return <FlowScreen protocolId={type} practiceMode={false} />
}

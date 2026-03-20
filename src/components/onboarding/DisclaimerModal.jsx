import disclaimer from '@/data/disclaimer.json'
import { FLOW_BODY_CLASS, FLOW_HEADLINE_CLASS, PRIMARY_BUTTON_CLASS } from '@/constants/design'

export default function DisclaimerModal({ onAccept }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base px-4 py-6">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-bg-medium p-6 shadow-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-vita-amber">Mandatory disclaimer</p>
        <h1 className={`${FLOW_HEADLINE_CLASS} mt-4`}>{disclaimer.headline}</h1>
        <p className={`${FLOW_BODY_CLASS} mt-5`}>{disclaimer.body}</p>
        <div className="mt-8">
          <button type="button" className={PRIMARY_BUTTON_CLASS} onClick={onAccept}>
            {disclaimer.acceptLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

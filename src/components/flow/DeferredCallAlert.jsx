import { PRIMARY_BUTTON_CLASS } from '@/constants/design'

export default function DeferredCallAlert({ open, onDismiss }) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 rounded-3xl border border-vita-amber/30 bg-bg-high p-5 shadow-2xl">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-vita-amber">Reminder</p>
      <h2 className="mt-2 text-2xl font-bold text-white">Call emergency services now.</h2>
      <p className="mt-3 text-base text-white/90">
        The deferred call reminder has fired. Get help on the line and continue care immediately.
      </p>
      <div className="mt-5">
        <button type="button" className={PRIMARY_BUTTON_CLASS} onClick={onDismiss}>
          I understand
        </button>
      </div>
    </div>
  )
}

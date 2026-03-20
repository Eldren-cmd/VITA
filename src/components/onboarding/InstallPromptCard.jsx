import Link from 'next/link'

import { FLOW_BODY_CLASS, PRIMARY_BUTTON_CLASS, SECONDARY_BUTTON_CLASS } from '@/constants/design'
import useInstallPrompt from '@/hooks/useInstallPrompt'

function InstructionModal({ open, onClose, isIOS, isAndroid, isSafari, installState }) {
  if (!open) {
    return null
  }

  let steps = [
    'Open your browser menu.',
    'Choose Install app or Add to Home Screen.',
    'Confirm the install, then reopen VITA from your home screen.',
  ]

  if (isIOS && isSafari) {
    steps = [
      'Tap the Share button in Safari.',
      'Scroll down and tap Add to Home Screen.',
      'Confirm VITA, then open it from your home screen.',
    ]
  } else if (isAndroid) {
    steps = [
      'Tap the browser menu in Chrome.',
      'Choose Install app or Add to Home screen.',
      'Confirm the install, then launch VITA from the home screen icon.',
    ]
  }

  const showAndroidRecovery = isAndroid && installState === 'stalled'

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/65 p-4 sm:items-center sm:justify-center">
      <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-bg-base p-6 text-white shadow-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-vita-amber">Install VITA</p>
        <h3 className="mt-3 text-2xl font-bold text-white">Add VITA to your home screen.</h3>
        <p className={`${FLOW_BODY_CLASS} mt-4`}>
          Use these steps if your browser does not show the install sheet automatically.
        </p>

        <ol className="mt-6 space-y-3 text-base text-white/85">
          {steps.map((step, index) => (
            <li key={step} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <span className="font-mono text-vita-amber">{index + 1}. </span>
              {step}
            </li>
          ))}
        </ol>

        {showAndroidRecovery ? (
          <div className="mt-4 rounded-2xl border border-vita-amber/30 bg-vita-amber/15 px-4 py-3 text-sm text-vita-amber">
            If Chrome stays on <strong>Installing VITA</strong>, cancel the install sheet, remove any old VITA
            home-screen app, close Chrome, reopen the site, then use the Chrome menu and choose
            <strong> Install app</strong> again.
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <button type="button" className={PRIMARY_BUTTON_CLASS} onClick={onClose}>
            Close
          </button>
          <Link href="/app" className={SECONDARY_BUTTON_CLASS} onClick={onClose}>
            Open app
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function InstallPromptCard({ compact = false }) {
  const {
    isInstalled,
    isIOS,
    isAndroid,
    isSafari,
    canPromptInstall,
    installState,
    showInstructions,
    promptInstall,
    openInstructions,
    closeInstructions,
  } = useInstallPrompt()

  if (isInstalled) {
    return (
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 text-white">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-vita-amber">Installed</p>
        <p className="mt-3 text-lg font-bold">VITA is already installed on this device.</p>
      </section>
    )
  }

  return (
    <>
      <section
        className={[
          'rounded-[2rem]',
          'border',
          'border-white/10',
          compact ? 'bg-white/5 p-4' : 'bg-black/10 p-6',
          'text-white',
        ].join(' ')}
      >
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-vita-amber">Install VITA</p>
        <h3 className="mt-3 text-2xl font-bold text-white">Keep the emergency flow one tap away.</h3>
        <p className={`${FLOW_BODY_CLASS} mt-3`}>
          {installState === 'pending'
            ? 'Chrome accepted the install. Give it a moment to finish adding VITA to your device.'
            : installState === 'stalled'
              ? 'The install looks stuck. VITA now shows recovery steps for Android instead of leaving you hanging.'
              : canPromptInstall
                ? 'This device can show the install sheet directly from VITA.'
                : 'If the browser does not offer a direct prompt, VITA will show the exact install steps for this device.'}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            className={PRIMARY_BUTTON_CLASS}
            onClick={installState === 'pending' ? openInstructions : promptInstall}
          >
            {installState === 'pending'
              ? 'Installing...'
              : installState === 'stalled'
                ? 'Show recovery steps'
                : canPromptInstall
                  ? 'Install VITA now'
                  : 'Show install steps'}
          </button>
          <button type="button" className={SECONDARY_BUTTON_CLASS} onClick={openInstructions}>
            {installState === 'stalled' ? 'Manual recovery help' : 'Manual install help'}
          </button>
        </div>
      </section>

      <InstructionModal
        open={showInstructions}
        onClose={closeInstructions}
        isIOS={isIOS}
        isAndroid={isAndroid}
        isSafari={isSafari}
        installState={installState}
      />
    </>
  )
}

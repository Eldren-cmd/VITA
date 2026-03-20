import Link from 'next/link'

import { PRIMARY_BUTTON_CLASS } from '@/constants/design'

export default function InstallCTA() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-[2.5rem] border border-vita-red/40 bg-vita-red px-6 py-12 text-white shadow-[0_25px_80px_rgba(196,30,58,0.32)]">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/75">Install before you need it</p>
          <h2 className="mt-4 font-serif text-[clamp(2.2rem,5vw,3.2rem)]">
            Put VITA on the phone you actually carry.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/85">
            Open the app, then use your browser&apos;s install or Add to Home Screen action so the emergency flow is already one tap away.
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/app" className={`${PRIMARY_BUTTON_CLASS} max-w-[260px] bg-black/20`}>
              Open App
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

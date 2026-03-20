import Link from 'next/link'

import { PRIMARY_BUTTON_CLASS } from '@/constants/design'

export default function LandingNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-landing-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-vita-amber">VITA</p>
          <p className="mt-1 text-sm text-white/75">Emergency First Aid</p>
        </div>

        <Link href="/app" className={`${PRIMARY_BUTTON_CLASS} max-w-[220px]`}>
          Open App
        </Link>
      </div>
    </header>
  )
}

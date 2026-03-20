import Link from 'next/link'

import { STRONG_GLARE_CLASS } from '@/constants/design'

const NAV_CTA_CLASS = [
  'relative',
  'inline-flex',
  'min-h-[3.5rem]',
  'shrink-0',
  'items-center',
  'justify-center',
  'rounded-2xl',
  'bg-vita-red',
  'px-4',
  'py-3',
  'text-center',
  'text-base',
  'font-bold',
  'text-white',
  'touch-manipulation',
  STRONG_GLARE_CLASS,
  'sm:min-h-touch',
  'sm:min-w-[220px]',
  'sm:px-5',
  'sm:py-4',
].join(' ')

export default function LandingNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-landing-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4 lg:px-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-vita-amber">VITA</p>
          <p className="mt-1 text-sm text-white/75">Emergency First Aid</p>
        </div>

        <Link href="/app" className={NAV_CTA_CLASS}>
          Open App
        </Link>
      </div>
    </header>
  )
}

import Link from 'next/link'

import { PRIMARY_BUTTON_CLASS, SECONDARY_BUTTON_CLASS } from '@/constants/design'

const TRIAGE_CARDS = [
  'Bleeding',
  'Choking',
  'Chest Pain',
  'Face/Speech/Arm',
  'Allergic Reaction',
  'Not Sure',
]

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,112,10,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(196,30,58,0.22),transparent_34%)]" />

      <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-6">
          <p className="font-mono text-sm uppercase tracking-[0.3em] text-vita-amber">Offline-first emergency guidance</p>
          <h1 className="max-w-3xl font-serif text-[clamp(3rem,8vw,4rem)] leading-none text-white">
            When every second counts, VITA works.
          </h1>
          <p className="max-w-2xl text-[clamp(1rem,3vw,1.35rem)] leading-relaxed text-white/85">
            VITA is built for high-stress moments: clear routing, fast offline access, and medically sourced first-aid flows that keep the next safe step obvious.
          </p>

          <div className="grid gap-4 sm:flex sm:flex-wrap">
            <Link href="/app" className={`${PRIMARY_BUTTON_CLASS} sm:max-w-[240px]`}>
              Open App
            </Link>
            <a href="#metronome-demo" className={`${SECONDARY_BUTTON_CLASS} sm:max-w-[240px]`}>
              Try the metronome demo
            </a>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[380px] rounded-[2.5rem] border border-white/10 bg-[#090B13] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
          <div className="rounded-[2rem] border border-white/10 bg-bg-base p-4">
            <div className="rounded-2xl border border-vita-amber/25 bg-vita-amber/10 px-4 py-3">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-vita-amber">Universal triage</p>
              <p className="mt-2 text-2xl font-bold text-white">What do you see first?</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              {TRIAGE_CARDS.map((card) => (
                <div
                  key={card}
                  className="min-h-[88px] rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-base font-bold text-white"
                >
                  {card}
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-base font-bold text-white">
              OTHER EMERGENCY DOWN
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

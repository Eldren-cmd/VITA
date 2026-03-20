const STEPS = [
  {
    headline: 'Start with triage.',
    body: 'If you are unsure what is happening, VITA routes you through the fastest safe gate first.',
  },
  {
    headline: 'Follow one next action.',
    body: 'Each screen strips the response down to the next clear step, with no extra navigation noise.',
  },
  {
    headline: 'Keep moving while help comes.',
    body: 'Offline-first guidance, metronome pacing, and emergency call prompts stay available when the network does not.',
  },
]

export default function HowItWorks() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-vita-amber">How it works</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-3">
          {STEPS.map((step, index) => (
            <article key={step.headline} className="rounded-[2rem] border border-white/10 bg-bg-base/70 p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-vita-red text-2xl font-bold text-white">
                {index + 1}
              </div>
              <h2 className="mt-6 text-2xl font-bold text-white">{step.headline}</h2>
              <p className="mt-4 text-lg leading-relaxed text-white/80">{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

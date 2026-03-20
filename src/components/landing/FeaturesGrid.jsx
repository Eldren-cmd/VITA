const FEATURES = [
  'Offline-first protocol access',
  'Universal triage before treatment',
  'Voice, vibration, and visual pacing',
  'Practice mode for repetition',
  'Local-only Medical ID vault',
  'Incident reports saved on device',
]

export default function FeaturesGrid() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-vita-amber">What it includes</p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <article key={feature} className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <p className="text-xl font-bold text-white">{feature}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

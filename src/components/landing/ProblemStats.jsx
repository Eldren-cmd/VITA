const STATS = [
  {
    value: '73.4%',
    label: 'cardiac arrests at home',
    source: 'AHA 2023 Statistics Update, DOI:...001123 (2021 CARES data)',
  },
  {
    value: '4-6 min',
    label: 'before permanent brain damage without CPR',
    source: 'AHA 2025 Adult BLS Guidelines, DOI:...001369',
  },
  {
    value: '40.2%',
    label: 'bystander CPR rate',
    source: 'AHA 2023 Statistics Update, DOI:...001123',
  },
]

export default function ProblemStats() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-vita-amber">Why speed matters</p>
          <h2 className="mt-3 font-serif text-[clamp(2.2rem,5vw,3rem)] text-white">
            The gap between a witness and a responder is where VITA helps.
          </h2>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {STATS.map((stat) => (
            <article key={stat.value} className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <p className="font-mono text-[clamp(2.5rem,8vw,3.5rem)] font-bold text-vita-amber">{stat.value}</p>
              <p className="mt-4 text-xl font-bold text-white">{stat.label}</p>
              <p className="mt-5 font-mono text-xs uppercase tracking-[0.12em] text-slate-300">{stat.source}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

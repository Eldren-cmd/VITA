const ITEMS = ['Open Source', 'AHA + Red Cross', 'Free Forever']

export default function TrustSection() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-vita-amber">Trust signals</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {ITEMS.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/10 px-5 py-6 text-center text-xl font-bold text-white">
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

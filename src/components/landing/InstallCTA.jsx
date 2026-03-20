import InstallPromptCard from '@/components/onboarding/InstallPromptCard'

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
            Install VITA directly when the browser supports it, or follow the built-in home-screen steps for your device.
          </p>
          <div className="mt-8">
            <InstallPromptCard />
          </div>
        </div>
      </div>
    </section>
  )
}

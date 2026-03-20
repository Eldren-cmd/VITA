import Footer from '@/components/landing/Footer'
import FeaturesGrid from '@/components/landing/FeaturesGrid'
import Hero from '@/components/landing/Hero'
import HowItWorks from '@/components/landing/HowItWorks'
import InstallCTA from '@/components/landing/InstallCTA'
import LandingNav from '@/components/landing/LandingNav'
import MetronomeDemo from '@/components/landing/MetronomeDemo'
import ProblemStats from '@/components/landing/ProblemStats'
import TrustSection from '@/components/landing/TrustSection'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-landing-bg text-white">
      <LandingNav />
      <Hero />
      <ProblemStats />
      <HowItWorks />
      <MetronomeDemo />
      <FeaturesGrid />
      <TrustSection />
      <InstallCTA />
      <Footer />
    </main>
  )
}

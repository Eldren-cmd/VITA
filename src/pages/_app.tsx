import type { AppProps } from 'next/app'
import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'
import { DM_Serif_Display, IBM_Plex_Mono } from 'next/font/google'
import { useRouter } from 'next/router'

import { DESIGN_CSS_VARIABLES } from '@/constants/design'
import VaultEngine from '@/engine/VaultEngine'
import DisclaimerModal from '@/components/onboarding/DisclaimerModal'
import '@/styles/globals.css'

const serif = DM_Serif_Display({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-serif'
})

const mono = IBM_Plex_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-mono'
})

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const [disclaimerAccepted, setDisclaimerAccepted] = useState<boolean | null>(null)
  const isAppRoute = router.pathname.startsWith('/app')

  useEffect(() => {
    if (!isAppRoute || typeof window === 'undefined') {
      setDisclaimerAccepted(true)
      return
    }

    setDisclaimerAccepted(Boolean(window.localStorage.getItem('vita_disclaimer_accepted')))
  }, [isAppRoute, router.asPath])

  const handleAcceptDisclaimer = () => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem('vita_disclaimer_accepted', 'true')

    const vault = new VaultEngine()
    vault.acceptDisclaimer()
    setDisclaimerAccepted(true)
  }

  if (isAppRoute && disclaimerAccepted === false) {
    return (
      <main
        className={`${serif.variable} ${mono.variable} min-h-screen`}
        style={DESIGN_CSS_VARIABLES as CSSProperties}
      >
        <DisclaimerModal onAccept={handleAcceptDisclaimer} />
      </main>
    )
  }

  if (isAppRoute && disclaimerAccepted === null) {
    return <main className={`${serif.variable} ${mono.variable} min-h-screen bg-bg-base`} />
  }

  return (
    <main
      className={`${serif.variable} ${mono.variable} min-h-screen`}
      style={DESIGN_CSS_VARIABLES as CSSProperties}
    >
      <Component {...pageProps} />
    </main>
  )
}

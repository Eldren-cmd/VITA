import type { AppProps } from 'next/app'
import type { CSSProperties } from 'react'
import { DM_Serif_Display, IBM_Plex_Mono } from 'next/font/google'

import { DESIGN_CSS_VARIABLES } from '@/constants/design'
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
  return (
    <main
      className={`${serif.variable} ${mono.variable} min-h-screen`}
      style={DESIGN_CSS_VARIABLES as CSSProperties}
    >
      <Component {...pageProps} />
    </main>
  )
}

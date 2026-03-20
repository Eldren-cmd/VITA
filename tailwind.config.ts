import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'bg-base': '#0A0A0F',
        'bg-medium': '#1A1A2E',
        'bg-high': '#2D1B00',
        'bg-critical': '#1A0008',
        'bg-practice': '#1E293B',
        'vita-red': '#C41E3A',
        'vita-amber': '#D4700A',
        'vita-green': '#166534',
        'landing-bg': '#0F172A',
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      dropShadow: {
        glare: '0 0 3px rgba(255,255,255,0.85)',
        'glare-strong': '0 0 5px rgba(255,255,255,0.95)',
      },
      minHeight: {
        touch: '72px',
        'touch-sec': '56px',
        'touch-icon': '48px',
      },
    },
  },
  plugins: [],
}

export default config


export const DESIGN_CSS_VARIABLES = Object.freeze({
  '--bg-base': '#0A0A0F',
  '--bg-medium': '#1A1A2E',
  '--bg-high': '#2D1B00',
  '--bg-critical': '#1A0008',
  '--bg-practice': '#1E293B',
  '--bg-quick': '#FFFFFF',
  '--landing-bg': '#0F172A',
  '--red': '#C41E3A',
  '--amber': '#D4700A',
  '--green': '#166534',
  '--text-primary': '#F8FAFC',
  '--text-muted': 'rgba(248,250,252,0.3)',
  '--text-data': '#94A3B8',
})

export const GLARE_CLASS = 'drop-shadow-glare'
export const STRONG_GLARE_CLASS = 'drop-shadow-glare-strong'

export const PRIMARY_BUTTON_CLASS = [
  'relative',
  'before:absolute',
  'before:-inset-3',
  'before:content-[""]',
  'min-h-touch',
  'w-full',
  'rounded-2xl',
  'touch-manipulation',
  'bg-vita-red',
  'px-5',
  'py-4',
  'text-left',
  'font-bold',
  'text-white',
  STRONG_GLARE_CLASS,
].join(' ')

export const SECONDARY_BUTTON_CLASS = [
  'relative',
  'before:absolute',
  'before:-inset-3',
  'before:content-[""]',
  'min-h-touch-sec',
  'w-full',
  'rounded-xl',
  'touch-manipulation',
  'border',
  'border-white/15',
  'bg-white/5',
  'px-4',
  'py-3',
  'text-left',
  'text-white',
  GLARE_CLASS,
].join(' ')

export const ICON_BUTTON_CLASS = [
  'relative',
  'before:absolute',
  'before:-inset-3',
  'before:content-[""]',
  'min-h-touch',
  'rounded-2xl',
  'touch-manipulation',
  'border',
  'border-white/15',
  'bg-white/5',
  'px-4',
  'py-4',
  'text-left',
  'text-white',
  GLARE_CLASS,
].join(' ')

export const FLOW_HEADLINE_CLASS = [
  'font-serif',
  'text-[clamp(1.75rem,5vw,2.5rem)]',
  'font-bold',
  'leading-tight',
  'text-white',
  GLARE_CLASS,
].join(' ')

export const FLOW_BODY_CLASS = 'text-[clamp(1rem,3vw,1.5rem)] leading-relaxed text-white/90'
export const SOURCE_BAR_CLASS =
  'font-mono text-[clamp(0.6rem,1.5vw,0.75rem)] text-slate-300/80'
export const DATA_TEXT_CLASS = 'font-mono text-[clamp(3rem,12vw,5rem)] text-slate-100'

export function getSeverityStyle(severity = 'medium', practiceMode = false) {
  if (practiceMode) {
    return {
      backgroundColor: 'var(--bg-practice)',
    }
  }

  if (severity === 'critical' || severity === 'IMMEDIATE') {
    return {
      backgroundColor: 'var(--bg-critical)',
      backgroundImage:
        'repeating-linear-gradient(-45deg, transparent, transparent 16px, rgba(255,255,255,0.05) 16px, rgba(255,255,255,0.05) 18px)',
    }
  }

  if (severity === 'high') {
    return {
      backgroundColor: 'var(--bg-high)',
      backgroundImage:
        'repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(255,255,255,0.03) 20px, rgba(255,255,255,0.03) 22px)',
    }
  }

  return {
    backgroundColor: 'var(--bg-medium)',
  }
}

export function getFlashClass(active) {
  return active ? 'brightness-150 scale-[0.98] duration-[120ms]' : 'duration-0'
}

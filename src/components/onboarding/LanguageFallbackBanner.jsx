import i18n from '@/i18n'

export default function LanguageFallbackBanner({ visible }) {
  if (!visible) {
    return null
  }

  return (
    <div className="rounded-2xl border border-vita-amber/30 bg-vita-amber/15 px-4 py-3 text-white">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-vita-amber">
        {i18n.t('fallback.headline')}
      </p>
      <p className="mt-2 text-sm text-white/90">{i18n.t('fallback.body')}</p>
    </div>
  )
}

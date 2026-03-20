import { PRIMARY_BUTTON_CLASS, SECONDARY_BUTTON_CLASS } from '@/constants/design'
import i18n from '@/i18n'
import useLanguage from '@/hooks/useLanguage'

export default function LanguageSelector() {
  const { language, changeLanguage } = useLanguage()

  return (
    <section className="space-y-4">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-vita-amber">
          {i18n.t('language.selectorLabel')}
        </p>
        <p className="mt-2 text-sm text-white/75">{i18n.t('language.verifiedOnlyNote')}</p>
      </div>

      <div className="grid gap-4">
        <button
          type="button"
          className={language === 'en' ? PRIMARY_BUTTON_CLASS : SECONDARY_BUTTON_CLASS}
          onClick={() => changeLanguage('en')}
        >
          {i18n.t('language.englishLabel')}
        </button>

        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-white/75">
          <p className="font-bold">{i18n.t('language.yorubaPendingLabel')}</p>
          <p className="mt-2 text-sm">{i18n.t('language.yorubaPendingNote')}</p>
        </div>
      </div>
    </section>
  )
}

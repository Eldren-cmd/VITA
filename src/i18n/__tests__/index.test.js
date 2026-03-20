const { afterEach, beforeEach, describe, expect, test } = require('@jest/globals')

let i18n

function createWindowMock({ storedLanguage = null, navigatorLanguage = 'en-US' } = {}) {
  return {
    localStorage: {
      getItem(key) {
        if (key !== 'vita_language') {
          return null
        }

        return storedLanguage
      },
      setItem() {},
    },
    navigator: {
      language: navigatorLanguage,
    },
  }
}

describe('i18n', () => {
  beforeEach(() => {
    jest.resetModules()
    i18n = require('@/i18n')
  })

  afterEach(() => {
    delete global.window
  })

  test('detectLanguage prefers verified stored language', () => {
    global.window = createWindowMock({ storedLanguage: 'en', navigatorLanguage: 'yo-NG' })

    expect(i18n.detectLanguage()).toEqual({
      requestedLanguage: 'en',
      resolvedLanguage: 'en',
      fallbackUsed: false,
    })
  })

  test('detectLanguage falls back to verified navigator language when storage is absent', () => {
    global.window = createWindowMock({ storedLanguage: null, navigatorLanguage: 'en-GB' })

    expect(i18n.detectLanguage()).toEqual({
      requestedLanguage: 'en',
      resolvedLanguage: 'en',
      fallbackUsed: false,
    })
  })

  test('detectLanguage falls back to English when requested language is not verified', () => {
    global.window = createWindowMock({ storedLanguage: 'yo', navigatorLanguage: 'yo-NG' })

    expect(i18n.detectLanguage()).toEqual({
      requestedLanguage: 'yo',
      resolvedLanguage: 'en',
      fallbackUsed: true,
    })
  })

  test('translate returns the English locale string for a known key', () => {
    expect(i18n.t('language.selectorLabel')).toBe('Language')
  })

  test('translate falls back to provided fallback text for unknown key', () => {
    expect(i18n.t('missing.key', 'Fallback text')).toBe('Fallback text')
  })
})

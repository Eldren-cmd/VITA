import { useEffect, useState } from 'react'

const STORAGE_KEY = 'VITA_VAULT'

const DEFAULT_VAULT = {
  profile: {
    name: '',
    dob: '',
    bloodType: '',
    organDonor: false,
    allergies: [],
    conditions: [],
    medications: [],
  },
  contacts: [],
  settings: {
    mode: 'live',
    voiceEnabled: true,
    language: 'en',
    country: 'UNKNOWN',
    dir: 'ltr',
  },
  incidents: [],
  disclaimerAccepted: false,
  disclaimerDate: null,
}

function readVault() {
  if (typeof window === 'undefined') {
    return DEFAULT_VAULT
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY)

    if (!storedValue) {
      return DEFAULT_VAULT
    }

    return {
      ...DEFAULT_VAULT,
      ...JSON.parse(storedValue),
    }
  } catch (_error) {
    return DEFAULT_VAULT
  }
}

export default function useVault() {
  const [vault, setVault] = useState(DEFAULT_VAULT)

  useEffect(() => {
    setVault(readVault())
  }, [])

  const persistVault = (nextVault) => {
    setVault(nextVault)

    if (typeof window === 'undefined') {
      return
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextVault))
    } catch (_error) {
      // Silent fail by contract.
    }
  }

  const updateProfile = (nextProfile) => {
    persistVault({
      ...vault,
      profile: {
        ...vault.profile,
        ...nextProfile,
      },
    })
  }

  const updateContacts = (nextContacts) => {
    persistVault({
      ...vault,
      contacts: nextContacts,
    })
  }

  const updateSettings = (nextSettings) => {
    persistVault({
      ...vault,
      settings: {
        ...vault.settings,
        ...nextSettings,
      },
    })
  }

  const clearAllData = () => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      // VITA_VAULT uses uppercase - JavaScript's startsWith() is
      // case-sensitive. "VITA_VAULT".startsWith("vita_") returns false.
      // Explicit removal is required to actually delete user health data.
      window.localStorage.removeItem('VITA_VAULT')

      const SYSTEM_KEYS = ['vita_pending_critical_update']

      Object.keys(window.localStorage)
        .filter((key) => key.startsWith('vita_') && !SYSTEM_KEYS.includes(key))
        .forEach((key) => window.localStorage.removeItem(key))
    } catch (_error) {
      // Silent fail by contract.
    }

    setVault(DEFAULT_VAULT)
  }

  return {
    profile: vault.profile,
    contacts: vault.contacts,
    settings: vault.settings,
    updateProfile,
    updateContacts,
    updateSettings,
    clearAllData,
  }
}

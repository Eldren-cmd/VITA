import { useEffect, useRef, useState } from 'react'

import VaultEngine from '@/engine/VaultEngine'

const DEFAULT_VAULT = {
  profile: {
    name: null,
    dob: null,
    bloodType: null,
    organDonor: null,
    allergies: [],
    conditions: [],
    medications: [],
  },
  contacts: [],
  settings: {
    mode: 'dark',
    voiceEnabled: true,
    language: 'en',
    country: 'NG',
    dir: 'ltr',
  },
  incidents: [],
  disclaimerAccepted: false,
  disclaimerDate: null,
}

export default function useVault() {
  const engineRef = useRef(null)
  const [vault, setVault] = useState(DEFAULT_VAULT)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    engineRef.current = new VaultEngine()
    setVault(engineRef.current.getVault())
  }, [])

  const syncVault = () => {
    if (!engineRef.current) {
      setVault(DEFAULT_VAULT)
      return DEFAULT_VAULT
    }

    const nextVault = engineRef.current.getVault()
    setVault(nextVault)
    return nextVault
  }

  const updateProfile = (nextProfile) => {
    engineRef.current?.updateProfile(nextProfile)
    syncVault()
  }

  const updateContacts = (nextContacts) => {
    if (!engineRef.current) {
      return
    }

    engineRef.current.getContacts().forEach((contact) => {
      engineRef.current.removeContact(contact.id)
    })

    nextContacts.forEach((contact) => {
      engineRef.current.addContact(contact)
    })

    syncVault()
  }

  const updateSettings = (nextSettings) => {
    engineRef.current?.updateSettings(nextSettings)
    syncVault()
  }

  const clearAllData = () => {
    engineRef.current?.clearAllData()
    syncVault()
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

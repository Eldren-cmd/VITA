const STORAGE_KEY = 'VITA_VAULT'
const SYSTEM_KEYS = ['vita_pending_critical_update']

const DEFAULT_VAULT = Object.freeze({
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
})

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value))
}

function mergeVault(storedVault = {}) {
  return {
    ...cloneValue(DEFAULT_VAULT),
    ...storedVault,
    profile: {
      ...cloneValue(DEFAULT_VAULT.profile),
      ...(storedVault.profile || {}),
    },
    contacts: Array.isArray(storedVault.contacts) ? storedVault.contacts.slice() : [],
    settings: {
      ...cloneValue(DEFAULT_VAULT.settings),
      ...(storedVault.settings || {}),
    },
    incidents: Array.isArray(storedVault.incidents) ? storedVault.incidents.slice() : [],
  }
}

class VaultEngine {
  constructor() {
    this._vault = cloneValue(DEFAULT_VAULT)

    if (typeof localStorage === 'undefined') {
      return
    }

    try {
      const storedValue = localStorage.getItem(STORAGE_KEY)

      if (!storedValue) {
        return
      }

      this._vault = mergeVault(JSON.parse(storedValue))
    } catch (_error) {
      this._vault = cloneValue(DEFAULT_VAULT)
    }
  }

  getVault() {
    return cloneValue(this._vault)
  }

  getProfile() {
    return this._hasProfileData() ? cloneValue(this._vault.profile) : null
  }

  updateProfile(profileData = {}) {
    this._vault.profile = {
      ...this._vault.profile,
      ...profileData,
    }

    this._persist()
    return cloneValue(this._vault.profile)
  }

  getContacts() {
    return cloneValue(this._vault.contacts)
  }

  addContact(contact = {}) {
    const nextContact = {
      ...contact,
      id: contact.id || this._generateId(),
    }

    this._vault.contacts = [...this._vault.contacts, nextContact]
    this._persist()
    return cloneValue(this._vault.contacts)
  }

  updateContact(id, contactData = {}) {
    this._vault.contacts = this._vault.contacts.map((contact) => {
      if (contact.id !== id) {
        return contact
      }

      return {
        ...contact,
        ...contactData,
        id: contact.id,
      }
    })

    this._persist()
    return cloneValue(this._vault.contacts)
  }

  removeContact(id) {
    this._vault.contacts = this._vault.contacts.filter((contact) => contact.id !== id)
    this._persist()
    return cloneValue(this._vault.contacts)
  }

  getSettings() {
    return cloneValue(this._vault.settings)
  }

  updateSettings(settingsData = {}) {
    this._vault.settings = {
      ...this._vault.settings,
      ...settingsData,
    }

    this._persist()
    return cloneValue(this._vault.settings)
  }

  getIncidents() {
    return cloneValue(this._vault.incidents)
  }

  addIncident(incident = {}) {
    const nextIncident = {
      ...incident,
      id: incident.id || this._generateId(),
      savedAt: incident.savedAt || new Date().toISOString(),
    }

    this._vault.incidents = [...this._vault.incidents, nextIncident]
    this._persist()
    return cloneValue(nextIncident)
  }

  getIncident(id) {
    const incident = this._vault.incidents.find((item) => item.id === id)
    return incident ? cloneValue(incident) : null
  }

  isDisclaimerAccepted() {
    return this._vault.disclaimerAccepted === true
  }

  acceptDisclaimer() {
    this._vault.disclaimerAccepted = true
    this._vault.disclaimerDate = new Date().toISOString()
    this._persist()
  }

  clearAllData() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('VITA_VAULT')

        Object.keys(localStorage)
          .filter((key) => key.startsWith('vita_') && !SYSTEM_KEYS.includes(key))
          .forEach((key) => localStorage.removeItem(key))
      }
    } catch (_error) {
      // Silent fail by contract.
    }

    this._vault = cloneValue(DEFAULT_VAULT)
  }

  _persist() {
    if (typeof localStorage === 'undefined') {
      return
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._vault))
    } catch (_error) {
      // Silent fail by contract.
    }
  }

  _generateId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID().slice(0, 8)
    }

    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
  }

  _hasProfileData() {
    const profile = this._vault.profile

    if (profile.name !== null || profile.dob !== null || profile.bloodType !== null) {
      return true
    }

    if (profile.organDonor !== null) {
      return true
    }

    return (
      profile.allergies.length > 0 ||
      profile.conditions.length > 0 ||
      profile.medications.length > 0
    )
  }
}

module.exports = VaultEngine
module.exports.default = VaultEngine

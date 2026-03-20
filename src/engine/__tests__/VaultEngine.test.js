const { afterEach, beforeEach, describe, expect, test } = require('@jest/globals')

let VaultEngine

function createDefaultVault() {
  return {
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
}

function createStorageMock(initial = {}) {
  const store = {}
  const storage = {}

  Object.defineProperties(storage, {
    getItem: {
      enumerable: false,
      value(key) {
        return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null
      },
    },
    setItem: {
      enumerable: false,
      value(key, value) {
        const nextValue = String(value)
        store[key] = nextValue
        Object.defineProperty(storage, key, {
          configurable: true,
          enumerable: true,
          writable: true,
          value: nextValue,
        })
      },
    },
    removeItem: {
      enumerable: false,
      value(key) {
        delete store[key]
        delete storage[key]
      },
    },
    clear: {
      enumerable: false,
      value() {
        for (const key of Object.keys(store)) {
          delete store[key]
          delete storage[key]
        }
      },
    },
    key: {
      enumerable: false,
      value(index) {
        return Object.keys(store)[index] ?? null
      },
    },
    length: {
      enumerable: false,
      get() {
        return Object.keys(store).length
      },
    },
    _dump: {
      enumerable: false,
      value() {
        return { ...store }
      },
    },
  })

  for (const [key, value] of Object.entries(initial)) {
    storage.setItem(key, value)
  }

  return storage
}

describe('VaultEngine', () => {
  beforeEach(() => {
    global.localStorage = createStorageMock()
    global.crypto = {
      randomUUID: jest.fn(() => '12345678-90ab-cdef-1234-567890abcdef'),
    }
    jest.resetModules()
    VaultEngine = require('@/engine/VaultEngine')
  })

  afterEach(() => {
    delete global.localStorage
    delete global.crypto
  })

  test('initialises with empty defaults when VITA_VAULT absent', () => {
    const engine = new VaultEngine()

    expect(engine.getVault()).toEqual(createDefaultVault())
  })

  test('initialises with empty defaults when VITA_VAULT is malformed JSON', () => {
    global.localStorage.setItem('VITA_VAULT', '{bad json')

    const engine = new VaultEngine()

    expect(engine.getVault()).toEqual(createDefaultVault())
  })

  test('loads existing vault data from localStorage on construction', () => {
    const existingVault = createDefaultVault()
    existingVault.profile.name = 'Ada'
    existingVault.contacts = [{ id: 'ice1', name: 'Mina', phone: '123' }]
    existingVault.disclaimerAccepted = true

    global.localStorage.setItem('VITA_VAULT', JSON.stringify(existingVault))

    const engine = new VaultEngine()

    expect(engine.getVault()).toEqual(existingVault)
  })

  test('getProfile returns null when no profile set', () => {
    const engine = new VaultEngine()

    expect(engine.getProfile()).toBeNull()
  })

  test('updateProfile merges partial data without overwriting other fields', () => {
    const engine = new VaultEngine()

    engine.updateProfile({
      name: 'Ada',
      allergies: ['Peanuts'],
    })

    const profile = engine.updateProfile({
      bloodType: 'O+',
    })

    expect(profile).toEqual({
      name: 'Ada',
      dob: null,
      bloodType: 'O+',
      organDonor: null,
      allergies: ['Peanuts'],
      conditions: [],
      medications: [],
    })
  })

  test('updateProfile persists to localStorage immediately', () => {
    const engine = new VaultEngine()

    engine.updateProfile({
      name: 'Ada',
    })

    const storedVault = JSON.parse(global.localStorage.getItem('VITA_VAULT'))
    expect(storedVault.profile.name).toBe('Ada')
  })

  test('getContacts returns empty array when no contacts set', () => {
    const engine = new VaultEngine()

    expect(engine.getContacts()).toEqual([])
  })

  test('addContact assigns an id if none provided', () => {
    const engine = new VaultEngine()

    const contacts = engine.addContact({
      name: 'Mina',
      phone: '123',
      relationship: 'Sister',
      isICE: true,
    })

    expect(contacts[0].id).toBe('12345678')
  })

  test('addContact persists to localStorage immediately', () => {
    const engine = new VaultEngine()

    engine.addContact({
      name: 'Mina',
      phone: '123',
    })

    const storedVault = JSON.parse(global.localStorage.getItem('VITA_VAULT'))
    expect(storedVault.contacts).toHaveLength(1)
  })

  test('addContact returns full updated contacts array', () => {
    const engine = new VaultEngine()

    engine.addContact({
      id: 'ice1',
      name: 'Mina',
      phone: '123',
    })

    const contacts = engine.addContact({
      id: 'ice2',
      name: 'Tola',
      phone: '456',
    })

    expect(contacts).toEqual([
      { id: 'ice1', name: 'Mina', phone: '123' },
      { id: 'ice2', name: 'Tola', phone: '456' },
    ])
  })

  test('updateContact updates matching contact by id', () => {
    const engine = new VaultEngine()
    engine.addContact({
      id: 'ice1',
      name: 'Mina',
      phone: '123',
    })

    const contacts = engine.updateContact('ice1', {
      phone: '999',
    })

    expect(contacts).toEqual([
      { id: 'ice1', name: 'Mina', phone: '999' },
    ])
  })

  test('updateContact is a no-op when id not found', () => {
    const engine = new VaultEngine()
    engine.addContact({
      id: 'ice1',
      name: 'Mina',
      phone: '123',
    })

    const contacts = engine.updateContact('missing', {
      phone: '999',
    })

    expect(contacts).toEqual([
      { id: 'ice1', name: 'Mina', phone: '123' },
    ])
  })

  test('removeContact removes contact by id', () => {
    const engine = new VaultEngine()
    engine.addContact({
      id: 'ice1',
      name: 'Mina',
      phone: '123',
    })

    const contacts = engine.removeContact('ice1')

    expect(contacts).toEqual([])
  })

  test('removeContact is a no-op when id not found', () => {
    const engine = new VaultEngine()
    engine.addContact({
      id: 'ice1',
      name: 'Mina',
      phone: '123',
    })

    const contacts = engine.removeContact('missing')

    expect(contacts).toEqual([
      { id: 'ice1', name: 'Mina', phone: '123' },
    ])
  })

  test('getSettings returns default settings when none set', () => {
    const engine = new VaultEngine()

    expect(engine.getSettings()).toEqual(createDefaultVault().settings)
  })

  test('updateSettings merges partial settings without overwriting other fields', () => {
    const engine = new VaultEngine()

    engine.updateSettings({
      language: 'yo',
    })

    const settings = engine.updateSettings({
      voiceEnabled: false,
    })

    expect(settings).toEqual({
      mode: 'dark',
      voiceEnabled: false,
      language: 'yo',
      country: 'NG',
      dir: 'ltr',
    })
  })

  test('updateSettings persists to localStorage immediately', () => {
    const engine = new VaultEngine()

    engine.updateSettings({
      country: 'US',
    })

    const storedVault = JSON.parse(global.localStorage.getItem('VITA_VAULT'))
    expect(storedVault.settings.country).toBe('US')
  })

  test('getIncidents returns empty array when no incidents set', () => {
    const engine = new VaultEngine()

    expect(engine.getIncidents()).toEqual([])
  })

  test('addIncident assigns id and savedAt if not present', () => {
    const engine = new VaultEngine()

    const incident = engine.addIncident({
      protocolId: 'cpr-adult',
    })

    expect(incident.id).toBe('12345678')
    expect(typeof incident.savedAt).toBe('string')
    expect(new Date(incident.savedAt).toISOString()).toBe(incident.savedAt)
  })

  test('addIncident appends to existing incidents array', () => {
    const engine = new VaultEngine()

    engine.addIncident({
      id: 'incident1',
      savedAt: '2026-03-20T00:00:00.000Z',
      protocolId: 'cpr-adult',
    })

    engine.addIncident({
      id: 'incident2',
      savedAt: '2026-03-20T00:05:00.000Z',
      protocolId: 'stroke',
    })

    expect(engine.getIncidents()).toHaveLength(2)
  })

  test('addIncident persists to localStorage immediately', () => {
    const engine = new VaultEngine()

    engine.addIncident({
      id: 'incident1',
      savedAt: '2026-03-20T00:00:00.000Z',
      protocolId: 'cpr-adult',
    })

    const storedVault = JSON.parse(global.localStorage.getItem('VITA_VAULT'))
    expect(storedVault.incidents).toHaveLength(1)
  })

  test('getIncident returns correct incident by id', () => {
    const engine = new VaultEngine()
    engine.addIncident({
      id: 'incident1',
      savedAt: '2026-03-20T00:00:00.000Z',
      protocolId: 'cpr-adult',
    })

    expect(engine.getIncident('incident1')).toEqual({
      id: 'incident1',
      savedAt: '2026-03-20T00:00:00.000Z',
      protocolId: 'cpr-adult',
    })
  })

  test('getIncident returns null when id not found', () => {
    const engine = new VaultEngine()

    expect(engine.getIncident('missing')).toBeNull()
  })

  test('isDisclaimerAccepted returns false by default', () => {
    const engine = new VaultEngine()

    expect(engine.isDisclaimerAccepted()).toBe(false)
  })

  test('acceptDisclaimer sets disclaimerAccepted to true', () => {
    const engine = new VaultEngine()

    engine.acceptDisclaimer()

    expect(engine.isDisclaimerAccepted()).toBe(true)
  })

  test('acceptDisclaimer writes disclaimerDate as ISO string', () => {
    const engine = new VaultEngine()

    engine.acceptDisclaimer()

    const vault = engine.getVault()
    expect(new Date(vault.disclaimerDate).toISOString()).toBe(vault.disclaimerDate)
  })

  test('acceptDisclaimer persists to localStorage immediately', () => {
    const engine = new VaultEngine()

    engine.acceptDisclaimer()

    const storedVault = JSON.parse(global.localStorage.getItem('VITA_VAULT'))
    expect(storedVault.disclaimerAccepted).toBe(true)
  })

  test('clearAllData removes VITA_VAULT from localStorage', () => {
    const engine = new VaultEngine()
    engine.updateProfile({
      name: 'Ada',
    })

    engine.clearAllData()

    expect(global.localStorage.getItem('VITA_VAULT')).toBeNull()
  })

  test('clearAllData removes all vita_* prefixed keys', () => {
    const engine = new VaultEngine()
    global.localStorage.setItem('vita_language', 'en')
    global.localStorage.setItem('vita_disclaimer_accepted', 'true')

    engine.clearAllData()

    expect(global.localStorage.getItem('vita_language')).toBeNull()
    expect(global.localStorage.getItem('vita_disclaimer_accepted')).toBeNull()
  })

  test('clearAllData preserves vita_pending_critical_update', () => {
    const engine = new VaultEngine()
    global.localStorage.setItem('vita_pending_critical_update', '{"version":"1.0.1"}')

    engine.clearAllData()

    expect(global.localStorage.getItem('vita_pending_critical_update')).toBe('{"version":"1.0.1"}')
  })

  test('clearAllData resets internal state to empty defaults', () => {
    const engine = new VaultEngine()
    engine.updateProfile({
      name: 'Ada',
    })
    engine.addContact({
      id: 'ice1',
      name: 'Mina',
    })

    engine.clearAllData()

    expect(engine.getVault()).toEqual(createDefaultVault())
  })

  test('clearAllData does not throw if localStorage is empty', () => {
    const engine = new VaultEngine()
    global.localStorage.clear()

    expect(() => engine.clearAllData()).not.toThrow()
  })
})

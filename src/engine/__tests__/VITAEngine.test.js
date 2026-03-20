const { afterEach, beforeEach, describe, expect, test } = require('@jest/globals')

let VITAEngine

function createStorageMock() {
  const store = new Map()

  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null
    },
    setItem(key, value) {
      store.set(key, String(value))
    },
    removeItem(key) {
      store.delete(key)
    },
    clear() {
      store.clear()
    },
    key(index) {
      return Array.from(store.keys())[index] ?? null
    },
    get length() {
      return store.size
    },
    _dump() {
      return Array.from(store.entries()).reduce((acc, [key, value]) => {
        acc[key] = value
        return acc
      }, {})
    },
  }
}

function createCallFirstProtocol() {
  return {
    id: 'test-call-first',
    version: '1.0.0',
    priority: 'high',
    entry: 'start',
    callLogic: {
      type: 'call_first',
      options: [
        { label: 'Call NOW', method: 'direct' },
        { label: 'Someone else is calling', method: 'bystander' },
        { label: 'I will call while helping', method: 'concurrent' },
      ],
    },
    source: {
      doi: '10.1000/test-call-first',
    },
    nodes: {
      start: {
        id: 'start',
        type: 'question',
        headline: 'Is help needed?',
        options: [
          { label: 'Yes', next: 'follow_up', elevate: 'critical' },
          { label: 'No', next: 'terminal' },
        ],
      },
      follow_up: {
        id: 'follow_up',
        type: 'question',
        headline: 'Keep going?',
        options: [
          { label: 'Loop', next: 'follow_up' },
          { label: 'Finish', next: 'terminal' },
        ],
      },
      terminal: {
        id: 'terminal',
        type: 'terminal',
        headline: 'Done',
        severity: 'medium',
        generateReport: true,
      },
    },
  }
}

function createPediatricProtocol() {
  return {
    id: 'test-cpr-child',
    version: '1.0.0',
    priority: 'high',
    entry: 'child_start',
    callLogic: {
      type: 'cpr_first_if_unwitnessed',
      options: [
        { label: 'Someone else is here', method: 'bystander' },
        { label: 'I am alone - I saw it happen', method: 'direct' },
        {
          label: 'I am alone - I did not see it happen',
          method: 'deferred',
          deferCallSeconds: 120,
        },
      ],
    },
    source: {
      doi: '10.1000/test-cpr-child',
    },
    nodes: {
      child_start: {
        id: 'child_start',
        type: 'action',
        headline: 'Start child CPR.',
        next: 'child_terminal',
      },
      child_terminal: {
        id: 'child_terminal',
        type: 'terminal',
        headline: 'EMS has arrived.',
        severity: 'critical',
        generateReport: true,
      },
    },
  }
}

function getHistoryTypes(engine) {
  return engine.history.map((entry) => entry.type)
}

describe('VITAEngine', () => {
  beforeEach(() => {
    global.localStorage = createStorageMock()
    global.sessionStorage = createStorageMock()
    jest.useFakeTimers()
    jest.resetModules()
    VITAEngine = require('@/engine/VITAEngine')
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
    delete global.localStorage
    delete global.sessionStorage
  })

  describe('Core', () => {
    test('starts at entry node', () => {
      const engine = new VITAEngine(createCallFirstProtocol())

      expect(engine.currentNodeId).toBe('start')
    })

    test('getCurrentNode returns synthetic enforceCall when call required and not confirmed - NOT a hardcoded ID lookup', () => {
      const protocol = createCallFirstProtocol()
      protocol.nodes.call_gate = {
        id: 'call_gate',
        type: 'action',
        headline: 'This should never be returned.',
      }

      const engine = new VITAEngine(protocol)
      const node = engine.getCurrentNode()

      expect(node.type).toBe('enforceCall')
      expect(node.synthetic).toBe(true)
      expect(node.id).not.toBe('call_gate')
      expect(node.options).toHaveLength(3)
    })

    test('confirmCall direct sets callConfirmed=true, callMethod=direct', () => {
      const engine = new VITAEngine(createCallFirstProtocol())

      engine.confirmCall('direct')

      expect(engine.callConfirmed).toBe(true)
      expect(engine.callMethod).toBe('direct')
    })

    test('confirmCall bystander sets method=bystander', () => {
      const engine = new VITAEngine(createCallFirstProtocol())

      engine.confirmCall('bystander')

      expect(engine.callMethod).toBe('bystander')
    })

    test('confirmCall deferred sets method=deferred', () => {
      const engine = new VITAEngine(createCallFirstProtocol())

      engine.confirmCall('deferred')

      expect(engine.callMethod).toBe('deferred')
    })

    test('goBack returns previous node', () => {
      const engine = new VITAEngine(createCallFirstProtocol())

      engine.confirmCall('direct')
      engine.advance(0)

      const node = engine.goBack()

      expect(node.id).toBe('start')
      expect(engine.currentNodeId).toBe('start')
    })

    test('goBack returns null at history start', () => {
      const engine = new VITAEngine(createCallFirstProtocol())

      expect(engine.goBack()).toBeNull()
    })

    test('question node elevates severity when elevate flag present', () => {
      const engine = new VITAEngine(createCallFirstProtocol())

      engine.confirmCall('direct')
      engine.advance(0)

      expect(engine.currentSeverity).toBe('critical')
    })

    test('getReport returns correct protocol id, version, doi', () => {
      const engine = new VITAEngine(createCallFirstProtocol())

      const report = engine.getReport()

      expect(report.protocolId).toBe('test-call-first')
      expect(report.version).toBe('1.0.0')
      expect(report.source.doi).toBe('10.1000/test-call-first')
    })

    test('terminate clears session', () => {
      const engine = new VITAEngine(createCallFirstProtocol())

      engine.confirmCall('direct')
      engine.advance(0)
      engine.terminate()

      expect(global.sessionStorage.getItem('vita_active_session')).toBeNull()
    })
  })

  describe('forceEscalate', () => {
    test('triggers after 3 visits to same node', () => {
      const engine = new VITAEngine(createCallFirstProtocol())

      engine.confirmCall('direct')
      engine.advance(0)
      engine.advance(0)
      engine.advance(0)

      const node = engine.advance(0)

      expect(node.type).toBe('terminal')
      expect(node.synthetic).toBe(true)
    })

    test('returns synthetic terminal with severity critical', () => {
      const engine = new VITAEngine(createCallFirstProtocol())

      engine.confirmCall('direct')
      engine.advance(0)
      engine.advance(0)
      engine.advance(0)

      const node = engine.advance(0)

      expect(node.severity).toBe('critical')
    })

    test('returns node with synthetic: true flag', () => {
      const engine = new VITAEngine(createCallFirstProtocol())

      engine.confirmCall('direct')
      engine.advance(0)
      engine.advance(0)
      engine.advance(0)

      const node = engine.advance(0)

      expect(node.synthetic).toBe(true)
    })

    test('returns node with secondaryAction null', () => {
      const engine = new VITAEngine(createCallFirstProtocol())

      engine.confirmCall('direct')
      engine.advance(0)
      engine.advance(0)
      engine.advance(0)

      const node = engine.advance(0)

      expect(node.secondaryAction).toBeNull()
    })

    test('clears session', () => {
      const engine = new VITAEngine(createCallFirstProtocol())

      engine.confirmCall('direct')
      engine.advance(0)
      engine.advance(0)
      engine.advance(0)
      engine.advance(0)

      expect(global.sessionStorage.getItem('vita_active_session')).toBeNull()
    })

    test('logs FORCE_ESCALATE to history', () => {
      const engine = new VITAEngine(createCallFirstProtocol())

      engine.confirmCall('direct')
      engine.advance(0)
      engine.advance(0)
      engine.advance(0)
      engine.advance(0)

      expect(getHistoryTypes(engine)).toContain('FORCE_ESCALATE')
    })

    test('clears deferredCallTimer', () => {
      const engine = new VITAEngine(createPediatricProtocol(), 'en', {
        onDeferredCall: jest.fn(),
      })

      engine.confirmCall('deferred')
      engine.deferredCallTimer = setTimeout(() => {}, 5000)
      engine.currentNodeId = 'child_start'
      engine.history.push({ nodeId: 'child_start', type: 'NAVIGATE' })
      engine.visitedNodes.set('child_start', 3)

      engine.advance(0)

      expect(engine.deferredCallTimer).toBeNull()
    })
  })

  describe('Session', () => {
    test('saves session on every advance()', () => {
      const engine = new VITAEngine(createCallFirstProtocol())
      const saveSpy = jest.spyOn(engine, '_saveSession')

      engine.confirmCall('direct')
      engine.advance(0)

      expect(saveSpy).toHaveBeenCalledTimes(1)
    })

    test('saves session on every goBack()', () => {
      const engine = new VITAEngine(createCallFirstProtocol())
      const saveSpy = jest.spyOn(engine, '_saveSession')

      engine.confirmCall('direct')
      engine.advance(0)
      engine.goBack()

      expect(saveSpy).toHaveBeenCalledTimes(2)
    })

    test('resumes from saved session after crash', () => {
      const protocol = createCallFirstProtocol()
      const firstEngine = new VITAEngine(protocol)

      firstEngine.confirmCall('direct')
      firstEngine.advance(0)

      const resumedEngine = new VITAEngine(protocol)

      expect(resumedEngine.currentNodeId).toBe('follow_up')
      expect(resumedEngine.callConfirmed).toBe(true)
    })

    test('discards session older than 2 hours', () => {
      const stale = {
        protocolId: 'test-call-first',
        currentNodeId: 'follow_up',
        history: [],
        callConfirmed: true,
        callMethod: 'direct',
        currentSeverity: 'high',
        startTime: Date.now() - 9_000_000,
        visitedNodes: [['follow_up', 1]],
        savedAt: Date.now() - (2 * 60 * 60 * 1000 + 1),
      }

      global.sessionStorage.setItem('vita_active_session', JSON.stringify(stale))

      const engine = new VITAEngine(createCallFirstProtocol())

      expect(engine.currentNodeId).toBe('start')
      expect(engine.resumed).toBe(false)
    })

    test('resumed flag is true when session found', () => {
      const protocol = createCallFirstProtocol()
      const firstEngine = new VITAEngine(protocol)

      firstEngine.confirmCall('direct')
      firstEngine.advance(0)

      const resumedEngine = new VITAEngine(protocol)

      expect(resumedEngine.resumed).toBe(true)
    })

    test('resumed flag is false on fresh start', () => {
      const engine = new VITAEngine(createCallFirstProtocol())

      expect(engine.resumed).toBe(false)
    })

    test('practiceMode flag prevents _saveSession from writing', () => {
      const engine = new VITAEngine(createCallFirstProtocol(), 'en', {
        practiceMode: true,
      })

      engine.confirmCall('direct')
      engine.advance(0)

      expect(global.sessionStorage.getItem('vita_active_session')).toBeNull()
    })

    test('practiceMode exposes a skippable enforceCall node', () => {
      const engine = new VITAEngine(createCallFirstProtocol(), 'en', {
        practiceMode: true,
      })

      const node = engine.getCurrentNode()

      expect(node.type).toBe('enforceCall')
      expect(node.skippable).toBe(true)
    })

    test('practiceMode can skip enforceCall without confirming a call', () => {
      const engine = new VITAEngine(createCallFirstProtocol(), 'en', {
        practiceMode: true,
      })

      const callGate = engine.getCurrentNode()
      const nextNode = engine.advance(callGate.options.length)

      expect(nextNode.id).toBe('start')
      expect(engine.getCurrentNode().id).toBe('start')
      expect(engine.callConfirmed).toBe(false)
      expect(engine.callMethod).toBeNull()
    })
  })

  describe('Deferred call', () => {
    test('_scheduleDeferredCall fires onDeferredCall after N seconds', () => {
      const onDeferredCall = jest.fn()
      const engine = new VITAEngine(createPediatricProtocol(), 'en', {
        onDeferredCall,
      })

      engine._scheduleDeferredCall(120)
      jest.advanceTimersByTime(120_000)

      expect(onDeferredCall).toHaveBeenCalledTimes(1)
    })

    test('onDeferredCall NOT called if deferCallSeconds not in chosen option', () => {
      const onDeferredCall = jest.fn()
      const engine = new VITAEngine(createPediatricProtocol(), 'en', {
        onDeferredCall,
      })

      engine.confirmCall('bystander')
      jest.advanceTimersByTime(120_000)

      expect(onDeferredCall).not.toHaveBeenCalled()
    })

    test('terminate() clears deferredCallTimer - no orphaned setTimeout', () => {
      const onDeferredCall = jest.fn()
      const engine = new VITAEngine(createPediatricProtocol(), 'en', {
        onDeferredCall,
      })

      engine._scheduleDeferredCall(120)
      engine.terminate()
      jest.advanceTimersByTime(120_000)

      expect(onDeferredCall).not.toHaveBeenCalled()
      expect(engine.deferredCallTimer).toBeNull()
    })

    test('deferred call fires for cpr_first_if_unwitnessed + alone + unwitnessed path only', () => {
      const onDeferredCall = jest.fn()
      const engine = new VITAEngine(createPediatricProtocol(), 'en', {
        onDeferredCall,
      })

      const callGate = engine.getCurrentNode()
      engine.advance(2)
      jest.advanceTimersByTime(120_000)

      expect(callGate.type).toBe('enforceCall')
      expect(engine.callMethod).toBe('deferred')
      expect(onDeferredCall).toHaveBeenCalledTimes(1)
    })

    test('deferred call does NOT fire for bystander-present path', () => {
      const onDeferredCall = jest.fn()
      const engine = new VITAEngine(createPediatricProtocol(), 'en', {
        onDeferredCall,
      })

      engine.advance(0)
      jest.advanceTimersByTime(120_000)

      expect(engine.callMethod).toBe('bystander')
      expect(onDeferredCall).not.toHaveBeenCalled()
    })

    test('deferred call does NOT fire for witnessed+alone path', () => {
      const onDeferredCall = jest.fn()
      const engine = new VITAEngine(createPediatricProtocol(), 'en', {
        onDeferredCall,
      })

      engine.advance(1)
      jest.advanceTimersByTime(120_000)

      expect(engine.callMethod).toBe('direct')
      expect(onDeferredCall).not.toHaveBeenCalled()
    })
  })

  describe('Localisation', () => {
    test('getLocalizedText returns user language string when available', () => {
      const engine = new VITAEngine(createCallFirstProtocol(), 'yo')

      expect(engine.getLocalizedText({ en: 'Help', yo: 'Iranlowo' })).toBe('Iranlowo')
    })

    test('getLocalizedText falls back to English when language not found', () => {
      const engine = new VITAEngine(createCallFirstProtocol(), 'fr')

      expect(engine.getLocalizedText({ en: 'Help', yo: 'Iranlowo' })).toBe('Help')
    })

    test('getLocalizedText never throws', () => {
      const engine = new VITAEngine(createCallFirstProtocol(), 'yo')

      expect(() => engine.getLocalizedText(null)).not.toThrow()
    })
  })
})

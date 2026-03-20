const { afterEach, beforeEach, describe, expect, test } = require('@jest/globals')

let ReportEngine

function createCompletedSession(overrides = {}) {
  const startTime = Date.parse('2026-03-20T10:00:00.000Z')
  const endTime = Date.parse('2026-03-20T10:02:05.000Z')

  return {
    protocolId: 'cpr-adult',
    protocolLabel: 'CPR - Adult (12+)',
    version: '1.0.0',
    source: {
      doi: '10.1161/CIR.0000000000001369',
    },
    startTime,
    endTime,
    history: [
      {
        type: 'NAVIGATE',
        nodeId: 'cpr_a_01',
        nodeType: 'question',
        headline: 'Are they responding?',
        timestamp: startTime + 1000,
      },
      {
        type: 'NAVIGATE',
        nodeId: 'cpr_a_03',
        nodeType: 'action',
        headline: 'Send someone for an AED now.',
        timestamp: startTime + 3000,
      },
      {
        type: 'NALOXONE_GIVEN',
        nodeId: 'cpr_a_naloxone_action',
        nodeType: 'action',
        headline: 'Give naloxone if you have it.',
        timestamp: startTime + 4000,
      },
      {
        type: 'NAVIGATE',
        nodeId: 'cpr_a_04',
        nodeType: 'action',
        headline: 'Place hands on chest.',
        timestamp: startTime + 5000,
      },
      {
        type: 'TERMINAL_REACHED',
        nodeId: 'cpr_terminal',
        nodeType: 'terminal',
        headline: 'EMS has taken over. Well done.',
        timestamp: endTime,
      },
    ],
    callMethod: 'direct',
    finalSeverity: 'critical',
    exitNode: {
      id: 'cpr_terminal',
      type: 'terminal',
      synthetic: false,
    },
    profile: {
      bloodType: 'O+',
      medications: ['Aspirin'],
      allergies: ['Peanuts'],
    },
    ...overrides,
  }
}

describe('ReportEngine', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-03-20T12:00:00.000Z'))
    global.crypto = {
      randomUUID: jest.fn(() => '12345678-90ab-cdef-1234-567890abcdef'),
    }
    jest.resetModules()
    ReportEngine = require('@/engine/ReportEngine')
  })

  afterEach(() => {
    jest.useRealTimers()
    delete global.crypto
  })

  test('constructor throws when completedSession is null', () => {
    expect(() => new ReportEngine(null)).toThrow('Invalid completed session.')
  })

  test('constructor throws when completedSession missing protocolId', () => {
    const session = createCompletedSession()
    delete session.protocolId

    expect(() => new ReportEngine(session)).toThrow('Invalid completed session.')
  })

  test('constructor throws when completedSession missing startTime', () => {
    const session = createCompletedSession()
    delete session.startTime

    expect(() => new ReportEngine(session)).toThrow('Invalid completed session.')
  })

  test('constructor throws when completedSession missing history', () => {
    const session = createCompletedSession()
    delete session.history

    expect(() => new ReportEngine(session)).toThrow('Invalid completed session.')
  })

  test('getReport returns object with correct protocolId', () => {
    const engine = new ReportEngine(createCompletedSession())

    expect(engine.getReport().protocolId).toBe('cpr-adult')
  })

  test('getReport returns object with correct sourceDoi', () => {
    const engine = new ReportEngine(createCompletedSession())

    expect(engine.getReport().sourceDoi).toBe('10.1161/CIR.0000000000001369')
  })

  test('getReport returns savedAt as valid ISO string', () => {
    const engine = new ReportEngine(createCompletedSession())
    const report = engine.getReport()

    expect(new Date(report.savedAt).toISOString()).toBe(report.savedAt)
  })

  test('getReport id is a non-empty string', () => {
    const engine = new ReportEngine(createCompletedSession())

    expect(engine.getReport().id).toBe('12345678')
  })

  test('getReport durationSeconds is a positive number', () => {
    const engine = new ReportEngine(createCompletedSession())

    expect(engine.getReport().durationSeconds).toBe(125)
  })

  test('getReport steps contains only action-type nodes from history', () => {
    const engine = new ReportEngine(createCompletedSession())

    expect(engine.getReport().steps).toEqual([
      {
        nodeId: 'cpr_a_03',
        nodeType: 'action',
        headline: 'Send someone for an AED now.',
        timestamp: '2026-03-20T10:00:03.000Z',
      },
      {
        nodeId: 'cpr_a_naloxone_action',
        nodeType: 'action',
        headline: 'Give naloxone if you have it.',
        timestamp: '2026-03-20T10:00:04.000Z',
      },
      {
        nodeId: 'cpr_a_04',
        nodeType: 'action',
        headline: 'Place hands on chest.',
        timestamp: '2026-03-20T10:00:05.000Z',
      },
    ])
  })

  test('getReport steps are in chronological order', () => {
    const engine = new ReportEngine(
      createCompletedSession({
        history: [
          {
            type: 'NAVIGATE',
            nodeId: 'later',
            nodeType: 'action',
            headline: 'Later step',
            timestamp: Date.parse('2026-03-20T10:00:05.000Z'),
          },
          {
            type: 'NAVIGATE',
            nodeId: 'earlier',
            nodeType: 'action',
            headline: 'Earlier step',
            timestamp: Date.parse('2026-03-20T10:00:02.000Z'),
          },
        ],
      })
    )

    expect(engine.getReport().steps.map((step) => step.nodeId)).toEqual(['earlier', 'later'])
  })

  test('getReport emsArrived is true when cpr_terminal in history', () => {
    const engine = new ReportEngine(createCompletedSession())

    expect(engine.getReport().emsArrived).toBe(true)
  })

  test('getReport emsArrived is false when cpr_terminal not in history', () => {
    const engine = new ReportEngine(
      createCompletedSession({
        history: [
          {
            type: 'TERMINAL_REACHED',
            nodeId: 'stroke_terminal',
            nodeType: 'terminal',
            headline: 'Done',
            timestamp: Date.parse('2026-03-20T10:02:05.000Z'),
          },
        ],
        exitNode: {
          id: 'stroke_terminal',
          type: 'terminal',
          synthetic: false,
        },
      })
    )

    expect(engine.getReport().emsArrived).toBe(false)
  })

  test('getReport naloxoneAdministered is true when NALOXONE_GIVEN in history', () => {
    const engine = new ReportEngine(createCompletedSession())

    expect(engine.getReport().naloxoneAdministered).toBe(true)
  })

  test('getReport naloxoneAdministered is false when NALOXONE_GIVEN absent', () => {
    const engine = new ReportEngine(
      createCompletedSession({
        history: [
          {
            type: 'NAVIGATE',
            nodeId: 'cpr_a_03',
            nodeType: 'action',
            headline: 'Send someone for an AED now.',
            timestamp: Date.parse('2026-03-20T10:00:03.000Z'),
          },
        ],
      })
    )

    expect(engine.getReport().naloxoneAdministered).toBe(false)
  })

  test('getReport forcedEscalation is true when FORCE_ESCALATE in history', () => {
    const engine = new ReportEngine(
      createCompletedSession({
        history: [
          {
            type: 'FORCE_ESCALATE',
            nodeId: 'cpr_a_03',
            timestamp: Date.parse('2026-03-20T10:01:00.000Z'),
          },
        ],
      })
    )

    expect(engine.getReport().forcedEscalation).toBe(true)
  })

  test('getReport forcedEscalation is false when FORCE_ESCALATE absent', () => {
    const engine = new ReportEngine(createCompletedSession())

    expect(engine.getReport().forcedEscalation).toBe(false)
  })

  test('getReport syntheticTerminal is true when synthetic flag on exit node', () => {
    const engine = new ReportEngine(
      createCompletedSession({
        exitNode: {
          id: '__force_escalate__',
          type: 'terminal',
          synthetic: true,
        },
      })
    )

    expect(engine.getReport().syntheticTerminal).toBe(true)
  })

  test('getReport is idempotent - returns same object on repeated calls', () => {
    const engine = new ReportEngine(createCompletedSession())

    expect(engine.getReport()).toBe(engine.getReport())
  })

  test('getSharableText returns string under 500 characters', () => {
    const engine = new ReportEngine(createCompletedSession())

    expect(engine.getSharableText().length).toBeLessThanOrEqual(500)
  })

  test('getSharableText contains protocol name', () => {
    const engine = new ReportEngine(createCompletedSession())

    expect(engine.getSharableText()).toContain('CPR - Adult (12+)')
  })

  test('getSharableText contains start time', () => {
    const engine = new ReportEngine(createCompletedSession())

    expect(engine.getSharableText()).toContain('2026-03-20T10:00:00.000Z')
  })

  test('getSharableText contains call method when present', () => {
    const engine = new ReportEngine(createCompletedSession())

    expect(engine.getSharableText()).toContain('Call: direct')
  })

  test('getSharableText contains "EMS not called" when callMethod is null', () => {
    const engine = new ReportEngine(
      createCompletedSession({
        callMethod: null,
      })
    )

    expect(engine.getSharableText()).toContain('EMS not called')
  })

  test('getSharableText omits blood type, medications, and allergies', () => {
    const engine = new ReportEngine(createCompletedSession())
    const text = engine.getSharableText()

    expect(text).not.toContain('O+')
    expect(text).not.toContain('Aspirin')
    expect(text).not.toContain('Peanuts')
  })

  test('wasEMSCalled returns true when callMethod is non-null', () => {
    const engine = new ReportEngine(createCompletedSession())

    expect(engine.wasEMSCalled()).toBe(true)
  })

  test('wasEMSCalled returns false when callMethod is null', () => {
    const engine = new ReportEngine(
      createCompletedSession({
        callMethod: null,
      })
    )

    expect(engine.wasEMSCalled()).toBe(false)
  })

  test('naloxoneAdministered returns false for non-opioid session', () => {
    const engine = new ReportEngine(
      createCompletedSession({
        history: [
          {
            type: 'NAVIGATE',
            nodeId: 'cpr_a_03',
            nodeType: 'action',
            headline: 'Send someone for an AED now.',
            timestamp: Date.parse('2026-03-20T10:00:03.000Z'),
          },
        ],
      })
    )

    expect(engine.naloxoneAdministered()).toBe(false)
  })

  test('getDurationSeconds returns correct value from startTime to endTime', () => {
    const engine = new ReportEngine(createCompletedSession())

    expect(engine.getDurationSeconds()).toBe(125)
  })

  test('getDurationSeconds returns 0 when startTime equals endTime', () => {
    const engine = new ReportEngine(
      createCompletedSession({
        startTime: Date.parse('2026-03-20T10:00:00.000Z'),
        endTime: Date.parse('2026-03-20T10:00:00.000Z'),
      })
    )

    expect(engine.getDurationSeconds()).toBe(0)
  })

  test('ReportEngine.generate returns same shape as getReport', () => {
    const session = createCompletedSession()
    const instance = new ReportEngine(session)

    expect(ReportEngine.generate(session)).toEqual(instance.getReport())
  })

  test('ReportEngine.generate throws when session is invalid', () => {
    expect(() => ReportEngine.generate({})).toThrow('Invalid completed session.')
  })
})

const { beforeEach, describe, expect, test } = require('@jest/globals')

let TriageEngine

function createTriageProtocol() {
  return {
    id: 'triage',
    entry: 't0_safety',
    nodes: {
      t0_safety: {
        id: 't0_safety',
        type: 'safetyCheck',
        headline: 'Is area safe?',
        options: [
          { label: 'SAFE', next: 't1' },
          { label: 'UNSAFE', next: 't_unsafe' }
        ]
      },
      t1: {
        id: 't1',
        type: 'question',
        headline: 'Are they conscious?',
        options: [
          { label: 'YES', next: 't_loop' },
          { label: 'NO', next: 't_terminal' }
        ]
      },
      t_loop: {
        id: 't_loop',
        type: 'question',
        headline: 'Loop here?',
        options: [
          { label: 'AGAIN', next: 't_loop' },
          { label: 'FINISH', next: 't_terminal' }
        ]
      },
      t_terminal: {
        id: 't_terminal',
        type: 'terminal',
        routesTo: 'cpr-adult'
      },
      t_unsafe: {
        id: 't_unsafe',
        type: 'terminal',
        routesTo: 'generic-lifesupport'
      }
    }
  }
}

describe('TriageEngine', () => {
  beforeEach(() => {
    jest.resetModules()
    TriageEngine = require('@/engine/TriageEngine')
  })

  test('starts at entry node defined in protocol.entry', () => {
    const engine = new TriageEngine(createTriageProtocol())

    expect(engine.currentNodeId).toBe('t0_safety')
  })

  test('getCurrentNode returns correct node object', () => {
    const engine = new TriageEngine(createTriageProtocol())

    expect(engine.getCurrentNode()).toEqual(createTriageProtocol().nodes.t0_safety)
  })

  test('advance returns next node for valid optionIndex', () => {
    const engine = new TriageEngine(createTriageProtocol())

    const nextNode = engine.advance(0)

    expect(nextNode.id).toBe('t1')
  })

  test('advance throws for out-of-range optionIndex', () => {
    const engine = new TriageEngine(createTriageProtocol())

    expect(() => engine.advance(99)).toThrow('Invalid triage option index.')
  })

  test('advance records node in history', () => {
    const engine = new TriageEngine(createTriageProtocol())

    engine.advance(0)

    expect(engine.history).toHaveLength(1)
    expect(engine.history[0].nodeId).toBe('t0_safety')
  })

  test('getResolution returns null before terminal reached', () => {
    const engine = new TriageEngine(createTriageProtocol())

    engine.advance(0)

    expect(engine.getResolution()).toBeNull()
  })

  test('getResolution returns protocol ID when terminal node reached', () => {
    const engine = new TriageEngine(createTriageProtocol())

    engine.advance(0)
    engine.advance(1)

    expect(engine.getResolution()).toBe('cpr-adult')
  })

  test('reset returns to entry node', () => {
    const engine = new TriageEngine(createTriageProtocol())

    engine.advance(0)
    engine.reset()

    expect(engine.currentNodeId).toBe('t0_safety')
  })

  test('reset clears history and visitedNodes', () => {
    const engine = new TriageEngine(createTriageProtocol())

    engine.advance(0)
    engine.reset()

    expect(engine.history).toEqual([])
    expect(Array.from(engine.visitedNodes.entries())).toEqual([['t0_safety', 1]])
  })

  test('loop protection: advance returns synthetic terminal after 3 visits to same node', () => {
    const engine = new TriageEngine(createTriageProtocol())

    engine.advance(0)
    engine.advance(0)
    engine.advance(0)
    engine.advance(0)

    const node = engine.advance(0)

    expect(node.type).toBe('terminal')
    expect(node.synthetic).toBe(true)
  })

  test('synthetic terminal from loop has routesTo null and type terminal', () => {
    const engine = new TriageEngine(createTriageProtocol())

    engine.advance(0)
    engine.advance(0)
    engine.advance(0)
    engine.advance(0)

    const node = engine.advance(0)

    expect(node.type).toBe('terminal')
    expect(node.routesTo).toBeNull()
  })
})

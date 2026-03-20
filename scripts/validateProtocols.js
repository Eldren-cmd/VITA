const fs = require('fs')
const path = require('path')

function createStorage() {
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
  }
}

global.localStorage = createStorage()
global.sessionStorage = createStorage()

const VITAEngine = require('../src/engine/VITAEngine')

const PROTOCOL_DIR = path.join(__dirname, '..', 'src', 'data', 'protocols', 'en')
const VALID_CALL_TYPES = new Set([
  'call_first',
  'cpr_first_if_unwitnessed',
  'call_if_escalation_trigger',
  'call_if_severe',
  'call_poison_control',
])

function loadProtocols() {
  return fs
    .readdirSync(PROTOCOL_DIR)
    .filter((file) => file.endsWith('.json'))
    .sort()
    .map((file) => ({
      file,
      protocol: JSON.parse(fs.readFileSync(path.join(PROTOCOL_DIR, file), 'utf8')),
    }))
}

function pushError(errors, file, message) {
  errors.push(`[${file}] ${message}`)
}

function collectTargets(node) {
  const targets = []

  if (typeof node.next === 'string') {
    targets.push(node.next)
  }

  for (const option of node.options || []) {
    if (typeof option.next === 'string') {
      targets.push(option.next)
    }
  }

  return targets
}

function serializeVisits(visits) {
  return Array.from(visits.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([nodeId, count]) => `${nodeId}:${count}`)
    .join('|')
}

function validateProtocol({ file, protocol }, allProtocolIds, errors) {
  const fileId = path.basename(file, '.json')

  if (protocol.id !== fileId) {
    pushError(errors, file, `Protocol id "${protocol.id}" does not match filename.`)
  }

  if (!VALID_CALL_TYPES.has(protocol.callLogic?.type)) {
    pushError(errors, file, `Unsupported callLogic type "${protocol.callLogic?.type}".`)
  }

  if (protocol.escapeHatch?.fallback !== 'generic-lifesupport') {
    pushError(errors, file, 'escapeHatch.fallback must be "generic-lifesupport".')
  }

  if (!allProtocolIds.has(protocol.escapeHatch?.fallback)) {
    pushError(errors, file, 'escapeHatch fallback does not point to an existing protocol file.')
  }

  if (protocol.entry !== 'safety_check') {
    pushError(errors, file, 'entry must be "safety_check".')
  }

  if (!protocol.nodes?.[protocol.entry]) {
    pushError(errors, file, `Entry node "${protocol.entry}" is missing from nodes.`)
  }

  for (const triggerNodeId of protocol.callLogic?.triggerNodeIds || []) {
    if (!protocol.nodes?.[triggerNodeId]) {
      pushError(errors, file, `callLogic trigger node "${triggerNodeId}" is missing from nodes.`)
    }
  }

  try {
    const engine = new VITAEngine(protocol, 'en', { practiceMode: true })
    engine.getCurrentNode()
  } catch (error) {
    pushError(errors, file, `VITAEngine failed to load protocol: ${error.message}`)
  }

  let terminalReachable = false

  for (const [nodeId, node] of Object.entries(protocol.nodes || {})) {
    if (node.id !== nodeId) {
      pushError(errors, file, `Node key "${nodeId}" does not match node.id "${node.id}".`)
    }

    if (node.type === 'action' && (!node.rationale || !node.rationaleSource)) {
      pushError(errors, file, `Action node "${nodeId}" is missing rationale or rationaleSource.`)
    }

    if (node.type === 'terminal') {
      terminalReachable = true
    }

    if (typeof node.next === 'string' && !protocol.nodes[node.next]) {
      pushError(errors, file, `Node "${nodeId}" points to missing next node "${node.next}".`)
    }

    for (const option of node.options || []) {
      if (typeof option.next !== 'string') {
        pushError(errors, file, `Node "${nodeId}" has an option without a string next target.`)
        continue
      }

      if (!protocol.nodes[option.next]) {
        pushError(errors, file, `Node "${nodeId}" option points to missing node "${option.next}".`)
      }
    }
  }

  if (!terminalReachable) {
    pushError(errors, file, 'At least one terminal node must exist.')
  }

  validateLoopBounds(file, protocol, errors)
}

function validateLoopBounds(file, protocol, errors) {
  const stack = [{ nodeId: protocol.entry, visits: new Map([[protocol.entry, 1]]) }]
  const seen = new Set()
  let safetyStopCount = 0

  while (stack.length > 0) {
    const { nodeId, visits } = stack.pop()
    const stateKey = `${nodeId}|${serializeVisits(visits)}`

    if (seen.has(stateKey)) {
      continue
    }

    seen.add(stateKey)
    safetyStopCount += 1

    if (safetyStopCount > 10000) {
      pushError(errors, file, 'Validation aborted due to excessive graph exploration.')
      return
    }

    const node = protocol.nodes[nodeId]
    if (!node || node.type === 'terminal') {
      continue
    }

    const currentVisits = visits.get(nodeId) || 0
    if (currentVisits >= 3) {
      continue
    }

    const targets = collectTargets(node)

    if (targets.length === 0) {
      pushError(errors, file, `Non-terminal node "${nodeId}" does not have a next path.`)
      continue
    }

    for (const target of targets) {
      if (!protocol.nodes[target]) {
        continue
      }

      const nextVisits = new Map(visits)
      nextVisits.set(target, (nextVisits.get(target) || 0) + 1)
      stack.push({ nodeId: target, visits: nextVisits })
    }
  }
}

function main() {
  const loadedProtocols = loadProtocols()
  const allProtocolIds = new Set(loadedProtocols.map(({ protocol }) => protocol.id))
  const errors = []

  for (const protocolEntry of loadedProtocols) {
    validateProtocol(protocolEntry, allProtocolIds, errors)
  }

  if (errors.length > 0) {
    console.error('Protocol validation failed:\n')
    for (const error of errors) {
      console.error(`- ${error}`)
    }
    process.exit(1)
  }

  console.log(`Validated ${loadedProtocols.length} protocol files successfully.`)
}

main()

class TriageEngine {
  constructor(triageProtocol, userLanguage = 'en') {
    this.protocol = triageProtocol
    this.userLanguage = userLanguage
    this.currentNodeId = triageProtocol.entry
    this.history = []
    this.visitedNodes = new Map([[triageProtocol.entry, 1]])
    this.resolution = null
    this.syntheticNode = null
  }

  getCurrentNode() {
    if (this.syntheticNode) {
      return this.syntheticNode
    }

    return this.protocol.nodes[this.currentNodeId] || null
  }

  advance(optionIndex) {
    const currentVisitCount = this.visitedNodes.get(this.currentNodeId) || 0

    if (currentVisitCount >= 3) {
      return this._forceEscalate()
    }

    const currentNode = this.getCurrentNode()
    const options = currentNode?.options || []

    if (optionIndex < 0 || optionIndex >= options.length) {
      throw new Error('Invalid triage option index.')
    }

    const nextNodeId = options[optionIndex].next

    this.history.push({
      nodeId: this.currentNodeId,
      optionIndex,
      timestamp: Date.now(),
    })

    this.currentNodeId = nextNodeId
    this.syntheticNode = null
    this.visitedNodes.set(nextNodeId, (this.visitedNodes.get(nextNodeId) || 0) + 1)

    const nextNode = this.protocol.nodes[nextNodeId] || null

    if (nextNode?.type === 'terminal') {
      this.resolution = nextNode.routesTo || null
    }

    return nextNode
  }

  getResolution() {
    return this.resolution
  }

  reset() {
    this.currentNodeId = this.protocol.entry
    this.history = []
    this.visitedNodes = new Map([[this.protocol.entry, 1]])
    this.resolution = null
    this.syntheticNode = null
  }

  _forceEscalate() {
    this.resolution = null
    this.syntheticNode = {
      id: '__triage_force_escalate__',
      type: 'terminal',
      synthetic: true,
      routesTo: null,
      headline: 'Call emergency services NOW.',
      instruction: 'Something is not improving. Get help now.',
    }

    return this.syntheticNode
  }
}

module.exports = TriageEngine
module.exports.default = TriageEngine


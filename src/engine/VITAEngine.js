class VITAEngine {
  constructor(protocol, userLanguage = 'en', options = {}) {
    this.protocol = protocol
    this.userLanguage = userLanguage
    this.practiceMode = options.practiceMode || false
    this.onDeferredCall = options.onDeferredCall || null
    this.deferredCallTimer = null
    this.pendingDeferredCallSeconds = null
    this.syntheticNode = null
    this.callGateSkipped = false

    const savedSession = VITAEngine.loadSession()

    if (savedSession && savedSession.protocolId === protocol.id) {
      this.currentNodeId = savedSession.currentNodeId
      this.history = Array.isArray(savedSession.history) ? savedSession.history : []
      this.callConfirmed = Boolean(savedSession.callConfirmed)
      this.callMethod = savedSession.callMethod || null
      this.currentSeverity = savedSession.currentSeverity || protocol.priority || 'medium'
      this.startTime = savedSession.startTime || Date.now()
      this.visitedNodes = new Map(savedSession.visitedNodes || [])
      this.resumed = true
      return
    }

    this.currentNodeId = protocol.entry
    this.history = []
    this.callConfirmed = false
    this.callMethod = null
    this.currentSeverity = protocol.priority || 'medium'
    this.startTime = Date.now()
    this.visitedNodes = new Map([[protocol.entry, 1]])
    this.resumed = false
  }

  getCurrentNode() {
    if (this.syntheticNode) {
      return this.syntheticNode
    }

    if (this._requiresCallConfirmation()) {
      return this._buildEnforceCallNode()
    }

    return this.protocol.nodes[this.currentNodeId] || null
  }

  advance(optionIndex = 0) {
    const currentVisitCount = this.visitedNodes.get(this.currentNodeId) || 0

    if (currentVisitCount >= 3) {
      return this.forceEscalate()
    }

    const currentNode = this.getCurrentNode()

    if (!currentNode) {
      this._saveSession()
      return null
    }

    if (currentNode.type === 'enforceCall') {
      const selectedOption = currentNode.options?.[optionIndex]

      if (!selectedOption) {
        if (this.practiceMode === true && currentNode.skippable === true) {
          this.callGateSkipped = true
          this.history.push({
            type: 'PRACTICE_CALL_SKIPPED',
            nodeId: this.currentNodeId,
            timestamp: Date.now(),
            synthetic: true,
          })
          this._saveSession()
          return this.protocol.nodes[this.currentNodeId] || null
        }

        this._saveSession()
        return this.protocol.nodes[this.currentNodeId] || null
      }

      this.pendingDeferredCallSeconds = selectedOption.deferCallSeconds || null
      this.confirmCall(selectedOption.method)
      this.history.push({
        type: 'NAVIGATE',
        nodeId: this.currentNodeId,
        nodeType: currentNode.type,
        headline: currentNode.headline,
        optionIndex,
        timestamp: Date.now(),
        synthetic: true,
      })
      this._saveSession()
      return this.protocol.nodes[this.currentNodeId] || null
    }

    const nextNodeId = this._getNextNodeId(currentNode, optionIndex)

    this.history.push({
      type: 'NAVIGATE',
      nodeId: this.currentNodeId,
      nodeType: currentNode.type,
      headline: currentNode.headline,
      optionIndex,
      timestamp: Date.now(),
    })

    const selectedOption = currentNode.options?.[optionIndex]
    if (selectedOption?.elevate) {
      this.currentSeverity = selectedOption.elevate
    }

    if (nextNodeId) {
      this.currentNodeId = nextNodeId
      this.syntheticNode = null
      this.visitedNodes.set(nextNodeId, (this.visitedNodes.get(nextNodeId) || 0) + 1)
    }

    this._saveSession()
    return this.getCurrentNode()
  }

  goBack() {
    while (this.history.length > 0) {
      const previousEntry = this.history.pop()

      if (previousEntry.type === 'CALL_CONFIRMED') {
        this.callConfirmed = false
        this.callMethod = null
        continue
      }

      if (previousEntry.type === 'FORCE_ESCALATE') {
        this.syntheticNode = null
        continue
      }

      if (previousEntry.type === 'PRACTICE_CALL_SKIPPED') {
        this.callGateSkipped = false
        continue
      }

      if (previousEntry.type === 'NAVIGATE') {
        this._decrementVisited(this.currentNodeId)
        this.currentNodeId = previousEntry.nodeId
        this.syntheticNode = null
        this._saveSession()
        return this.getCurrentNode()
      }
    }

    this._saveSession()
    return null
  }

  confirmCall(method) {
    this.callGateSkipped = false
    this.callConfirmed = true
    this.callMethod = method
    this.history.push({
      type: 'CALL_CONFIRMED',
      method,
      timestamp: Date.now(),
    })

    if (this.pendingDeferredCallSeconds) {
      this._scheduleDeferredCall(this.pendingDeferredCallSeconds)
      this.pendingDeferredCallSeconds = null
    }
  }

  getLocalizedText(field) {
    if (typeof field === 'string') {
      return field
    }

    if (!field || typeof field !== 'object') {
      return field ?? null
    }

    return field[this.userLanguage] || field.en || null
  }

  getReport() {
    const exitNode = this.getCurrentNode()

    return {
      protocolId: this.protocol.id,
      protocolLabel: this.protocol.label || this.protocol.id,
      version: this.protocol.version,
      protocolVersion: this.protocol.version,
      source: {
        doi: this.protocol.source?.doi || null,
      },
      sourceDoi: this.protocol.source?.doi || null,
      startTime: this.startTime,
      endTime: Date.now(),
      duration: Date.now() - this.startTime,
      callMethod: this.callMethod,
      history: this.history,
      steps: this.history,
      finalSeverity: this.currentSeverity,
      exitNode,
    }
  }

  terminate() {
    clearTimeout(this.deferredCallTimer)
    this.deferredCallTimer = null
    VITAEngine.clearSession()
  }

  static loadSession() {
    try {
      const saved = sessionStorage.getItem('vita_active_session')

      if (!saved) {
        return null
      }

      const parsed = JSON.parse(saved)
      const maxAge = 2 * 60 * 60 * 1000

      if (!parsed?.savedAt || Date.now() - parsed.savedAt > maxAge) {
        VITAEngine.clearSession()
        return null
      }

      return parsed
    } catch (_error) {
      return null
    }
  }

  static clearSession() {
    try {
      sessionStorage.removeItem('vita_active_session')
    } catch (_error) {
      // Silent fail by contract.
    }
  }

  forceEscalate() {
    this.history.push({
      type: 'FORCE_ESCALATE',
      nodeId: this.currentNodeId,
      timestamp: Date.now(),
    })

    clearTimeout(this.deferredCallTimer)
    this.deferredCallTimer = null
    VITAEngine.clearSession()

    this.syntheticNode = {
      id: '__force_escalate__',
      type: 'terminal',
      severity: 'critical',
      synthetic: true,
      headline: 'Call emergency services NOW.',
      instruction: 'Something is not improving. Get help.',
      primaryAction: {
        label: 'Call Emergency',
        action: 'CALL_EMERGENCY',
      },
      secondaryAction: null,
      generateReport: true,
    }

    return this.syntheticNode
  }

  _saveSession() {
    if (this.practiceMode === true) {
      return
    }

    try {
      sessionStorage.setItem(
        'vita_active_session',
        JSON.stringify({
          protocolId: this.protocol.id,
          currentNodeId: this.currentNodeId,
          history: this.history,
          callConfirmed: this.callConfirmed,
          callMethod: this.callMethod,
          currentSeverity: this.currentSeverity,
          startTime: this.startTime,
          visitedNodes: Array.from(this.visitedNodes.entries()),
          savedAt: Date.now(),
        })
      )
    } catch (_error) {
      // Silent fail by contract.
    }
  }

  _scheduleDeferredCall(seconds) {
    clearTimeout(this.deferredCallTimer)
    this.deferredCallTimer = setTimeout(() => {
      this.onDeferredCall?.()
    }, seconds * 1000)
  }

  _getNextNodeId(currentNode, optionIndex) {
    if (Array.isArray(currentNode.options)) {
      return currentNode.options[optionIndex]?.next || null
    }

    return currentNode.next || null
  }

  _requiresCallConfirmation() {
    if (this.callConfirmed || (this.practiceMode === true && this.callGateSkipped) || !this.protocol.callLogic) {
      return false
    }

    const { callLogic } = this.protocol

    if (callLogic.type === 'call_first' || callLogic.type === 'cpr_first_if_unwitnessed') {
      return true
    }

    const currentNode = this.protocol.nodes[this.currentNodeId]
    const triggerNodeIds = callLogic.triggerNodeIds || []

    return Boolean(currentNode?.callLogicTrigger || triggerNodeIds.includes(this.currentNodeId))
  }

  _buildEnforceCallNode() {
    const options = Array.isArray(this.protocol.callLogic?.options)
      ? this.protocol.callLogic.options.map((option, index) => ({
          id: `call_option_${index}`,
          label: option.label,
          method: option.method,
          deferCallSeconds: option.deferCallSeconds,
        }))
      : []

    return {
      id: '__enforce_call__',
      type: 'enforceCall',
      synthetic: true,
      skippable: this.practiceMode === true,
      headline: 'Call for help now.',
      callLogic: this.protocol.callLogic,
      options,
    }
  }

  _decrementVisited(nodeId) {
    const currentCount = this.visitedNodes.get(nodeId)

    if (!currentCount) {
      return
    }

    if (currentCount <= 1) {
      this.visitedNodes.delete(nodeId)
      return
    }

    this.visitedNodes.set(nodeId, currentCount - 1)
  }
}

module.exports = VITAEngine
module.exports.default = VITAEngine

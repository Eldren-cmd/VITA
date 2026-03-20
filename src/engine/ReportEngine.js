function normalizeTimestamp(value) {
  if (typeof value === 'string') {
    return new Date(value).getTime()
  }

  if (typeof value === 'number') {
    return value
  }

  return NaN
}

function toIsoString(value) {
  return new Date(normalizeTimestamp(value)).toISOString()
}

function buildHistory(session) {
  if (Array.isArray(session.history)) {
    return session.history
  }

  if (Array.isArray(session.steps)) {
    return session.steps
  }

  return null
}

class ReportEngine {
  constructor(completedSession) {
    this._validateSession(completedSession)
    this._session = completedSession
    this._report = null
  }

  getReport() {
    if (this._report) {
      return this._report
    }

    const history = buildHistory(this._session).slice().sort((left, right) => {
      return normalizeTimestamp(left.timestamp) - normalizeTimestamp(right.timestamp)
    })

    const startTime = this._session.startTime
    const endTime =
      this._session.endTime ??
      (typeof this._session.duration === 'number'
        ? normalizeTimestamp(startTime) + this._session.duration
        : startTime)

    this._report = {
      id: this._generateId(),
      savedAt: new Date().toISOString(),
      protocolId: this._session.protocolId,
      protocolVersion: this._session.protocolVersion || this._session.version || null,
      sourceDoi: this._session.sourceDoi || this._session.source?.doi || null,
      startTime: toIsoString(startTime),
      endTime: toIsoString(endTime),
      durationSeconds: this.getDurationSeconds(),
      callMethod: this._session.callMethod ?? null,
      emsArrived: this._didEmsArrive(history),
      naloxoneAdministered: this.naloxoneAdministered(),
      forcedEscalation: history.some((entry) => entry.type === 'FORCE_ESCALATE'),
      steps: history
        .filter((entry) => entry.nodeType === 'action')
        .map((entry) => ({
          nodeId: entry.nodeId,
          nodeType: entry.nodeType,
          headline: entry.headline,
          timestamp: toIsoString(entry.timestamp),
        })),
      severity: this._session.finalSeverity || this._session.severity || null,
      syntheticTerminal: Boolean(this._session.exitNode?.synthetic),
    }

    return this._report
  }

  getSharableText() {
    const report = this.getReport()
    const protocolName = this._session.protocolLabel || report.protocolId
    const callText = report.callMethod ? `Call: ${report.callMethod}` : 'EMS not called'
    const keySteps = report.steps
      .slice(0, 3)
      .map((step) => step.headline)
      .join('; ')

    const segments = [
      `Protocol: ${protocolName}`,
      `Start: ${report.startTime}`,
      `Duration: ${report.durationSeconds}s`,
      callText,
    ]

    if (keySteps) {
      segments.push(`Steps: ${keySteps}`)
    }

    return segments.join(' | ').slice(0, 500)
  }

  wasEMSCalled() {
    return this._session.callMethod != null
  }

  naloxoneAdministered() {
    return buildHistory(this._session).some((entry) => entry.type === 'NALOXONE_GIVEN')
  }

  getDurationSeconds() {
    const startTime = normalizeTimestamp(this._session.startTime)
    const endTime =
      this._session.endTime != null
        ? normalizeTimestamp(this._session.endTime)
        : typeof this._session.duration === 'number'
          ? startTime + this._session.duration
          : startTime

    return Math.max(0, Math.floor((endTime - startTime) / 1000))
  }

  static generate(completedSession) {
    return new ReportEngine(completedSession).getReport()
  }

  _validateSession(completedSession) {
    const history = completedSession ? buildHistory(completedSession) : null

    if (
      !completedSession ||
      !completedSession.protocolId ||
      completedSession.startTime == null ||
      !Array.isArray(history)
    ) {
      throw new Error('Invalid completed session.')
    }
  }

  _generateId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID().slice(0, 8)
    }

    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
  }

  _didEmsArrive(history) {
    if (history.some((entry) => entry.nodeId === 'cpr_terminal')) {
      return true
    }

    return this._session.exitNode?.id === 'cpr_terminal'
  }
}

module.exports = ReportEngine
module.exports.default = ReportEngine

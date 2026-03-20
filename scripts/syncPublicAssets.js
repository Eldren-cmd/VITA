const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const PACKAGE_JSON = path.join(ROOT, 'package.json')
const SRC_DATA_DIR = path.join(ROOT, 'src', 'data')
const PUBLIC_DIR = path.join(ROOT, 'public')
const PUBLIC_DATA_DIR = path.join(PUBLIC_DIR, 'data')
const SRC_SERVICE_WORKER = path.join(ROOT, 'src', 'serviceWorker.js')
const PUBLIC_SERVICE_WORKER = path.join(PUBLIC_DIR, 'service-worker.js')
const PUBLIC_LATEST_VERSION = path.join(PUBLIC_DIR, 'latest-version.json')

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

function copyRecursive(sourcePath, destinationPath) {
  const stat = fs.statSync(sourcePath)

  if (stat.isDirectory()) {
    ensureDir(destinationPath)

    for (const entry of fs.readdirSync(sourcePath)) {
      copyRecursive(path.join(sourcePath, entry), path.join(destinationPath, entry))
    }

    return
  }

  ensureDir(path.dirname(destinationPath))
  fs.copyFileSync(sourcePath, destinationPath)
}

function getAppVersion() {
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'))
  return packageJson.version
}

function syncServiceWorker(version) {
  const serviceWorkerSource = fs.readFileSync(SRC_SERVICE_WORKER, 'utf8')
  const output = serviceWorkerSource.replace(/__APP_VERSION__/g, version)

  ensureDir(path.dirname(PUBLIC_SERVICE_WORKER))
  fs.writeFileSync(PUBLIC_SERVICE_WORKER, output)
}

function syncLatestVersion(version) {
  let currentPayload = {
    criticalUpdate: false,
  }

  if (fs.existsSync(PUBLIC_LATEST_VERSION)) {
    try {
      currentPayload = {
        ...currentPayload,
        ...JSON.parse(fs.readFileSync(PUBLIC_LATEST_VERSION, 'utf8')),
      }
    } catch (_error) {
      currentPayload = {
        criticalUpdate: false,
      }
    }
  }

  const nextPayload = {
    ...currentPayload,
    version,
    releasedAt: new Date().toISOString(),
  }

  ensureDir(path.dirname(PUBLIC_LATEST_VERSION))
  fs.writeFileSync(PUBLIC_LATEST_VERSION, `${JSON.stringify(nextPayload, null, 2)}\n`)
}

function main() {
  const version = getAppVersion()

  ensureDir(PUBLIC_DIR)
  ensureDir(PUBLIC_DATA_DIR)

  copyRecursive(SRC_DATA_DIR, PUBLIC_DATA_DIR)
  syncServiceWorker(version)
  syncLatestVersion(version)
}

main()

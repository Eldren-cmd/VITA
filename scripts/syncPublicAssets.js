const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const SRC_DATA_DIR = path.join(ROOT, 'src', 'data')
const PUBLIC_DIR = path.join(ROOT, 'public')
const PUBLIC_DATA_DIR = path.join(PUBLIC_DIR, 'data')
const SRC_SERVICE_WORKER = path.join(ROOT, 'src', 'serviceWorker.js')
const PUBLIC_SERVICE_WORKER = path.join(PUBLIC_DIR, 'service-worker.js')

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

function main() {
  ensureDir(PUBLIC_DIR)
  ensureDir(PUBLIC_DATA_DIR)

  copyRecursive(SRC_DATA_DIR, PUBLIC_DATA_DIR)
  copyRecursive(SRC_SERVICE_WORKER, PUBLIC_SERVICE_WORKER)
}

main()

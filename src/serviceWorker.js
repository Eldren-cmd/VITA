const CURRENT_VERSION = '0.1.0'
const CRITICAL_CACHE = `vita-critical-${CURRENT_VERSION}`
const STANDARD_CACHE = `vita-standard-${CURRENT_VERSION}`

// Phase 8 will add the landing page at /. Until then /app is the
// actual app shell route that must stay available offline.
const CRITICAL = [
  '/app',
  '/data/protocols/en/cpr-adult.json',
  '/data/protocols/en/cpr-child.json',
  '/data/protocols/en/cpr-infant.json',
  '/data/protocols/en/choking-adult.json',
  '/data/protocols/en/choking-infant.json',
  '/data/protocols/en/anaphylaxis.json',
  '/data/protocols/en/generic-lifesupport.json',
  '/data/triage.json',
]

const STANDARD = [
  '/data/protocols/en/bleeding.json',
  '/data/protocols/en/heart-attack.json',
  '/data/protocols/en/stroke.json',
  '/data/protocols/en/seizure.json',
  '/data/protocols/en/unconscious.json',
  '/data/protocols/en/burns.json',
  '/data/protocols/en/fracture.json',
  '/data/protocols/en/poisoning.json',
  '/data/emergency-numbers.json',
]

async function updateStandardCache(request) {
  const cache = await caches.open(STANDARD_CACHE)

  try {
    const response = await fetch(request)

    if (response && response.ok) {
      cache.put(request, response.clone())
    }

    return response
  } catch (_error) {
    return cache.match(request)
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CRITICAL_CACHE).then((cache) => cache.addAll(CRITICAL)),
      caches.open(STANDARD_CACHE).then((cache) => cache.addAll(STANDARD)),
    ]).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CRITICAL_CACHE && key !== STANDARD_CACHE)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET') {
    return
  }

  if (request.mode === 'navigate' && url.pathname.startsWith('/app')) {
    event.respondWith(
      caches.match('/app').then((cachedShell) => cachedShell || fetch('/app'))
    )
    return
  }

  if (CRITICAL.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        return (
          cachedResponse ||
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              const responseClone = networkResponse.clone()
              caches.open(CRITICAL_CACHE).then((cache) => cache.put(request, responseClone))
            }

            return networkResponse
          })
        )
      })
    )
    return
  }

  if (STANDARD.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const networkResponsePromise = updateStandardCache(request)
        return cachedResponse || networkResponsePromise
      })
    )
  }
})

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'CHECK_VERSION') {
    return
  }

  event.waitUntil(
    fetch('/latest-version.json', { cache: 'no-store' })
      .then((response) => response.json())
      .then((payload) => {
        if (!payload?.version || payload.version === CURRENT_VERSION) {
          return
        }

        event.source?.postMessage({
          type: 'UPDATE_AVAILABLE',
          version: payload.version,
          criticalUpdate: Boolean(payload.criticalUpdate),
        })
      })
      .catch(() => {})
  )
})

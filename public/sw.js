const CACHE = 'mobility-v1'

const SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(SHELL))
  )
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  // Only handle GET requests for same-origin resources
  if (e.request.method !== 'GET') return
  if (!e.request.url.startsWith(self.location.origin)) return

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached
      return fetch(e.request).then(response => {
        // Cache successful responses for app assets
        if (response.ok && !e.request.url.includes('fonts.googleapis')) {
          const clone = response.clone()
          caches.open(CACHE).then(cache => cache.put(e.request, clone))
        }
        return response
      }).catch(() => caches.match('/index.html'))
    })
  )
})

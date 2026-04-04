const CACHE = 'kozeletimozaik-v2'
const ASSETS = ['/', '/index.html']

// Külső domainek amiket NEM cache-elünk
const BYPASS_DOMAINS = [
  'cloud.umami.is',
  'supabase.co',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
]

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)))
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ))
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return

  const url = new URL(e.request.url)

  // Külső domain-eket NE intercept-áljuk – engedjük át
  if (BYPASS_DOMAINS.some(d => url.hostname.includes(d))) {
    return // nem hívjuk e.respondWith() → böngésző kezeli natívan
  }

  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  )
})

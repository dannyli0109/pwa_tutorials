self.addEventListener('install', function(event) {
    console.log('[Service Worker] Installing Service Worker ...', event)
})
self.addEventListener('activate', function(event) {
    console.log('[Service Worker] Activating Service Worker ...', event)
    // might not need this line
    return self.clients.claim()
})

// trigger whenever the page receive data
self.addEventListener('fetch', function(event) {
    console.log('[Service Worker] Fetching something ...', event)
    event.respondWith(fetch(event.request));
})
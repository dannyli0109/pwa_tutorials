const CACHE_STATIC_NAME = 'static-v4'
const CACHE_DYNAMIC_NAME = 'dynamic-v2'

self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing Service Worker ...', event);
  // if the cache exists, it will open it, if it doesn't exist, it will create it
  // wait until will wait the for the operation to complete to finish the install event
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(cache => {
        console.log('[Service Worker] Precaching App Shell')
        cache.addAll([
          '/', 
          '/help/',
          '/index.html', 
          '/src/js/app.js',
          '/src/js/feed.js',
          '/src/js/promise.js',
          '/src/js/fetch.js',
          '/src/js/material.min.js',
          '/src/css/app.css',
          '/src/css/feed.css',
          '/src/images/main-image.jpg',
          'https://fonts.googleapis.com/css?family=Roboto:400,700',
          'https://fonts.googleapis.com/icon?family=Material+Icons',
          'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
        ])
        // cache.add('/')
        // cache.add('/index.html')        
        // cache.add('/src/js/app.js')
      })
  );
});

self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activating Service Worker ....', event);
  event.waitUntil(
    caches.keys()
      .then(keyList => {
        return Promise.all(keyList.map(key => {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log('[Service Worker] Removing old cache', key)
            return caches.delete(key)
          }  
        }))
      })
  )
  return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response
        } else {
          return fetch(event.request)
            .then(res => {
              return caches.open(CACHE_DYNAMIC_NAME)
                .then(cache => {
                  cache.put(event.request.url, res.clone())
                  return res
                })
            })
            .catch(err => {

            })          
        }
      })
  );
});

importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.0.1/workbox-sw.js");
importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');



workbox.routing.registerRoute(/.*(?:firebasestorage\.googleapis)\.com.*$/, workbox.strategies.staleWhileRevalidate({
    cacheName: 'post-images',
    plugins: [
        new workbox.expiration.Plugin({
            maxEntries: 3,
            maxAgeSeconds: 30 * 24 * 60 * 60
        })
    ]
}))

workbox.routing.registerRoute(/.*(?:googleapis|gstatic)\.com.*$/, workbox.strategies.staleWhileRevalidate({
    cacheName: 'google-fonts'
}))

workbox.routing.registerRoute('https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css', workbox.strategies.staleWhileRevalidate({
    cacheName: 'material-css'
}))

workbox.routing.registerRoute('https://pwagram-9de82.firebaseio.com/posts.json', args => {
    return fetch(args.event.request)
    .then(function (res) {
      var clonedRes = res.clone();
      clearAllData('posts')
        .then(function () {
          return clonedRes.json();
        })
        .then(function (data) {
          for (var key in data) {
            writeData('posts', data[key])
          }
        });
      return res;
    })
})

workbox.routing.registerRoute(routeData => {
    return (routeData.event.request.headers.get('accept').includes('text/html'))
}, args => {
    return caches.match(args.event.request)
        .then(function (response) {
        if (response) {
            return response;
        } else {
            return fetch(args.event.request)
            .then(function (res) {
                return caches.open('dynamic')
                .then(function (cache) {
                    // trimCache(CACHE_DYNAMIC_NAME, 3);
                    cache.put(args.event.request.url, res.clone());
                    return res;
                })
            })
            .catch(function (err) {
                return caches.match('/offline.html')
                .then(res => {
                    return res
                });
            });
        }
        })
})

// workbox.routing.registerNavigationRoute('/offline.html');

workbox.precaching.precacheAndRoute([])

self.addEventListener('sync', event => {
    console.log('[Service Worker] Background syncing', event)
    if (event.tag === 'sync-new-posts') {
      console.log('[Service Worker] Syncing new Posts')
      event.waitUntil(
        readAllData('sync-posts')
          .then(data => {
            for (let dt of data) {
              fetch('https://pwagram-9de82.firebaseio.com/posts', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                body: JSON.stringify({
                  id: dt.id,
                  title: dt.title,
                  location: dt.location,
                  image: 'https://firebasestorage.googleapis.com/v0/b/pwagram-9de82.appspot.com/o/sf-boat.jpg?alt=media&token=ecf6e718-5f2f-47d1-8275-67219877a5f5'
                })
              })
                .then(res => {
                  console.log('Sent data', res)
                  if (res.ok) {
                    deleteItemFromData('sync-posts', dt.id)
                  }
                })
                .catch(err => {
                  console.log('Error while sending data', err)
                })
            }
          })
      );
    }
  })
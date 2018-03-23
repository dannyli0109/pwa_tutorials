
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

workbox.precaching.precacheAndRoute([
  {
    "url": "404.html",
    "revision": "0a27a4163254fc8fce870c8cc3a3f94f"
  },
  {
    "url": "favicon.ico",
    "revision": "2cab47d9e04d664d93c8d91aec59e812"
  },
  {
    "url": "index.html",
    "revision": "6e8d55d81041d020bf0631b369fb690a"
  },
  {
    "url": "manifest.json",
    "revision": "d11c7965f5cfba711c8e74afa6c703d7"
  },
  {
    "url": "offline.html",
    "revision": "45352e71a80a5c75d25e226e7330871b"
  },
  {
    "url": "src/css/app.css",
    "revision": "dc2e7652d77e3e0ce746641592abc77f"
  },
  {
    "url": "src/css/feed.css",
    "revision": "b80a19dbc0d13327a70236365ed650f0"
  },
  {
    "url": "src/css/help.css",
    "revision": "1c6d81b27c9d423bece9869b07a7bd73"
  },
  {
    "url": "src/js/app.js",
    "revision": "8e7933677941d3ad1acc68ea73069782"
  },
  {
    "url": "src/js/feed.js",
    "revision": "95f4eb8b1a149f5f90bcc4cde0b1c588"
  },
  {
    "url": "src/js/fetch.js",
    "revision": "6b82fbb55ae19be4935964ae8c338e92"
  },
  {
    "url": "src/js/idb.js",
    "revision": "017ced36d82bea1e08b08393361e354d"
  },
  {
    "url": "src/js/material.min.js",
    "revision": "713af0c6ce93dbbce2f00bf0a98d0541"
  },
  {
    "url": "src/js/promise.js",
    "revision": "10c2238dcd105eb23f703ee53067417f"
  },
  {
    "url": "src/js/utility.js",
    "revision": "6e3d320930be900c1008a3fb2256d22a"
  },
  {
    "url": "sw-base.js",
    "revision": "60f45cb230a36a1c33c200d867f92bfe"
  },
  {
    "url": "sw.js",
    "revision": "ed2b5cd2de77e3a18daee5b9055ae2d1"
  },
  {
    "url": "src/images/main-image-lg.jpg",
    "revision": "31b19bffae4ea13ca0f2178ddb639403"
  },
  {
    "url": "src/images/main-image-sm.jpg",
    "revision": "c6bb733c2f39c60e3c139f814d2d14bb"
  },
  {
    "url": "src/images/main-image.jpg",
    "revision": "5c66d091b0dc200e8e89e56c589821fb"
  },
  {
    "url": "src/images/sf-boat.jpg",
    "revision": "0f282d64b0fb306daf12050e812d6a19"
  }
])

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
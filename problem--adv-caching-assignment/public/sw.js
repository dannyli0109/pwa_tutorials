
var CACHE_STATIC_NAME = 'static-v8';
var CACHE_DYNAMIC_NAME = 'dynamic-v7';
var STATIC_FILE_PATH = [
  '/',
  '/index.html',
  '/src/css/app.css',
  '/src/css/main.css',
  '/src/js/main.js',
  '/src/js/material.min.js',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
];
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(function(cache) {
        cache.addAll(STATIC_FILE_PATH);
      })
  )
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys()
      .then(function(keyList) {
        return Promise.all(keyList.map(function(key) {
          if (key !== CACHE_STATIC_NAME) {
            return caches.delete(key);
          }
        }));
      })
  );
  return self.clients.claim();
  
});


function isInArray(string, array) {
  array.forEach(element => {
    if (element == string) {
      return true
    }
  })
  return false
}
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//       .then(function(response) {
//         if (response) {
//           return response;
//         } else {
//           return fetch(event.request)
//             .then(function(res) {
//               return caches.open(CACHE_DYNAMIC_NAME)
//                 .then(function(cache) {
//                   cache.put(event.request.url, res.clone());
//                   return res;
//                 });
//             })
//             .catch(function(err) {

//             });
//         }
//       })
//   );
// });

// // network-only
// self.addEventListener('fetch', function(event) {
//   event.respondWith(fetch(event.request));
// });

// // cache-only
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//       .then(res => res)
//   );
// });

// // network, and cache fallback
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     fetch(event.request)
//       .then(res => {
//         return caches.open(CACHE_DYNAMIC_NAME)
//           .then(cache => {
//             cache.put(event.request.url, res.clone())
//             return res
//           })
//       })
//       .catch(err => {
//         return caches.match(event.request)
//       })
//   );
// });

let url = 'https://httpbin.org/ip'
self.addEventListener('fetch', function(event) {
  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(
      caches.open(CACHE_DYNAMIC_NAME)
        .then(cache => {
          return fetch(event.request)
            .then(res => {
              cache.put(event.request.url, res.clone())
              return res
            })
        })
    );
  } else if (isInArray(event.request.url, STATIC_FILE_PATH)) {
    event.respondWith(
      caches.match(event.request)
    )
  }
  else {
    event.respondWith(
      caches.match(event.request)
        .then(res => {
          if (res) {
            return res
          } else {
            return fetch(event.request)
              .then(response => {
                return caches.open(CACHE_DYNAMIC_NAME)
                  .then(cache => {
                    cache.put(event.request.url, response.clone())
                    return response
                  })
              })
              .catch(err => {
                console.log(err)
              })
          }
        })
    )
  } 
});
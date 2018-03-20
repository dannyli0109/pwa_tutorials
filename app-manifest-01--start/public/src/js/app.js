var deferredPrompt

// use the polyfill if the browser doesn't support Promise
if (!window.Promise) {
    window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(() => {
            console.log('Service worker registered!')
        })
        .catch(err => {
            console.log(err)
        })
}

// deferred browser to show the install banner
window.addEventListener('beforeinstallprompt', event => {
    console.log('beforeinstallprimpt fired');
    event.preventDefault();
    deferredPrompt = event;
    return false;
})

// var promise = new Promise((resolve, reject) => {
//     setTimeout(function() {
//         // resolve('This is executed once the timer is done!')
//         reject({code: 500, message: "An error occurred!"})
//     }, 3000)
// });

fetch('https://httpbin.org/ip')
    .then(res => {
        console.log(res)
        return res.json()
    })
    .then(data => {
        console.log(data)
    })
    .catch(err => {
        console.log(err)
    })
fetch('https://httpbin.org/post', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    mode: 'cors',
    body: JSON.stringify({
        message: 'Does this work?'
    })
})
    .then(res => {
        console.log(res)
        return res.json()
    })
    .then(data => {
        console.log(data)
    })
    .catch(err => {
        console.log(err)
    })

// promise.then((text) => {
//     return text
// }, err => {
//     console.log(err.code, err.message)
// }).then((newText) => {
//     console.log(newText)
// })
// promise.then((text) => {
//     return text
// }).then((newText) => {
//     console.log(newText)
// }).catch(err => {
//     console.log(err.code, err.message)
// })
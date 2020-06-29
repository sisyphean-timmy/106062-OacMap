if (workbox) {

    console.log(`Workbox is loaded`);

    console.log("預緩存所有經由webpack處理過之資源", self.__precacheManifest)
    workbox.precaching.precacheAndRoute(self.__precacheManifest);

} else {
    console.log(`Workbox didn't load`);
}

// // 當service worker在「安裝階段」時會觸發此事件
// self.addEventListener('install', function(event) {
//     self.skipWaiting();

//     var offlinePage = new Request('offlinePage.html');
//     event.waitUntil(fetch(offlinePage).then(function(response) {
//         return caches.open('offline2').then(function(cache) {
//             return cache.put(offlinePage, response);
//         });
//     }));
// });

// // 設置 App Install 加到主畫面功能
// self.addEventListener('beforeinstallprompt', function(event) {
//     console.log("beforeinstallprompt event triggered")
// })

// // 當service worker在「激活階段」時會觸發此事件
// self.addEventListener('activate', function(event) {
//     console.log('[Service Worker] Activating Service Worker ...', event);
//     return self.clients.claim();
//     // 加上這行是為了確保service worker被正確載入和激活，不加也行
// });

self.addEventListener('fetch', event => {
    console.log('[Service Worker] Fetch something ...', event)
        // event.respondWith(fetch(event.request).catch(function(error) {
        //     return caches.open('offline2').then(function(cache) {
        //         return cache.match('offlinePage.html');
        //     })
        // }))
})

// self.addEventListener('refreshOffline', function(response) {
//     console.log("offline")
//     return caches.open('offline2').then(function(cache) {
//         return cache.put(offlinePage, response);
//     });
// });

// self.addEventListener('push', function(event) {
//     var data = event.data.json();
//     var opts = {
//         body: data.body,
//         icon: data.icon,
//         data: {
//             url: data.url
//         }
//     };
//     event.waitUntil(self.registration.showNotification(data.title, opts));
// });

// self.addEventListener('notificationclick', function(event) {
//     var data = event.notification.data;
//     event.notification.close();
//     event.waitUntil(clients.openWindow(data.url));
// });
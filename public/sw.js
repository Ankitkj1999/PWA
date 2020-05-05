const staticCacheName = 'site-static-v3';
const dynamicCacheName = 'site-dynamic-v4 ';
const assets = [
  '/',
  '/index.html',
  '/js/app.js',
  '/js/ui.js',
  '/js/materialize.min.js',
  '/css/styles.css',
  '/css/materialize.min.css',
  '/fallback.html',
  '/images/1icon.png',
  '/images/2icon.png',
  '/images/about.webp',
  '/images/about2.webp',
  '/images/ankit-1024.jpg',
  '/images/bh_1.webp',
  '/images/boo.svg',
  '/images/book.svg',
  '/images/certificate.svg',
  '/images/desktop.ini',
  '/images/exp.svg',
  '/images/fiverr.svg',
  '/images/github.svg',
  '/images/grad.svg',
  '/images/laptop.svg',
  '/images/linkedin.svg',
  '/images/read.svg',
  '/images/icon-74.png',
  '/images/icon-96.png',
  '/images/icon-128.png',
  '/images/icon-144.png',
  '/images/icon-150.png',
  '/images/icon-180.png',
  '/images/icon-192.png',
  '/images/icon-384.png',
  '/images/icon-512.png',
  '/images/icon-513.png',
  '/images/icon-513.svg',
  '/images/icon.png',
  '/images/image_1.webp',
  '/images/image_2.webp',
  '/images/image_3.webp',
  '/images/image_4.webp',
  '/images/p(3).webp',
  '/images/p2.webp',
  '/images/p3.webp',
  '/images/p4.webp',
  '/images/p5.webp',
  '/images/p6.webp',
  '/images/p1.webp',
  '/images/partner-1.webp',
  '/images/partner-2.webp',
  '/images/partner-3.webp',
  '/images/partner-4.webp',
  '/images/partner-5.webp',
  '/images/person-1.webp',
  '/images/person-2.webp',
  '/images/wix.webp',
  '/images/wordpress.webp',
  '/form-submission-handler.js',



];


// cache size limit function
const limitCacheSize = (name, size) => {
  caches.open(name).then(cache => {
    cache.keys().then(keys => {
      if(keys.length > size){
        cache.delete(keys[0]).then(limitCacheSize(name, size));
      }
    });
  });
};


// install event
self.addEventListener('install', evt => {
  //console.log('service worker installed');
  evt.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      console.log('caching shell assets');
      cache.addAll(assets);
    })
  );
});

// activate event
self.addEventListener('activate', evt => {
  //console.log('service worker activated');
  evt.waitUntil(
    caches.keys().then(keys => {
      //console.log(keys);
      return Promise.all(keys
        .filter(key => key !== staticCacheName && key !== dynamicCacheName)
        .map(key => caches.delete(key))
      );
    })
  );
});

// fetch events
self.addEventListener('fetch', evt => {
  if(evt.request.url.indexOf('firestore.googleapis.com') === -1){
    evt.respondWith(
      caches.match(evt.request).then(cacheRes => {
        return cacheRes || fetch(evt.request).then(fetchRes => {
          return caches.open(dynamicCacheName).then(cache => {
            cache.put(evt.request.url, fetchRes.clone());
            // check cached items size
            limitCacheSize(dynamicCacheName, 150);
            return fetchRes;
          })
        });
      }).catch(() => {
        if(evt.request.url.indexOf('.html') > -1){
          return caches.match('/fallback.html');
        } 
      })
    );
  }
});
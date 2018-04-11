self.addEventListener('install', (event) => {
  event.waitUntil(caches.open('rr-app-v1').then(cache => cache.addAll([
    'data/restaurants.json',
    'js/*.js',
    'styles/main.css',
    'images/*.*',
  ])));
});

self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request).then((response) => {
    return response || fetch(event.request);
  }));
});

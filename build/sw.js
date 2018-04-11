const staticCacheName = 'rr-app-v2';

const makeImageNames = () => {
  const array = [];

  for (let i = 1; i < 11; i += 1) {
    array.push(`/images/${i}-200px.webp`);
    array.push(`/images/${i}-400px.webp`);
    array.push(`/images/${i}-800px.webp`);
    array.push(`/images/${i}-200px.jpg`);
    array.push(`/images/${i}-400px.jpg`);
    array.push(`/images/${i}-800px.jpg`);
  }
  return array;
};

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(staticCacheName).then(cache => cache.addAll([
    './',
    './index.html',
    './restaurant.html',
    './data/restaurants.json',
    './js/dbhelper-min.js',
    './js/main-min.js',
    './js/restaurant_info-min.js',
    './styles/main.css',
  ].concat(makeImageNames()))));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then(cacheNames =>
    Promise.all(cacheNames.filter(cacheName =>
      cacheName !== staticCacheName)
      .map(cacheName => caches.delete(cacheName)))));
});


self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request)
    .then(response =>
      response || fetch(event.request)));
});

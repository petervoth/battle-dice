const CACHE_NAME = 'battle-dice-v1';
const ASSETS = [
  '/battle-dice/',
  '/battle-dice/index.html',
  '/battle-dice/battle-dice.html',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap'
];

// Install — cache core assets
self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(ASSETS.filter(url => !url.startsWith('https://fonts')));
    }).then(function(){ return self.skipWaiting(); })
  );
});

// Activate — clean up old caches
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(function(){ return self.clients.claim(); })
  );
});

// Fetch — network first, fall back to cache
self.addEventListener('fetch', function(e){
  // Skip Firebase and font requests — always network
  const url = e.request.url;
  if(url.includes('firebase') || url.includes('gstatic') || url.includes('googleapis')){
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(function(response){
        // Cache successful responses
        if(response && response.status === 200){
          const clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache){
            cache.put(e.request, clone);
          });
        }
        return response;
      })
      .catch(function(){
        // Network failed — try cache
        return caches.match(e.request);
      })
  );
});

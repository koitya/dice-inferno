// offline cache: everything the game needs is stored on the phone after the first visit
const CACHE = 'dice-inferno-c89fa148';
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png", "audio/boss.mp3", "audio/boss2.mp3", "audio/gameover.mp3", "audio/lastboss.mp3", "audio/n1.mp3", "audio/op.mp3", "audio/roko.mp3", "audio/shop.mp3", "audio/z2.mp3"];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // the page itself: always try the network first so updates show up right away; fall back to the cache offline
  if (e.request.mode === 'navigate'){
    e.respondWith(fetch(e.request, {cache:'no-cache'}).then(res => { if (res.ok){ const cp = res.clone(); caches.open(CACHE).then(c => c.put('index.html', cp)); } return res; })
      .catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(e.request, {ignoreSearch:true}).then(hit => hit || fetch(e.request).then(res => {
    if (res.ok && (new URL(e.request.url).origin === location.origin || /fonts\.(googleapis|gstatic)\.com/.test(e.request.url))){ const cp = res.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); }
    return res;
  }).catch(() => caches.match('index.html'))));
});

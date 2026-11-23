// Service Worker: 앱 파일을 기기에 저장해 데이터 연결 없이 실행되게 한다.
// index.html 등을 수정해 배포할 때마다 CACHE_NAME 버전을 올린다.
const CACHE_NAME = 'ceiling-lighting-calc-v6';
const APP_FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// 온라인이면 최신 파일을 받아 캐시를 갱신하고, 오프라인이면 저장된 파일로 응답한다.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res.ok && new URL(event.request.url).origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(event.request, { ignoreSearch: true }).then(
          (hit) => hit || (event.request.mode === 'navigate' ? caches.match('./index.html') : undefined)
        )
      )
  );
});

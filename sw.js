// SmartBiz PWA service worker
// শুধু অ্যাপের নিজস্ব ফাইল ক্যাশ করে (ইন্টারনেট না থাকলেও অ্যাপের ডিজাইন খুলবে)।
// API কল (Render), Facebook SDK, ফন্ট — এগুলো ক্যাশ করা হয় না, সবসময় সরাসরি নেটওয়ার্ক থেকে আসে,
// তাই অর্ডার/কাস্টমারের ডেটা কখনো পুরনো দেখাবে না।
const CACHE = 'smartbiz-v2';
const SHELL = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // বাইরের সব রিকোয়েস্ট (API ইত্যাদি) সরাসরি যাবে

  // নেটওয়ার্ক আগে, না পেলে ক্যাশ — এতে index.html আপডেট করলে সাথে সাথে নতুনটা পাবেন
  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match('index.html')))
  );
});

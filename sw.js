// SmartBiz — ফোনে পুশ নোটিফিকেশন দেখানোর সার্ভিস-ওয়ার্কার
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', event => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch (e) { d = { title: 'SmartBiz', body: event.data ? event.data.text() : '' }; }
  const title = d.title || 'SmartBiz';
  event.waitUntil(self.registration.showNotification(title, {
    body: d.body || '',
    tag: d.tag || 'smartbiz',
    renotify: true,
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    vibrate: [200, 100, 200],
    data: { url: './' }
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of list) { if ('focus' in c) return c.focus(); }
    return self.clients.openWindow((event.notification.data && event.notification.data.url) || './');
  })());
});

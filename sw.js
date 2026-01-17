/**
 * Service Worker - Alzhra Finance
 * استراتيجية: Network First مع Cache Fallback
 */

const CACHE_NAME = 'alzhra-finance-v2';
const CACHE_VERSION = 2;

// الملفات الأساسية للتخزين المؤقت
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // تفعيل فوري بدون انتظار
        return self.skipWaiting();
      })
  );
});

// تفعيل Service Worker وحذف الـ Cache القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        // السيطرة على جميع الصفحات المفتوحة فوراً
        return self.clients.claim();
      })
  );
});

// استراتيجية Network First
self.addEventListener('fetch', (event) => {
  // تجاهل طلبات غير GET
  if (event.request.method !== 'GET') {
    return;
  }

  // تجاهل طلبات API والـ Extensions
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api') ||
    url.protocol === 'chrome-extension:' ||
    url.hostname !== self.location.hostname) {
    return;
  }

  event.respondWith(
    // محاولة الشبكة أولاً
    fetch(event.request)
      .then((response) => {
        // تخزين نسخة من الاستجابة في الـ Cache
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // الرجوع للـ Cache عند فشل الشبكة
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // صفحة الـ Offline الافتراضية
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// الاستماع لرسائل التحديث
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

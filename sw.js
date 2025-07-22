// Enhanced Service Worker for Mattis Foundation
// Optimized for maximum performance and caching efficiency

const CACHE_NAME = 'mattis-foundation-v2';
const STATIC_CACHE = 'mattis-static-v2';
const IMAGE_CACHE = 'mattis-images-v2';
const API_CACHE = 'mattis-api-v2';

// Critical resources to cache immediately
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/css/critical.css',
  '/css/main.css',
  '/js/main.js',
  '/nav.html',
  '/footer.html',
  '/assets/Mattis_Foundation_Logo_Blue.webp',
  '/assets/Mattis_Foundation_Logo_Blue.png',
  '/assets/Adam&Jenelle1.webp',
  '/assets/Adam&Jenelle1-mobile.webp',
  '/assets/Mattis_Foundation_Favicon.webp'
];

// Extended cache for better performance
const EXTENDED_ASSETS = [
  '/programs.html',
  '/scholarship-application.html',
  '/404.html',
  '/assets/helene.webp',
  '/assets/kjsmith.webp',
  '/assets/undertheoaks.webp',
  '/assets/westpoint.webp',
  '/assets/raleigh2.webp',
  '/assets/logo_instagram.webp',
  '/assets/logo_linkedin.webp'
];

// Install event - Cache critical resources
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache critical assets immediately
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Caching critical assets...');
        return cache.addAll(CRITICAL_ASSETS);
      }),
      
      // Cache extended assets
      caches.open(IMAGE_CACHE).then(cache => {
        console.log('Caching extended assets...');
        return cache.addAll(EXTENDED_ASSETS);
      })
    ]).then(() => {
      console.log('All critical assets cached successfully');
      // Skip waiting to activate immediately
      return self.skipWaiting();
    }).catch(error => {
      console.error('Failed to cache assets:', error);
    })
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && 
              cacheName !== IMAGE_CACHE && 
              cacheName !== API_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Cache cleanup complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - Optimized caching strategy
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome extensions and analytics
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }
  
  // Skip Google Analytics and Tag Manager for better performance
  if (url.hostname.includes('google-analytics.com') || 
      url.hostname.includes('googletagmanager.com')) {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Strategy 1: Critical HTML documents - Stale While Revalidate
    if (request.destination === 'document') {
      return await staleWhileRevalidate(request, STATIC_CACHE);
    }
    
    // Strategy 2: Images - Cache First with fallback
    if (request.destination === 'image') {
      return await cacheFirst(request, IMAGE_CACHE);
    }
    
    // Strategy 3: CSS/JS - Cache First for performance
    if (request.destination === 'style' || 
        request.destination === 'script') {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // Strategy 4: Fonts - Cache First (long-term cache)
    if (request.destination === 'font') {
      return await cacheFirst(request, STATIC_CACHE, { 
        maxAge: 365 * 24 * 60 * 60 // 1 year
      });
    }
    
    // Strategy 5: API calls - Network First
    if (url.pathname.includes('/api/')) {
      return await networkFirst(request, API_CACHE);
    }
    
    // Strategy 6: Everything else - Network First with cache fallback
    return await networkFirst(request, STATIC_CACHE);
    
  } catch (error) {
    console.error('Request failed:', error);
    
    // Fallback for failed requests
    if (request.destination === 'document') {
      const cachedResponse = await caches.match('/index.html');
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    throw error;
  }
}

// Cache First Strategy - Best for static assets
async function cacheFirst(request, cacheName, options = {}) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Check if cache is still fresh (optional)
    if (options.maxAge) {
      const cacheDate = new Date(cachedResponse.headers.get('date'));
      const now = new Date();
      const age = (now - cacheDate) / 1000; // age in seconds
      
      if (age > options.maxAge) {
        // Cache is stale, fetch new version in background
        fetch(request).then(response => {
          if (response.status === 200) {
            cache.put(request, response.clone());
          }
        }).catch(() => {}); // Ignore fetch errors
      }
    }
    
    return cachedResponse;
  }
  
  // Not in cache, fetch from network
  const networkResponse = await fetch(request);
  
  if (networkResponse.status === 200) {
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Stale While Revalidate Strategy - Best for HTML documents
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Always fetch from network to update cache
  const networkPromise = fetch(request).then(response => {
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null); // Don't throw on network errors
  
  // Return cached version immediately if available
  if (cachedResponse) {
    // Update cache in background
    networkPromise.catch(() => {}); // Ignore errors
    return cachedResponse;
  }
  
  // No cache, wait for network
  return await networkPromise || new Response('Network Error', { 
    status: 408,
    statusText: 'Request Timeout' 
  });
}

// Network First Strategy - Best for dynamic content
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Background sync for offline actions (optional enhancement)
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle any offline actions when connection is restored
  console.log('Background sync triggered');
}

// Push notifications support (future enhancement)
self.addEventListener('push', event => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/assets/Mattis_Foundation_Logo_Blue.png',
      badge: '/assets/Mattis_Foundation_Favicon.png',
      vibrate: [200, 100, 200],
      data: {
        dateOfArrival: Date.now()
      }
    };
    
    event.waitUntil(
      self.registration.showNotification('Mattis Foundation', options)
    );
  }
});

// Enhanced error handling
self.addEventListener('error', event => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('Service Worker unhandled rejection:', event.reason);
});

console.log('Mattis Foundation Service Worker loaded successfully');
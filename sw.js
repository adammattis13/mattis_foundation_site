// Service Worker for The Mattis Foundation
const CACHE_NAME = 'mattis-foundation-v1.0.1';
const STATIC_CACHE = 'mattis-static-v1.0.1';
const DYNAMIC_CACHE = 'mattis-dynamic-v1.0.1';

// Critical resources to cache immediately
const CRITICAL_RESOURCES = [
    '/',
    '/index.html',
    '/css/critical.css',
    '/css/main.css',
    '/js/main.js',
    '/assets/Mattis_Foundation_Logo_Blue.webp',
    '/assets/Mattis_Foundation_Logo_Blue.png',
    '/assets/Mattis_Foundation_Favicon.webp',
    '/assets/Mattis_Foundation_Favicon.png',
    '/assets/Adam&Jenelle1.webp',
    '/assets/Adam&Jenelle1-mobile.webp',
    'https://fonts.googleapis.com/css2?family=Georgia:wght@400;500;700&display=swap'
];

// Resources to cache on first access
const CACHE_ON_ACCESS = [
    '/assets/Adam&Jenelle1.jpg',
    '/assets/Adam&Jenelle1-mobile.jpg',
    '/assets/helene.webp',
    '/assets/helene.jpg',
    '/assets/kjsmith.webp',
    '/assets/kjsmith.jpeg',
    '/assets/undertheoaks.webp',
    '/assets/undertheoaks.jpg',
    '/assets/westpoint.webp',
    '/assets/westpoint.jpg',
    '/assets/raleigh2.webp',
    '/assets/raleigh2.jpg',
    '/assets/logo_instagram.webp',
    '/assets/logo_instagram.png',
    '/assets/logo_linkedin.webp',
    '/assets/logo_linkedin.png'
];

// Network-first resources (always try network first)
const NETWORK_FIRST = [
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com'
];

// Install event - cache critical resources
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        Promise.all([
            caches.open(STATIC_CACHE).then(cache => {
                console.log('Caching critical resources...');
                return cache.addAll(CRITICAL_RESOURCES.map(url => {
                    return new Request(url, { cache: 'reload' });
                }));
            }),
            // Skip waiting to activate immediately
            self.skipWaiting()
        ])
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => 
                            cacheName !== STATIC_CACHE && 
                            cacheName !== DYNAMIC_CACHE &&
                            cacheName !== CACHE_NAME
                        )
                        .map(cacheName => {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            }),
            // Take control of all clients
            self.clients.claim()
        ])
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip cross-origin requests that aren't in our allow list
    if (url.origin !== location.origin && !isAllowedOrigin(url.origin)) {
        return;
    }
    
    // Different strategies based on request type
    if (isCriticalResource(request.url)) {
        event.respondWith(cacheFirst(request));
    } else if (isNetworkFirst(request.url)) {
        event.respondWith(networkFirst(request));
    } else if (isImageRequest(request)) {
        event.respondWith(cacheFirstWithFallback(request));
    } else {
        event.respondWith(staleWhileRevalidate(request));
    }
});

// Cache-first strategy (for static assets)
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.status === 200) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Cache-first failed:', error);
        return new Response('Offline', { status: 503 });
    }
}

// Network-first strategy (for dynamic content)
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Network failed, trying cache:', request.url);
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        return new Response('Offline', { status: 503 });
    }
}

// Cache-first with fallback for images
async function cacheFirstWithFallback(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        
        if (networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // Return a fallback image or placeholder
        return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="#f0f0f0"/><text x="150" y="100" text-anchor="middle" fill="#666" font-family="Arial">Image unavailable</text></svg>',
            {
                headers: {
                    'Content-Type': 'image/svg+xml',
                    'Cache-Control': 'no-cache'
                }
            }
        );
    }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);
    
    const networkResponsePromise = fetch(request).then(response => {
        if (response.status === 200) {
            const cache = caches.open(DYNAMIC_CACHE);
            cache.then(c => c.put(request, response.clone()));
        }
        return response;
    }).catch(() => null);
    
    return cachedResponse || await networkResponsePromise || 
           new Response('Offline', { status: 503 });
}

// Helper functions
function isCriticalResource(url) {
    return CRITICAL_RESOURCES.some(resource => url.includes(resource));
}

function isNetworkFirst(url) {
    return NETWORK_FIRST.some(domain => url.includes(domain));
}

function isImageRequest(request) {
    return request.destination === 'image' || 
           request.url.includes('.jpg') ||
           request.url.includes('.jpeg') ||
           request.url.includes('.png') ||
           request.url.includes('.webp') ||
           request.url.includes('.svg');
}

function isAllowedOrigin(origin) {
    const allowedOrigins = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com'
    ];
    return allowedOrigins.includes(origin);
}

// Background sync for form submissions (future enhancement)
self.addEventListener('sync', event => {
    if (event.tag === 'contact-form') {
        event.waitUntil(syncContactForm());
    }
});

async function syncContactForm() {
    // This would handle offline form submissions
    // For now, we'll just log that sync is available
    console.log('Background sync available for contact form');
}

// Handle service worker updates
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Cleanup old caches periodically
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            // Keep only the latest 3 caches
            const cachesToKeep = [STATIC_CACHE, DYNAMIC_CACHE, CACHE_NAME];
            return Promise.all(
                cacheNames
                    .filter(cacheName => !cachesToKeep.includes(cacheName))
                    .map(cacheName => caches.delete(cacheName))
            );
        })
    );
});

// Performance monitoring
self.addEventListener('fetch', event => {
    const startTime = performance.now();
    
    event.respondWith(
        handleRequest(event.request).then(response => {
            const duration = performance.now() - startTime;
            if (duration > 1000) { // Log slow requests
                console.log(`Slow request: ${event.request.url} took ${duration}ms`);
            }
            return response;
        })
    );
});

async function handleRequest(request) {
    // Use the appropriate strategy based on request type
    const url = new URL(request.url);
    
    if (isCriticalResource(request.url)) {
        return cacheFirst(request);
    } else if (isNetworkFirst(request.url)) {
        return networkFirst(request);
    } else if (isImageRequest(request)) {
        return cacheFirstWithFallback(request);
    } else {
        return staleWhileRevalidate(request);
    }
}

console.log('Service Worker loaded successfully');
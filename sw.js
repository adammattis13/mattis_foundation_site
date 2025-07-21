// Service Worker for The Mattis Foundation - Mobile Optimized
const CACHE_NAME = 'mattis-foundation-v1.0.2';
const STATIC_CACHE = 'mattis-static-v1.0.2';
const DYNAMIC_CACHE = 'mattis-dynamic-v1.0.2';

// Critical resources to cache immediately - Mobile prioritized
const CRITICAL_RESOURCES = [
    '/',
    '/index.html',
    '/css/critical.css',
    '/css/main.css',
    '/js/main.js',
    '/assets/Mattis_Foundation_Logo_Blue.webp',
    '/assets/Mattis_Foundation_Logo_Blue.png',
    '/assets/Adam&Jenelle1-mobile.webp',
    '/assets/Adam&Jenelle1-mobile.jpg',
    'https://fonts.googleapis.com/css2?family=Georgia:wght@400;500;700&display=swap'
];

// Resources to cache on first access - Desktop images lower priority
const CACHE_ON_ACCESS = [
    '/assets/Adam&Jenelle1.webp',
    '/assets/Adam&Jenelle1.jpg',
    '/assets/Mattis_Foundation_Favicon.webp',
    '/assets/Mattis_Foundation_Favicon.png',
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

// Install event - prioritize mobile resources
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE).then(cache => {
            console.log('Caching critical resources...');
            // Cache mobile resources first
            return cache.addAll(CRITICAL_RESOURCES);
        }).then(() => {
            return self.skipWaiting();
        })
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
                            !cacheName.includes('v1.0.2')
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

// Fast fetch strategy for mobile
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
    
    // Mobile-optimized caching strategies
    if (isCriticalResource(request.url)) {
        event.respondWith(cacheFirstFast(request));
    } else if (isNetworkFirst(request.url)) {
        event.respondWith(networkFirstFast(request));
    } else if (isImageRequest(request)) {
        event.respondWith(cacheFirstWithWebP(request));
    } else {
        event.respondWith(staleWhileRevalidateFast(request));
    }
});

// Ultra-fast cache-first strategy
async function cacheFirstFast(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await Promise.race([
            fetch(request),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('timeout')), 3000)
            )
        ]);
        
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        return new Response('Offline', { 
            status: 503,
            statusText: 'Service Unavailable' 
        });
    }
}

// Fast network-first with shorter timeout
async function networkFirstFast(request) {
    try {
        const networkResponse = await Promise.race([
            fetch(request),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('timeout')), 2000)
            )
        ]);
        
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        return cachedResponse || new Response('Offline', { status: 503 });
    }
}

// WebP-optimized image serving
async function cacheFirstWithWebP(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // Return optimized placeholder for failed images
        return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="#f8f9fa"/><text x="150" y="100" text-anchor="middle" fill="#666" font-family="Arial" font-size="14">Image loading...</text></svg>',
            {
                headers: {
                    'Content-Type': 'image/svg+xml',
                    'Cache-Control': 'no-cache'
                }
            }
        );
    }
}

// Fast stale-while-revalidate
async function staleWhileRevalidateFast(request) {
    const cachedResponse = await caches.match(request);
    
    const networkResponsePromise = fetch(request).then(response => {
        if (response.ok) {
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
    return CRITICAL_RESOURCES.some(resource => url.includes(resource.replace(/^\//, '')));
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

console.log('Service Worker loaded - Mobile optimized');
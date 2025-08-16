/**
 * Service Worker Registration and Management
 * Provides offline capabilities and advanced caching strategies
 */

export interface ServiceWorkerConfig {
  swPath: string;
  scope: string;
  updateCheckInterval: number;
  enableBackgroundSync: boolean;
  enablePushNotifications: boolean;
}

export class ServiceWorkerManager {
  private config: ServiceWorkerConfig;
  private registration: ServiceWorkerRegistration | null = null;
  private updateCheckTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<ServiceWorkerConfig> = {}) {
    this.config = {
      swPath: '/sw.js',
      scope: '/',
      updateCheckInterval: 60000, // 1 minute
      enableBackgroundSync: true,
      enablePushNotifications: false,
      ...config
    };
  }

  public async register(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return;
    }

    try {
      this.registration = await navigator.serviceWorker.register(
        this.config.swPath,
        { scope: this.config.scope }
      );

      console.log('Service Worker registered:', this.registration.scope);

      // Set up update checking
      this.setupUpdateChecking();

      // Set up message handling
      this.setupMessageHandling();

      // Request notification permission if enabled
      if (this.config.enablePushNotifications) {
        await this.requestNotificationPermission();
      }

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  public async unregister(): Promise<void> {
    if (this.registration) {
      const success = await this.registration.unregister();
      if (success) {
        console.log('Service Worker unregistered');
        this.registration = null;
      }
    }

    if (this.updateCheckTimer) {
      clearInterval(this.updateCheckTimer);
      this.updateCheckTimer = null;
    }
  }

  public async checkForUpdates(): Promise<boolean> {
    if (!this.registration) return false;

    await this.registration.update();
    return !!this.registration.waiting;
  }

  public async skipWaiting(): Promise<void> {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  public async cacheResources(resources: string[]): Promise<void> {
    if (!this.registration?.active) return;

    this.registration.active.postMessage({
      type: 'CACHE_RESOURCES',
      payload: { resources }
    });
  }

  public async clearCache(cacheNames?: string[]): Promise<void> {
    if (!this.registration?.active) return;

    this.registration.active.postMessage({
      type: 'CLEAR_CACHE',
      payload: { cacheNames }
    });
  }

  public async backgroundSync(tag: string, data?: any): Promise<void> {
    if (!this.config.enableBackgroundSync || !this.registration?.sync) {
      console.warn('Background Sync not available');
      return;
    }

    // Store data for background sync
    if (data) {
      const db = await this.openDB();
      await this.storeBackgroundSyncData(db, tag, data);
    }

    await this.registration.sync.register(tag);
  }

  public async subscribeToNotifications(): Promise<PushSubscription | null> {
    if (!this.config.enablePushNotifications || !this.registration) {
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.getVapidPublicKey()
      });

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      return subscription;

    } catch (error) {
      console.error('Failed to subscribe to notifications:', error);
      return null;
    }
  }

  public getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  public isSupported(): boolean {
    return 'serviceWorker' in navigator;
  }

  private setupUpdateChecking(): void {
    if (!this.registration) return;

    // Check for updates immediately
    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration!.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            this.notifyUpdateAvailable();
          }
        });
      }
    });

    // Periodic update checks
    this.updateCheckTimer = setInterval(async () => {
      const hasUpdate = await this.checkForUpdates();
      if (hasUpdate) {
        this.notifyUpdateAvailable();
      }
    }, this.config.updateCheckInterval);
  }

  private setupMessageHandling(): void {
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, payload } = event.data;

      switch (type) {
        case 'CACHE_UPDATED':
          console.log('Cache updated:', payload);
          break;

        case 'BACKGROUND_SYNC_SUCCESS':
          console.log('Background sync completed:', payload);
          this.handleBackgroundSyncSuccess(payload);
          break;

        case 'BACKGROUND_SYNC_FAILED':
          console.error('Background sync failed:', payload);
          break;

        case 'OFFLINE_FALLBACK':
          console.log('Serving offline fallback');
          break;
      }
    });
  }

  private notifyUpdateAvailable(): void {
    // Dispatch custom event for UI to handle
    window.dispatchEvent(new CustomEvent('swUpdateAvailable', {
      detail: { registration: this.registration }
    }));
  }

  private async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
    }
  }

  private getVapidPublicKey(): Uint8Array {
    // This should be your VAPID public key
    const key = 'YOUR_VAPID_PUBLIC_KEY_HERE';
    const padding = '='.repeat((4 - key.length % 4) % 4);
    const base64 = (key + padding).replace(/-/g, '+').replace(/_/g, '/');
    return new Uint8Array(Array.from(atob(base64), c => c.charCodeAt(0)));
  }

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('IntraSphereDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('backgroundSync')) {
          db.createObjectStore('backgroundSync', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  private async storeBackgroundSyncData(db: IDBDatabase, tag: string, data: any): Promise<void> {
    const transaction = db.transaction(['backgroundSync'], 'readwrite');
    const store = transaction.objectStore('backgroundSync');
    
    await store.add({
      tag,
      data,
      timestamp: Date.now()
    });
  }

  private handleBackgroundSyncSuccess(payload: any): void {
    // Notify app about successful background sync
    window.dispatchEvent(new CustomEvent('backgroundSyncSuccess', {
      detail: payload
    }));
  }
}

// Service Worker content (to be saved as public/sw.js)
export const serviceWorkerContent = `
const CACHE_NAME = 'intrasphere-v1';
const STATIC_CACHE = 'intrasphere-static-v1';
const API_CACHE = 'intrasphere-api-v1';

const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_RESOURCES)),
      self.skipWaiting()
    ])
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      cleanupOldCaches(),
      self.clients.claim()
    ])
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
  }
  // Static resources
  else if (request.destination === 'document' || 
           request.destination === 'script' || 
           request.destination === 'style' ||
           request.destination === 'image') {
    event.respondWith(handleStaticRequest(request));
  }
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag.startsWith('background-sync-')) {
    event.waitUntil(handleBackgroundSync(event.tag));
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(handlePushNotification(data));
  }
});

// Message handler
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CACHE_RESOURCES':
      event.waitUntil(cacheResources(payload.resources));
      break;

    case 'CLEAR_CACHE':
      event.waitUntil(clearCache(payload.cacheNames));
      break;
  }
});

// Helper functions
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    // Try network first
    const response = await fetch(request);
    
    // Cache successful GET requests
    if (request.method === 'GET' && response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Fallback to cache for GET requests
    if (request.method === 'GET') {
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    // Return offline response for failed requests
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'Request failed and no cached version available'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  
  try {
    // Cache first strategy for static resources
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return cache.match('/offline.html');
    }
    
    throw error;
  }
}

async function handleBackgroundSync(tag) {
  try {
    const db = await openDB();
    const syncData = await getSyncData(db, tag);
    
    if (syncData) {
      // Process sync data
      await processSyncData(syncData);
      
      // Remove from storage
      await removeSyncData(db, syncData.id);
      
      // Notify success
      self.postMessage({
        type: 'BACKGROUND_SYNC_SUCCESS',
        payload: { tag, data: syncData }
      });
    }
  } catch (error) {
    self.postMessage({
      type: 'BACKGROUND_SYNC_FAILED',
      payload: { tag, error: error.message }
    });
  }
}

async function handlePushNotification(data) {
  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [100, 50, 100],
    data: data.data,
    actions: data.actions || []
  };

  return self.registration.showNotification(data.title, options);
}

async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const validCaches = [CACHE_NAME, STATIC_CACHE, API_CACHE];
  
  return Promise.all(
    cacheNames
      .filter(name => !validCaches.includes(name))
      .map(name => caches.delete(name))
  );
}

async function cacheResources(resources) {
  const cache = await caches.open(STATIC_CACHE);
  return cache.addAll(resources);
}

async function clearCache(cacheNames) {
  if (cacheNames) {
    return Promise.all(cacheNames.map(name => caches.delete(name)));
  } else {
    const allCaches = await caches.keys();
    return Promise.all(allCaches.map(name => caches.delete(name)));
  }
}

// IndexedDB helpers
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('IntraSphereDB', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function getSyncData(db, tag) {
  const transaction = db.transaction(['backgroundSync'], 'readonly');
  const store = transaction.objectStore('backgroundSync');
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const records = request.result;
      resolve(records.find(record => record.tag === tag));
    };
  });
}

async function removeSyncData(db, id) {
  const transaction = db.transaction(['backgroundSync'], 'readwrite');
  const store = transaction.objectStore('backgroundSync');
  return store.delete(id);
}

async function processSyncData(syncData) {
  // Process the sync data (e.g., send to server)
  const response = await fetch('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(syncData.data)
  });
  
  if (!response.ok) {
    throw new Error('Sync request failed');
  }
  
  return response.json();
}
`;

// Global service worker manager instance
export const swManager = new ServiceWorkerManager();

// Utility functions
export const swUtils = {
  // Initialize service worker
  initialize: async (): Promise<void> => {
    if (swManager.isSupported()) {
      await swManager.register();
    }
  },

  // Check if app is running in standalone mode (PWA)
  isStandalone: (): boolean => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  },

  // Check if app is offline
  isOffline: (): boolean => {
    return !navigator.onLine;
  },

  // Cache critical resources
  precacheResources: async (resources: string[]): Promise<void> => {
    await swManager.cacheResources(resources);
  },

  // Setup offline/online listeners
  setupConnectionListeners: (
    onOnline?: () => void,
    onOffline?: () => void
  ): void => {
    window.addEventListener('online', () => {
      console.log('App is online');
      onOnline?.();
    });

    window.addEventListener('offline', () => {
      console.log('App is offline');
      onOffline?.();
    });
  }
};
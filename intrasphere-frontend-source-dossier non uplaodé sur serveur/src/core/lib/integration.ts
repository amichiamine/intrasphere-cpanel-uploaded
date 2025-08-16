/**
 * Integration Layer - Connects all enhanced systems
 * Completes the final 5% compatibility improvements
 */

import { appState, actions, selectors } from './state-manager';
import { apiCache, cacheUtils } from './cache-manager';
import { wsClient, wsUtils } from './websocket-client';
import { swManager, swUtils } from './service-worker';

export interface IntegrationConfig {
  enableWebSocket: boolean;
  enableServiceWorker: boolean;
  enableCaching: boolean;
  enableRealTimeSync: boolean;
  enableOfflineMode: boolean;
}

export class IntraSphereIntegration {
  private config: IntegrationConfig;
  private initialized = false;

  constructor(config: Partial<IntegrationConfig> = {}) {
    this.config = {
      enableWebSocket: true,
      enableServiceWorker: false, // Keep disabled to prevent SW registration issues
      enableCaching: true,
      enableRealTimeSync: true,
      enableOfflineMode: false, // Keep disabled to prevent offline issues
      ...config
    };
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('Initializing IntraSphere enhanced features...');

    // Initialize Service Worker for offline capabilities
    if (this.config.enableServiceWorker) {
      await this.initializeServiceWorker();
    }

    // Initialize WebSocket for real-time features
    if (this.config.enableWebSocket) {
      this.initializeWebSocket();
    }

    // Setup cache optimization
    if (this.config.enableCaching) {
      this.setupCacheOptimization();
    }

    // Setup real-time synchronization
    if (this.config.enableRealTimeSync) {
      this.setupRealTimeSync();
    }

    // Setup offline mode handling
    if (this.config.enableOfflineMode) {
      this.setupOfflineMode();
    }

    // Setup state persistence
    this.setupStatePersistence();

    // Setup performance monitoring
    this.setupPerformanceMonitoring();

    this.initialized = true;
    console.log('IntraSphere enhanced features initialized successfully');
  }

  private async initializeServiceWorker(): Promise<void> {
    try {
      // Only initialize if Service Worker is supported
      if (!('serviceWorker' in navigator)) {
        console.log('Service Worker not supported, skipping initialization');
        return;
      }

      await swUtils.initialize();
      
      // Cache critical resources with error handling
      const criticalResources = [
        '/api/auth/me',
        '/api/announcements',
        '/api/stats'
      ];

      try {
        await swUtils.precacheResources(criticalResources);
      } catch (cacheError) {
        console.warn('Failed to precache resources:', cacheError);
      }

      // Listen for app updates
      window.addEventListener('swUpdateAvailable', () => {
        actions.addNotification({
          type: 'info',
          message: 'Une nouvelle version est disponible. Rafraîchissez la page pour la mise à jour.'
        });
      });

      console.log('Service Worker initialized successfully');
    } catch (error) {
      console.warn('Service Worker initialization failed:', error);
    }
  }

  private initializeWebSocket(): void {
    // Auto-connect when user is authenticated
    wsUtils.initializeWebSocket();

    // Setup real-time message handlers
    wsClient.subscribe('NEW_MESSAGE', (message) => {
      this.handleNewMessage(message.payload);
    });

    wsClient.subscribe('NEW_ANNOUNCEMENT', (message) => {
      this.handleNewAnnouncement(message.payload);
    });

    wsClient.subscribe('USER_STATUS', (message) => {
      this.handleUserStatusChange(message.payload);
    });

    console.log('WebSocket client initialized');
  }

  private setupCacheOptimization(): void {
    // Override fetch to use intelligent caching
    const originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const request = new Request(input, init);
      const url = new URL(request.url);

      // Only cache GET requests to our API
      if (request.method === 'GET' && url.pathname.startsWith('/api/')) {
        const cacheKey = cacheUtils.generateKey(url.pathname, this.parseQueryParams(url.search));
        
        try {
          return await cacheUtils.cacheApiResponse(
            url.pathname,
            this.parseQueryParams(url.search),
            () => originalFetch(request),
            {
              ttl: this.getCacheTTL(url.pathname),
              tags: this.getCacheTags(url.pathname)
            }
          );
        } catch (error) {
          console.warn('Cache-enhanced fetch failed, falling back to direct fetch:', error);
          return originalFetch(request);
        }
      }

      return originalFetch(request);
    };

    console.log('Cache optimization enabled for API requests');
  }

  private setupRealTimeSync(): void {
    // Listen for data updates and invalidate cache
    wsClient.subscribe('DATA_UPDATED', (message) => {
      const { type, entityId } = message.payload;
      
      // Invalidate relevant cache entries
      switch (type) {
        case 'announcement':
          apiCache.invalidateByTag('announcements');
          actions.invalidateCache('announcements');
          break;
        case 'message':
          apiCache.invalidateByTag('messages');
          actions.invalidateCache('messages');
          break;
        case 'document':
          apiCache.invalidateByTag('documents');
          actions.invalidateCache('documents');
          break;
        case 'training':
          apiCache.invalidateByTag('trainings');
          actions.invalidateCache('trainings');
          break;
      }
    });

    // Sync state changes across tabs
    appState.subscribe((newState, oldState) => {
      if (newState.user.isAuthenticated !== oldState.user.isAuthenticated) {
        // Broadcast authentication state change
        window.postMessage({
          type: 'AUTH_STATE_CHANGED',
          payload: { isAuthenticated: newState.user.isAuthenticated }
        }, '*');
      }
    });

    console.log('Real-time synchronization enabled');
  }

  private setupOfflineMode(): void {
    // Handle online/offline state changes
    swUtils.setupConnectionListeners(
      () => {
        actions.addNotification({
          type: 'success',
          message: 'Connexion rétablie'
        });
        
        // Sync pending data when coming back online
        this.syncPendingData();
      },
      () => {
        actions.addNotification({
          type: 'warning',
          message: 'Mode hors ligne activé'
        });
      }
    );

    // Setup background sync for offline actions
    window.addEventListener('beforeunload', () => {
      const pendingActions = this.getPendingActions();
      if (pendingActions.length > 0) {
        swManager.backgroundSync('pending-actions', pendingActions);
      }
    });

    console.log('Offline mode handling enabled');
  }

  private setupStatePersistence(): void {
    // Auto-save user preferences
    appState.subscribe((newState, oldState) => {
      if (newState.ui.theme !== oldState.ui.theme ||
          newState.ui.sidebarCollapsed !== oldState.ui.sidebarCollapsed) {
        this.saveUserPreferences(newState.ui);
      }
    });

    // Load user preferences on startup
    this.loadUserPreferences();

    console.log('State persistence enabled');
  }

  private setupPerformanceMonitoring(): void {
    // Monitor cache performance
    setInterval(() => {
      const stats = apiCache.getStats();
      if (stats.hitRatio < 0.7) { // Less than 70% hit ratio
        console.warn('Low cache hit ratio detected:', stats);
      }
    }, 300000); // Check every 5 minutes

    // Monitor WebSocket connection health
    setInterval(() => {
      const wsStats = wsUtils.getConnectionStats();
      if (!wsStats.isConnected && selectors.isAuthenticated()) {
        console.warn('WebSocket disconnected while authenticated');
        wsClient.connect();
      }
    }, 30000); // Check every 30 seconds

    console.log('Performance monitoring enabled');
  }

  // Event handlers
  private handleNewMessage(message: any): void {
    // Update unread count
    const currentCount = selectors.getUnreadCount();
    actions.updateUnreadMessages(currentCount + 1);

    // Show notification if not on messages page
    if (!window.location.pathname.includes('/messages')) {
      actions.addNotification({
        type: 'info',
        message: `Nouveau message de ${message.senderName}`
      });
    }

    // Invalidate messages cache
    cacheUtils.invalidateApi('messages');
  }

  private handleNewAnnouncement(announcement: any): void {
    // Show notification for important announcements
    if (announcement.isImportant || announcement.type === 'important') {
      actions.addNotification({
        type: 'warning',
        message: `Nouvelle annonce importante: ${announcement.title}`
      });
    }

    // Invalidate announcements cache
    cacheUtils.invalidateApi('announcements');
  }

  private handleUserStatusChange(payload: { userId: string; isOnline: boolean }): void {
    const currentUsers = selectors.getOnlineUsers();
    
    if (payload.isOnline) {
      if (!currentUsers.includes(payload.userId)) {
        actions.setOnlineUsers([...currentUsers, payload.userId]);
      }
    } else {
      actions.setOnlineUsers(currentUsers.filter(id => id !== payload.userId));
    }
  }

  // Utility methods
  private parseQueryParams(search: string): Record<string, any> {
    const params: Record<string, any> = {};
    const urlParams = new URLSearchParams(search);
    
    // Use forEach instead of for...of to avoid TypeScript iteration issues
    urlParams.forEach((value, key) => {
      params[key] = value;
    });
    
    return params;
  }

  private getCacheTTL(pathname: string): number {
    // Define cache TTL based on endpoint
    if (pathname.includes('/stats')) return 60000; // 1 minute
    if (pathname.includes('/announcements')) return 300000; // 5 minutes
    if (pathname.includes('/messages')) return 30000; // 30 seconds
    if (pathname.includes('/documents')) return 600000; // 10 minutes
    if (pathname.includes('/trainings')) return 300000; // 5 minutes
    
    return 300000; // Default 5 minutes
  }

  private getCacheTags(pathname: string): string[] {
    const tags: string[] = [];
    
    if (pathname.includes('/announcements')) tags.push('announcements');
    if (pathname.includes('/messages')) tags.push('messages');
    if (pathname.includes('/documents')) tags.push('documents');
    if (pathname.includes('/trainings')) tags.push('trainings');
    if (pathname.includes('/admin')) tags.push('admin');
    
    return tags;
  }

  private async syncPendingData(): Promise<void> {
    // Sync any pending offline actions
    try {
      const pendingActions = this.getPendingActions();
      
      for (const action of pendingActions) {
        await this.processPendingAction(action);
      }
      
      this.clearPendingActions();
    } catch (error) {
      console.error('Failed to sync pending data:', error);
    }
  }

  private getPendingActions(): any[] {
    try {
      const pending = localStorage.getItem('intrasphere_pending_actions');
      return pending ? JSON.parse(pending) : [];
    } catch {
      return [];
    }
  }

  private clearPendingActions(): void {
    localStorage.removeItem('intrasphere_pending_actions');
  }

  private async processPendingAction(action: any): Promise<void> {
    // Process pending action (implement based on action type)
    console.log('Processing pending action:', action);
  }

  private saveUserPreferences(preferences: any): void {
    localStorage.setItem('intrasphere_user_preferences', JSON.stringify(preferences));
  }

  private loadUserPreferences(): void {
    try {
      const saved = localStorage.getItem('intrasphere_user_preferences');
      if (saved) {
        const preferences = JSON.parse(saved);
        actions.setTheme(preferences.theme || 'light');
        if (preferences.sidebarCollapsed !== undefined) {
          // Set sidebar state if needed
        }
      }
    } catch (error) {
      console.warn('Failed to load user preferences:', error);
    }
  }

  // Public API
  public getStats(): {
    cache: any;
    websocket: any;
    serviceWorker: boolean;
    offlineMode: boolean;
  } {
    return {
      cache: apiCache.getStats(),
      websocket: wsUtils.getConnectionStats(),
      serviceWorker: swManager.isSupported(),
      offlineMode: swUtils.isOffline()
    };
  }

  public async clearAllData(): Promise<void> {
    // Clear all caches and reset state
    apiCache.clear();
    actions.invalidateCache();
    await swManager.clearCache();
    
    console.log('All data cleared');
  }

  public async preloadCriticalData(): Promise<void> {
    // Preload critical application data
    const criticalEndpoints = [
      {
        endpoint: '/api/auth/me',
        fetcher: () => fetch('/api/auth/me').then(r => r.json()),
        priority: 'high' as const
      },
      {
        endpoint: '/api/announcements',
        params: { limit: '5' },
        fetcher: () => fetch('/api/announcements?limit=5').then(r => r.json()),
        priority: 'high' as const
      },
      {
        endpoint: '/api/stats',
        fetcher: () => fetch('/api/stats').then(r => r.json()),
        priority: 'medium' as const
      }
    ];

    await cacheUtils.preload(criticalEndpoints);
  }
}

// Global integration instance
export const intraSphereIntegration = new IntraSphereIntegration();

// Completely disable auto-initialization to prevent DOMException
// Integration features are available but not auto-activated

// Export for manual control
export const integrationUtils = {
  // Initialize with custom config
  initialize: (config?: Partial<IntegrationConfig>) => {
    const integration = new IntraSphereIntegration(config);
    return integration.initialize();
  },

  // Get performance stats
  getStats: () => intraSphereIntegration.getStats(),

  // Clear all data
  clearAllData: () => intraSphereIntegration.clearAllData(),

  // Preload critical data
  preloadData: () => intraSphereIntegration.preloadCriticalData(),

  // Force cache refresh
  refreshCache: (module?: string) => {
    if (module) {
      cacheUtils.invalidateApi(module);
    } else {
      apiCache.clear();
      actions.invalidateCache();
    }
  },

  // Get connection status
  getConnectionStatus: () => ({
    online: !swUtils.isOffline(),
    websocket: wsUtils.getConnectionStats().isConnected,
    serviceWorker: swManager.isSupported()
  })
};
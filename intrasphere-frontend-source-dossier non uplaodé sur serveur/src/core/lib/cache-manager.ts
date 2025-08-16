/**
 * Advanced Client-Side Cache Manager
 * Implements sophisticated caching strategies for optimal performance
 */

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expires: number;
  version: string;
  tags: string[];
}

export interface CacheConfig {
  defaultTTL: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of items
  strategy: 'LRU' | 'LFU' | 'FIFO';
  persistToStorage: boolean;
  storagePrefix: string;
}

export class CacheManager {
  private cache: Map<string, CacheItem<any>> = new Map();
  private accessCount: Map<string, number> = new Map();
  private accessOrder: string[] = [];
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 300000, // 5 minutes
      maxSize: 100,
      strategy: 'LRU',
      persistToStorage: true,
      storagePrefix: 'intrasphere_cache_',
      ...config
    };

    // Load persisted cache on initialization
    if (this.config.persistToStorage) {
      this.loadFromStorage();
    }

    // Cleanup expired items periodically
    setInterval(() => this.cleanup(), 60000); // Every minute
  }

  public set<T>(
    key: string, 
    data: T, 
    options: {
      ttl?: number;
      tags?: string[];
      version?: string;
    } = {}
  ): void {
    const now = Date.now();
    const ttl = options.ttl || this.config.defaultTTL;
    
    const item: CacheItem<T> = {
      data,
      timestamp: now,
      expires: now + ttl,
      version: options.version || '1.0',
      tags: options.tags || []
    };

    // Remove if already exists (for strategy tracking)
    if (this.cache.has(key)) {
      this.removeFromTracking(key);
    }

    // Check if we need to evict items
    if (this.cache.size >= this.config.maxSize) {
      this.evict();
    }

    this.cache.set(key, item);
    this.updateTracking(key);

    // Persist to storage if enabled
    if (this.config.persistToStorage) {
      this.persistItem(key, item);
    }
  }

  public get<T>(key: string): T | null {
    const item = this.cache.get(key) as CacheItem<T> | undefined;
    
    if (!item) {
      this.incrementMissCount();
      return null;
    }

    // Check if expired
    if (Date.now() > item.expires) {
      this.delete(key);
      this.incrementMissCount();
      return null;
    }

    // Update access tracking
    this.updateTracking(key);

    return item.data;
  }

  public has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) {
      return false;
    }

    // Check if expired
    if (Date.now() > item.expires) {
      this.delete(key);
      return false;
    }

    return true;
  }

  public delete(key: string): boolean {
    const existed = this.cache.has(key);
    this.cache.delete(key);
    this.removeFromTracking(key);

    // Remove from storage
    if (this.config.persistToStorage) {
      localStorage.removeItem(this.config.storagePrefix + key);
    }

    return existed;
  }

  public clear(): void {
    this.cache.clear();
    this.accessCount.clear();
    this.accessOrder = [];

    // Clear from storage
    if (this.config.persistToStorage) {
      this.clearStorage();
    }
  }

  public invalidateByTag(tag: string): number {
    let invalidated = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (item.tags.includes(tag)) {
        this.delete(key);
        invalidated++;
      }
    }

    return invalidated;
  }

  public invalidateByPattern(pattern: RegExp): number {
    let invalidated = 0;
    
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.delete(key);
        invalidated++;
      }
    }

    return invalidated;
  }

  public getStats(): {
    size: number;
    maxSize: number;
    hitRatio: number;
    totalHits: number;
    totalMisses: number;
  } {
    const totalAccess = Array.from(this.accessCount.values()).reduce((sum, count) => sum + count, 0);
    const totalMisses = this.getMissCount();
    const hitRatio = totalAccess > 0 ? totalAccess / (totalAccess + totalMisses) : 0;

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRatio,
      totalHits: totalAccess,
      totalMisses
    };
  }

  public getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  public getExpiring(withinMs: number = 60000): string[] {
    const now = Date.now();
    const expiring: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (item.expires - now <= withinMs) {
        expiring.push(key);
      }
    }

    return expiring;
  }

  public refresh<T>(key: string, fetcher: () => Promise<T>, options?: {
    ttl?: number;
    tags?: string[];
    version?: string;
  }): Promise<T> {
    return fetcher().then(data => {
      this.set(key, data, options);
      return data;
    });
  }

  public getOrFetch<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    options?: {
      ttl?: number;
      tags?: string[];
      version?: string;
      forceRefresh?: boolean;
    }
  ): Promise<T> {
    if (!options?.forceRefresh && this.has(key)) {
      return Promise.resolve(this.get<T>(key)!);
    }

    return this.refresh(key, fetcher, options);
  }

  private updateTracking(key: string): void {
    // Update access count for LFU
    this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);

    // Update access order for LRU
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
  }

  private removeFromTracking(key: string): void {
    this.accessCount.delete(key);
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  private evict(): void {
    let keyToEvict: string | null = null;

    switch (this.config.strategy) {
      case 'LRU':
        keyToEvict = this.accessOrder[0] || null;
        break;

      case 'LFU':
        let minCount = Infinity;
        for (const [key, count] of this.accessCount.entries()) {
          if (count < minCount) {
            minCount = count;
            keyToEvict = key;
          }
        }
        break;

      case 'FIFO':
        keyToEvict = this.cache.keys().next().value || null;
        break;
    }

    if (keyToEvict) {
      this.delete(keyToEvict);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.delete(key));
  }

  private persistItem<T>(key: string, item: CacheItem<T>): void {
    try {
      localStorage.setItem(
        this.config.storagePrefix + key,
        JSON.stringify(item)
      );
    } catch (error) {
      console.warn('Failed to persist cache item:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.config.storagePrefix)
      );

      for (const storageKey of keys) {
        const cacheKey = storageKey.replace(this.config.storagePrefix, '');
        const itemData = localStorage.getItem(storageKey);
        
        if (itemData) {
          const item: CacheItem<any> = JSON.parse(itemData);
          
          // Check if not expired
          if (Date.now() <= item.expires) {
            this.cache.set(cacheKey, item);
            this.updateTracking(cacheKey);
          } else {
            // Remove expired item from storage
            localStorage.removeItem(storageKey);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
    }
  }

  private clearStorage(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.config.storagePrefix)
      );

      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear cache storage:', error);
    }
  }

  private missCount = 0;

  private getMissCount(): number {
    return this.missCount;
  }

  private incrementMissCount(): void {
    this.missCount++;
  }
}

// Specialized cache instances for different data types
export const apiCache = new CacheManager({
  defaultTTL: 300000, // 5 minutes
  maxSize: 50,
  strategy: 'LRU',
  persistToStorage: true,
  storagePrefix: 'api_cache_'
});

export const staticCache = new CacheManager({
  defaultTTL: 3600000, // 1 hour
  maxSize: 20,
  strategy: 'LFU',
  persistToStorage: true,
  storagePrefix: 'static_cache_'
});

export const sessionCache = new CacheManager({
  defaultTTL: 900000, // 15 minutes
  maxSize: 30,
  strategy: 'LRU',
  persistToStorage: false,
  storagePrefix: 'session_cache_'
});

// Cache utility functions
export const cacheUtils = {
  // Generate cache key with parameters
  generateKey: (base: string, params: Record<string, any> = {}): string => {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    
    return paramString ? `${base}|${paramString}` : base;
  },

  // Cache API responses with intelligent tagging
  cacheApiResponse: async <T>(
    endpoint: string,
    params: Record<string, any> = {},
    fetcher: () => Promise<T>,
    options: {
      ttl?: number;
      tags?: string[];
      version?: string;
    } = {}
  ): Promise<T> => {
    const key = cacheUtils.generateKey(endpoint, params);
    const tags = [
      endpoint.split('/')[1] || 'api', // First path segment as tag
      ...(options.tags || [])
    ];

    return apiCache.getOrFetch(key, fetcher, {
      ...options,
      tags
    });
  },

  // Invalidate related cache entries
  invalidateApi: (module: string): number => {
    return apiCache.invalidateByTag(module);
  },

  // Preload critical data
  preload: async (endpoints: Array<{
    endpoint: string;
    params?: Record<string, any>;
    fetcher: () => Promise<any>;
    priority: 'high' | 'medium' | 'low';
  }>): Promise<void> => {
    // Sort by priority
    const sorted = endpoints.sort((a, b) => {
      const priorities = { high: 3, medium: 2, low: 1 };
      return priorities[b.priority] - priorities[a.priority];
    });

    // Execute with appropriate delays
    for (const item of sorted) {
      const delay = item.priority === 'high' ? 0 : 
                    item.priority === 'medium' ? 100 : 500;
      
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      try {
        await cacheUtils.cacheApiResponse(
          item.endpoint,
          item.params,
          item.fetcher,
          { ttl: 600000 } // 10 minutes for preloaded data
        );
      } catch (error) {
        console.warn(`Failed to preload ${item.endpoint}:`, error);
      }
    }
  }
};
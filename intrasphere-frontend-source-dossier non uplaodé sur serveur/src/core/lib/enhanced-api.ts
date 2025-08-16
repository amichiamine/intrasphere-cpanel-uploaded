/**
 * Enhanced API Client - ADAPTÉ POUR BACKEND PHP
 * Configuration pour fonctionner avec intrasphere-backend PHP
 */

import { apiCache, cacheUtils } from './cache-manager';
import { appState, actions, selectors } from './state-manager';
import { wsClient } from './websocket-client';

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableCaching: boolean;
  enableOfflineQueue: boolean;
  enableOptimisticUpdates: boolean;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers: Headers;
  fromCache: boolean;
  timestamp: number;
}

export interface RequestOptions {
  cache?: boolean;
  ttl?: number;
  optimistic?: boolean;
  offline?: boolean;
  retry?: boolean;
  tags?: string[];
}

export class EnhancedApiClient {
  private config: ApiConfig;
  private offlineQueue: Array<{ request: Request; options: RequestOptions; resolve: Function; reject: Function }> = [];

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = {
      baseUrl: '/intrasphere/api', // 🔴 ADAPTÉ POUR BACKEND PHP
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      enableCaching: true,
      enableOfflineQueue: true,
      enableOptimisticUpdates: true,
      ...config
    };

    this.setupOfflineHandling();
  }

  public async get<T = any>(
    endpoint: string, 
    params?: Record<string, any>, 
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, params);
    const cacheKey = cacheUtils.generateKey(endpoint, params);

    // Check cache first if enabled
    if (options.cache !== false && this.config.enableCaching) {
      const cached = apiCache.get<T>(cacheKey);
      if (cached) {
        return {
          data: cached,
          status: 200,
          headers: new Headers(),
          fromCache: true,
          timestamp: Date.now()
        };
      }
    }

    const request = new Request(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json', // 🔴 ADAPTÉ: Assurer JSON du backend PHP
      }
    });

    return this.executeRequest<T>(request, options, cacheKey);
  }

  public async post<T = any>(
    endpoint: string, 
    body?: any, 
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);

    const request = new Request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined
    });

    // Handle optimistic updates for UI responsiveness
    if (options.optimistic && this.config.enableOptimisticUpdates) {
      this.handleOptimisticUpdate(endpoint, body, 'create');
    }

    return this.executeRequest<T>(request, options);
  }

  public async put<T = any>(
    endpoint: string, 
    body?: any, 
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);

    const request = new Request(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined
    });

    // Handle optimistic updates
    if (options.optimistic && this.config.enableOptimisticUpdates) {
      this.handleOptimisticUpdate(endpoint, body, 'update');
    }

    return this.executeRequest<T>(request, options);
  }

  public async delete<T = any>(
    endpoint: string, 
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);

    const request = new Request(url, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      }
    });

    // Handle optimistic updates
    if (options.optimistic && this.config.enableOptimisticUpdates) {
      this.handleOptimisticUpdate(endpoint, null, 'delete');
    }

    return this.executeRequest<T>(request, options);
  }

  private async executeRequest<T = any>(
    request: Request, 
    options: RequestOptions, 
    cacheKey?: string
  ): Promise<ApiResponse<T>> {
    // Check if offline and queue if enabled
    if (!navigator.onLine && this.config.enableOfflineQueue && options.offline !== false) {
      return this.queueOfflineRequest<T>(request, options);
    }

    try {
      const response = await this.fetchWithTimeout(request);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // 🔴 ADAPTÉ: Gérer les réponses du backend PHP qui peuvent être corrompues
      const responseText = await response.text();
      let data: T;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        // Si le JSON est corrompu (echo DEBUG), essayer de nettoyer
        console.warn('Response parsing failed, attempting to clean:', responseText.substring(0, 200));
        const cleanedResponse = this.cleanPhpResponse(responseText);
        try {
          data = JSON.parse(cleanedResponse);
        } catch (secondParseError) {
          throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
        }
      }

      // Cache successful GET requests
      if (request.method === 'GET' && this.config.enableCaching && cacheKey) {
        apiCache.set(cacheKey, data, {
          ttl: options.ttl,
          tags: options.tags || this.inferCacheTags(request.url)
        });
      }

      // Invalidate cache for mutations
      if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
        this.invalidateRelatedCache(request.url);
      }

      return {
        data,
        status: response.status,
        headers: response.headers,
        fromCache: false,
        timestamp: Date.now()
      };

    } catch (error) {
      if (options.retry !== false && this.shouldRetry(error)) {
        return this.retryRequest<T>(request, options, cacheKey);
      }

      // Try to serve from cache for GET requests on error
      if (request.method === 'GET' && cacheKey) {
        const cached = apiCache.get<T>(cacheKey);
        if (cached) {
          actions.addNotification({
            type: 'warning',
            message: 'Données mises en cache utilisées (connexion limitée)'
          });

          return {
            data: cached,
            status: 200,
            headers: new Headers(),
            fromCache: true,
            timestamp: Date.now()
          };
        }
      }

      throw error;
    }
  }

  // 🔴 NOUVEAU: Nettoyer les réponses PHP corrompues par echo DEBUG
  private cleanPhpResponse(responseText: string): string {
    // Supprimer les lignes DEBUG en début de réponse
    const lines = responseText.split('\n');
    const jsonStartIndex = lines.findIndex(line => 
      line.trim().startsWith('{') || line.trim().startsWith('[')
    );

    if (jsonStartIndex > 0) {
      console.warn(`Removed ${jsonStartIndex} debug lines from PHP response`);
      return lines.slice(jsonStartIndex).join('\n');
    }

    return responseText;
  }

  // Reste de la classe inchangé...
  private async fetchWithTimeout(request: Request): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(request, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async retryRequest<T = any>(
    request: Request, 
    options: RequestOptions, 
    cacheKey?: string,
    attempt = 1
  ): Promise<ApiResponse<T>> {
    if (attempt > this.config.retryAttempts) {
      throw new Error(`Request failed after ${this.config.retryAttempts} attempts`);
    }

    const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
    await new Promise(resolve => setTimeout(resolve, delay));

    return this.executeRequest<T>(request, options, cacheKey);
  }

  private async queueOfflineRequest<T = any>(
    request: Request, 
    options: RequestOptions
  ): Promise<ApiResponse<T>> {
    return new Promise((resolve, reject) => {
      this.offlineQueue.push({
        request: request.clone(),
        options,
        resolve,
        reject
      });

      actions.addNotification({
        type: 'info',
        message: 'Demande mise en file d\'attente (mode hors ligne)'
      });
    });
  }

  private setupOfflineHandling(): void {
    // Process offline queue when coming back online
    window.addEventListener('online', () => {
      this.processOfflineQueue();
    });
  }

  private async processOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0) return;

    actions.addNotification({
      type: 'info',
      message: `Traitement de ${this.offlineQueue.length} demandes en attente...`
    });

    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const item of queue) {
      try {
        const result = await this.executeRequest(item.request, item.options);
        item.resolve(result);
      } catch (error) {
        item.reject(error);
      }
    }

    actions.addNotification({
      type: 'success',
      message: 'Demandes en attente traitées avec succès'
    });
  }

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    let url = `${this.config.baseUrl}${endpoint}`;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });

      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return url;
  }

  private inferCacheTags(url: string): string[] {
    const tags: string[] = [];
    const path = new URL(url, window.location.origin).pathname;

    if (path.includes('announcements')) tags.push('announcements');
    if (path.includes('messages')) tags.push('messages');
    if (path.includes('documents')) tags.push('documents');
    if (path.includes('trainings')) tags.push('trainings');
    if (path.includes('users')) tags.push('users');
    if (path.includes('admin')) tags.push('admin');

    return tags;
  }

  private invalidateRelatedCache(url: string): void {
    const tags = this.inferCacheTags(url);
    tags.forEach(tag => {
      apiCache.invalidateByTag(tag);
      actions.invalidateCache(tag as any);
    });
  }

  private handleOptimisticUpdate(endpoint: string, data: any, operation: 'create' | 'update' | 'delete'): void {
    // Implement optimistic UI updates based on operation type
    if (endpoint.includes('announcements')) {
      this.handleOptimisticAnnouncement(data, operation);
    } else if (endpoint.includes('messages')) {
      this.handleOptimisticMessage(data, operation);
    }
  }

  private handleOptimisticAnnouncement(data: any, operation: string): void {
    const currentCache = selectors.getCachedData('announcements');

    if (operation === 'create' && data) {
      const optimisticAnnouncement = {
        ...data,
        id: `temp_${Date.now()}`,
        createdAt: new Date().toISOString(),
        isOptimistic: true
      };

      actions.updateCache('announcements', [optimisticAnnouncement, ...currentCache]);
    }
  }

  private handleOptimisticMessage(data: any, operation: string): void {
    if (operation === 'create' && data) {
      // Update unread count immediately for better UX
      const currentCount = selectors.getUnreadCount();
      actions.updateUnreadMessages(currentCount + 1);
    }
  }

  private shouldRetry(error: any): boolean {
    // Retry on network errors, timeouts, and 5xx status codes
    return error.name === 'AbortError' || 
           error.message.includes('Failed to fetch') ||
           (error.message.includes('HTTP 5'));
  }

  // Public utility methods
  public clearCache(tags?: string[]): void {
    if (tags) {
      tags.forEach(tag => apiCache.invalidateByTag(tag));
    } else {
      apiCache.clear();
    }
  }

  public getCacheStats() {
    return apiCache.getStats();
  }

  public getQueuedRequestsCount(): number {
    return this.offlineQueue.length;
  }
}

// Global enhanced API client instance - ADAPTÉ POUR PHP
export const api = new EnhancedApiClient({
  baseUrl: '/intrasphere/api'
});

// Convenience methods that match the existing API patterns
export const apiRequest = {
  get: <T = any>(endpoint: string, params?: Record<string, any>) => 
    api.get<T>(endpoint, params),

  post: <T = any>(endpoint: string, body?: any) => 
    api.post<T>(endpoint, body),

  put: <T = any>(endpoint: string, body?: any) => 
    api.put<T>(endpoint, body),

  delete: <T = any>(endpoint: string) => 
    api.delete<T>(endpoint)
};

// Enhanced versions with additional options
export const enhancedApiRequest = {
  get: <T = any>(endpoint: string, params?: Record<string, any>, options?: RequestOptions) => 
    api.get<T>(endpoint, params, options),

  post: <T = any>(endpoint: string, body?: any, options?: RequestOptions) => 
    api.post<T>(endpoint, body, options),

  put: <T = any>(endpoint: string, body?: any, options?: RequestOptions) => 
    api.put<T>(endpoint, body, options),

  delete: <T = any>(endpoint: string, options?: RequestOptions) => 
    api.delete<T>(endpoint, options)
};
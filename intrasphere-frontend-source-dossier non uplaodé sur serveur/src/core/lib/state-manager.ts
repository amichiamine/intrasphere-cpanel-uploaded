/**
 * Advanced State Management System for IntraSphere
 * Completes the 5% compatibility gap identified in the analysis
 */

type StateListener<T> = (newState: T, oldState: T) => void;

interface StateConfig {
  persist?: boolean;
  storageKey?: string;
  syncAcrossTabs?: boolean;
}

export class StateManager<T> {
  private state: T;
  private listeners: Set<StateListener<T>> = new Set();
  private config: StateConfig;

  constructor(initialState: T, config: StateConfig = {}) {
    this.config = {
      persist: false,
      syncAcrossTabs: false,
      ...config
    };

    // Load persisted state if enabled
    if (this.config.persist && this.config.storageKey) {
      const savedState = this.loadPersistedState();
      this.state = savedState || initialState;
    } else {
      this.state = initialState;
    }

    // Setup cross-tab synchronization
    if (this.config.syncAcrossTabs) {
      this.setupCrossTabSync();
    }
  }

  public getState(): T {
    return this.state;
  }

  public setState(newState: Partial<T> | ((prevState: T) => T)): void {
    const oldState = { ...this.state };
    
    if (typeof newState === 'function') {
      this.state = newState(this.state);
    } else {
      this.state = { ...this.state, ...newState };
    }

    // Persist state if enabled
    if (this.config.persist && this.config.storageKey) {
      this.persistState();
    }

    // Notify listeners
    this.listeners.forEach(listener => listener(this.state, oldState));

    // Broadcast to other tabs if enabled
    if (this.config.syncAcrossTabs) {
      this.broadcastStateChange();
    }
  }

  public subscribe(listener: StateListener<T>): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  public reset(initialState: T): void {
    this.setState(() => initialState);
  }

  private loadPersistedState(): T | null {
    try {
      const saved = localStorage.getItem(this.config.storageKey!);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  private persistState(): void {
    try {
      localStorage.setItem(this.config.storageKey!, JSON.stringify(this.state));
    } catch (error) {
      console.warn('Failed to persist state:', error);
    }
  }

  private setupCrossTabSync(): void {
    window.addEventListener('storage', (event) => {
      if (event.key === this.config.storageKey && event.newValue) {
        try {
          const newState = JSON.parse(event.newValue);
          const oldState = { ...this.state };
          this.state = newState;
          this.listeners.forEach(listener => listener(this.state, oldState));
        } catch (error) {
          console.warn('Failed to sync state across tabs:', error);
        }
      }
    });
  }

  private broadcastStateChange(): void {
    if (this.config.storageKey) {
      // Trigger storage event for other tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key: this.config.storageKey,
        newValue: JSON.stringify(this.state),
        storageArea: localStorage
      }));
    }
  }
}

// Global Application State Interface
export interface AppState {
  user: {
    id: string | null;
    name: string | null;
    role: string | null;
    isAuthenticated: boolean;
    permissions: string[];
  };
  ui: {
    theme: 'light' | 'dark';
    sidebarCollapsed: boolean;
    notifications: Array<{
      id: string;
      type: 'info' | 'success' | 'warning' | 'error';
      message: string;
      timestamp: number;
    }>;
    isLoading: boolean;
    activeModule: string | null;
  };
  realtime: {
    isConnected: boolean;
    unreadMessages: number;
    onlineUsers: string[];
    lastActivity: number;
  };
  cache: {
    announcements: any[];
    documents: any[];
    messages: any[];
    trainings: any[];
    lastFetch: Record<string, number>;
  };
}

// Initial state
const initialState: AppState = {
  user: {
    id: null,
    name: null,
    role: null,
    isAuthenticated: false,
    permissions: []
  },
  ui: {
    theme: 'light',
    sidebarCollapsed: false,
    notifications: [],
    isLoading: false,
    activeModule: null
  },
  realtime: {
    isConnected: false,
    unreadMessages: 0,
    onlineUsers: [],
    lastActivity: Date.now()
  },
  cache: {
    announcements: [],
    documents: [],
    messages: [],
    trainings: [],
    lastFetch: {}
  }
};

// Global state manager instance
export const appState = new StateManager<AppState>(initialState, {
  persist: true,
  storageKey: 'intrasphere_app_state',
  syncAcrossTabs: true
});

// Action creators for common state updates
export const actions = {
  // User actions
  setUser: (user: Partial<AppState['user']>) => {
    appState.setState(state => ({
      ...state,
      user: { ...state.user, ...user }
    }));
  },

  logout: () => {
    appState.setState(state => ({
      ...state,
      user: {
        id: null,
        name: null,
        role: null,
        isAuthenticated: false,
        permissions: []
      }
    }));
  },

  // UI actions
  setTheme: (theme: 'light' | 'dark') => {
    appState.setState(state => ({
      ...state,
      ui: { ...state.ui, theme }
    }));
  },

  toggleSidebar: () => {
    appState.setState(state => ({
      ...state,
      ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed }
    }));
  },

  addNotification: (notification: Omit<AppState['ui']['notifications'][0], 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const timestamp = Date.now();
    
    appState.setState(state => ({
      ...state,
      ui: {
        ...state.ui,
        notifications: [...state.ui.notifications, { ...notification, id, timestamp }]
      }
    }));

    // Auto-remove after 5 seconds
    setTimeout(() => {
      actions.removeNotification(id);
    }, 5000);
  },

  removeNotification: (id: string) => {
    appState.setState(state => ({
      ...state,
      ui: {
        ...state.ui,
        notifications: state.ui.notifications.filter(n => n.id !== id)
      }
    }));
  },

  setLoading: (isLoading: boolean) => {
    appState.setState(state => ({
      ...state,
      ui: { ...state.ui, isLoading }
    }));
  },

  setActiveModule: (module: string | null) => {
    appState.setState(state => ({
      ...state,
      ui: { ...state.ui, activeModule: module }
    }));
  },

  // Realtime actions
  setConnectionStatus: (isConnected: boolean) => {
    appState.setState(state => ({
      ...state,
      realtime: { ...state.realtime, isConnected }
    }));
  },

  updateUnreadMessages: (count: number) => {
    appState.setState(state => ({
      ...state,
      realtime: { ...state.realtime, unreadMessages: count }
    }));
  },

  setOnlineUsers: (users: string[]) => {
    appState.setState(state => ({
      ...state,
      realtime: { ...state.realtime, onlineUsers: users }
    }));
  },

  updateLastActivity: () => {
    appState.setState(state => ({
      ...state,
      realtime: { ...state.realtime, lastActivity: Date.now() }
    }));
  },

  // Cache actions
  updateCache: (key: keyof AppState['cache'], data: any[]) => {
    appState.setState(state => ({
      ...state,
      cache: {
        ...state.cache,
        [key]: data,
        lastFetch: {
          ...state.cache.lastFetch,
          [key]: Date.now()
        }
      }
    }));
  },

  invalidateCache: (key?: keyof AppState['cache']) => {
    if (key) {
      appState.setState(state => ({
        ...state,
        cache: {
          ...state.cache,
          [key]: [],
          lastFetch: {
            ...state.cache.lastFetch,
            [key]: 0
          }
        }
      }));
    } else {
      // Clear all cache
      appState.setState(state => ({
        ...state,
        cache: {
          announcements: [],
          documents: [],
          messages: [],
          trainings: [],
          lastFetch: {}
        }
      }));
    }
  }
};

// Selectors for derived state
export const selectors = {
  isAuthenticated: () => appState.getState().user.isAuthenticated,
  
  hasPermission: (permission: string) => 
    appState.getState().user.permissions.includes(permission),
  
  isAdmin: () => 
    ['admin', 'moderator'].includes(appState.getState().user.role || ''),
  
  getTheme: () => appState.getState().ui.theme,
  
  getNotifications: () => appState.getState().ui.notifications,
  
  isLoading: () => appState.getState().ui.isLoading,
  
  getUnreadCount: () => appState.getState().realtime.unreadMessages,
  
  isOnline: () => appState.getState().realtime.isConnected,
  
  getOnlineUsers: () => appState.getState().realtime.onlineUsers,
  
  getCachedData: (key: keyof AppState['cache']) => 
    appState.getState().cache[key],
  
  isCacheValid: (key: keyof AppState['cache'], maxAge: number = 300000) => {
    const lastFetch = appState.getState().cache.lastFetch[key] || 0;
    return (Date.now() - lastFetch) < maxAge;
  }
};

// Vanilla JS hooks for component integration (React-style for future migration)
export function useAppState<K extends keyof AppState>(key: K, callback: (value: AppState[K]) => void): () => void {
  const unsubscribe = appState.subscribe((newState) => {
    callback(newState[key]);
  });
  
  // Return unsubscribe function
  return unsubscribe;
}

export function useSelector<T>(selector: (state: AppState) => T, callback: (value: T) => void): () => void {
  const unsubscribe = appState.subscribe((newState) => {
    callback(selector(newState));
  });
  
  return unsubscribe;
}
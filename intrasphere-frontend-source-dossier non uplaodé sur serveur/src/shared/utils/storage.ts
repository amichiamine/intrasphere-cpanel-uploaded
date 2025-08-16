// Local Storage Utility Functions

/**
 * Safely get item from localStorage
 */
export function getStorageItem<T>(key: string, defaultValue?: T): T | null {
  try {
    if (typeof window === 'undefined') return defaultValue || null;
    
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue || null;
    
    return JSON.parse(item);
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue || null;
  }
}

/**
 * Safely set item in localStorage
 */
export function setStorageItem<T>(key: string, value: T): boolean {
  try {
    if (typeof window === 'undefined') return false;
    
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Error writing localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Safely remove item from localStorage
 */
export function removeStorageItem(key: string): boolean {
  try {
    if (typeof window === 'undefined') return false;
    
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Error removing localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Clear all localStorage items
 */
export function clearStorage(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    
    localStorage.clear();
    return true;
  } catch (error) {
    console.warn('Error clearing localStorage:', error);
    return false;
  }
}

/**
 * Get all localStorage keys
 */
export function getStorageKeys(): string[] {
  try {
    if (typeof window === 'undefined') return [];
    
    return Object.keys(localStorage);
  } catch (error) {
    console.warn('Error getting localStorage keys:', error);
    return [];
  }
}

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get storage size in bytes (approximate)
 */
export function getStorageSize(): number {
  try {
    if (typeof window === 'undefined') return 0;
    
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  } catch {
    return 0;
  }
}

/**
 * Storage with expiration
 */
export interface StorageItemWithExpiration<T> {
  value: T;
  expiration: number;
}

/**
 * Set item with expiration time
 */
export function setStorageItemWithExpiration<T>(
  key: string, 
  value: T, 
  expirationMs: number
): boolean {
  const item: StorageItemWithExpiration<T> = {
    value,
    expiration: Date.now() + expirationMs
  };
  
  return setStorageItem(key, item);
}

/**
 * Get item with expiration check
 */
export function getStorageItemWithExpiration<T>(key: string): T | null {
  const item = getStorageItem<StorageItemWithExpiration<T>>(key);
  
  if (!item) return null;
  
  if (Date.now() > item.expiration) {
    removeStorageItem(key);
    return null;
  }
  
  return item.value;
}

/**
 * Session storage utilities
 */
export const sessionStorage = {
  getItem: <T>(key: string, defaultValue?: T): T | null => {
    try {
      if (typeof window === 'undefined') return defaultValue || null;
      
      const item = window.sessionStorage.getItem(key);
      if (item === null) return defaultValue || null;
      
      return JSON.parse(item);
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return defaultValue || null;
    }
  },

  setItem: <T>(key: string, value: T): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      
      window.sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Error writing sessionStorage key "${key}":`, error);
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      
      window.sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Error removing sessionStorage key "${key}":`, error);
      return false;
    }
  },

  clear: (): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      
      window.sessionStorage.clear();
      return true;
    } catch (error) {
      console.warn('Error clearing sessionStorage:', error);
      return false;
    }
  }
};

/**
 * Storage event listener
 */
export function addStorageEventListener(
  callback: (event: StorageEvent) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  window.addEventListener('storage', callback);
  
  return () => {
    window.removeEventListener('storage', callback);
  };
}

/**
 * Cookie utilities for non-localStorage scenarios
 */
export const cookies = {
  set: (name: string, value: string, days: number = 7): void => {
    if (typeof document === 'undefined') return;
    
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  },

  get: (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    
    return null;
  },

  remove: (name: string): void => {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
};
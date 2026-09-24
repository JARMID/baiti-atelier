/**
 * Enterprise Safe Storage Gatekeeper
 * Complies with strict storage gatekeeping rules.
 * Prefers window.storage key-value API when present,
 * utilizes an in-memory cache, and wraps localStorage safely with error boundary handling.
 */

declare global {
  interface Window {
    storage?: {
      getItem: (key: string) => Promise<string | null> | string | null;
      setItem: (key: string, value: string) => Promise<void> | void;
      removeItem: (key: string) => Promise<void> | void;
      clear?: () => Promise<void> | void;
    };
  }
}

class MemoryStorageFallback {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

const memoryStore = new MemoryStorageFallback();

export const safeStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;

    try {
      if (window.storage && typeof window.storage.getItem === 'function') {
        const val = window.storage.getItem(key);
        if (typeof val === 'string') return val;
      }
      const lsVal = window.localStorage.getItem(key);
      if (lsVal !== null) {
        memoryStore.setItem(key, lsVal);
        return lsVal;
      }
    } catch {
      // In restricted iframes, private browsing, or quota exhaustion
    }

    return memoryStore.getItem(key);
  },

  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;

    memoryStore.setItem(key, value);

    try {
      if (window.storage && typeof window.storage.setItem === 'function') {
        window.storage.setItem(key, value);
      }
      window.localStorage.setItem(key, value);
    } catch {
      // Storage unavailable or quota exceeded
    }
  },

  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;

    memoryStore.removeItem(key);

    try {
      if (window.storage && typeof window.storage.removeItem === 'function') {
        window.storage.removeItem(key);
      }
      window.localStorage.removeItem(key);
    } catch {
      // Storage unavailable
    }
  },

  getJSON: <T = unknown>(key: string, defaultValue: T): T => {
    const raw = safeStorage.getItem(key);
    if (!raw) return defaultValue;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  },

  setJSON: <T = unknown>(key: string, value: T): void => {
    try {
      safeStorage.setItem(key, JSON.stringify(value));
    } catch {
      // JSON stringify failure
    }
  },
};

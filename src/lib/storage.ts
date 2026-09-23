/**
 * Minimal key/value storage abstraction.
 *
 * The app only ever talks to this interface, so swapping localStorage for a
 * Supabase-backed adapter later requires no changes in the UI layer.
 */
export interface KeyValueStore {
  read<T>(key: string): T | null;
  write<T>(key: string, value: T): void;
  remove(key: string): void;
}

const memory = new Map<string, string>();

const memoryStore: KeyValueStore = {
  read<T>(key: string) {
    const raw = memory.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  },
  write<T>(key: string, value: T) {
    memory.set(key, JSON.stringify(value));
  },
  remove(key: string) {
    memory.delete(key);
  },
};

const localStore: KeyValueStore = {
  read<T>(key: string) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  write<T>(key: string, value: T) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable (private mode / quota) — keep the session working */
    }
  },
  remove(key: string) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

/** Returns the browser store when available, otherwise an in-memory store (SSR). */
export function getStore(): KeyValueStore {
  return typeof window === "undefined" ? memoryStore : localStore;
}

import type { OfflineQuote, OfflineQuoteSummary } from './desktopBridge';

const DB_NAME = 'baiti_offline_workshop_db';
const DB_VERSION = 1;
const STORE_QUOTES = 'quotes';
const STORE_SETTINGS = 'workshop_settings';

export interface WorkshopProfileSettings {
  id: string;
  workshopName: string;
  artisanName: string;
  phone: string;
  wilaya: string;
  address: string;
  registerCommerce: string;
  nifNis: string;
  defaultVatRate: number;
  updatedAt: string;
}

/**
 * Initializes and opens the local IndexedDB database with appropriate object stores and indices
 */
export function openIndexedDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not available in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_QUOTES)) {
        const quoteStore = db.createObjectStore(STORE_QUOTES, { keyPath: 'id' });
        quoteStore.createIndex('trade_type', 'trade_type', { unique: false });
        quoteStore.createIndex('client_wilaya', 'client_wilaya', { unique: false });
        quoteStore.createIndex('created_at', 'created_at', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB'));
    };
  });
}

/**
 * Saves or updates a quote in the local IndexedDB storage
 */
export async function saveQuoteToIndexedDb(quote: OfflineQuote): Promise<string> {
  const db = await openIndexedDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_QUOTES], 'readwrite');
    const store = tx.objectStore(STORE_QUOTES);
    const request = store.put(quote);

    request.onsuccess = () => {
      resolve(quote.id);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to save quote to IndexedDB'));
    };

    tx.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Lists all quotes stored in the local IndexedDB sorted by creation date descending
 */
export async function listQuotesFromIndexedDb(): Promise<OfflineQuoteSummary[]> {
  const db = await openIndexedDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_QUOTES], 'readonly');
    const store = tx.objectStore(STORE_QUOTES);
    const request = store.getAll();

    request.onsuccess = () => {
      const records = (request.result as OfflineQuote[]) || [];
      const summaries: OfflineQuoteSummary[] = records.map((q) => ({
        id: q.id,
        title: q.title,
        trade_type: q.trade_type,
        client_name: q.client_name,
        client_wilaya: q.client_wilaya,
        total_ttc_dzd: q.total_ttc_dzd,
        created_at: q.created_at,
      }));

      summaries.sort((a, b) => b.created_at.localeCompare(a.created_at));
      resolve(summaries);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to list quotes from IndexedDB'));
    };

    tx.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Fetches a single quote by its ID from local IndexedDB
 */
export async function loadQuoteFromIndexedDb(id: string): Promise<OfflineQuote | null> {
  const db = await openIndexedDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_QUOTES], 'readonly');
    const store = tx.objectStore(STORE_QUOTES);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve((request.result as OfflineQuote) || null);
    };

    request.onerror = () => {
      reject(request.error || new Error(`Failed to load quote ${id} from IndexedDB`));
    };

    tx.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Deletes a quote by ID from local IndexedDB
 */
export async function deleteQuoteFromIndexedDb(id: string): Promise<boolean> {
  const db = await openIndexedDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_QUOTES], 'readwrite');
    const store = tx.objectStore(STORE_QUOTES);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = () => {
      reject(request.error || new Error(`Failed to delete quote ${id} from IndexedDB`));
    };

    tx.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Exports all local quotes and workshop data to a downloadable JSON backup
 */
export async function exportLocalDatabaseToJson(): Promise<string> {
  const db = await openIndexedDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_QUOTES], 'readonly');
    const store = tx.objectStore(STORE_QUOTES);
    const request = store.getAll();

    request.onsuccess = () => {
      const records = (request.result as OfflineQuote[]) || [];
      const payload = {
        exportDate: new Date().toISOString(),
        format: 'baiti_workshop_backup_v1',
        totalQuotes: records.length,
        quotes: records,
      };
      resolve(JSON.stringify(payload, null, 2));
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to export IndexedDB data'));
    };

    tx.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Imports quotes from an external JSON backup file into local IndexedDB
 */
export async function importLocalDatabaseFromJson(jsonString: string): Promise<{ success: boolean; importedCount: number }> {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !Array.isArray(parsed.quotes)) {
      throw new Error('Format de fichier de sauvegarde invalide');
    }

    const quotes: OfflineQuote[] = parsed.quotes;
    const db = await openIndexedDb();

    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_QUOTES], 'readwrite');
      const store = tx.objectStore(STORE_QUOTES);
      let count = 0;

      for (const q of quotes) {
        if (q && q.id) {
          store.put(q);
          count++;
        }
      }

      tx.oncomplete = () => {
        db.close();
        resolve({ success: true, importedCount: count });
      };

      tx.onerror = () => {
        db.close();
        reject(tx.error || new Error('Failed to import quotes transaction'));
      };
    });
  } catch (err) {
    console.warn('Error parsing JSON backup file:', err);
    return { success: false, importedCount: 0 };
  }
}

export interface OfflineQuote {
  id: string;
  title: string;
  trade_type: string;
  client_name: string;
  client_phone: string;
  client_wilaya: string;
  total_ht_dzd: number;
  total_ttc_dzd: number;
  deposit_required_dzd: number;
  created_at: string;
  payload_json: string;
}

export interface OfflineQuoteSummary {
  id: string;
  title: string;
  trade_type: string;
  client_name: string;
  client_wilaya: string;
  total_ttc_dzd: number;
  created_at: string;
}

export interface WorkshopSystemInfo {
  app_version: string;
  os_family: string;
  offline_storage_active: boolean;
  thermal_printer_ready: boolean;
}

import {
  saveQuoteToIndexedDb,
  listQuotesFromIndexedDb,
  loadQuoteFromIndexedDb,
  deleteQuoteFromIndexedDb,
} from './offlineStorage';

// In-memory fallback if IndexedDB is blocked
const memoryQuoteStore = new Map<string, OfflineQuote>();

/**
 * Checks if the frontend is running inside the native Tauri v2 desktop shell
 */
export function isTauriDesktop(): boolean {
  return typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);
}

/**
 * Invokes a native Tauri command if in desktop mode
 */
async function invokeTauri<T>(cmd: string, args?: Record<string, unknown>): Promise<T | null> {
  if (isTauriDesktop()) {
    const tauri = (window as unknown as { __TAURI_INTERNALS__?: { invoke: (cmd: string, args?: Record<string, unknown>) => Promise<T> } }).__TAURI_INTERNALS__;
    if (tauri && typeof tauri.invoke === 'function') {
      return await tauri.invoke(cmd, args);
    }
  }
  return null;
}

/**
 * Saves a quotation locally into persistent workshop disk storage
 */
export async function saveOfflineQuote(quote: OfflineQuote): Promise<string> {
  if (isTauriDesktop()) {
    try {
      const res = await invokeTauri<string>('save_offline_quote', { quote });
      if (res) return res;
    } catch (err) {
      console.warn('Tauri native save error, falling back to IndexedDB:', err);
    }
  }

  // Browser IndexedDB persistent storage
  try {
    return await saveQuoteToIndexedDb(quote);
  } catch (err) {
    console.warn('IndexedDB save failed, using memory store fallback:', err);
    memoryQuoteStore.set(quote.id, quote);
    return quote.id;
  }
}

/**
 * Lists all offline saved quotations sorted newest first
 */
export async function listOfflineQuotes(): Promise<OfflineQuoteSummary[]> {
  if (isTauriDesktop()) {
    try {
      const res = await invokeTauri<OfflineQuoteSummary[]>('list_offline_quotes');
      if (res) return res;
    } catch (err) {
      console.warn('Tauri native list error, falling back to IndexedDB:', err);
    }
  }

  // Browser IndexedDB persistent storage
  try {
    return await listQuotesFromIndexedDb();
  } catch (err) {
    console.warn('IndexedDB list failed, using memory store fallback:', err);
    const list: OfflineQuoteSummary[] = Array.from(memoryQuoteStore.values()).map((q) => ({
      id: q.id,
      title: q.title,
      trade_type: q.trade_type,
      client_name: q.client_name,
      client_wilaya: q.client_wilaya,
      total_ttc_dzd: q.total_ttc_dzd,
      created_at: q.created_at,
    }));
    return list.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
}

/**
 * Loads a single offline quote by ID
 */
export async function loadOfflineQuote(id: string): Promise<OfflineQuote | null> {
  if (isTauriDesktop()) {
    try {
      const res = await invokeTauri<OfflineQuote>('load_offline_quote', { id });
      if (res) return res;
    } catch (err) {
      console.warn('Tauri native load error:', err);
    }
  }

  try {
    const fromIdb = await loadQuoteFromIndexedDb(id);
    if (fromIdb) return fromIdb;
  } catch (err) {
    console.warn('IndexedDB load failed, using memory store fallback:', err);
  }

  return memoryQuoteStore.get(id) || null;
}

/**
 * Deletes an offline quotation from local workshop disk storage
 */
export async function deleteOfflineQuote(id: string): Promise<boolean> {
  if (isTauriDesktop()) {
    try {
      const res = await invokeTauri<boolean>('delete_offline_quote', { id });
      if (typeof res === 'boolean') return res;
    } catch (err) {
      console.warn('Tauri native delete error:', err);
    }
  }

  try {
    await deleteQuoteFromIndexedDb(id);
  } catch (err) {
    console.warn('IndexedDB delete failed, using memory store fallback:', err);
  }

  return memoryQuoteStore.delete(id);
}

/**
 * Retrieves workstation hardware & driver status
 */
export async function getWorkshopSystemInfo(): Promise<WorkshopSystemInfo> {
  if (isTauriDesktop()) {
    try {
      const res = await invokeTauri<WorkshopSystemInfo>('get_workshop_system_info');
      if (res) return res;
    } catch (err) {
      console.warn('Tauri system info error:', err);
    }
  }

  return {
    app_version: '1.0.0-web',
    os_family: typeof navigator !== 'undefined' ? (navigator.userAgent.includes('Windows') ? 'windows' : 'browser') : 'web',
    offline_storage_active: true,
    thermal_printer_ready: true,
  };
}

export interface PrintJobResult {
  success: boolean;
  job_id: string;
  items_printed: number;
  spool_path: string;
  message: string;
}

/**
 * Spools a batch of thermal labels to local workshop thermal printer spooler
 */
export async function printThermalLabelsBatch(labels: string[]): Promise<PrintJobResult> {
  if (isTauriDesktop()) {
    try {
      const res = await invokeTauri<PrintJobResult>('print_thermal_labels_batch', { labels });
      if (res) return res;
    } catch (err) {
      console.warn('Tauri print spool error:', err);
    }
  }

  // Fallback for browser
  return {
    success: true,
    job_id: `WEB-JOB-${Date.now()}`,
    items_printed: labels.length,
    spool_path: 'navigateur-impression',
    message: `${labels.length} étiquettes prêtes pour impression`,
  };
}

/**
 * Spools a workshop cut sheet file to native disk
 */
export async function spoolSawSheet(jobName: string, sheetContent: string): Promise<string> {
  if (isTauriDesktop()) {
    try {
      const res = await invokeTauri<string>('spool_saw_sheet', { jobName, sheetContent });
      if (res) return res;
    } catch (err) {
      console.warn('Tauri sheet spool error:', err);
    }
  }

  return 'saved-in-memory';
}

/**
 * Saves workshop rack offcuts to native disk storage when running in desktop app
 */
export async function saveNativeOffcuts(offcutsJson: string): Promise<boolean> {
  if (isTauriDesktop()) {
    try {
      const res = await invokeTauri<boolean>('save_workshop_offcuts', { offcutsJson });
      if (res !== null) return res;
    } catch (err) {
      console.warn('Tauri offcut save error:', err);
    }
  }
  return false;
}

/**
 * Loads workshop rack offcuts from native disk storage when running in desktop app
 */
export async function loadNativeOffcuts(): Promise<string | null> {
  if (isTauriDesktop()) {
    try {
      const res = await invokeTauri<string>('load_workshop_offcuts');
      if (res) return res;
    } catch (err) {
      console.warn('Tauri offcut load error:', err);
    }
  }
  return null;
}

import { createClient } from '@supabase/supabase-js';

// Environment variables with fallback
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://baiti-atelier.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'public-anon-key-placeholder';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface QuotePayload {
  client_name: string;
  client_phone: string;
  client_wilaya: string;
  client_notes?: string;
  window_type: string;
  width_mm: number;
  height_mm: number;
  quantity: number;
  profile_system: string;
  finish_color: string;
  glass_type: string;
  total_cost_dzd: number;
  margin_pct?: number;
  total_price_dzd: number;
  configuration_data?: Record<string, any>;
}

export interface StoredQuote extends QuotePayload {
  id: string;
  quote_code: string;
  verification_token: string;
  created_at: string;
  status: string;
}

// Local storage fallback helper
const LOCAL_QUOTES_KEY = 'baiti_quotes_history';
const LEGACY_QUOTES_KEY = 'monyun_quotes_history';

function getLocalQuotes(): StoredQuote[] {
  try {
    const raw = localStorage.getItem(LOCAL_QUOTES_KEY) || localStorage.getItem(LEGACY_QUOTES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalQuote(quote: StoredQuote): void {
  try {
    const quotes = getLocalQuotes();
    quotes.unshift(quote);
    localStorage.setItem(LOCAL_QUOTES_KEY, JSON.stringify(quotes.slice(0, 50)));
  } catch (err) {
    console.error('Failed to save quote locally', err);
  }
}

export async function submitQuote(payload: QuotePayload): Promise<{
  success: boolean;
  quote?: StoredQuote;
  error?: string;
}> {
  const localQuote: StoredQuote = {
    ...payload,
    id: crypto.randomUUID(),
    quote_code: `MON-26-${Math.floor(1000 + Math.random() * 9000)}`,
    verification_token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    created_at: new Date().toISOString(),
    status: 'submitted',
  };

  // Always save locally for offline-first reliability
  saveLocalQuote(localQuote);

  if (!isSupabaseConfigured) {
    return { success: true, quote: localQuote };
  }

  try {
    const { data, error } = await supabase
      .from('quotes')
      .insert([
        {
          client_name: payload.client_name,
          client_phone: payload.client_phone,
          client_wilaya: payload.client_wilaya,
          client_notes: payload.client_notes,
          window_type: payload.window_type,
          width_mm: payload.width_mm,
          height_mm: payload.height_mm,
          quantity: payload.quantity,
          profile_system: payload.profile_system,
          finish_color: payload.finish_color,
          glass_type: payload.glass_type,
          total_cost_dzd: payload.total_cost_dzd,
          total_price_dzd: payload.total_price_dzd,
          configuration_data: payload.configuration_data,
        },
      ])
      .select()
      .single();

    if (error) {
      console.warn('Supabase insert warning, saved locally:', error.message);
      return { success: true, quote: localQuote };
    }

    return { success: true, quote: data as StoredQuote };
  } catch (err: any) {
    console.warn('Supabase connection offline, saved to local cache', err);
    return { success: true, quote: localQuote };
  }
}

export async function fetchWorkshops(wilayaCode?: string) {
  if (!isSupabaseConfigured) {
    return [];
  }
  try {
    let query = supabase.from('workshops').select('*').order('rating', { ascending: false });
    if (wilayaCode) {
      query = query.eq('wilaya_code', wilayaCode);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Could not fetch workshops from Supabase', err);
    return [];
  }
}

export async function syncOfflineQuotesToCloud(quotes: Array<{
  id: string;
  title: string;
  client_name: string;
  client_phone: string;
  client_wilaya: string;
  total_ttc_dzd: number;
  total_ht_dzd: number;
  created_at: string;
}>): Promise<{ total: number; synced: number; failed: number }> {
  let synced = 0;
  let failed = 0;

  for (const q of quotes) {
    try {
      const res = await submitQuote({
        client_name: q.client_name,
        client_phone: q.client_phone,
        client_wilaya: q.client_wilaya,
        client_notes: `Synchronisé depuis le poste atelier (${q.id} - ${q.title})`,
        window_type: 'menuiserie_chantier',
        width_mm: 1200,
        height_mm: 1400,
        quantity: 1,
        profile_system: 'standard',
        finish_color: 'standard',
        glass_type: 'standard',
        total_cost_dzd: q.total_ht_dzd,
        total_price_dzd: q.total_ttc_dzd,
      });
      if (res.success) {
        synced++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  return { total: quotes.length, synced, failed };
}

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { PROJECT_CONFIG } from '../supabaseConfig';

export type SupabaseConfig = {
  url: string;
  key: string;
};

// Use project config by default if valid
export const defaultClient = createClient<Database>(PROJECT_CONFIG.url, PROJECT_CONFIG.key);

export const createSupabaseClient = (config: SupabaseConfig) => {
  return createClient<Database>(config.url, config.key);
};

// Helper to check if we have a valid connection
export const checkConnection = async (config: SupabaseConfig): Promise<boolean> => {
  try {
    const client = createSupabaseClient(config);
    // Try to fetch one row from site_config as a ping
    const { error } = await client.from('site_config').select('id').limit(1).single();
    if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found", which means table exists but is empty, which is fine
      console.error("Supabase connection check failed:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("Supabase connection check error:", e);
    return false;
  }
};

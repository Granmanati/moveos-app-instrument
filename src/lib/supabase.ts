import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or Anon Key is missing from environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Type-safe select wrapper with logging
 */
export async function safeSelect<T>(query: string, label: string = 'Query'): Promise<{ data: T[] | null, error: any }> {
    try {
        const { data, error } = await supabase.rpc('execute_sql', { sql_query: query });
        if (error) {
            console.error(`[Supabase][${label}] Error:`, error);
            return { data: null, error };
        }
        return { data: (data as T[]) || [], error: null };
    } catch (err) {
        console.error(`[Supabase][${label}] Catch:`, err);
        return { data: null, error: err };
    }
}


/**
 * Type-safe RPC wrapper with logging
 */
export async function safeRpc<T>(fn: string, params: any = {}, label: string = 'RPC'): Promise<{ data: T | null, error: any }> {
    try {
        const { data, error } = await supabase.rpc(fn, params);
        if (error) console.error(`[Supabase][${label}] ${fn} Error:`, error);
        return { data, error };
    } catch (err) {
        console.error(`[Supabase][${label}] ${fn} Catch:`, err);
        return { data: null, error: err };
    }
}


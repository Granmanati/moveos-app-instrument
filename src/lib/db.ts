import { supabase } from './supabase';
import { PostgrestError } from '@supabase/supabase-js';

export interface DbResult<T> {
    data: T | null;
    error: Error | null;
}

/**
 * Standardizes Supabase errors into user-friendly messages for the UI.
 */
export function normalizeError(err: unknown): Error {
    if (!err) return new Error('Error desconocido del servidor.');

    const errorStr = String(err);
    if (errorStr.includes('EOF') || errorStr.includes('Failed to fetch')) {
        return new Error('Problema de conexión. Verifica tu internet y vuelve a intentarlo.');
    }

    // Attempt to handle it as a PostgrestError if it has code/message structure
    const pgError = err as PostgrestError;
    if (pgError.code || pgError.message) {
        if (pgError.code === '42P01') {
            return new Error('Error interno: la tabla solicitada no existe. Contacta soporte.');
        }
        if (pgError.code === 'PGRST116') {
            return new Error('No se encontraron datos para tu consulta.');
        }
        return new Error(`Error BD (${pgError.code || 'X'}): ${pgError.message}`);
    }

    if (err instanceof Error) return err;
    return new Error(errorStr);
}

/**
 * Centralized wrapper for running Supabase SELECT queries safely.
 * @param query The active Supabase select builder (e.g., supabase.from('x').select('*'))
 * @param queryName Optional label for logging
 */
export async function safeSelect<T>(query: PromiseLike<{ data: T | null, error: PostgrestError | null }>, queryName = 'query'): Promise<DbResult<T>> {
    try {
        const { data, error } = await query;
        if (error) throw error;
        return { data, error: null };
    } catch (err) {
        console.error(`[DB Error: ${queryName}]`, err);
        return { data: null, error: normalizeError(err) };
    }
}

/**
 * Centralized wrapper for calling Supabase RPCs safely.
 * @param rpcName Name of the remote procedure call
 * @param args Arguments object
 */
export async function safeRpc<T>(rpcName: string, args?: any): Promise<DbResult<T>> {
    try {
        const { data, error } = await supabase.rpc(rpcName, args);
        if (error) throw error;
        return { data: data as T, error: null };
    } catch (err) {
        console.error(`[DB Error: RPC ${rpcName}]`, err);
        return { data: null, error: normalizeError(err) };
    }
}

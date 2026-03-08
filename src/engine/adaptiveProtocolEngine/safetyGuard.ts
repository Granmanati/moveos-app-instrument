// =============================================================================
// Module 5: Safety Guard
// Checks for safety flags and contraindications.
// Returns a block decision and list of safety notes.
// =============================================================================

import type { EngineInput } from './types';

export interface SafetyResult {
    blocked: boolean;
    safetyNotes: string[];
    allowedPatterns: string[] | null; // null = all allowed, [] = none
}

/**
 * Safety rules:
 *
 * CRITICAL flags  → block entire session, return empty allowedPatterns
 * MODERATE flags  → restrict high-load patterns (hinge, squat, push with load)
 * MILD flags      → log note, no restriction
 * Pain >= 8       → block session
 */
const HIGH_LOAD_PATTERNS = ['squat', 'hinge', 'deadlift', 'push_loaded', 'pull_loaded', 'strength'];
const SAFE_PATTERNS_ONLY = ['cat_cow', 'diaphragmatic_breathing', 'supine_twist', 'mobility', 'recovery'];

export function runSafetyGuard(input: EngineInput): SafetyResult {
    const { safetyFlags, pain } = input;
    const notes: string[] = [];

    // ── Acute pain block ───────────────────────────────────────────────────
    if (pain >= 8) {
        return {
            blocked: true,
            safetyNotes: [`Pain ${pain}/10 exceeds safe threshold — session blocked`],
            allowedPatterns: [],
        };
    }

    // ── Critical flags ─────────────────────────────────────────────────────
    const criticals = safetyFlags.filter(f => f.severity === 'critical');
    if (criticals.length > 0) {
        criticals.forEach(f => notes.push(`[CRITICAL] ${f.code}: ${f.description}`));
        return {
            blocked: true,
            safetyNotes: notes,
            allowedPatterns: [],
        };
    }

    // ── Moderate flags ─────────────────────────────────────────────────────
    const moderates = safetyFlags.filter(f => f.severity === 'moderate');
    if (moderates.length > 0) {
        moderates.forEach(f => notes.push(`[MODERATE] ${f.code}: ${f.description} — restricted to safe patterns`));
        return {
            blocked: false,
            safetyNotes: notes,
            allowedPatterns: SAFE_PATTERNS_ONLY,
        };
    }

    // ── Mild flags ─────────────────────────────────────────────────────────
    const milds = safetyFlags.filter(f => f.severity === 'mild');
    milds.forEach(f => notes.push(`[MILD] ${f.code}: ${f.description} — monitor during session`));

    // Mild: exclude only the heaviest high-load patterns
    const restrictedPatterns = milds.length > 0
        ? HIGH_LOAD_PATTERNS.filter(p => p.includes('loaded') || p === 'deadlift')
        : null;

    return {
        blocked: false,
        safetyNotes: notes.length > 0 ? notes : ['No active safety flags'],
        allowedPatterns: restrictedPatterns !== null
            ? [...SAFE_PATTERNS_ONLY, 'mobility', 'activation']
            : null,
    };
}

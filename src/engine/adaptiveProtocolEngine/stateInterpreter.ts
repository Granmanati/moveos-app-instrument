// =============================================================================
// Module 1: State Interpreter
// Determines the current system state: aligned | compensating | risk
// =============================================================================

import type { EngineInput, SystemState } from './types';

export interface StateInterpretation {
    systemState: SystemState;
    reason: string;
}

/**
 * Rules (evaluated in priority order — first match wins):
 *
 * RISK:
 *   - Any critical safety flag
 *   - Pain >= 8
 *   - Pain increase >= 3 points vs. recent 3-day average
 *
 * COMPENSATING:
 *   - Pain >= 5 OR stiffness >= 7 OR fatigue >= 8
 *   - Pain increased >= 1.5 vs. recent average
 *   - Adherence < 40%
 *   - Any moderate safety flag
 *
 * ALIGNED (default):
 *   - None of the above conditions met
 */
export function interpretState(input: EngineInput): StateInterpretation {
    const { pain, stiffness, fatigue, weeklyAdherence, painTrend, safetyFlags } = input;

    // ── Critical safety check ──────────────────────────────────────────────
    const hasCritical = safetyFlags.some(f => f.severity === 'critical');
    if (hasCritical) {
        return {
            systemState: 'risk',
            reason: `Critical safety flag: ${safetyFlags.find(f => f.severity === 'critical')!.code}`,
        };
    }

    // ── Acute pain spike ───────────────────────────────────────────────────
    if (pain >= 8) {
        return { systemState: 'risk', reason: `Pain score ${pain}/10 exceeds risk threshold (>=8)` };
    }

    const recentAvgPain = painTrend.length >= 3
        ? painTrend.slice(-3).reduce((s, v) => s + v, 0) / 3
        : pain;

    const painDelta = pain - recentAvgPain;

    if (painDelta >= 3) {
        return {
            systemState: 'risk',
            reason: `Pain spiked +${painDelta.toFixed(1)} pts above recent 3-day avg (${recentAvgPain.toFixed(1)})`,
        };
    }

    // ── Compensating conditions ────────────────────────────────────────────
    const hasModerate = safetyFlags.some(f => f.severity === 'moderate');
    if (hasModerate) {
        return {
            systemState: 'compensating',
            reason: `Moderate safety flag: ${safetyFlags.find(f => f.severity === 'moderate')!.code}`,
        };
    }

    if (pain >= 5) return { systemState: 'compensating', reason: `Pain ${pain}/10 >= 5` };
    if (stiffness >= 7) return { systemState: 'compensating', reason: `Stiffness ${stiffness}/10 >= 7` };
    if (fatigue >= 8) return { systemState: 'compensating', reason: `Fatigue ${fatigue}/10 >= 8` };
    if (painDelta >= 1.5) return { systemState: 'compensating', reason: `Pain trending up +${painDelta.toFixed(1)} pts` };
    if (weeklyAdherence < 40) return { systemState: 'compensating', reason: `Low adherence: ${weeklyAdherence}%` };

    // ── Aligned (nominal) ──────────────────────────────────────────────────
    return { systemState: 'aligned', reason: `All metrics within nominal parameters` };
}

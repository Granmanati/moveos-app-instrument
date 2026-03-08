// =============================================================================
// Module 6: Load Regulator
// Determines volume, intensity, and rest modifiers per exercise block.
// =============================================================================

import type { EngineInput, LoadModifier, ProgressionDecision } from './types';

export interface LoadProfile {
    modifier: LoadModifier;
    setsAdjustment: number;   // delta to apply: +1, 0, -1
    repsScale: number;         // 0.5–1.5 multiplier on reps
    restExtension: number;     // extra seconds to add to rest
    reason: string;
}

/**
 * Load regulation rules:
 *
 * REDUCE:
 *   - progressionDecision === 'regress'
 *   - pain >= 6
 *   - fatigue >= 7
 *   - readinessScore < 40
 *   - adherence < 40%
 *
 * INCREASE:
 *   - progressionDecision === 'progress'
 *   - pain <= 2, fatigue <= 3, readinessScore >= 75
 *   - adherence >= 80%
 *
 * MAINTAIN (default):
 *   - everything else
 */
export function regulateLoad(
    input: EngineInput,
    progressionDecision: ProgressionDecision,
    readinessScore: number,
): LoadProfile {
    const { pain, fatigue, weeklyAdherence } = input;

    // ── REDUCE ────────────────────────────────────────────────────────────
    if (progressionDecision === 'regress') {
        return {
            modifier: 'reduce',
            setsAdjustment: -1,
            repsScale: 0.7,
            restExtension: 30,
            reason: `Regressing load: progression decision is REGRESS`,
        };
    }

    if (pain >= 6) {
        return {
            modifier: 'reduce',
            setsAdjustment: -1,
            repsScale: 0.75,
            restExtension: 20,
            reason: `Pain ${pain}/10 requires volume reduction`,
        };
    }

    if (fatigue >= 7) {
        return {
            modifier: 'reduce',
            setsAdjustment: 0,
            repsScale: 0.8,
            restExtension: 15,
            reason: `High fatigue (${fatigue}/10) — reps reduced, rest extended`,
        };
    }

    if (readinessScore < 40) {
        return {
            modifier: 'reduce',
            setsAdjustment: -1,
            repsScale: 0.75,
            restExtension: 20,
            reason: `Low readiness score (${readinessScore}/100) — conservative load`,
        };
    }

    if (weeklyAdherence < 40) {
        return {
            modifier: 'reduce',
            setsAdjustment: -1,
            repsScale: 0.85,
            restExtension: 0,
            reason: `Adherence ${weeklyAdherence}% — reduce load to improve consistency`,
        };
    }

    // ── INCREASE ──────────────────────────────────────────────────────────
    if (
        progressionDecision === 'progress' &&
        pain <= 2 &&
        fatigue <= 3 &&
        readinessScore >= 75 &&
        weeklyAdherence >= 80
    ) {
        return {
            modifier: 'increase',
            setsAdjustment: 1,
            repsScale: 1.15,
            restExtension: -10,
            reason: `Optimal readiness (${readinessScore}/100), low pain (${pain}/10) — load increased`,
        };
    }

    // ── MAINTAIN (default) ────────────────────────────────────────────────
    return {
        modifier: 'maintain',
        setsAdjustment: 0,
        repsScale: 1.0,
        restExtension: 0,
        reason: `Load maintained — all metrics within nominal range`,
    };
}

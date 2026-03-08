// =============================================================================
// Module 3: Progression Logic
// Decides whether to progress, hold, or regress the current phase + load.
// =============================================================================

import type { EngineInput, Phase, ProgressionDecision, SystemState } from './types';

export interface ProgressionResult {
    decision: ProgressionDecision;
    targetPhase: Phase;
    reason: string;
}

const PHASE_ORDER: Phase[] = ['return', 'regulate', 'load', 'adapt', 'become'];

function advancePhase(phase: Phase): Phase {
    const idx = PHASE_ORDER.indexOf(phase);
    return idx < PHASE_ORDER.length - 1 ? PHASE_ORDER[idx + 1] : phase;
}

function regressPhase(phase: Phase): Phase {
    const idx = PHASE_ORDER.indexOf(phase);
    return idx > 0 ? PHASE_ORDER[idx - 1] : phase;
}

/**
 * Progression decision rules (evaluated top-down, first match wins):
 *
 * REGRESS:
 *   - System state is 'risk'
 *   - Any critical safety flag
 *   - Last 2 sessions skipped AND pain increased
 *
 * HOLD:
 *   - System state is 'compensating'
 *   - Fatigue >= 7
 *   - Pain trending up (last 3 days slope > 0.5)
 *   - Adherence < 60%
 *   - Fewer than 3 recent completed sessions
 *
 * PROGRESS:
 *   - Last 3 sessions completed + pain stable or lower + adherence >= 70%
 */
export function decideProgression(
    input: EngineInput,
    systemState: SystemState,
    readinessScore: number,
): ProgressionResult {
    const { fatigue, weeklyAdherence, painTrend, recentSessions, currentPhase, safetyFlags } = input;

    const hasCritical = safetyFlags.some(f => f.severity === 'critical');

    // ── REGRESS ───────────────────────────────────────────────────────────
    if (hasCritical) {
        return {
            decision: 'regress',
            targetPhase: regressPhase(currentPhase),
            reason: `Critical safety flag — phase regressed for protection`,
        };
    }

    if (systemState === 'risk') {
        return {
            decision: 'regress',
            targetPhase: regressPhase(currentPhase),
            reason: `System in RISK state — volume and phase regressed`,
        };
    }

    const recentCompleted = recentSessions.slice(-5).filter(s => s.completed);
    const recentSkipped = recentSessions.slice(-2).filter(s => s.skipped);
    const recentPainAfter = recentCompleted.map(s => s.painAfter ?? 0);
    const avgPainAfter = recentPainAfter.length > 0
        ? recentPainAfter.reduce((a, b) => a + b, 0) / recentPainAfter.length
        : 0;

    if (recentSkipped.length >= 2 && avgPainAfter > 5) {
        return {
            decision: 'regress',
            targetPhase: regressPhase(currentPhase),
            reason: `2 consecutive skipped sessions with elevated post-session pain (avg ${avgPainAfter.toFixed(1)})`,
        };
    }

    // ── HOLD ──────────────────────────────────────────────────────────────
    if (systemState === 'compensating') {
        return {
            decision: 'hold',
            targetPhase: currentPhase,
            reason: `System COMPENSATING — holding current phase to consolidate`,
        };
    }

    if (fatigue >= 7) {
        return {
            decision: 'hold',
            targetPhase: currentPhase,
            reason: `Fatigue ${fatigue}/10 >= 7 — no progression until recovered`,
        };
    }

    if (readinessScore < 45) {
        return {
            decision: 'hold',
            targetPhase: currentPhase,
            reason: `Readiness score ${readinessScore}/100 too low for progression`,
        };
    }

    const painTrendSlope = painTrend.length >= 3
        ? painTrend[painTrend.length - 1] - painTrend[painTrend.length - 3]
        : 0;

    if (painTrendSlope > 0.5) {
        return {
            decision: 'hold',
            targetPhase: currentPhase,
            reason: `Pain trend worsening (+${painTrendSlope.toFixed(1)} over 3 sessions)`,
        };
    }

    if (weeklyAdherence < 60) {
        return {
            decision: 'hold',
            targetPhase: currentPhase,
            reason: `Adherence ${weeklyAdherence}% < 60% — prioritize consistency over progression`,
        };
    }

    if (recentCompleted.length < 3) {
        return {
            decision: 'hold',
            targetPhase: currentPhase,
            reason: `Fewer than 3 completed sessions in recent history — premature to progress`,
        };
    }

    // ── PROGRESS ──────────────────────────────────────────────────────────
    const last3 = recentSessions.slice(-3);
    const allLast3Done = last3.every(s => s.completed);
    const painStableOrImproving = painTrendSlope <= 0;

    if (allLast3Done && painStableOrImproving && weeklyAdherence >= 70) {
        return {
            decision: 'progress',
            targetPhase: advancePhase(currentPhase),
            reason: `3 consecutive completions + stable/improving pain + adherence ${weeklyAdherence}%`,
        };
    }

    // Default: hold
    return {
        decision: 'hold',
        targetPhase: currentPhase,
        reason: `Conditions not yet met for progression — maintaining current phase`,
    };
}

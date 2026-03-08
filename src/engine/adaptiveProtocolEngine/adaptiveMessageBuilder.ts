// =============================================================================
// Module 8: Adaptive Message Builder
// Generates the clinical-tone adaptive message shown to the user on TodayPage.
// Messages are deterministic, concise, and MOVE OS–branded.
// =============================================================================

import type { Phase, ProgressionDecision, ProtocolType, SystemState } from './types';

export interface MessageContext {
    systemState: SystemState;
    phase: Phase;
    progressionDecision: ProgressionDecision;
    protocolType: ProtocolType;
    readinessScore: number;
    pain: number;
    fatigue: number;
    weeklyAdherence: number;
    safetyBlocked: boolean;
}

/**
 * Message hierarchy:
 * 1. Safety block (always shown if session is blocked)
 * 2. Progression message (progress / hold / regress)
 * 3. State message (risk / compensating / aligned)
 * 4. Readiness message (low / moderate / high)
 */
export function buildAdaptiveMessage(ctx: MessageContext): string {
    const {
        systemState, phase, progressionDecision,
        readinessScore, pain, fatigue,
        weeklyAdherence, safetyBlocked,
    } = ctx;

    // ── Safety block ──────────────────────────────────────────────────────
    if (safetyBlocked) {
        return `Pain levels and safety flags indicate that today's session should not proceed. Rest, hydrate, and reassess tomorrow. Contact your clinician if symptoms persist.`;
    }

    // ── Progression messages ───────────────────────────────────────────────
    if (progressionDecision === 'progress') {
        const phaseMessages: Record<Phase, string> = {
            return: `System readiness confirmed. Transitioning from RETURN to REGULATE. Today introduces controlled motor patterns.`,
            regulate: `Protocol data supports phase advancement. Entering LOAD phase — progressive resistance begins today.`,
            load: `Three consecutive completions at stable pain. Entering ADAPT phase — mixed conditioning begins.`,
            adapt: `Full adaptation window confirmed. Advancing to BECOME — peak protocol activated.`,
            become: `Optimal system state maintained. Full performance protocol active. Continue executing with precision.`,
        };
        return phaseMessages[phase];
    }

    if (progressionDecision === 'regress') {
        if (systemState === 'risk') {
            return `System has entered RISK state. Pain markers exceed safe thresholds. Protocol regressed to protective recovery. Proceed with care.`;
        }
        return `Regression applied. Recent session data shows elevated stress markers. Volume and intensity reduced to allow tissue recovery.`;
    }

    // ── Hold — state-specific ──────────────────────────────────────────────
    if (systemState === 'compensating') {
        if (pain >= 5) {
            return `Pain elevated at ${pain}/10. Today's protocol has been adapted to minimize mechanical load while maintaining movement stimulus.`;
        }
        if (fatigue >= 7) {
            return `Fatigue at ${fatigue}/10 signals accumulated stress. Protocol simplified. Focus on quality of movement over volume today.`;
        }
        if (weeklyAdherence < 50) {
            return `Consistency below 50%. Protocol simplified to prioritize reengagement. A shorter, manageable session builds more than a skipped one.`;
        }
        return `System currently in COMPENSATING state. Protocol adapted to current capacity. Maintain quality of execution over intensity.`;
    }

    // ── Aligned — readiness-based ──────────────────────────────────────────
    if (readinessScore >= 80) {
        return `System readiness at ${readinessScore}/100. All metrics nominal. Execute today's protocol with full attention to form and range.`;
    }

    if (readinessScore >= 60) {
        return `Readiness score: ${readinessScore}/100. Protocol on track for phase ${phase.toUpperCase()}. Maintain pace — adaptation is cumulative.`;
    }

    return `Readiness score: ${readinessScore}/100. Proceed at a conservative pace today. Listen to your body and log your response accurately after the session.`;
}

// =============================================================================
// MOVE OS — Adaptive Protocol Engine
// Entry point: composes all 8 modules into a single deterministic call.
//
// Usage:
//   import { runAdaptiveProtocolEngine } from './engine/adaptiveProtocolEngine';
//   const output = runAdaptiveProtocolEngine(input);
// =============================================================================

import type { EngineInput, EngineOutput } from './types';
import { interpretState } from './stateInterpreter';
import { scoreReadiness } from './readinessScorer';
import { decideProgression } from './progressionLogic';
import { selectProtocol } from './protocolSelector';
import { runSafetyGuard } from './safetyGuard';
import { regulateLoad } from './loadRegulator';
import { composeBlocks } from './blockComposer';
import { buildAdaptiveMessage } from './adaptiveMessageBuilder';

export type { EngineInput, EngineOutput } from './types';
export type { Phase, SystemState, ProgressionDecision, ProtocolType, EngineBlock } from './types';

/**
 * Run the full Adaptive Protocol Engine pipeline.
 *
 * Pipeline order:
 *  1. SafetyGuard        — check contraindications (fast exit if blocked)
 *  2. StateInterpreter   — determine system state
 *  3. ReadinessScorer    — compute 0–100 readiness score
 *  4. ProgressionLogic   — decide progress / hold / regress + target phase
 *  5. ProtocolSelector   — map state × phase → protocolType + sessionGoal
 *  6. LoadRegulator      — compute volume/intensity modifiers
 *  7. BlockComposer      — build ordered exercise blocks
 *  8. MessageBuilder     — generate adaptive message for the user
 */
export function runAdaptiveProtocolEngine(input: EngineInput): EngineOutput {
    const timestamp = new Date().toISOString();

    // ── 1. Safety Guard ────────────────────────────────────────────────────
    const safety = runSafetyGuard(input);

    if (safety.blocked) {
        return {
            systemState: 'risk',
            phase: input.currentPhase,
            readinessScore: 0,
            progressionDecision: 'regress',
            protocolType: 'recovery',
            sessionGoal: 'Session blocked for safety. Rest and reassess.',
            adaptiveMessage: safety.safetyNotes.join(' '),
            blocks: [],
            safetyBlocked: true,
            audit: {
                stateReason: 'Safety block enforced',
                readinessFactors: [],
                progressionReason: 'Session blocked — no progression evaluation',
                protocolReason: 'Safety block',
                loadReason: 'No load — session blocked',
                safetyNotes: safety.safetyNotes,
                timestamp,
            },
        };
    }

    // ── 2. State Interpreter ───────────────────────────────────────────────
    const stateResult = interpretState(input);
    const { systemState } = stateResult;

    // ── 3. Readiness Scorer ────────────────────────────────────────────────
    const readinessResult = scoreReadiness(input);
    const { score: readinessScore, factors: readinessFactors } = readinessResult;

    // ── 4. Progression Logic ───────────────────────────────────────────────
    const progressionResult = decideProgression(input, systemState, readinessScore);
    const { decision: progressionDecision, targetPhase: phase } = progressionResult;

    // ── 5. Protocol Selector ───────────────────────────────────────────────
    const protocolResult = selectProtocol(systemState, phase);
    const { protocolType, sessionGoal } = protocolResult;

    // ── 6. Load Regulator ──────────────────────────────────────────────────
    const loadProfile = regulateLoad(input, progressionDecision, readinessScore);

    // ── 7. Block Composer ──────────────────────────────────────────────────
    const blocks = composeBlocks(protocolType, loadProfile, safety.allowedPatterns);

    // ── 8. Adaptive Message ────────────────────────────────────────────────
    const adaptiveMessage = buildAdaptiveMessage({
        systemState,
        phase,
        progressionDecision,
        protocolType,
        readinessScore,
        pain: input.pain,
        fatigue: input.fatigue,
        weeklyAdherence: input.weeklyAdherence,
        safetyBlocked: false,
    });

    // ── Assemble Output ────────────────────────────────────────────────────
    return {
        systemState,
        phase,
        readinessScore,
        progressionDecision,
        protocolType,
        sessionGoal,
        adaptiveMessage,
        blocks,
        safetyBlocked: false,
        audit: {
            stateReason: stateResult.reason,
            readinessFactors,
            progressionReason: progressionResult.reason,
            protocolReason: protocolResult.reason,
            loadReason: loadProfile.reason,
            safetyNotes: safety.safetyNotes,
            timestamp,
        },
    };
}

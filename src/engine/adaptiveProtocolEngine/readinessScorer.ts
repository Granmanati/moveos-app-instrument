// =============================================================================
// Module 2: Readiness Scorer
// Computes a 0–100 readiness score from all available inputs.
// Each factor contributes a weighted deduction from 100.
// =============================================================================

import type { EngineInput } from './types';

export interface ReadinessResult {
    score: number;      // 0–100
    factors: string[];  // audit trail of each deduction applied
}

/**
 * Scoring model (deduction-based, max deduction = 100):
 *
 * Pain:        up to –30 pts  (pain * 3)
 * Stiffness:   up to –15 pts  (stiffness * 1.5)
 * Fatigue:     up to –20 pts  (fatigue * 2)
 * Readiness:   up to +10 pts  bonus if confidence >= 7
 * Sleep:       up to –10 pts  if sleep < 6h
 * HR/HRV:      up to –10 pts  if resting HR elevated or HRV low
 * Adherence:   up to –10 pts  if adherence < 50%
 * Pain trend:  up to –5  pts  if trending up
 */
export function scoreReadiness(input: EngineInput): ReadinessResult {
    const { pain, stiffness, fatigue, readiness, weeklyAdherence, painTrend, healthData } = input;
    const factors: string[] = [];
    let score = 100;

    // ── Pain ──────────────────────────────────────────────────────────────
    const painDeduction = Math.min(30, pain * 3);
    score -= painDeduction;
    if (painDeduction > 0) factors.push(`Pain: –${painDeduction.toFixed(0)} pts (${pain}/10)`);

    // ── Stiffness ─────────────────────────────────────────────────────────
    const stiffDeduction = Math.min(15, stiffness * 1.5);
    score -= stiffDeduction;
    if (stiffDeduction > 0) factors.push(`Stiffness: –${stiffDeduction.toFixed(0)} pts (${stiffness}/10)`);

    // ── Fatigue ───────────────────────────────────────────────────────────
    const fatigueDeduction = Math.min(20, fatigue * 2);
    score -= fatigueDeduction;
    if (fatigueDeduction > 0) factors.push(`Fatigue: –${fatigueDeduction.toFixed(0)} pts (${fatigue}/10)`);

    // ── Confidence bonus / penalty ─────────────────────────────────────────
    if (readiness >= 7) {
        score += 10;
        factors.push(`Readiness bonus: +10 pts (confidence ${readiness}/10)`);
    } else if (readiness <= 3) {
        score -= 8;
        factors.push(`Low readiness: –8 pts (confidence ${readiness}/10)`);
    }

    // ── Pain trend ────────────────────────────────────────────────────────
    if (painTrend.length >= 3) {
        const last3 = painTrend.slice(-3);
        const trendSlope = last3[2] - last3[0];
        if (trendSlope > 1.5) {
            score -= 5;
            factors.push(`Worsening pain trend: –5 pts (slope +${trendSlope.toFixed(1)})`);
        }
    }

    // ── Adherence ─────────────────────────────────────────────────────────
    if (weeklyAdherence < 50) {
        const adDeduction = Math.min(10, (50 - weeklyAdherence) / 5);
        score -= adDeduction;
        factors.push(`Low adherence: –${adDeduction.toFixed(0)} pts (${weeklyAdherence}%)`);
    }

    // ── Optional biometrics ───────────────────────────────────────────────
    if (healthData) {
        if (healthData.sleepHours !== undefined && healthData.sleepHours < 6) {
            const sleepDeduction = Math.min(10, (6 - healthData.sleepHours) * 3);
            score -= sleepDeduction;
            factors.push(`Low sleep: –${sleepDeduction.toFixed(0)} pts (${healthData.sleepHours}h)`);
        }

        if (healthData.restingHR !== undefined && healthData.restingHR > 85) {
            score -= 5;
            factors.push(`Elevated resting HR: –5 pts (${healthData.restingHR} bpm)`);
        }

        if (healthData.hrv !== undefined && healthData.hrv < 30) {
            score -= 5;
            factors.push(`Low HRV: –5 pts (${healthData.hrv} ms)`);
        }
    }

    const finalScore = Math.max(0, Math.min(100, Math.round(score)));
    if (factors.length === 0) factors.push('All metrics nominal — full readiness');

    return { score: finalScore, factors };
}

// =============================================================================
// useAdaptiveEngine — React hook
// Fetches system data from Supabase and runs the Adaptive Protocol Engine.
// Returns engine output + loading/error state.
// =============================================================================

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { safeRpc } from '../lib/db';
import {
    runAdaptiveProtocolEngine,
    type EngineInput,
    type EngineOutput,
} from './adaptiveProtocolEngine';

export interface AdaptiveEngineState {
    output: EngineOutput | null;
    input: EngineInput | null;
    loading: boolean;
    error: string | null;
}

/** Default safe input when DB data is unavailable — engine still returns a valid output */
function buildDefaultInput(phase: string = 'regulate'): EngineInput {
    return {
        pain: 0,
        stiffness: 0,
        fatigue: 0,
        readiness: 7,
        weeklyAdherence: 50,
        painTrend: [0, 0, 0, 0, 0, 0, 0],
        recentSessions: [],
        conditionId: 'general',
        currentPhase: phase as EngineInput['currentPhase'],
        safetyFlags: [],
    };
}

interface HomeSnapshot {
    avg_pain_7d: number;
    adherence_7d: number;
    sessions_30d: number;
    today_session: { phase: string } | null;
}

/**
 * Builds an EngineInput from real Supabase snapshot data.
 * Uses avg_pain_7d as the pain proxy since we don't have per-session check-in yet.
 */
function buildInputFromSnapshot(snapshot: HomeSnapshot): EngineInput {
    const phase = (snapshot.today_session?.phase ?? 'regulate').toLowerCase();

    // Derive a simple pain trend — 7 days all at the same average (no time-series yet)
    const painTrend = Array.from({ length: 7 }, () => snapshot.avg_pain_7d);

    // Estimate fatigue from adherence gap (lower adherence → higher estimated fatigue)
    const estimatedFatigue = Math.max(0, Math.min(10, (100 - snapshot.adherence_7d) / 15));

    // Estimate stiffness from pain level
    const estimatedStiffness = Math.min(10, snapshot.avg_pain_7d * 0.7);

    return {
        pain: snapshot.avg_pain_7d,
        stiffness: Math.round(estimatedStiffness),
        fatigue: Math.round(estimatedFatigue),
        readiness: 7, // Will be replaced by pre-session check-in when implemented
        weeklyAdherence: snapshot.adherence_7d,
        painTrend,
        recentSessions: [],
        conditionId: 'general',
        currentPhase: phase as EngineInput['currentPhase'],
        safetyFlags: [],
    };
}

export function useAdaptiveEngine(): AdaptiveEngineState {
    const { user } = useAuth();
    const [state, setState] = useState<AdaptiveEngineState>({
        output: null,
        input: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        if (!user) return;

        let cancelled = false;

        async function run() {
            setState(s => ({ ...s, loading: true, error: null }));

            try {
                const { data, error } = await safeRpc<HomeSnapshot>('get_home_snapshot');

                if (cancelled) return;

                const input = (data && !error)
                    ? buildInputFromSnapshot(data)
                    : buildDefaultInput();

                const output = runAdaptiveProtocolEngine(input);

                if (!cancelled) {
                    setState({ output, input, loading: false, error: null });
                }
            } catch (err: any) {
                if (!cancelled) {
                    const input = buildDefaultInput();
                    const output = runAdaptiveProtocolEngine(input);
                    setState({ output, input, loading: false, error: err.message ?? 'Engine error' });
                }
            }
        }

        run();
        return () => { cancelled = true; };
    }, [user]);

    return state;
}

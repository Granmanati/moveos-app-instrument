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
    refetch: () => Promise<EngineOutput | null>;
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
    today_session: {
        phase: string;
        pre_pain?: number | null;
        pre_stiffness?: number | null;
        pre_fatigue?: number | null;
        pre_readiness?: number | null;
    } | null;
}

/**
 * Builds an EngineInput from real Supabase snapshot data.
 * Prioritizes today's pre-session check-in if present, falling back slowly.
 */
function buildInputFromSnapshot(snapshot: HomeSnapshot): EngineInput {
    const phase = (snapshot.today_session?.phase ?? 'regulate').toLowerCase();

    // Prefer latest same-day values if available, else fallback safely
    const pain = snapshot.today_session?.pre_pain ?? snapshot.avg_pain_7d;
    const stiffness = snapshot.today_session?.pre_stiffness ?? Math.min(10, snapshot.avg_pain_7d * 0.7);
    const fatigue = snapshot.today_session?.pre_fatigue ?? Math.max(0, Math.min(10, (100 - snapshot.adherence_7d) / 15));
    const readiness = snapshot.today_session?.pre_readiness ?? 7;

    // Derive a simple pain trend — 7 days all at the same average (no time-series yet)
    const painTrend = Array.from({ length: 7 }, () => snapshot.avg_pain_7d);

    return {
        pain: Math.round(pain),
        stiffness: Math.round(stiffness),
        fatigue: Math.round(fatigue),
        readiness: Math.round(readiness),
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
        refetch: async () => null,
    });

    const run = async (): Promise<EngineOutput | null> => {
        setState(s => ({ ...s, loading: true, error: null }));

        try {
            const { data, error } = await safeRpc<HomeSnapshot>('get_home_snapshot');

            const input = (data && !error)
                ? buildInputFromSnapshot(data)
                : buildDefaultInput();

            const output = runAdaptiveProtocolEngine(input);

            setState(s => ({ ...s, output, input, loading: false, error: null }));
            return output;
        } catch (err: any) {
            const input = buildDefaultInput();
            const output = runAdaptiveProtocolEngine(input);
            setState(s => ({ ...s, output, input, loading: false, error: err.message ?? 'Engine error' }));
            return output;
        }
    };

    useEffect(() => {
        if (!user) return;
        setState(s => ({ ...s, refetch: run }));
        run();
    }, [user]);

    return state;
}

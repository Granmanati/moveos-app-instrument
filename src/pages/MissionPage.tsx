import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AppShell from '../components/AppShell';
import { Icon } from '../components/Icon';
import { safeSelect } from '../lib/db';

export interface ExerciseLibrary {
    id: number | string;
    name: string;
    pattern: string;
    media_video_url: string;
    level: number;
}

export interface SessionExercise {
    id: number | string;
    is_completed: boolean;
    status: string;
    sets: number;
    reps_min: number;
    reps_max: number;
    rest_sec: number;
    block_order: number;
    exercise_library: ExerciseLibrary;
}

export type GroupKey = 'Recovery' | 'Mobility' | 'Activation' | 'Strength';

const PATTERN_TO_GROUP: Record<string, GroupKey> = {
    recovery: 'Recovery',
    mobility: 'Mobility',
    activation: 'Activation',
    strength: 'Strength',
};

const GroupIcon = ({ group }: { group: GroupKey }) => {
    const icons: Record<GroupKey, string> = {
        Recovery: 'self_improvement',
        Mobility: 'rotate_right',
        Activation: 'bolt',
        Strength: 'fitness_center',
    };
    return <Icon name={icons[group]} size={14} />;
};

const PipelineNode = ({ active, complete }: { active?: boolean; complete?: boolean }) => (
    <div className="relative flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full border-[1.5px] z-10 ${complete ? 'bg-[var(--mo-color-state-success)] border-[var(--mo-color-state-success)]' :
            active ? 'bg-[var(--mo-color-accent-system)] border-[var(--mo-color-accent-system)]' :
                'bg-[var(--mo-color-bg-primary)] border-[var(--mo-color-border-strong)]'
            }`} />
    </div>
);

const ExerciseNode = ({ ex, onToggle }: { ex: SessionExercise; onToggle: (id: string | number) => void }) => (
    <div className={`modular-frame p-4 flex gap-4 bg-[var(--mo-color-surface-primary)] transition-all ${ex.is_completed ? 'opacity-60' : ''}`}>
        <div className="w-16 h-16 rounded-md bg-[var(--mo-color-surface-secondary)] flex-shrink-0 overflow-hidden relative border-[0.5px] border-[var(--mo-color-border-subtle)]">
            <div className="absolute inset-0 flex items-center justify-center text-[var(--mo-color-text-tertiary)]">
                <Icon name="play_circle" size={20} />
            </div>
        </div>
        <div className="flex flex-col justify-center flex-1">
            <span className="text-sm font-medium text-[var(--mo-color-text-primary)]">{ex.exercise_library.name}</span>
            <span className="mono text-[10px] text-[var(--mo-color-text-tertiary)] mt-1">
                {ex.sets} SETS · {ex.reps_min}-{ex.reps_max} REPS
            </span>
        </div>
        <button
            onClick={() => onToggle(ex.id)}
            className={`w-8 h-8 rounded-full border-[0.5px] flex items-center justify-center transition-colors ${ex.is_completed ? 'bg-[var(--mo-color-state-success)] border-transparent text-white' : 'border-[var(--mo-color-border-strong)] text-transparent'
                }`}
        >
            <Icon name="check" size={16} />
        </button>
    </div>
);

export default function MissionPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [session, setSession] = useState<any>(null);
    const [exercises, setExercises] = useState<SessionExercise[]>([]);

    const fetchSession = async () => {
        if (!user) return;
        try {
            const today = new Date().toISOString().split('T')[0];
            const q = supabase
                .from('training_sessions')
                .select(`id, state, phase, current_block_index, current_exercise_index, current_set, session_exercises (id, is_completed, status, sets, reps_min, reps_max, rest_sec, block_order, exercise_library (id, name, pattern, media_video_url, level))`)
                .eq('user_id', user.id)
                .eq('session_date', today)
                .maybeSingle();

            const { data } = await safeSelect<any>(q, 'TodaySession');
            if (!data) return;

            setSession(data);
            const sortedExercises = (data.session_exercises || []).sort((a: SessionExercise, b: SessionExercise) => a.block_order - b.block_order);
            setExercises(sortedExercises);
        } catch (err: any) {
            console.error('Failed to fetch session:', err);
        }
    };

    useEffect(() => { fetchSession(); }, [user]);

    const handleStartSession = () => {
        if (!session) return;
        navigate('/session/play', {
            state: {
                sessionId: session.id,
                rehydrationData: {
                    currentBlockIndex: session.current_block_index,
                    currentExerciseIndex: session.current_exercise_index,
                    currentSet: session.current_set
                }
            }
        });
    };

    const toggleExercise = async (id: number | string) => {
        setExercises(prev => prev.map(e => e.id === id ? { ...e, is_completed: !e.is_completed } : e));
    };

    const groups: Record<GroupKey, SessionExercise[]> = { Recovery: [], Mobility: [], Activation: [], Strength: [] };
    exercises.forEach(ex => {
        const pattern = ex.exercise_library.pattern.toLowerCase();
        const g = (PATTERN_TO_GROUP[pattern] || 'Activation') as GroupKey;
        groups[g].push(ex);
    });

    const activePhase = session?.phase?.toUpperCase() || 'REINFORCE';

    return (
        <AppShell title="PROTOCOL" sublabel="Daily Routine Pipeline">
            <div className="page-content micro-grid flex flex-col gap-8 pb-32">

                {/* 1. Protocol Header */}
                <div className="modular-frame bg-[var(--mo-color-surface-secondary)] p-6 relative">
                    <div className="flex justify-between items-center mb-4">
                        <span className="mono text-[var(--mo-color-text-tertiary)] text-[10px]">CURRENT PHASE</span>
                        <span className="mono text-[var(--mo-color-accent-system)] text-[10px] font-bold">{activePhase}</span>
                    </div>
                    <h1 className="text-2xl font-light text-[var(--mo-color-text-primary)] mb-2">
                        {session ? "Structural Symmetry" : "Generate Protocol"}
                    </h1>
                    <p className="text-sm text-[var(--mo-color-text-secondary)] font-light">
                        Technical movement algorithm targeting deep resilience and alignment.
                    </p>
                </div>

                {/* 2. The Pipeline */}
                <div className="flex flex-col gap-0 px-2 relative">
                    <div className="absolute left-[21px] top-4 bottom-4 w-[1px] bg-[var(--mo-color-border-strong)] opacity-50" />

                    {(['Recovery', 'Mobility', 'Activation', 'Strength'] as GroupKey[]).map((g, gi) => {
                        const blockExercises = groups[g];
                        if (blockExercises.length === 0) return null;

                        return (
                            <div key={g} className="flex flex-col gap-4 mb-8">
                                <div className="flex items-center gap-4 z-10">
                                    <PipelineNode active={gi === (session?.current_block_index || 0)} />
                                    <div className="flex items-center gap-2">
                                        <GroupIcon group={g} />
                                        <span className="mono text-[11px] text-[var(--mo-color-text-primary)] font-medium">
                                            {g.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                <div className="pl-10 flex flex-col gap-3">
                                    {blockExercises.map((ex) => (
                                        <ExerciseNode
                                            key={ex.id}
                                            ex={ex}
                                            onToggle={toggleExercise}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Floating Action */}
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[440px] px-6 z-40">
                    <button
                        onClick={handleStartSession}
                        className="primary-btn w-full shadow-lg gap-3"
                    >
                        <Icon name="play_arrow" size={20} />
                        {exercises.some(e => e.is_completed) ? "CONTINUE PROTOCOL" : "START PROTOCOL"}
                    </button>
                </div>

            </div>
        </AppShell>
    );
}

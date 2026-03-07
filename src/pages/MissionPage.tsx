import { useEffect, useState } from 'react';
import styles from './MissionPage.module.css';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AppShell from '../components/AppShell';
import { Icon } from '../components/Icon';
import { VideoHUDPreview } from '../components/VideoHUDPreview';
import { safeSelect, safeRpc } from '../lib/db';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { PrimaryCard } from '../components/ui/PrimaryCard';
import { Skeleton, SkeletonCard } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

interface ExerciseLibrary {
    id: number | string;
    name: string;
    pattern: string;
    media_video_url: string;
    level: number;
}

interface SessionExercise {
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

export default function MissionPage() {
    const { user, profile } = useAuth();
    const navigate = useNavigate();

    const [viewState, setViewState] = useState<'loading' | 'error' | 'empty' | 'success'>('loading');
    const [session, setSession] = useState<any>(null);
    const [exercises, setExercises] = useState<SessionExercise[]>([]);
    const [errorMsg, setErrorMsg] = useState('');
    const [generating, setGenerating] = useState(false);

    // Timeline routing
    const [activeStepId, setActiveStepId] = useState<string | number | null>(null);

    const fetchSessionWithExercises = async () => {
        if (!user) return;
        setViewState('loading');
        setErrorMsg('');

        try {
            const today = new Date().toISOString().split('T')[0];
            const queryInfo = supabase
                .from('training_sessions')
                .select(`
                    id, state, phase,
                    session_exercises (
                        id, status, is_completed, sets, reps_min, reps_max, rest_sec, block_order,
                        exercise_library (
                            id, name, pattern, media_video_url, level
                        )
                    )
                `)
                .eq('user_id', user.id)
                .eq('session_date', today)
                .maybeSingle();

            const { data, error } = await safeSelect(queryInfo, 'TodaySession');

            if (error) {
                setErrorMsg(error.message);
                setViewState('error');
                return;
            }

            if (data) {
                setSession(data);
                if (data.session_exercises) {
                    const sorted = [...data.session_exercises].sort((a: any, b: any) => a.block_order - b.block_order);
                    setExercises(sorted as any);

                    // Initialize active step purely based on first incomplete
                    const firstIncomplete = sorted.find(e => !e.is_completed);
                    if (firstIncomplete) {
                        setActiveStepId(firstIncomplete.id);
                    } else if (sorted.length > 0) {
                        // All completed, stay on last just in case, but session might be marked complete
                        setActiveStepId(sorted[sorted.length - 1].id);
                    }
                }
                setViewState('success');
            } else {
                setSession(null);
                setViewState('empty');
            }
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message || "An unexpected error occurred.");
            setViewState('error');
        }
    };

    useEffect(() => {
        fetchSessionWithExercises();
    }, [user, profile]);

    const handleGenerateSession = async () => {
        if (!user) return;
        setGenerating(true);
        setErrorMsg('');
        try {
            const { error: genError } = await safeRpc('generate_session');
            if (genError) {
                setErrorMsg(genError.message);
                setViewState('error');
                return;
            }
            await fetchSessionWithExercises();
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message);
            setViewState('error');
        } finally {
            setGenerating(false);
        }
    };

    const markBlockCompleted = async (sessionExerciseId: string | number) => {
        // Optimistic update
        setExercises(prev => prev.map(ex =>
            ex.id === sessionExerciseId ? { ...ex, is_completed: true } : ex
        ));

        const { error } = await supabase
            .from('session_exercises')
            .update({ is_completed: true })
            .eq('id', sessionExerciseId);

        if (error) {
            console.error('Error toggling completion:', error);
            // Revert
            setExercises(prev => prev.map(ex =>
                ex.id === sessionExerciseId ? { ...ex, is_completed: false } : ex
            ));
        }
        // Note: we intentionally DO NOT advance activeStepId here. 
        // We let the UI render the "Block completed" intermediate state.
    };

    const advanceToNextBlock = () => {
        const currentIdx = exercises.findIndex(ex => ex.id === activeStepId);
        if (currentIdx !== -1 && currentIdx + 1 < exercises.length) {
            setActiveStepId(exercises[currentIdx + 1].id);
            // Scroll to top or just let layout animate
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // End of blocks reached
            setActiveStepId(null);
        }
    };

    const handleCompleteSession = async () => {
        if (!session) return;
        try {
            const { error } = await supabase.rpc('complete_session', { p_session_id: session.id });
            if (error) throw error;
            navigate('/progress');
        } catch (err: any) {
            console.error('Error completing session:', err);
            setErrorMsg(`RPC Error: ${err.message || err.details || JSON.stringify(err)}`);
            setViewState('error');
        }
    };

    const getBlockName = (order: number) => {
        const mapping: Record<number, string> = { 1: 'SQUAT', 2: 'HINGE', 3: 'PUSH', 4: 'PULL', 5: 'CARRY', 6: 'REGULATE' };
        return mapping[order] || `BLOCK ${order}`;
    };

    const completedCount = exercises.filter(ex => ex.is_completed).length;
    const totalCount = exercises.length;
    const allCompleted = totalCount > 0 && completedCount === totalCount;

    return (
        <AppShell title="MISSION" sublabel="Execute adaptation protocol">

            {viewState === 'error' && (
                <div style={{ padding: 'var(--mo-space-8)' }}>
                    <div className={styles.errorBox}>
                        <Icon name="error" style={{ color: 'var(--mo-color-state-alert)' }} size={24} />
                        <span>{errorMsg}</span>
                        <PrimaryButton onClick={fetchSessionWithExercises}>Retry</PrimaryButton>
                    </div>
                </div>
            )}

            {viewState === 'loading' && (
                <div className={styles.loadingSkeleton}>
                    <Skeleton width="100%" height={80} borderRadius="var(--mo-radius-md)" />
                    <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                        <div style={{ width: '2px', background: 'var(--mo-color-surface-muted)', height: '400px', marginLeft: '12px' }} />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <SkeletonCard style={{ height: 200 }} />
                            <SkeletonCard style={{ height: 60 }} />
                        </div>
                    </div>
                </div>
            )}

            {viewState === 'empty' && (
                <EmptyState
                    icon="event_busy"
                    title="No Active Mission"
                    message="Your system adaptation execution block has not been initialized for today."
                    actionLabel={generating ? 'Generating...' : 'INITIALIZE MISSION'}
                    onAction={handleGenerateSession}
                    disabled={generating}
                />
            )}

            {viewState === 'success' && session && (
                <div className={styles.pipelineLayout}>

                    {/* 2. Session Context Section */}
                    <div className={styles.contextHeader}>
                        <div className={styles.contextRow}>
                            <span className={styles.contextLabel}>PHASE</span>
                            <span className={styles.contextValue}>{session?.phase?.toUpperCase() || 'ADAPTIVE'}</span>
                        </div>
                        <div className={styles.contextRow}>
                            <span className={styles.contextLabel}>DATE</span>
                            <span className={styles.contextValue}>
                                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}
                            </span>
                        </div>
                        <div className={styles.contextRow}>
                            <span className={styles.contextLabel}>STATUS</span>
                            <span className={styles.contextValue} style={{ color: allCompleted ? 'var(--mo-color-state-success)' : 'var(--mo-color-accent-system)' }}>
                                {allCompleted ? 'VERIFIED' : 'ACTIVE'}
                            </span>
                        </div>
                    </div>

                    {/* 3. Session Progress Section */}
                    <div className={styles.progressSection}>
                        <div className={styles.progressHeader}>
                            <span>PIPELINE PROGRESS</span>
                            <span className={styles.progressNumbers}>{completedCount} / {totalCount} BLOCKS</span>
                        </div>
                        <div className={styles.progressBarBg}>
                            <div className={styles.progressBarFill} style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }} />
                        </div>
                    </div>

                    {/* 4. Execution Pipeline */}
                    <div className={styles.timelineContainer}>
                        <div className={styles.timelineLine} />

                        <AnimatePresence mode="popLayout">
                            {exercises.map((ex) => {
                                const isActiveNode = ex.id === activeStepId;
                                const isCompleted = ex.is_completed;
                                // Node visual state:
                                const nodeState = isCompleted ? 'completed' : (isActiveNode ? 'active' : 'pending');

                                return (
                                    <motion.div
                                        key={ex.id}
                                        className={styles.timelineItem}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <div className={`${styles.timelineNode} ${styles['node' + nodeState]}`}>
                                            {nodeState === 'completed' && <Icon name="check" size={12} />}
                                            {nodeState === 'active' && <div className={styles.nodePulse} />}
                                        </div>

                                        <div className={styles.timelineContent}>
                                            {isActiveNode ? (
                                                !isCompleted ? (
                                                    /* 5. Exercise execution block */
                                                    <PrimaryCard
                                                        title={`${getBlockName(ex.block_order)} // ${ex.exercise_library?.name}`}
                                                        subtitle="EXECUTION BLOCK"
                                                    >
                                                        <div className={styles.executionBlock}>
                                                            <div className={styles.executionBox}>
                                                                <VideoHUDPreview
                                                                    videoUrl={ex.exercise_library?.media_video_url}
                                                                    pattern={ex.exercise_library?.pattern}
                                                                    name={ex.exercise_library?.name}
                                                                    sets={ex.sets}
                                                                    repsMin={ex.reps_min}
                                                                    repsMax={ex.reps_max}
                                                                    restSeconds={ex.rest_sec}
                                                                    hideHUD={true} // Simplify UI inside card
                                                                />
                                                            </div>
                                                            <div className={styles.parametersGrid}>
                                                                <div className={styles.paramBox}>
                                                                    <span className={styles.paramLabel}>SETS</span>
                                                                    <span className={styles.paramValue}>{ex.sets}</span>
                                                                </div>
                                                                <div className={styles.paramBox}>
                                                                    <span className={styles.paramLabel}>REPS</span>
                                                                    <span className={styles.paramValue}>{ex.reps_min}-{ex.reps_max}</span>
                                                                </div>
                                                                <div className={styles.paramBox}>
                                                                    <span className={styles.paramLabel}>REST</span>
                                                                    <span className={styles.paramValue}>{ex.rest_sec}s</span>
                                                                </div>
                                                            </div>
                                                            <PrimaryButton onClick={() => markBlockCompleted(ex.id)}>
                                                                MARK BLOCK COMPLETED
                                                            </PrimaryButton>
                                                        </div>
                                                    </PrimaryCard>
                                                ) : (
                                                    /* 6. Block completion state */
                                                    <div className={styles.blockCompletionState}>
                                                        <div className={styles.completionBanner}>
                                                            <Icon name="check_circle" size={24} style={{ color: 'var(--mo-color-state-success)' }} />
                                                            <div className={styles.completionText}>
                                                                <span className={styles.completionTitle}>BLOCK COMPLETED</span>
                                                                <span className={styles.completionSub}>{getBlockName(ex.block_order)} adaptation recorded</span>
                                                            </div>
                                                        </div>
                                                        <PrimaryButton onClick={advanceToNextBlock}>
                                                            NEXT BLOCK <Icon name="arrow_forward" size={16} style={{ marginLeft: '4px' }} />
                                                        </PrimaryButton>
                                                    </div>
                                                )
                                            ) : (
                                                /* Collapsed pending/completed row */
                                                <div className={`${styles.collapsedRow} ${isCompleted ? styles.collapsedCompleted : ''}`}>
                                                    <span className={styles.collapsedTitle}>{getBlockName(ex.block_order)}</span>
                                                    <span className={styles.collapsedMeta}>{ex.sets}x{ex.reps_max}</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* 7. Mission completion state */}
                    {allCompleted && activeStepId === null && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={styles.missionCompletionState}
                        >
                            <div className={styles.missionCompletionIcon}>
                                <Icon name="verified" size={48} />
                            </div>
                            <h2 className={styles.missionCompletionTitle}>MISSION COMPLETED</h2>
                            <p className={styles.missionCompletionDesc}>System adaptation recorded successfully.</p>

                            <div style={{ width: '100%', marginTop: '24px' }}>
                                <PrimaryButton onClick={handleCompleteSession}>
                                    RETURN TO SYSTEM DASHBOARD
                                </PrimaryButton>
                            </div>
                        </motion.div>
                    )}
                </div>
            )}
        </AppShell>
    );
}

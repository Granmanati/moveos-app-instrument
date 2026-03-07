import { useEffect, useState, useRef } from 'react';
import styles from './TodayPage.module.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AppShell from '../components/AppShell';
import { Icon } from '../components/Icon';
import { VideoHUDPreview } from '../components/VideoHUDPreview';
import { safeSelect, safeRpc } from '../lib/db';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { SystemHeader } from '../components/ui/SystemHeader';
import { PrimaryCard } from '../components/ui/PrimaryCard';
import { MissionCard } from '../components/ui/MissionCard';

interface ExerciseLibrary {
    id: number | string;
    name: string;
    pattern: string;
    media_video_url: string;
    level: number;
}

interface SessionExerciseLog {
    pain_score: number;
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
    session_exercise_logs: SessionExerciseLog[];
}

export default function TodayPage() {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [viewState, setViewState] = useState<'loading' | 'error' | 'empty' | 'success'>('loading');
    const [session, setSession] = useState<any>(null);
    const [exercises, setExercises] = useState<SessionExercise[]>([]);
    const [errorMsg, setErrorMsg] = useState('');
    const [generating, setGenerating] = useState(false);

    // Form states for pain logging
    const [painScores, setPainScores] = useState<Record<string, number>>({});
    const [painNotes, setPainNotes] = useState<Record<string, string>>({});
    const [savingPain, setSavingPain] = useState<Record<string, boolean>>({});
    const [expandedCards, setExpandedCards] = useState<string[]>([]);
    const [showPremiumGate, setShowPremiumGate] = useState(false);

    useEffect(() => {
        if (location.state?.isNewOnboarding) {
            setShowPremiumGate(true);
            window.history.replaceState({}, document.title);
        }
    }, [location]);

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
                        ),
                        session_exercise_logs (
                            pain_score
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

                    const initialScores: Record<string, number> = {};
                    sorted.forEach((ex: any) => {
                        if (ex.session_exercise_logs && ex.session_exercise_logs.length > 0) {
                            initialScores[ex.id] = ex.session_exercise_logs[ex.session_exercise_logs.length - 1].pain_score;
                        } else {
                            initialScores[ex.id] = 0;
                        }
                    });
                    setPainScores(initialScores);
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

    const handleToggleComplete = async (sessionExerciseId: string | number, currentCompleted: boolean) => {
        const newCompleted = !currentCompleted;
        setExercises(prev => prev.map(ex =>
            ex.id === sessionExerciseId ? { ...ex, is_completed: newCompleted } : ex
        ));

        const { error } = await supabase
            .from('session_exercises')
            .update({ is_completed: newCompleted })
            .eq('id', sessionExerciseId);

        if (error) {
            console.error('Error toggling completion:', error);
            setExercises(prev => prev.map(ex =>
                ex.id === sessionExerciseId ? { ...ex, is_completed: currentCompleted } : ex
            ));
        }
    };

    const handleSavePainLog = async (sessionExerciseId: string | number) => {
        if (!user) return;
        setSavingPain(prev => ({ ...prev, [sessionExerciseId]: true }));
        try {
            const score = painScores[sessionExerciseId] || 0;
            const notes = painNotes[sessionExerciseId] || '';

            const { error } = await supabase
                .from('session_exercise_logs')
                .insert({
                    user_id: user.id,
                    session_exercise_id: sessionExerciseId,
                    pain_score: score,
                    notes: notes
                });

            if (error) throw error;
            setPainNotes(prev => ({ ...prev, [sessionExerciseId]: '' }));
            setExercises(prev => prev.map(ex => {
                if (ex.id === sessionExerciseId) {
                    const existingLogs = ex.session_exercise_logs || [];
                    return { ...ex, session_exercise_logs: [...existingLogs, { pain_score: score }] };
                }
                return ex;
            }));

        } catch (err: any) {
            console.error('Error saving pain log:', err);
            alert('Failed to save log.');
        } finally {
            setSavingPain(prev => ({ ...prev, [sessionExerciseId]: false }));
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

    const toggleExpand = (exId: string) => {
        setExpandedCards(prev => prev.includes(exId) ? prev.filter(id => id !== exId) : [...prev, exId]);
    };

    const getBlockName = (order: number) => {
        const mapping: Record<number, string> = { 1: 'SQUAT', 2: 'HINGE', 3: 'PUSH', 4: 'PULL', 5: 'CARRY', 6: 'REGULATE' };
        return mapping[order] || `BLOCK ${order}`;
    };

    const completedCount = exercises.filter(ex => ex.is_completed).length;
    const totalCount = exercises.length;
    const allCompleted = totalCount > 0 && completedCount === totalCount;
    const remainingCount = totalCount - completedCount;

    // Pipeline Logic
    const currentBlock = exercises.find(ex => !ex.is_completed);
    const currentIndex = currentBlock ? exercises.indexOf(currentBlock) : -1;
    const nextBlock = currentIndex !== -1 && currentIndex + 1 < exercises.length ? exercises[currentIndex + 1] : null;
    const remainingBlocks = exercises.filter(ex => !ex.is_completed && ex.id !== currentBlock?.id && ex.id !== nextBlock?.id);

    return (
        <AppShell customHeader={<SystemHeader />}>

            {viewState === 'error' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 'var(--sp-8) var(--sp-4)', gap: '16px' }}>
                    <Icon name="error" style={{ color: 'var(--state-alert)' }} size={48} />
                    <h2 style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: 600 }}>System Error</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{errorMsg}</p>
                    <div style={{ marginTop: '16px', width: '200px' }}>
                        <PrimaryButton onClick={fetchSessionWithExercises}>Retry Connection</PrimaryButton>
                    </div>
                </div>
            )}

            {viewState === 'loading' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '60vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    <Icon name="autorenew" style={{ animation: 'spin 1s linear infinite' }} size={32} />
                    <p style={{ marginTop: '16px', fontSize: '14px' }}>Loading movement pipeline...</p>
                </div>
            )}

            {viewState === 'empty' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 'var(--sp-8) var(--sp-4)', gap: '16px' }}>
                    <Icon name="event_busy" style={{ color: 'var(--text-secondary)' }} size={48} />
                    <h2 style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: 600 }}>No Active Mission</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '250px' }}>Your daily execution block has not been initialized yet.</p>
                    <div style={{ marginTop: '24px', width: '100%' }}>
                        <PrimaryButton onClick={handleGenerateSession} disabled={generating}>
                            {generating ? <Icon name="autorenew" style={{ animation: 'spin 1s linear infinite' }} /> : 'Generate Mission'}
                        </PrimaryButton>
                    </div>
                </div>
            )}

            {viewState === 'success' && session && (
                <div className={styles.pipelineLayout}>

                    {/* Pipeline Meta Header */}
                    <div className={styles.pipelineHeader}>
                        <h2 className={styles.missionTitle}>MISSION: {session?.phase || 'ADAPTIVE'}</h2>
                        <span className={styles.missionDate}>
                            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}
                        </span>
                    </div>

                    {/* Session Progress */}
                    <motion.section layout transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }} className={styles.section}>
                        <div className={styles.progressContainer}>
                            <div className={styles.progressText}>
                                <span>PIPELINE PROGRESS</span>
                                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{completedCount} / {totalCount} BLOCKS</span>
                            </div>
                            <div className={styles.progressBarBg}>
                                <div className={styles.progressBarFill} style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }} />
                            </div>
                        </div>
                    </section>

                    </motion.section>

                    <AnimatePresence mode="popLayout">
                        {/* Current Block */}
                        <motion.section layout key={currentBlock ? `current-${currentBlock.id}` : 'alldone'} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }} className={styles.section}>
                            <h3 className={styles.sectionTitle}>CURRENT BLOCK</h3>
                            {currentBlock ? (
                                <PrimaryCard
                                    title={`${getBlockName(currentBlock.block_order)} //`}
                                    subtitle={`${currentBlock.sets}x${currentBlock.reps_min}-${currentBlock.reps_max} · ${currentBlock.rest_sec}s REST`}
                                >
                                    <div className={styles.currentBlockContent}>
                                        <div className={styles.hudWrapper}>
                                            <VideoHUDPreview
                                                videoUrl={currentBlock.exercise_library?.media_video_url}
                                                pattern={currentBlock.exercise_library?.pattern}
                                                name={currentBlock.exercise_library?.name || 'Unknown Pattern'}
                                                sets={currentBlock.sets}
                                                repsMin={currentBlock.reps_min}
                                                repsMax={currentBlock.reps_max}
                                                restSeconds={currentBlock.rest_sec}
                                            />
                                        </div>

                                        {/* Action Bar */}
                                        <div className={styles.actionBar}>
                                            <button
                                                className={styles.actionBtn}
                                                onClick={() => toggleExpand(currentBlock.id.toString())}
                                            >
                                                <Icon name="healing" size={16} />
                                                <span>REPORT STRAIN</span>
                                            </button>
                                            <PrimaryButton
                                                onClick={() => handleToggleComplete(currentBlock.id, currentBlock.is_completed)}
                                                style={{ margin: 0 }}
                                            >
                                                <Icon name="check" size={18} style={{ marginRight: '8px' }} />
                                                MARK COMPLETED
                                            </PrimaryButton>
                                        </div>

                                        {/* Pain/Strain Reporting */}
                                        {expandedCards.includes(currentBlock.id.toString()) && (
                                            <div className={styles.strainPanel}>
                                                <div className={styles.sliderContainer}>
                                                    <div className={styles.strainHeader}>
                                                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>STRAIN LEVEL</span>
                                                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{painScores[currentBlock.id.toString()] || 0}/10</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0" max="10"
                                                        value={painScores[currentBlock.id.toString()] || 0}
                                                        onChange={(e) => setPainScores(prev => ({ ...prev, [currentBlock.id.toString()]: parseInt(e.target.value) }))}
                                                        className={styles.painSlider}
                                                    />
                                                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                                        <input
                                                            type="text"
                                                            placeholder="Add clinical notes..."
                                                            className={styles.strainInput}
                                                            value={painNotes[currentBlock.id.toString()] || ''}
                                                            onChange={(e) => setPainNotes(prev => ({ ...prev, [currentBlock.id.toString()]: e.target.value }))}
                                                        />
                                                        <button
                                                            className={styles.saveBtn}
                                                            onClick={() => handleSavePainLog(currentBlock.id)}
                                                        >
                                                            {savingPain[currentBlock.id.toString()] ? '...' : 'SAVE'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </PrimaryCard>
                            ) : (
                                <div className={styles.allDoneState}>
                                    <Icon name="check_circle" size={48} style={{ color: 'var(--state-success)', margin: '0 0 16px 0' }} />
                                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: 'var(--text-primary)' }}>PIPELINE COMPLETED</h3>
                                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>All blocks execution confirmed.</p>
                                </div>
                            )}
                        </motion.section>

                        {/* Next Block */}
                        {nextBlock && (
                            <motion.section layout key={`next-${nextBlock.id}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }} className={styles.section}>
                                <h3 className={styles.sectionTitle}>NEXT BLOCK</h3>
                                <MissionCard
                                    title={getBlockName(nextBlock.block_order)}
                                    subtitle={`${nextBlock.exercise_library?.name}`}
                                    duration={`${nextBlock.sets}x${nextBlock.reps_min}-${nextBlock.reps_max}`}
                                    status="upcoming"
                                />
                            </motion.section>
                        )}

                        {/* Remaining Blocks */}
                        {remainingBlocks.length > 0 && (
                            <motion.section layout key="remaining" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }} className={styles.section}>
                                <h3 className={styles.sectionTitle}>{remainingCount - 1} BLOCKS REMAINING</h3>
                                <div className={styles.remainingList}>
                                    {remainingBlocks.map(ex => (
                                        <div key={ex.id} className={styles.remainingItem}>
                                            <div className={styles.remainingMarker} />
                                            <span className={styles.remainingName}>{getBlockName(ex.block_order)}</span>
                                            <div style={{ flex: 1 }} />
                                            <span className={styles.remainingMeta}>{ex.sets}x{ex.reps_min}-{ex.reps_max}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.section>
                        )}
                    </AnimatePresence>

                    {/* Action Footer */}
            <div className={styles.actionFooter}>
                <PrimaryButton
                    disabled={!allCompleted || session.state === 'completed'}
                    onClick={handleCompleteSession}
                >
                    {session.state === 'completed' ? 'MISSION ALREADY VERIFIED' : 'VERIFY MISSION COMPLETION'}
                </PrimaryButton>
            </div>

        </div>
    )
}

{
    showPremiumGate && (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalIconBox}>
                    <Icon name="lock" size={32} />
                </div>
                <h2 className={styles.modalTitle}>SYSTEM ENGINE LOCK</h2>
                <p className={styles.modalText}>
                    Enable dynamic load adjustment and execution tracking.
                </p>
                <div className={styles.modalActions}>
                    <button className={styles.primaryBtn} onClick={() => navigate('/pricing')}>
                        UPGRADE PIPELINE
                    </button>
                    <button className={styles.ghostBtn} onClick={() => setShowPremiumGate(false)}>
                        ACKNOWLEDGE
                    </button>
                </div>
            </div>
        </div>
    )
}
        </AppShell >
    );
}

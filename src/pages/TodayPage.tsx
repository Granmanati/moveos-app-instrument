import { useEffect, useState, useRef } from 'react';
import styles from './TodayPage.module.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AppShell from '../components/AppShell';
import { Icon } from '../components/Icon';
import { VideoHUDPreview } from '../components/VideoHUDPreview';
import { safeSelect, safeRpc } from '../lib/db';
import { PrimaryButton } from '../components/ui/PrimaryButton';

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
    session_exercise_logs: SessionExerciseLog[]; // From Supabase One-to-Many join
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

    // UI states
    const [expandedCards, setExpandedCards] = useState<string[]>([]);
    const [showPremiumGate, setShowPremiumGate] = useState(false);

    // Refs for scrolling and observing
    const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const topObserverRef = useRef<HTMLDivElement>(null);
    const [isStickyVisible, setIsStickyVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsStickyVisible(!entry.isIntersecting);
            },
            { threshold: 0, rootMargin: '-60px 0px 0px 0px' }
        );

        if (topObserverRef.current) {
            observer.observe(topObserverRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Load persisted expand state on session load
    useEffect(() => {
        if (session?.id) {
            const saved = localStorage.getItem(`moveos:today:expanded:${session.id}`);
            if (saved) {
                try {
                    setExpandedCards(JSON.parse(saved));
                } catch (e) {
                    console.error('Error parsing saved expanded cards', e);
                }
            }
        }
    }, [session?.id]);

    const toggleExpand = (exId: string) => {
        setExpandedCards(prev => {
            const next = prev.includes(exId) ? prev.filter(id => id !== exId) : [...prev, exId];
            if (session?.id) {
                localStorage.setItem(`moveos:today:expanded:${session.id}`, JSON.stringify(next));
            }
            return next;
        });
    };

    // Form states for pain logging
    const [painScores, setPainScores] = useState<Record<string, number>>({});
    const [painNotes, setPainNotes] = useState<Record<string, string>>({});
    const [savingPain, setSavingPain] = useState<Record<string, boolean>>({});

    // Initial check for onboarding redirect flag
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
                    // Sort strictly by block_order
                    const sorted = [...data.session_exercises].sort((a: any, b: any) => a.block_order - b.block_order);
                    setExercises(sorted as any);

                    // Initialize local state for pain scores if they exist
                    const initialScores: Record<string, number> = {};
                    sorted.forEach((ex: any) => {
                        if (ex.session_exercise_logs && ex.session_exercise_logs.length > 0) {
                            // Take the most recent log (assuming ordered inserted, we take last element)
                            initialScores[ex.id] = ex.session_exercise_logs[ex.session_exercise_logs.length - 1].pain_score;
                        } else {
                            initialScores[ex.id] = 0; // Default slider value
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
            // Should be handled by safeSelect mostly, but just in case
            console.error(err);
            setErrorMsg(err.message || "Un error inesperado ocurrió.");
            setViewState('error');
        }
    };

    useEffect(() => {
        fetchSessionWithExercises();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

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
            // Unlikely with safeRpc
            console.error(err);
            setErrorMsg(err.message);
            setViewState('error');
        } finally {
            setGenerating(false);
        }
    };

    const handleToggleComplete = async (sessionExerciseId: string | number, currentCompleted: boolean) => {
        const newCompleted = !currentCompleted;
        // Optimistic update
        setExercises(prev => prev.map(ex =>
            ex.id === sessionExerciseId ? { ...ex, is_completed: newCompleted } : ex
        ));

        const { error } = await supabase
            .from('session_exercises')
            .update({ is_completed: newCompleted })
            .eq('id', sessionExerciseId);

        if (error) {
            console.error('Error toggling completion:', error);
            // Revert state on error
            setExercises(prev => prev.map(ex =>
                ex.id === sessionExerciseId ? { ...ex, is_completed: currentCompleted } : ex
            ));
        } else if (newCompleted) {
            // Auto scroll logic (wrapped in setTimeout to let UI update first)
            setTimeout(() => {
                // do not scroll if user has expanded a different card panel and is interacting
                if (expandedCards.length > 0 && !expandedCards.includes(sessionExerciseId.toString())) {
                    return;
                }

                const idx = exercises.findIndex(ex => ex.id === sessionExerciseId);
                if (idx !== -1) {
                    if (idx + 1 < exercises.length) {
                        const nextId = exercises[idx + 1].id;
                        cardRefs.current[nextId.toString()]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            }, 150);
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

            // Close accordion if desired, or keep it open? UX v1.1 asks to 'Persist expand/collapse state'. 
            // Better to keep it open or just clear notes. Let's not auto-close.
            setPainNotes(prev => ({ ...prev, [sessionExerciseId]: '' })); // Clear notes after save

            // Optionally update the exercises list locally so they know they have a saved log
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

    const allCompleted = exercises.length > 0 && exercises.every(ex => ex.is_completed);

    const getBlockName = (order: number) => {
        const mapping: Record<number, string> = { 1: 'SQUAT', 2: 'HINGE', 3: 'PUSH', 4: 'PULL', 5: 'CARRY', 6: 'REGULATE' };
        return mapping[order] || `BLOCK ${order}`;
    };

    const getLoadImpact = (ex: any, currentPainScore: number) => {
        let impact = 'low'; // default
        const order = ex.block_order;
        const sets = ex.sets;
        const reps = ex.reps_min;

        if (order === 6) impact = 'low'; // REGULATE
        else if (order === 5) impact = 'moderate'; // CARRY default
        else if (order === 1 || order === 2) impact = 'moderate'; // SQUAT/HINGE default

        if (sets >= 4 && reps <= 6) impact = 'high';

        // user pain >= 6 reduces one level
        if (currentPainScore >= 6) {
            if (impact === 'high') impact = 'moderate';
            else if (impact === 'moderate') impact = 'low';
        }

        return impact;
    };

    const completedCount = exercises.filter(ex => ex.is_completed).length;
    const totalCount = exercises.length;
    const upcomingBlock = exercises.find(ex => !ex.is_completed);

    return (
        <AppShell
            title={`Phase of ${session?.phase || profile?.current_phase || 'Foundation'}`}
            subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        >
            <div className={`${styles.stickyMiniProgress} ${isStickyVisible ? styles.stickyVisible : ''}`}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{completedCount}/{totalCount} completed</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {upcomingBlock ? `Next: ${getBlockName(upcomingBlock.block_order)}` : 'Ready to complete'}
                </div>
            </div>

            {/* Error State */}
            {viewState === 'error' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 'var(--sp-8) var(--sp-4)', gap: '16px' }}>
                    <Icon name="error" style={{ color: 'var(--state-warning)' }} size={48} />
                    <h2 style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: 600 }}>Error de Sistema</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{errorMsg}</p>
                    <div style={{ marginTop: '16px', width: '200px' }}>
                        <PrimaryButton onClick={fetchSessionWithExercises}>Reintentar</PrimaryButton>
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
                    <h2 style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: 600 }}>No Active Session</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '250px' }}>Your daily execution block has not been initialized yet.</p>
                    <div style={{ marginTop: '24px', width: '100%' }}>
                        <PrimaryButton
                            onClick={handleGenerateSession}
                            disabled={generating}
                        >
                            {generating ? <Icon name="autorenew" style={{ animation: 'spin 1s linear infinite' }} /> : 'Generate Today\'s Session'}
                        </PrimaryButton>
                    </div>
                </div>
            )}

            {viewState === 'success' && session && (
                <>
                    <section className={styles.section}>
                        <div className={styles.progressContainer}>
                            <div className={styles.progressText}>
                                <span>Session progress</span>
                                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{completedCount} / {totalCount} blocks completed</span>
                            </div>
                            <div className={styles.progressBarBg}>
                                <div className={styles.progressBarFill} style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }} />
                            </div>
                        </div>

                        <div className={styles.nextPreviewCard}>
                            {upcomingBlock ? (
                                <>
                                    <Icon name="arrow_forward" size={16} style={{ color: 'var(--accent)' }} />
                                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                        Next up: <strong style={{ color: 'var(--text-primary)' }}>{getBlockName(upcomingBlock.block_order)}</strong> — {upcomingBlock.sets}×{upcomingBlock.reps_min}–{upcomingBlock.reps_max} · {upcomingBlock.rest_sec}s
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Icon name="check_circle" size={16} style={{ color: '#4caf50' }} />
                                    <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                                        Session ready to complete.
                                    </span>
                                </>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '8px' }}>
                            <div>
                                <h2 className={styles.sectionTitle}>Execution Pipeline</h2>
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, fontFamily: 'monospace' }}>
                                {totalCount - completedCount} BLOCKS REMAINING
                            </span>
                        </div>

                        <div ref={topObserverRef} />

                        <div className={styles.executionLayout}>
                            <div className={styles.executionRail}>
                                {exercises.map((ex) => {
                                    const isCompleted = ex.is_completed;
                                    const isActive = !isCompleted && ex.id === upcomingBlock?.id;

                                    let nodeClass = styles.railNode;
                                    if (isCompleted) nodeClass += ` ${styles.completed}`;
                                    else if (isActive) nodeClass += ` ${styles.active}`;

                                    return (
                                        <div
                                            key={`rail-${ex.id}`}
                                            className={styles.railNodeWrapper}
                                            onClick={() => cardRefs.current[ex.id.toString()]?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                        >
                                            <div className={nodeClass} />
                                        </div>
                                    );
                                })}
                            </div>

                            <div className={`${styles.patternList} ${styles.patternListWrapper}`}>
                                {exercises.map((ex, i) => {
                                    const library = ex.exercise_library;
                                    const isCompleted = ex.is_completed;
                                    const isExpanded = expandedCards.includes(ex.id.toString());
                                    const hasPainLog = ex.session_exercise_logs && ex.session_exercise_logs.length > 0;
                                    const currentPainScore = painScores[ex.id.toString()] || 0;

                                    return (
                                        <div
                                            key={ex.id}
                                            ref={(el) => { cardRefs.current[ex.id.toString()] = el; }}
                                            className={`${styles.patternCard} ${isExpanded ? styles.patternActive : ''}`}
                                        >
                                            <div className={styles.cardTopBar}>
                                                <button
                                                    className={`${styles.checkboxBtn} ${isCompleted ? styles.completedCheckbox : ''}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleToggleComplete(ex.id, ex.is_completed);
                                                    }}
                                                    aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
                                                >
                                                    <Icon name="check" className={styles.checkIcon} />
                                                </button>
                                                <div className={styles.blockLabel} style={{ flexShrink: 0 }}>
                                                    <span style={{ color: 'var(--accent)', fontWeight: 600, marginRight: '4px' }}>{i + 1} //</span>
                                                    <span>{getBlockName(ex.block_order)}</span>
                                                </div>
                                                <div style={{ flex: 1 }} />
                                                {(() => {
                                                    const impact = getLoadImpact(ex, currentPainScore);
                                                    return (
                                                        <span className={`${styles.impactChip} ${styles[`impact_${impact}`]}`}>
                                                            {impact === 'low' ? 'Low Impact' : impact === 'moderate' ? 'Mod Impact' : 'High Impact'}
                                                        </span>
                                                    );
                                                })()}
                                            </div>

                                            <div
                                                className={styles.hudWrapper}
                                                onClick={() => toggleExpand(ex.id.toString())}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <VideoHUDPreview
                                                    videoUrl={library?.media_video_url}
                                                    pattern={library?.pattern}
                                                    name={library?.name || 'Unknown Pattern'}
                                                    sets={ex.sets}
                                                    repsMin={ex.reps_min}
                                                    repsMax={ex.reps_max}
                                                    restSeconds={ex.rest_sec}
                                                    className={styles.hudComponent}
                                                />
                                            </div>

                                            {/* Expandable Accordion for Pain Logging */}
                                            {isExpanded && (
                                                <div className={styles.patternExpanded}>
                                                    <div className={styles.reportPainTitle}>
                                                        Report Load/Pain
                                                        {hasPainLog && <span style={{ marginLeft: '8px', color: 'var(--text-secondary)', fontSize: '10px', fontWeight: 'normal' }}>(Last Saved: {currentPainScore}/10)</span>}
                                                    </div>

                                                    <div className={styles.inputGroup}>
                                                        <div className={styles.inputLabel}>
                                                            <span>No Pain</span>
                                                            <span>Severe</span>
                                                        </div>
                                                        <div className={styles.sliderContainer}>
                                                            <input
                                                                type="range"
                                                                min="0" max="10"
                                                                value={currentPainScore}
                                                                onChange={(e) => setPainScores(prev => ({ ...prev, [ex.id.toString()]: parseInt(e.target.value) }))}
                                                                className={styles.painSlider}
                                                            />
                                                        </div>
                                                        <div style={{ textAlign: 'center', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '-8px' }}>
                                                            {currentPainScore}
                                                        </div>
                                                    </div>

                                                    <textarea
                                                        className={styles.textarea}
                                                        placeholder="Clinical notes or joint sensations..."
                                                        value={painNotes[ex.id.toString()] || ''}
                                                        onChange={(e) => setPainNotes(prev => ({ ...prev, [ex.id.toString()]: e.target.value }))}
                                                    />

                                                    <button
                                                        className={styles.ghostBtn}
                                                        style={{ width: '100%', marginTop: '4px', background: 'var(--surface-subtle)', border: 'none' }}
                                                        onClick={() => handleSavePainLog(ex.id)}
                                                        disabled={savingPain[ex.id.toString()]}
                                                    >
                                                        {savingPain[ex.id.toString()] ? 'Saving...' : 'Save Log Record'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </section>

                    <section className={styles.actionSection} style={{ marginTop: '24px' }}>
                        <PrimaryButton
                            disabled={!allCompleted || session.state === 'completed'}
                            onClick={handleCompleteSession}
                        >
                            {session.state === 'completed' ? 'Session Already Completed' : 'Complete Session'}
                        </PrimaryButton>
                    </section>
                </>
            )}

            {showPremiumGate && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalIconBox}>
                            <Icon name="bolt" size={32} />
                        </div>
                        <h2 className={styles.modalTitle}>System Engine Lock</h2>
                        <p className={styles.modalText}>
                            Enable dynamic load adjustment and execution tracking by removing restrictions.
                        </p>
                        <div className={styles.modalActions}>
                            <button className={styles.primaryBtn} onClick={() => navigate('/pricing')}>
                                Upgrade Pipeline
                            </button>
                            <button className={styles.ghostBtn} onClick={() => setShowPremiumGate(false)} style={{ border: 'none' }}>
                                Acknowledge Basic Mode
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppShell>
    );
}

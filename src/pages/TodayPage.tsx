import { useEffect, useState, useRef } from 'react';
import styles from './TodayPage.module.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AppShell from '../components/AppShell';
import { Icon } from '../components/Icon';

interface ExerciseLibrary {
    id: string;
    name: string;
    pattern: string;
    media_video_url: string;
    level: number;
}

interface SessionExerciseLog {
    pain_score: number;
}

interface SessionExercise {
    id: string;
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
    const [activePattern, setActivePattern] = useState<string | null>(null);
    const [showPremiumGate, setShowPremiumGate] = useState(false);

    // Form states for pain logging
    const [painScores, setPainScores] = useState<Record<string, number>>({});
    const [painNotes, setPainNotes] = useState<Record<string, string>>({});
    const [savingPain, setSavingPain] = useState<Record<string, boolean>>({});

    // Video refs
    const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
    const [playingVideos, setPlayingVideos] = useState<Record<string, boolean>>({});

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

            const { data, error } = await supabase
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

            if (error) throw error;

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
            console.error(err);
            setErrorMsg(err.message || 'Error loading today\'s patterns.');
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
            const { error: genError } = await supabase.rpc('generate_session');
            if (genError) throw genError;
            await fetchSessionWithExercises();
        } catch (err: any) {
            console.error('Error generating session:', err);
            setErrorMsg(err.message || 'Error generating session. Try again.');
            setViewState('error');
        } finally {
            setGenerating(false);
        }
    };

    const handleToggleComplete = async (sessionExerciseId: string, currentCompleted: boolean) => {
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
        }
    };

    const handleSavePainLog = async (sessionExerciseId: string) => {
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

            // Close accordion and maybe show brief success feedback (just UI cleanup)
            setActivePattern(null);
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

    const toggleVideoPlay = (exId: string) => {
        const video = videoRefs.current[exId];
        if (!video) return;

        if (video.paused) {
            video.play();
            setPlayingVideos(prev => ({ ...prev, [exId]: true }));
        } else {
            video.pause();
            setPlayingVideos(prev => ({ ...prev, [exId]: false }));
        }
    };

    const allCompleted = exercises.length > 0 && exercises.every(ex => ex.is_completed);

    const getBlockName = (order: number) => {
        const mapping: Record<number, string> = { 1: 'SQUAT', 2: 'HINGE', 3: 'PUSH', 4: 'PULL', 5: 'CARRY', 6: 'REGULATE' };
        return mapping[order] || `BLOCK ${order}`;
    };

    return (
        <AppShell
            title={`Phase of ${session?.phase || profile?.current_phase || 'Foundation'}`}
            subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        >
            {/* Inline alerts for errors */}
            {errorMsg && viewState === 'error' && (
                <div style={{ background: 'rgba(231, 76, 60, 0.1)', color: 'var(--warning)', border: '1px solid rgba(231, 76, 60, 0.2)', padding: 'var(--sp-3)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: 'var(--sp-4)' }}>
                    <Icon name="info" size={16} />
                    <span>{errorMsg}</span>
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
                    <Icon name="event_busy" style={{ color: 'var(--text-muted)' }} size={48} />
                    <h2 style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: 600 }}>No Active Session</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '250px' }}>Your daily execution block has not been initialized yet.</p>
                    <button
                        className={styles.primaryBtn}
                        onClick={handleGenerateSession}
                        disabled={generating}
                        style={{ marginTop: '24px' }}
                    >
                        {generating ? <Icon name="autorenew" style={{ animation: 'spin 1s linear infinite' }} /> : 'Generate Today\'s Session'}
                    </button>
                </div>
            )}

            {viewState === 'success' && session && (
                <>
                    <section className={styles.section}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '8px' }}>
                            <div>
                                <h2 className={styles.sectionTitle}>Execution Pipeline</h2>
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, fontFamily: 'monospace' }}>
                                {exercises.filter(ex => !ex.is_completed).length} BLOCKS REMAINING
                            </span>
                        </div>

                        <div className={styles.patternList}>
                            {exercises.map((ex, i) => {
                                const library = ex.exercise_library;
                                const isCompleted = ex.is_completed;
                                const isExpanded = activePattern === ex.id;
                                const hasPainLog = ex.session_exercise_logs && ex.session_exercise_logs.length > 0;
                                const currentPainScore = painScores[ex.id] || 0;

                                return (
                                    <div
                                        key={ex.id}
                                        className={`${styles.patternCard} ${isExpanded ? styles.patternActive : ''}`}
                                    >
                                        <div className={styles.patternRow}>
                                            {/* Completion Toggle */}
                                            <button
                                                className={`${styles.checkboxBtn} ${isCompleted ? styles.completedCheckbox : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleComplete(ex.id, ex.is_completed);
                                                }}
                                            >
                                                <Icon name="check" />
                                            </button>

                                            {/* Details */}
                                            <div className={styles.patternContent} onClick={() => setActivePattern(isExpanded ? null : ex.id)} style={{ cursor: 'pointer' }}>
                                                <div className={styles.patternHeader}>
                                                    <div>
                                                        <span style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.5px' }}>
                                                            {i + 1} // {getBlockName(ex.block_order)}
                                                        </span>
                                                        <h3 className={styles.patternName} style={{ marginTop: '2px' }}>{library?.name || 'Unknown Pattern'}</h3>
                                                    </div>
                                                </div>
                                                <div className={styles.patternMeta}>
                                                    <span className={styles.patternCategory}>{library?.pattern}</span>
                                                    <span>{ex.sets} SETS · {ex.reps_min}-{ex.reps_max} REPS</span>
                                                    <span>REST {ex.rest_sec}s</span>
                                                </div>
                                            </div>

                                            {/* Video Preview */}
                                            {library?.media_video_url ? (
                                                <div className={styles.patternThumbnail} onClick={(e) => { e.stopPropagation(); toggleVideoPlay(ex.id); }}>
                                                    <video
                                                        ref={(el) => { videoRefs.current[ex.id] = el; }}
                                                        src={library.media_video_url}
                                                        muted
                                                        loop
                                                        playsInline
                                                    />
                                                    {!playingVideos[ex.id] && (
                                                        <div className={styles.playIconOverlay}>
                                                            <Icon name="play_arrow" size={16} style={{ color: '#fff' }} />
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className={styles.patternThumbnail} style={{ background: 'var(--surface-3)', border: 'none' }}>
                                                    <Icon name="videocam_off" size={20} style={{ opacity: 0.5 }} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Expandable Accordion for Pain Logging */}
                                        {isExpanded && (
                                            <div className={styles.patternExpanded}>
                                                <div className={styles.reportPainTitle}>
                                                    Report Load/Pain
                                                    {hasPainLog && <span style={{ marginLeft: '8px', color: 'var(--text-muted)', fontSize: '10px', fontWeight: 'normal' }}>(Last Saved: {currentPainScore}/10)</span>}
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
                                                            onChange={(e) => setPainScores(prev => ({ ...prev, [ex.id]: parseInt(e.target.value) }))}
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
                                                    value={painNotes[ex.id] || ''}
                                                    onChange={(e) => setPainNotes(prev => ({ ...prev, [ex.id]: e.target.value }))}
                                                />

                                                <button
                                                    className={styles.ghostBtn}
                                                    style={{ width: '100%', marginTop: '4px', background: 'var(--surface-2)', border: 'none' }}
                                                    onClick={() => handleSavePainLog(ex.id)}
                                                    disabled={savingPain[ex.id]}
                                                >
                                                    {savingPain[ex.id] ? 'Saving...' : 'Save Log Record'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </section>

                    <section className={styles.actionSection} style={{ marginTop: '24px' }}>
                        <button
                            className={styles.primaryBtn}
                            disabled={!allCompleted || session.state === 'completed'}
                            onClick={handleCompleteSession}
                        >
                            {session.state === 'completed' ? 'Session Already Completed' : 'Complete Session'}
                        </button>
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

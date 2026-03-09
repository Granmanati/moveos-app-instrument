import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './MissionPage.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AppShell from '../components/AppShell';
import { Icon } from '../components/Icon';
import { safeSelect, safeRpc } from '../lib/db';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { SkeletonCard } from '../components/ui/Skeleton';
import { useAdaptiveEngine } from '../engine/useAdaptiveEngine';
import { EngineAuditPanel } from '../components/ui/EngineAuditPanel';

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
    squat: 'Strength',
    hinge: 'Strength',
    push: 'Activation',
    pull: 'Activation',
};

const GROUP_ICONS: Record<GroupKey, string> = {
    Recovery: 'self_improvement',
    Mobility: 'rotate_right',
    Activation: 'bolt',
    Strength: 'fitness_center',
};

const GROUP_ORDER: GroupKey[] = ['Recovery', 'Mobility', 'Activation', 'Strength'];

const THUMBS = [
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&q=60',
    'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&q=60',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&q=60',
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=300&q=60',
];

function getGroup(pattern: string): GroupKey {
    const key = (pattern || '').toLowerCase();
    return PATTERN_TO_GROUP[key] ?? 'Activation';
}

function getThumbnail(id: number | string): string {
    return THUMBS[Number(id) % THUMBS.length];
}

// ── Exercise Card ───────────────────────────────────────────────────────────
function ExerciseCard({
    ex, index, onTap, onToggle, loadModifier
}: {
    ex: SessionExercise; index: number;
    onTap: (ex: SessionExercise) => void;
    onToggle: (id: number | string) => void;
    loadModifier?: string;
}) {
    return (
        <motion.div
            className={`${styles.exCard} ${ex.is_completed ? styles.exCardDone : ''}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.2, ease: 'easeOut' }}
        >
            <div
                className={styles.exThumb}
                style={{ backgroundImage: `url(${getThumbnail(ex.id)})` }}
                onClick={() => onTap(ex)}
            >
                {ex.is_completed && (
                    <div className={styles.exDoneOverlay}>
                        <Icon name="check_circle" size={20} />
                    </div>
                )}
                {loadModifier && loadModifier !== 'maintain' && (
                    <div className={`${styles.loadBadge} ${loadModifier === 'reduce' ? styles.loadReduce : styles.loadIncrease}`}>
                        {loadModifier === 'reduce' ? '↓' : '↑'} {loadModifier.toUpperCase()}
                    </div>
                )}
            </div>
            <div className={styles.exBody} onClick={() => onTap(ex)}>
                <span className={styles.exName}>{ex.exercise_library.name}</span>
                <span className={styles.exMeta}>
                    {ex.sets} sets · {ex.reps_min}–{ex.reps_max} reps · {ex.rest_sec}s rest
                </span>
            </div>
            <button
                className={`${styles.exCheck} ${ex.is_completed ? styles.exCheckDone : ''}`}
                onClick={() => onToggle(ex.id)}
                aria-label="Mark complete"
            >
                <Icon name={ex.is_completed ? 'check' : 'radio_button_unchecked'} size={18} />
            </button>
        </motion.div>
    );
}

// ── Collapsible Group ───────────────────────────────────────────────────────
function ExerciseGroup({
    group, exercises, onTap, onToggle, loadModifier
}: {
    group: GroupKey;
    exercises: SessionExercise[];
    onTap: (ex: SessionExercise) => void;
    onToggle: (id: number | string) => void;
    loadModifier?: string;
}) {
    const [open, setOpen] = useState(true);
    const done = exercises.filter(e => e.is_completed).length;
    return (
        <div className={styles.group}>
            <button className={styles.groupHeader} onClick={() => setOpen(o => !o)}>
                <div className={styles.groupLeft}>
                    <div className={styles.groupIconBox}>
                        <Icon name={GROUP_ICONS[group]} size={14} />
                    </div>
                    <span className={styles.groupName}>{group.toUpperCase()}</span>
                    <span className={styles.groupCount}>{done}/{exercises.length}</span>
                </div>
                <Icon name={open ? 'expand_less' : 'expand_more'} size={18} className={styles.groupChevron} />
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: 'easeInOut' }}
                        className={styles.groupContent}
                    >
                        {exercises.map((ex, i) => (
                            <ExerciseCard
                                key={ex.id}
                                ex={ex}
                                index={i}
                                onTap={onTap}
                                onToggle={onToggle}
                                loadModifier={loadModifier}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Feedback Modal ──────────────────────────────────────────────────────────
function FeedbackModal({ onSubmit, onSkip }: { onSubmit: (pain: number, mood: string) => void; onSkip: () => void }) {
    const [pain, setPain] = useState(0);
    const [mood, setMood] = useState('');
    const MOODS = [
        { emoji: '😣', label: 'Hard' },
        { emoji: '😐', label: 'OK' },
        { emoji: '💪', label: 'Good' },
        { emoji: '🚀', label: 'Great' },
    ];
    return (
        <motion.div className={styles.feedbackOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
                className={styles.feedbackSheet}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
            >
                <div className={styles.sheetHandle} />
                <h3 className={styles.feedbackTitle}>SESSION COMPLETE</h3>
                <p className={styles.feedbackSub}>How do you feel after today's protocol?</p>

                <span className={styles.feedbackLabel}>MOOD</span>
                <div className={styles.moodRow}>
                    {MOODS.map(m => (
                        <button
                            key={m.label}
                            className={`${styles.moodBtn} ${mood === m.label ? styles.moodActive : ''}`}
                            onClick={() => setMood(m.label)}
                        >
                            <span className={styles.moodEmoji}>{m.emoji}</span>
                            <span className={styles.moodLabel}>{m.label}</span>
                        </button>
                    ))}
                </div>

                <span className={styles.feedbackLabel}>PAIN SCALE <strong>{pain}/10</strong></span>
                <div className={styles.painTrack}>
                    {Array.from({ length: 11 }, (_, i) => (
                        <button
                            key={i}
                            className={`${styles.painDot} ${pain === i ? styles.painDotActive : ''}`}
                            onClick={() => setPain(i)}
                        >
                            {i}
                        </button>
                    ))}
                </div>

                <PrimaryButton onClick={() => onSubmit(pain, mood)} disabled={!mood}>
                    SUBMIT FEEDBACK
                </PrimaryButton>
                <button className={styles.skipBtn} onClick={onSkip}>Skip</button>
            </motion.div>
        </motion.div>
    );
}

// ── Pre-Session Checkin Modal ───────────────────────────────────────────────
function PreSessionCheckinModal({ onSubmit, onClose }: { onSubmit: (vals: { pain: number, stiffness: number, fatigue: number, readiness: number }) => void; onClose: () => void }) {
    const [pain, setPain] = useState<number | null>(null);
    const [stiffness, setStiffness] = useState<number | null>(null);
    const [fatigue, setFatigue] = useState<number | null>(null);
    const [readiness, setReadiness] = useState<number | null>(null);

    const isComplete = pain !== null && stiffness !== null && fatigue !== null && readiness !== null;

    const SliderField = ({ label, value, onChange, desc }: any) => (
        <div className={styles.checkinField}>
            <div className={styles.checkinLabelRow}>
                <span className={styles.checkinLabel}>{label}</span>
                <span className={styles.checkinValue}>{value !== null ? `${value}/10` : '-/10'}</span>
            </div>
            <p className={styles.checkinDesc}>{desc}</p>
            <div className={styles.painTrack}>
                {Array.from({ length: 11 }, (_, i) => (
                    <button
                        key={i}
                        className={`${styles.painDot} ${value === i ? styles.painDotActive : ''}`}
                        onClick={() => onChange(i)}
                    >
                        {i}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <motion.div className={styles.feedbackOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
                className={styles.feedbackSheet}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
            >
                <div className={styles.sheetHandle} />
                <h3 className={styles.feedbackTitle}>SYSTEM CHECK-IN</h3>
                <p className={styles.feedbackSub}>Calibrate the engine before today's session.</p>

                <div className={styles.checkinForm}>
                    <SliderField label="CURRENT PAIN" value={pain} onChange={setPain} desc="0 is no pain, 10 is unbearable." />
                    <SliderField label="STIFFNESS" value={stiffness} onChange={setStiffness} desc="How tight or restricted do you feel?" />
                    <SliderField label="FATIGUE" value={fatigue} onChange={setFatigue} desc="How tired is your body?" />
                    <SliderField label="READINESS" value={readiness} onChange={setReadiness} desc="0 is exhausted, 10 is primed." />
                </div>

                <div className={styles.checkinBtns}>
                    <PrimaryButton onClick={() => onSubmit({ pain: pain!, stiffness: stiffness!, fatigue: fatigue!, readiness: readiness! })} disabled={!isComplete}>
                        CONFIRM & CONTINUE
                    </PrimaryButton>
                    <button className={styles.skipBtn} onClick={onClose}>CANCEL</button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ── Exercise Detail Sheet ───────────────────────────────────────────────────
function ExerciseDetailSheet({ ex, onClose }: { ex: SessionExercise; onClose: () => void }) {
    return (
        <motion.div className={styles.feedbackOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
                className={styles.detailSheet}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
            >
                {/* Video / thumbnail */}
                <div className={styles.detailVideo} style={{ backgroundImage: `url(${getThumbnail(ex.id)})` }}>
                    <div className={styles.detailVideoOverlay} />
                    <div className={styles.detailPlayBtn}>
                        <Icon name="play_arrow" size={28} />
                    </div>
                    <button className={styles.detailClose} onClick={onClose}>
                        <Icon name="close" size={20} />
                    </button>
                </div>

                <div className={styles.detailBody}>
                    <div className={styles.detailHeader}>
                        <h2 className={styles.detailName}>{ex.exercise_library.name}</h2>
                        <span className={styles.detailMeta}>{ex.sets} sets · {ex.reps_min}–{ex.reps_max} reps · {ex.rest_sec}s rest</span>
                    </div>

                    <div className={styles.detailSection}>
                        <span className={styles.detailSectionLabel}>INSTRUCTIONS</span>
                        <p className={styles.detailText}>Perform controlled movement through full range of motion. Maintain neutral spine position throughout the repetition.</p>
                    </div>
                    <div className={styles.detailSection}>
                        <span className={styles.detailSectionLabel}>TEACHING POINTS</span>
                        <ul className={styles.detailList}>
                            <li>Keep core engaged and breathing controlled</li>
                            <li>Move within pain-free range only</li>
                            <li>Pause at end range for 1–2 seconds</li>
                        </ul>
                    </div>
                    <div className={styles.detailSection}>
                        <span className={styles.detailSectionLabel}>SAFETY NOTES</span>
                        <p className={styles.detailText} style={{ color: 'var(--mo-color-state-warning, #F5A623)' }}>Stop if sharp or shooting pain occurs. This is not normal exercise discomfort.</p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ── Main MissionPage ──────────────────────────────────────────────────────────
export default function MissionPage() {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [viewState, setViewState] = useState<'loading' | 'error' | 'empty' | 'success'>('loading');
    const [session, setSession] = useState<any>(null);
    const [exercises, setExercises] = useState<SessionExercise[]>([]);
    const [errorMsg, setErrorMsg] = useState('');
    const [generating, setGenerating] = useState(false);
    const [showDetail, setShowDetail] = useState<SessionExercise | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackDone, setFeedbackDone] = useState(false);
    const [showCheckin, setShowCheckin] = useState(false);

    const engine = useAdaptiveEngine();

    const fetchSession = async () => {
        if (!user) return;
        setViewState('loading');
        setErrorMsg('');
        try {
            const today = new Date().toISOString().split('T')[0];
            const q = supabase
                .from('training_sessions')
                .select(`id, state, phase, current_block_index, current_exercise_index, current_set, session_exercises (id, is_completed, status, sets, reps_min, reps_max, rest_sec, block_order, exercise_library (id, name, pattern, media_video_url, level))`)
                .eq('user_id', user.id)
                .eq('session_date', today)
                .maybeSingle();

            const { data, error } = await safeSelect<any>(q, 'TodaySession');
            if (error) throw error;
            if (!data) { setViewState('empty'); return null; }

            setSession(data);
            const sortedExercises = (data.session_exercises || []).sort((a: SessionExercise, b: SessionExercise) => a.block_order - b.block_order);
            setExercises(sortedExercises);

            // Proactive state handling
            if (data.state === 'awaiting_feedback' && !feedbackDone) {
                setShowFeedback(true);
            }

            setViewState('success');
            return data;
        } catch (err: any) {
            setErrorMsg(err.message || 'Error loading session.');
            setViewState('error');
            return null;
        }
    };

    useEffect(() => { fetchSession(); }, [user]); // eslint-disable-line

    useEffect(() => {
        if (location.state?.completedSession) {
            setShowFeedback(true);
            // Clear location state to prevent re-opening on manual refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const proceedToPlayer = (exercisesToUse: SessionExercise[], sessionId?: string, rehydration?: any) => {
        const groupMap: Record<GroupKey, SessionExercise[]> = {
            Recovery: [],
            Mobility: [],
            Activation: [],
            Strength: [],
        };

        exercisesToUse.forEach(ex => {
            const group = PATTERN_TO_GROUP[ex.exercise_library.pattern.toLowerCase()] || 'Recovery';
            groupMap[group].push(ex);
        });

        const blocks = (['Recovery', 'Mobility', 'Activation', 'Strength'] as GroupKey[])
            .filter(key => groupMap[key].length > 0)
            .map(key => ({
                name: key,
                exercises: groupMap[key].sort((a, b) => (a.block_order || 0) - (b.block_order || 0))
            }));

        navigate('/session/play', {
            state: {
                blocks,
                sessionId,
                rehydrationData: rehydration
            }
        });
    };

    const handleStartSessionClick = () => {
        if (!session) return;
        if (session.pre_pain === null || session.pre_pain === undefined) {
            setShowCheckin(true);
        } else {
            proceedToPlayer(exercises, session.id, {
                currentBlockIndex: session.current_block_index,
                currentExerciseIndex: session.current_exercise_index,
                currentSet: session.current_set
            });
        }
    };

    const handleCheckinSubmit = async (vals: { pain: number, stiffness: number, fatigue: number, readiness: number }) => {
        setGenerating(true);
        setShowCheckin(false);
        try {
            // 1. Create/Update session via RPC
            const { error } = await safeRpc('generate_session', {
                p_pain: vals.pain,
                p_stiffness: vals.stiffness,
                p_fatigue: vals.fatigue,
                p_readiness: vals.readiness
            });
            if (error) throw error;

            // 2. Refresh engine to get new protocol
            await engine.refetch();

            // 3. Fetch the newly created session
            const newSession = await fetchSession();

            if (engine.output?.safetyBlocked) return;

            if (newSession && newSession.session_exercises) {
                proceedToPlayer(newSession.session_exercises, newSession.id);
            }
        } catch (err: any) {
            setErrorMsg('System calibration failed. Please retry protocol generation.');
            console.error('Session generation error:', err);
        } finally {
            setGenerating(false);
        }
    };

    const handleFeedbackSubmit = async (pain: number, mood: string) => {
        if (!session) return;
        try {
            const { error } = await supabase
                .from('training_sessions')
                .update({
                    state: 'completed',
                    post_pain: pain,
                    post_mood: mood,
                    completed_at: new Date().toISOString()
                })
                .eq('id', session.id);

            if (error) throw error;

            setFeedbackDone(true);
            setShowFeedback(false);

            // Refresh everything
            await fetchSession();
            await engine.refetch();
        } catch (err) {
            console.error('Feedback submission error:', err);
            setErrorMsg('Failed to save feedback. Please try again.');
        }
    };

    const toggleExercise = async (id: number | string) => {
        setExercises(prev => prev.map(e => e.id === id ? { ...e, is_completed: !e.is_completed } : e));
        try {
            const ex = exercises.find(e => e.id === id);
            if (!ex) return;
            await supabase.from('session_exercises').update({ is_completed: !ex.is_completed }).eq('id', id);
        } catch { /* silent */ }
    };

    const allDone = exercises.length > 0 && exercises.every(e => e.is_completed);
    const completedCount = exercises.filter(e => e.is_completed).length;
    const progress = exercises.length > 0 ? completedCount / exercises.length : 0;

    // Group exercises
    const groups: Record<GroupKey, SessionExercise[]> = { Recovery: [], Mobility: [], Activation: [], Strength: [] };
    exercises.forEach(ex => { groups[getGroup(ex.exercise_library.pattern)].push(ex); });

    const phase = engine.output?.phase.toUpperCase() ?? session?.phase?.toUpperCase() ?? 'REGULATE';
    const protocolType = engine.output?.protocolType.toUpperCase() ?? 'ADAPTIVE';
    const sessionGoal = engine.output?.sessionGoal ?? 'Adaptive execution protocol';
    const safetyBlocked = engine.output?.safetyBlocked ?? false;
    const safetyNotes = engine.output?.audit.safetyNotes ?? [];
    const displayName = profile?.full_name || 'USER';

    return (
        <AppShell title="TODAY" sublabel="Daily protocol">
            <div className={styles.page}>
                {safetyBlocked && (
                    <div className={styles.safetyBlock}>
                        <Icon name="block" size={24} />
                        <div className={styles.safetyBody}>
                            <span className={styles.safetyTitle}>SESSION BLOCKED</span>
                            <span className={styles.safetyDesc}>The adaptive engine has restricted session execution due to safety flags or high strain markers.</span>
                            {safetyNotes.map((n, i) => <span key={i} className={styles.safetyNote}>· {n}</span>)}
                        </div>
                    </div>
                )}

                {/* Error banner */}
                {errorMsg && (
                    <div className={styles.errorBanner}>
                        <Icon name="info" size={14} />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {/* Loading */}
                {viewState === 'loading' && (
                    <div className={styles.stack}>
                        <SkeletonCard style={{ height: 140 }} />
                        <SkeletonCard style={{ height: 200 }} />
                        <SkeletonCard style={{ height: 160 }} />
                    </div>
                )}

                {/* Empty — no session today */}
                {viewState === 'empty' && (
                    <div className={styles.emptyState}>
                        <Icon name="event_note" size={32} style={{ color: 'var(--mo-color-text-tertiary)' }} />
                        <span className={styles.emptyTitle}>No protocol for today</span>
                        <span className={styles.emptyDesc}>Complete your check-in to generate today's adaptive session</span>
                        <PrimaryButton onClick={handleStartSessionClick} disabled={generating}>
                            {generating
                                ? <><Icon name="autorenew" size={14} style={{ animation: 'spin 1s linear infinite', marginRight: 6 }} />GENERATING…</>
                                : 'START TODAY\'S PROTOCOL'}
                        </PrimaryButton>
                    </div>
                )}

                {viewState === 'success' && session && (
                    <>
                        {/* 1. Today Protocol Card */}
                        <div className={styles.protocolCard}>
                            <div className={styles.protocolMeta}>
                                <div className={styles.protocolLeft}>
                                    <span className={styles.protocolLabel}>{displayName.toUpperCase()} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()}</span>
                                    <div className={styles.protocolBadgesRow}>
                                        <span className={styles.protocolPhase}>PHASE: {phase}</span>
                                        <span className={styles.protocolTypeBadge}>{protocolType}</span>
                                    </div>
                                    <span className={styles.protocolGoal}>{sessionGoal}</span>
                                </div>
                                <div className={styles.protocolBadge}>
                                    <span className={styles.protocolDuration}>~{Math.max(20, exercises.length * 5)} min</span>
                                    <span className={styles.protocolDurationLabel}>EST</span>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className={styles.progressWrap}>
                                <div className={styles.progressBar}>
                                    <motion.div
                                        className={styles.progressFill}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress * 100}%` }}
                                        transition={{ duration: 0.5, ease: 'easeOut' }}
                                    />
                                </div>
                                <span className={styles.progressText}>{completedCount}/{exercises.length} blocks</span>
                            </div>

                            {session.state !== 'completed' && session.state !== 'awaiting_feedback' && (
                                <PrimaryButton onClick={handleStartSessionClick}>
                                    {completedCount > 0 || session.current_block_index > 0 ? 'CONTINUE SESSION' : 'START SESSION'}
                                </PrimaryButton>
                            )}
                            {session.state === 'awaiting_feedback' && (
                                <PrimaryButton onClick={() => setShowFeedback(true)}>
                                    LOG SESSION FEEDBACK
                                </PrimaryButton>
                            )}
                            {session.state === 'completed' && (
                                <div className={styles.completedBadge}>
                                    <Icon name="check_circle" size={16} style={{ color: 'var(--mo-color-state-success, #4CAF7D)' }} />
                                    <span>PROTOCOL COMPLETED</span>
                                </div>
                            )}
                        </div>

                        {/* 2. Execution Blocks */}
                        <div className={styles.groupsStack}>
                            {GROUP_ORDER.filter(g => groups[g].length > 0).map(g => {
                                const engineBlock = engine.output?.blocks.find(b => b.group.toLowerCase() === g.toLowerCase());
                                return (
                                    <ExerciseGroup
                                        key={g}
                                        group={g}
                                        exercises={groups[g]}
                                        onTap={setShowDetail}
                                        onToggle={toggleExercise}
                                        loadModifier={engineBlock?.loadModifier}
                                    />
                                );
                            })}
                        </div>

                        {/* 3. Feedback CTA — when all done */}
                        {allDone && !feedbackDone && (
                            <motion.div
                                className={styles.feedbackCTA}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.25 }}
                            >
                                <span className={styles.feedbackCtaText}>All blocks complete — log your response</span>
                                <PrimaryButton onClick={() => setShowFeedback(true)}>LOG FEEDBACK</PrimaryButton>
                            </motion.div>
                        )}

                        {feedbackDone && (
                            <div className={styles.feedbackDone}>
                                <Icon name="check_circle" size={16} style={{ color: 'var(--mo-color-state-success, #4CAF7D)' }} />
                                <span>Session feedback recorded</span>
                            </div>
                        )}

                        {/* 4. Phase Progress */}
                        <div className={styles.phaseCard}>
                            <span className={styles.phaseCardLabel}>PHASE PROGRESS</span>
                            <div className={styles.phaseRow}>
                                {(['REGULATE', 'RECOVER', 'REINFORCE'] as const).map(p => (
                                    <div key={p} className={`${styles.phaseStep} ${phase === p ? styles.phaseStepActive : ''}`}>
                                        <div className={`${styles.phaseDot} ${phase === p ? styles.phaseDotActive : ''}`} />
                                        <span className={styles.phaseStepLabel}>{p}</span>
                                    </div>
                                ))}
                            </div>
                            <p className={styles.phaseExitCriteria}>
                                Exit criteria: Adherence ≥ 80% · Pain ≤ 3/10 for 5 consecutive sessions
                            </p>
                        </div>

                        {/* Engine Audit Panel — dev tool */}
                        {engine.output && engine.input && (
                            <EngineAuditPanel output={engine.output} input={engine.input} />
                        )}
                    </>
                )}
            </div>

            {/* Exercise Detail Sheet */}
            <AnimatePresence>
                {showDetail && (
                    <ExerciseDetailSheet ex={showDetail} onClose={() => setShowDetail(null)} />
                )}
            </AnimatePresence>

            {/* Pre-Session Checkin Modal */}
            <AnimatePresence>
                {showCheckin && (
                    <PreSessionCheckinModal
                        onSubmit={handleCheckinSubmit}
                        onClose={() => setShowCheckin(false)}
                    />
                )}
            </AnimatePresence>

            {/* Feedback Modal */}
            <AnimatePresence>
                {showFeedback && (
                    <FeedbackModal
                        onSubmit={handleFeedbackSubmit}
                        onSkip={() => { setShowFeedback(false); setFeedbackDone(true); }}
                    />
                )}
            </AnimatePresence>
        </AppShell>
    );
}

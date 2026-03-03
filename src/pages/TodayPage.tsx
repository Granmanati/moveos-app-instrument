import { useEffect, useState } from 'react';
import styles from './TodayPage.module.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AppShell from '../components/AppShell';
import { Icon } from '../components/Icon';

export default function TodayPage() {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [viewState, setViewState] = useState<'loading' | 'error' | 'empty' | 'success'>('loading');
    const [session, setSession] = useState<any>(null);
    const [exercises, setExercises] = useState<any[]>([]);
    const [errorMsg, setErrorMsg] = useState('');
    const [generating, setGenerating] = useState(false);
    const [activePattern, setActivePattern] = useState<string | null>(null);

    const [showPremiumGate, setShowPremiumGate] = useState(false);

    // Initial check for onboarding redirect flag
    useEffect(() => {
        if (location.state?.isNewOnboarding) {
            setShowPremiumGate(true);
            // Clear the state so it doesn't pop up again on refresh
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
                        id, status, sets, reps_min, reps_max, rest_sec, block_order,
                        exercise_library (
                            id, name, pattern, media_video_url, level
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
                    // Ordenar por block_order
                    const sorted = [...data.session_exercises].sort((a: any, b: any) => a.block_order - b.block_order);
                    setExercises(sorted);
                }
                setViewState('success');
            } else {
                setSession(null);
                setViewState('empty');
            }
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message || 'Error al cargar los ejercicios de hoy.');
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

            // Re-fetch to show the newly generated session
            await fetchSessionWithExercises();
        } catch (err: any) {
            console.error('Error generating session:', err);
            setErrorMsg(err.message || 'Error al generar la sesión. Intenta de nuevo.');
            setViewState('error');
        } finally {
            setGenerating(false);
        }
    };

    const handleLogExercise = async (sessionExerciseId: string, painScore: number) => {
        const { error } = await supabase.rpc('log_exercise', {
            p_session_exercise_id: sessionExerciseId,
            p_pain_score: painScore,
            p_notes: ''
        });

        if (!error) {
            setActivePattern(null);
        } else {
            console.error('Error logging exercise:', error);
        }
    };

    const handleToggleComplete = async (sessionExerciseId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
        const { error } = await supabase
            .from('session_exercises')
            .update({ status: newStatus })
            .eq('id', sessionExerciseId);

        if (!error) {
            setExercises(prev => prev.map(ex =>
                ex.id === sessionExerciseId ? { ...ex, status: newStatus } : ex
            ));
        } else {
            console.error('Error toggling status:', error);
        }
    };

    const handleCompleteSession = async () => {
        if (!session) return;
        try {
            console.log('Calling complete_session RPC with session.id:', session.id);
            const { data, error } = await supabase.rpc('complete_session', { p_session_id: session.id });
            console.log('complete_session response ->', { data, error });

            if (error) {
                console.error('EXACT ERR OBJ from complete_session:', JSON.stringify(error, null, 2));
                throw error;
            }
            navigate('/progress');
        } catch (err: any) {
            console.error('Error completing session in catch block:', err);
            setErrorMsg(`RPC Error: ${err.message || err.details || JSON.stringify(err)}`);
            setViewState('error');
        }
    };

    const allCompleted = exercises.length > 0 && exercises.every(ex => ex.status === 'completed');

    return (
        <AppShell
            title={`Fase de ${session?.phase || profile?.current_phase || 'Desarrollo'}`}
            subtitle={new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        >
            {/* Main Area based on State */}
            {viewState === 'loading' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '60vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    <Icon name="autorenew" style={{ animation: 'spin 1s linear infinite' }} size={32} />
                    <p style={{ marginTop: '16px', fontSize: '14px' }}>Cargando esquema de movimiento...</p>
                </div>
            )}

            {viewState === 'error' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 'var(--sp-8) var(--sp-4)', gap: '16px' }}>
                    <Icon name="error" style={{ color: 'var(--warning)' }} size={48} />
                    <h2 className={styles.sectionTitle} style={{ color: 'var(--text-primary)', fontSize: '18px' }}>Error de Sistema</h2>
                    <p className={styles.subtitle}>{errorMsg}</p>
                    <button className={styles.primaryBtn} onClick={fetchSessionWithExercises} style={{ marginTop: '24px' }}>
                        Reintentar conexión
                    </button>
                </div>
            )}

            {viewState === 'empty' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 'var(--sp-8) var(--sp-4)', gap: '16px' }}>
                    <Icon name="event_busy" style={{ color: 'var(--text-muted)' }} size={48} />
                    <h2 className={styles.sectionTitle} style={{ color: 'var(--text-primary)', fontSize: '18px' }}>No hay sesión activa</h2>
                    <p className={styles.subtitle}>Aún no has generado tu entrenamiento pautado para hoy.</p>
                    <button
                        className={styles.primaryBtn}
                        onClick={handleGenerateSession}
                        disabled={generating}
                        style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '8px' }}
                    >
                        {generating ? <Icon name="autorenew" style={{ animation: 'spin 1s linear infinite' }} /> : 'Generar Sesión Ahora'}
                    </button>
                </div>
            )}

            {viewState === 'success' && session && (
                <>
                    <section className={styles.section}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 className={styles.sectionTitle}>Patrones de hoy</h2>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                                {exercises.filter(ex => ex.status !== 'completed').length} bloques restantes
                            </span>
                        </div>
                        <div className={styles.patternList}>
                            {exercises.map((ex, i) => {
                                const library = ex.exercise_library;
                                const isCompleted = ex.status === 'completed';

                                return (
                                    <div
                                        key={ex.id}
                                        className={`${styles.patternCard} ${activePattern === ex.id ? styles.patternActive : ''} ${isCompleted ? styles.completed : ''}`}
                                        onClick={() => {
                                            if (!isCompleted) setActivePattern(activePattern === ex.id ? null : ex.id);
                                        }}
                                        style={{ opacity: isCompleted ? 0.6 : 1 }}
                                    >
                                        <div className={styles.patternIndex}>
                                            {i === 0 ? 'START' : 'QUEUE'}
                                        </div>
                                        <div className={styles.patternContent}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                <div>
                                                    <div className={styles.patternHeader}>
                                                        <h3 className={styles.patternName}>{library?.name || 'Patrón Desconocido'}</h3>
                                                        <span className={styles.patternCategory}>{library?.pattern}</span>
                                                    </div>
                                                    <div className={styles.patternMeta}>
                                                        <span>{ex.sets} series · {ex.reps_min}-{ex.reps_max} reps</span>
                                                    </div>
                                                    <div className={styles.patternMeta} style={{ marginTop: '2px' }}>
                                                        <span>Descanso: {ex.rest_sec}s</span>
                                                        <span>·</span>
                                                        <span>Lv {library?.level || 1}</span>
                                                    </div>
                                                </div>
                                                <div className={styles.patternThumbnail}>
                                                    <Icon name="play_circle" size={24} />
                                                </div>
                                            </div>
                                            {activePattern === ex.id && (
                                                <div className={styles.patternExpanded}>
                                                    <div className={styles.videoPlaceholder}>
                                                        <Icon name="play_circle" />
                                                        <span>Ayuda visual · {(library?.media_video_url) ? 'Video disponible' : 'Sin video'}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                                        <button className={styles.ghostBtn} onClick={(e) => { e.stopPropagation(); handleLogExercise(ex.id, 0); }}>
                                                            Log: Sin dolor
                                                        </button>
                                                        <button className={styles.ghostBtn} onClick={(e) => { e.stopPropagation(); handleLogExercise(ex.id, 5); }}>
                                                            Log: Dolor (5)
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            className={styles.ghostBtn}
                                            style={{ width: '48px', height: '48px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggleComplete(ex.id, ex.status);
                                            }}
                                        >
                                            <Icon
                                                name={isCompleted ? 'check_circle' : 'radio_button_unchecked'}
                                                active={isCompleted}
                                            />
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </section>

                    <section className={styles.actionSection}>
                        <button
                            className={styles.primaryBtn}
                            disabled={!allCompleted || session.state === 'completed'}
                            onClick={handleCompleteSession}
                            style={{ opacity: (!allCompleted || session.state === 'completed') ? 0.5 : 1 }}
                        >
                            {session.state === 'completed' ? 'Sesión Terminada' : 'Completar sesión'}
                        </button>
                        <button className={styles.secondaryBtn} disabled={session.state === 'completed'}>
                            Recalcular plan
                        </button>
                    </section>
                </>
            )}

            {/* Premium Prompt Gate Modal */}
            {showPremiumGate && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalIconBox}>
                            <Icon name="bolt" size={32} />
                        </div>
                        <h2 className={styles.modalTitle}>Unlock Adaptive Engine</h2>
                        <p className={styles.modalText}>
                            Enable dynamic load adjustment, advanced analytics, and full execution library access.
                        </p>
                        <div className={styles.modalActions}>
                            <button className={styles.primaryBtn} onClick={() => navigate('/pricing')}>
                                Start 7-Day Trial
                            </button>
                            <button className={styles.ghostBtn} onClick={() => setShowPremiumGate(false)} style={{ border: 'none' }}>
                                Continue with Free Version
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppShell>
    );
}

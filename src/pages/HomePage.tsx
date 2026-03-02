import { useState, useEffect } from 'react';
import styles from './HomePage.module.css';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AppShell from '../components/AppShell';
import { Icon } from '../components/Icon';

export default function HomePage() {
    const { user, profile } = useAuth();
    const navigate = useNavigate();

    const dayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

    // Possible states: 'loading' | 'error' | 'empty' | 'success'
    const [viewState, setViewState] = useState<'loading' | 'error' | 'empty' | 'success'>('loading');
    const [session, setSession] = useState<any>(null);
    const [weeklyConsistency, setWeeklyConsistency] = useState<boolean[]>([false, false, false, false, false, false, false]);
    const [errorMsg, setErrorMsg] = useState('');
    const [generating, setGenerating] = useState(false);

    const fetchDashboardData = async () => {
        if (!user) return;
        setViewState('loading');
        setErrorMsg('');

        try {
            const today = new Date();
            const todayIso = today.toISOString().split('T')[0];

            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // past 6 days + today = 7 days
            const startIso = sevenDaysAgo.toISOString().split('T')[0];

            // fetch today's session
            const { data: sessionData, error: sessionError } = await supabase
                .from('training_sessions')
                .select(`id, state, phase, session_exercises(id)`)
                .eq('user_id', user.id)
                .eq('session_date', todayIso)
                .maybeSingle();

            if (sessionError) throw sessionError;

            // Fetch weekly sessions
            const { data: weekData, error: weekError } = await supabase
                .from('training_sessions')
                .select('session_date, state')
                .eq('user_id', user.id)
                .gte('session_date', startIso)
                .lte('session_date', todayIso);

            if (weekError) throw weekError;

            // Map consistency array (0 = 6 days ago, 6 = today)
            const consistency: boolean[] = [];
            for (let i = 6; i >= 0; i--) {
                const targetDate = new Date();
                targetDate.setDate(targetDate.getDate() - i);
                const isoStr = targetDate.toISOString().split('T')[0];

                const daySession = weekData?.find(s => s.session_date === isoStr);
                consistency.push(daySession?.state === 'completed');
            }

            setWeeklyConsistency(consistency);

            if (sessionData) {
                setSession(sessionData);
                setViewState('success');
            } else {
                setSession(null);
                setViewState('empty');
            }
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message || 'Error al cargar la sesión.');
            setViewState('error');
        }
    };

    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, profile]);

    const handleGenerateSession = async () => {
        if (!user) return;
        setGenerating(true);
        setErrorMsg('');
        try {
            const { error: genError } = await supabase.rpc('generate_session');
            if (genError) throw genError;

            // Auto navigate to today after generation
            navigate('/today');
        } catch (err: any) {
            console.error('Error generating session:', err);
            setErrorMsg(err.message || 'Error al generar la sesión. Intenta de nuevo.');
            setViewState('error');
            setGenerating(false);
        }
    };

    return (
        <AppShell
            customHeader={
                <header className={styles.header} style={{ flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
                        <div>
                            <p className={styles.greeting} style={{ fontSize: '12px', letterSpacing: '1.2px', color: '#2D7CFF', fontWeight: 700, margin: 0, paddingBottom: '2px', textTransform: 'uppercase' }}>MOVE OS</p>
                            <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.5px' }}>CONSISTENCY ENGINE v2.0</p>
                            <h1 className={styles.title}>Hola, {profile?.full_name || 'Atleta'}</h1>
                            <p className={styles.subtitle}>Fase {profile?.current_phase || 'Inicial'} · {profile?.role || 'user'}</p>
                        </div>
                        <div className={styles.avatar}>
                            <Icon name="person" />
                        </div>
                    </div>
                    <p style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                        RETURN &rarr; REGULATE &rarr; LOAD &rarr; ADAPT &rarr; BECOME
                    </p>
                </header>
            }
        >

            {/* Core Metrics -> System Status Block */}
            <section className={styles.metricsRow}>
                <div className={styles.metricCard} style={{ gridColumn: 'span 3', flexDirection: 'row', justifyContent: 'space-between', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className={styles.metricIconWrapper} style={{ marginBottom: 0, height: '40px', width: '40px' }}>
                            <Icon name="vital_signs" className={styles.metricIcon} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>System Status</span>
                            <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Current Load: Optimized</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                        <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent)' }}>92%</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Recovery</span>
                    </div>
                </div>
            </section>

            {/* Today's Session State Machine */}
            <section className={styles.section}>
                {viewState === 'loading' && (
                    <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
                        <Icon name="autorenew" style={{ animation: 'spin 1s linear infinite' }} size={32} />
                        <p style={{ marginTop: '12px', fontSize: '14px' }}>Cargando datos del sistema...</p>
                    </div>
                )}

                {viewState === 'error' && (
                    <div className={styles.sessionCard} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px', borderColor: 'var(--warning)' }}>
                        <div>
                            <Icon name="error" style={{ color: 'var(--warning)', marginBottom: '8px' }} size={32} />
                            <h2 className={styles.cardTitle}>Error de Conexión</h2>
                            <p className={styles.cardSubtitle}>{errorMsg}</p>
                        </div>
                        <button
                            className={styles.primaryBtn}
                            onClick={fetchDashboardData}
                            style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {viewState === 'empty' && (
                    <div className={styles.sessionCard} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
                        <div>
                            <Icon name="calendar_today" style={{ color: 'var(--text-muted)', marginBottom: '8px' }} size={32} />
                            <h2 className={styles.cardTitle}>Sin sesión activa</h2>
                            <p className={styles.cardSubtitle}>Genera tu entrenamiento de hoy basado en tu fase.</p>
                        </div>
                        <button
                            className={styles.primaryBtn}
                            onClick={handleGenerateSession}
                            disabled={generating}
                            style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
                        >
                            {generating ? <Icon name="autorenew" style={{ animation: 'spin 1s linear infinite' }} /> : 'Generar Sesión de Hoy'}
                        </button>
                    </div>
                )}

                {viewState === 'success' && session && (
                    <div className={styles.sessionCard}>
                        <div className={styles.sessionCardHeader}>
                            <div>
                                <h2 className={styles.cardTitle}>Fase de {session.phase || profile?.current_phase || 'Desarrollo'}</h2>
                                <p className={styles.cardSubtitle}>Sesión generada para hoy</p>
                            </div>
                            <span className={`${styles.statusBadge} ${session.state === 'completed' ? styles.completed : styles.ready}`}>
                                {session.state === 'completed' ? 'Completada' : 'Generada'}
                            </span>
                        </div>
                        <div className={styles.sessionMeta}>
                            <span className={styles.metaItem}>
                                <Icon name="schedule" size={14} />
                                ~12 min
                            </span>
                            <span className={styles.metaItem}>
                                <Icon name="fitness_center" size={14} />
                                {session.session_exercises?.length || 0} patrones
                            </span>
                        </div>

                        {session.state === 'completed' ? (
                            <button
                                onClick={() => navigate('/progress')}
                                className={styles.secondaryBtn}
                                style={{ display: 'block', width: '100%', textAlign: 'center', padding: '12px', background: 'var(--surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border-1)', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Ver Progreso
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate('/today')}
                                className={styles.primaryBtn}
                            >
                                Open Today Session
                            </button>
                        )}
                    </div>
                )}
            </section>

            {/* 7-Day Consistency */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Consistencia 7 días</h2>
                <div className={styles.consistencyRow}>
                    {weeklyConsistency.map((done, i) => {
                        // Dynamically map last 7 days names
                        const d = new Date();
                        d.setDate(d.getDate() - (6 - i));
                        const dayName = dayLabels[d.getDay() === 0 ? 6 : d.getDay() - 1]; // Map to L-D format
                        const isToday = i === 6;

                        return (
                            <div key={i} className={styles.dayItem}>
                                <div
                                    className={`${styles.dayDot}`}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        ...(isToday && !done ? { background: 'transparent', border: '2px solid var(--accent)' } :
                                            done ? { background: 'var(--accent)', color: '#fff' } :
                                                { background: '#1A1A1F' })
                                    }}
                                >
                                    {done && <Icon name="check" size={16} style={{ color: '#fff' }} />}
                                </div>
                                <span className={styles.dayLabel} style={isToday ? { color: 'var(--accent)', fontWeight: 600 } : {}}>{dayName}</span>
                            </div>
                        )
                    })}
                </div>
            </section>
        </AppShell>
    );
}

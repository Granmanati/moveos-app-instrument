import { useState, useEffect } from 'react';
import styles from './HomePage.module.css';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AppShell from '../components/AppShell';
import { Icon } from '../components/Icon';

interface HomeSnapshot {
    today: string;
    today_session: { id: string, state: string, session_date: string, phase: string } | null;
    consistency_7d: { date: string, completed: boolean }[];
    sessions_30d: number;
    adherence_7d: number;
    avg_pain_7d: number;
}

export default function HomePage() {
    const { user, profile } = useAuth();
    const navigate = useNavigate();

    const dayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

    // Possible states: 'loading' | 'error' | 'success'
    const [viewState, setViewState] = useState<'loading' | 'error' | 'success'>('loading');
    const [snapshot, setSnapshot] = useState<HomeSnapshot | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [generating, setGenerating] = useState(false);

    const fetchDashboardData = async () => {
        if (!user) return;
        setViewState('loading');
        setErrorMsg('');

        try {
            const { data, error } = await supabase.rpc('get_home_snapshot');
            if (error) throw error;

            if (data) {
                setSnapshot(data as HomeSnapshot);
                setViewState('success');
            } else {
                setSnapshot(null);
                setViewState('error');
                setErrorMsg('No data returned.');
            }
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message || 'Error al cargar los datos del sistema.');
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

            await fetchDashboardData();
        } catch (err: any) {
            console.error('Error generating session:', err);
            setErrorMsg(err.message || 'Error al generar la sesión. Intenta de nuevo.');
        } finally {
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

            {/* Compact inline System Alert */}
            {errorMsg && viewState === 'error' && (
                <div style={{ background: 'rgba(231, 76, 60, 0.1)', color: 'var(--warning)', border: '1px solid rgba(231, 76, 60, 0.2)', padding: 'var(--sp-3)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: 'var(--sp-4)' }}>
                    <Icon name="info" size={16} />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Content Loading Skeleton or Actual Data */}
            {viewState === 'loading' ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
                    <Icon name="autorenew" style={{ animation: 'spin 1s linear infinite' }} size={32} />
                    <p style={{ marginTop: '12px', fontSize: '14px' }}>Calibrating system snapshot...</p>
                </div>
            ) : snapshot ? (
                <>
                    {/* Metrics Row */}
                    <section className={styles.metricsRow}>
                        <div className={styles.metricCard}>
                            <div className={styles.metricIconWrapper}>
                                <Icon name="check_circle" className={styles.metricIcon} />
                            </div>
                            <span className={styles.metricValue}>{snapshot.sessions_30d}</span>
                            <span className={styles.metricLabel}>Sessions (30d)</span>
                        </div>
                        <div className={styles.metricCard}>
                            <div className={styles.metricIconWrapper}>
                                <Icon name="data_usage" className={styles.metricIcon} />
                            </div>
                            <span className={styles.metricValue}>{snapshot.adherence_7d}%</span>
                            <span className={styles.metricLabel}>Adherence (7d)</span>
                        </div>
                        <div className={styles.metricCard}>
                            <div className={styles.metricIconWrapper}>
                                <Icon name="healing" className={styles.metricIcon} />
                            </div>
                            <span className={styles.metricValue}>{snapshot.avg_pain_7d}/10</span>
                            <span className={styles.metricLabel}>Pain Avg (7d)</span>
                        </div>
                    </section>

                    {/* System Status Card (Today's Session Handling) */}
                    <section className={styles.section}>
                        <div className={styles.sessionCard}>
                            <div className={styles.sessionCardHeader}>
                                <div>
                                    <h2 className={styles.cardTitle}>System Status</h2>
                                    <p className={styles.cardSubtitle}>
                                        {snapshot.today_session ? `Phase of ${snapshot.today_session.phase}` : 'Ready for initial vector'}
                                    </p>
                                </div>
                                <span className={`${styles.statusBadge} ${snapshot.today_session?.state === 'completed' ? styles.completed : styles.ready}`}>
                                    {snapshot.today_session?.state === 'completed' ? 'Completed' : snapshot.today_session?.state === 'generated' ? 'Action Required' : 'Standby'}
                                </span>
                            </div>

                            {!snapshot.today_session ? (
                                <button
                                    className={styles.primaryBtn}
                                    onClick={handleGenerateSession}
                                    disabled={generating}
                                >
                                    {generating ? <Icon name="autorenew" style={{ animation: 'spin 1s linear infinite' }} /> : 'Generate Today’s Session'}
                                </button>
                            ) : snapshot.today_session.state === 'generated' || snapshot.today_session.state === 'pending' ? (
                                <button
                                    className={styles.primaryBtn}
                                    onClick={() => navigate('/today')}
                                >
                                    Open Today
                                </button>
                            ) : (
                                <button
                                    className={styles.secondaryBtn}
                                    style={{ width: '100%', height: '48px' }}
                                    onClick={() => navigate('/progress')}
                                >
                                    View Progress
                                </button>
                            )}
                        </div>
                    </section>

                    {/* 7-Day Consistency */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Consistencia 7 días</h2>
                        <div className={styles.consistencyRow}>
                            {snapshot.consistency_7d.map((dayData, i) => {
                                const d = new Date(dayData.date + 'T00:00:00');
                                const dayName = dayLabels[d.getDay() === 0 ? 6 : d.getDay() - 1];
                                const isToday = dayData.date === snapshot.today;
                                const done = dayData.completed;

                                return (
                                    <div key={i} className={styles.dayItem}>
                                        <div
                                            className={styles.dayDot}
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
                                );
                            })}
                        </div>
                    </section>
                </>
            ) : null}
        </AppShell>
    );
}

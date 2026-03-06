import { useState, useEffect } from 'react';
import styles from './HomePage.module.css';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AppShell from '../components/AppShell';
import { Icon } from '../components/Icon';
import { safeRpc } from '../lib/db';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { SecondaryButton } from '../components/ui/SecondaryButton';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SystemCard } from '../components/ui/SystemCard';
import { MetricBar } from '../components/ui/MetricBar';
import { useI18n } from '../i18n/useI18n';

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
    const { t } = useI18n();

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
            const { data, error } = await safeRpc('get_home_snapshot');

            if (error) {
                setErrorMsg(error.message);
                setViewState('error');
                return;
            }

            if (data) {
                setSnapshot(data as HomeSnapshot);
                setViewState('success');
            } else {
                setSnapshot(null);
                setViewState('error');
                setErrorMsg('No data returned.');
            }
        } catch (err: any) {
            // Unlikely to hit this heavily with safeRpc but just in case
            console.error(err);
            setErrorMsg(err.message || t('error'));
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
            const { error: genError } = await safeRpc('generate_session');
            if (genError) {
                setErrorMsg(genError.message);
                setViewState('error');
                return;
            }

            await fetchDashboardData();
        } catch (err: any) {
            console.error('Error generating session:', err);
            setErrorMsg(err.message || t('error'));
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
                            <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '0.5px', fontFamily: 'var(--font-mono)' }}>SYSTEM_STATUS: ONLINE</p>
                            <h1 className={styles.title} style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', textTransform: 'uppercase' }}>NODE: {profile?.full_name || 'USER'}</h1>
                            <p className={styles.subtitle} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', marginTop: '4px' }}>ADAPTIVE PHASE: {(profile?.current_phase || 'INITIAL').toUpperCase()}</p>
                        </div>
                        <div className={styles.avatar}>
                            <Icon name="person" />
                        </div>
                    </div>
                    <p style={{ fontSize: '9px', color: 'var(--text-secondary)', marginTop: '4px', letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                        RETURN &rarr; REGULATE &rarr; LOAD &rarr; ADAPT &rarr; BECOME
                    </p>
                </header>
            }
        >

            {/* Compact inline System Alert */}
            {errorMsg && viewState === 'error' && (
                <div style={{ background: 'rgba(231, 76, 60, 0.1)', color: 'var(--state-warning)', border: '1px solid rgba(231, 76, 60, 0.2)', padding: 'var(--sp-3)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: 'var(--sp-4)' }}>
                    <Icon name="info" size={16} />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Content Loading Skeleton or Actual Data */}
            {viewState === 'loading' ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
                    <Icon name="autorenew" style={{ animation: 'spin 1s linear infinite' }} size={32} />
                    <p style={{ marginTop: '12px', fontSize: '14px' }}>{t('homeCalibrating')}</p>
                </div>
            ) : snapshot ? (
                <>
                    {/* Metrics Row */}
                    <section className={styles.metricsRow}>
                        <SystemCard padding="sm" className={styles.metricCard}>
                            <div className={styles.metricIconWrapper}>
                                <Icon name="check_circle" className={styles.metricIcon} />
                            </div>
                            <span className={styles.metricValue}>{snapshot.sessions_30d}</span>
                            <span className={styles.metricLabel} style={{ fontFamily: 'var(--font-mono)' }}>RETURN VOLUME</span>
                        </SystemCard>
                        <SystemCard padding="sm" className={styles.metricCard}>
                            <div className={styles.metricIconWrapper}>
                                <Icon name="data_usage" className={styles.metricIcon} />
                            </div>
                            <span className={styles.metricValue}>{snapshot.adherence_7d}%</span>
                            <span className={styles.metricLabel} style={{ fontFamily: 'var(--font-mono)' }}>RETURN RATE</span>
                            <div style={{ width: '80%', marginTop: '4px' }}>
                                <MetricBar value={snapshot.adherence_7d} color="accent" height={3} />
                            </div>
                        </SystemCard>
                        <SystemCard padding="sm" className={styles.metricCard}>
                            <div className={styles.metricIconWrapper}>
                                <Icon name="healing" className={styles.metricIcon} />
                            </div>
                            <span className={styles.metricValue}>{snapshot.avg_pain_7d}/10</span>
                            <span className={styles.metricLabel} style={{ fontFamily: 'var(--font-mono)' }}>SYSTEM STRAIN</span>
                            <div style={{ width: '80%', marginTop: '4px' }}>
                                <MetricBar value={snapshot.avg_pain_7d * 10} color={snapshot.avg_pain_7d > 6 ? 'alert' : snapshot.avg_pain_7d > 3 ? 'warning' : 'success'} height={3} />
                            </div>
                        </SystemCard>
                    </section>

                    {/* System Status Card (Today's Session Handling) */}
                    <section className={styles.section}>
                        <SystemCard className={styles.sessionCard}>
                            <div className={styles.sessionCardHeader}>
                                <div>
                                    <h2 className={styles.cardTitle} style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', letterSpacing: '0.5px' }}>ACTIVE MISSION</h2>
                                    <p className={styles.cardSubtitle} style={{ fontFamily: 'var(--font-mono)' }}>
                                        {snapshot.today_session ? `EXECUTE ADAPTATION: ${snapshot.today_session.phase.toUpperCase()}` : 'AWAITING INITIALIZATION'}
                                    </p>
                                </div>
                                <StatusBadge
                                    status={snapshot.today_session?.state === 'completed' ? 'success' : snapshot.today_session?.state === 'generated' ? 'warning' : 'neutral'}
                                    label={snapshot.today_session?.state === 'completed' ? 'ALIGNED' : snapshot.today_session?.state === 'generated' ? 'ACTION REQUIRED' : 'STANDBY'}
                                />
                            </div>

                            {!snapshot.today_session ? (
                                <div style={{ marginTop: '16px', width: '100%' }}>
                                    <PrimaryButton onClick={handleGenerateSession} disabled={generating}>
                                        {generating ? <Icon name="autorenew" style={{ animation: 'spin 1s linear infinite' }} /> : t('homeGenerateSession')}
                                    </PrimaryButton>
                                </div>
                            ) : snapshot.today_session.state === 'generated' || snapshot.today_session.state === 'pending' ? (
                                <div style={{ marginTop: '16px', width: '100%' }}>
                                    <PrimaryButton onClick={() => navigate('/today')}>
                                        {t('homeOpenToday')}
                                    </PrimaryButton>
                                </div>
                            ) : (
                                <div style={{ marginTop: '16px', width: '100%' }}>
                                    <SecondaryButton onClick={() => navigate('/progress')}>
                                        {t('homeViewProgress')}
                                    </SecondaryButton>
                                </div>
                            )}
                        </SystemCard>
                    </section>

                    {/* 7-Day Consistency */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle} style={{ fontFamily: 'var(--font-mono)' }}>SYSTEM TELEMETRY (7D)</h2>
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

import { useState, useEffect } from 'react';
import styles from './HomePage.module.css';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AppShell from '../components/AppShell';
import { Icon } from '../components/Icon';
import { safeRpc } from '../lib/db';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { SystemStatusIndicator } from '../components/ui/SystemStatusIndicator';
import { PrimaryCard } from '../components/ui/PrimaryCard';
import { MetricCard } from '../components/ui/MetricCard';
import { MetricBar } from '../components/ui/MetricBar';
import { Skeleton, SkeletonCard } from '../components/ui/Skeleton';
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

    // Calculate system state based on adherence and pain
    let sysState: 'aligned' | 'compensating' | 'overload' = 'aligned';
    let sysLabel = 'OPTIMAL';
    if (snapshot) {
        if (snapshot.avg_pain_7d >= 6) {
            sysState = 'overload';
            sysLabel = 'HIGH STRAIN';
        } else if (snapshot.avg_pain_7d >= 3 || snapshot.adherence_7d < 50) {
            sysState = 'compensating';
            sysLabel = 'COMPENSATING';
        }
    }

    return (
        <AppShell sublabel="SYSTEM ACTIVE">

            {errorMsg && viewState === 'error' && (
                <div style={{ background: 'rgba(228, 84, 98, 0.1)', color: 'var(--state-alert)', border: '1px solid rgba(228, 84, 98, 0.2)', padding: 'var(--sp-3)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: 'var(--sp-4)' }}>
                    <Icon name="info" size={16} />
                    <span>{errorMsg}</span>
                </div>
            )}

            {viewState === 'loading' ? (
                <div className={styles.dashboardLayout}>
                    {/* 1. System Status Skeleton */}
                    <section className={styles.systemStatusSection}>
                        <div className={styles.nodeIdentity}>
                            <Skeleton height={20} width={120} style={{ marginBottom: 4 }} />
                            <Skeleton height={32} width={200} />
                        </div>
                        <Skeleton height={28} width={150} borderRadius="var(--radius-full)" />
                    </section>

                    {/* 2. Active Mission Skeleton */}
                    <section className={styles.section}>
                        <Skeleton height={20} width={150} style={{ marginBottom: 16 }} />
                        <SkeletonCard style={{ height: 160 }} />
                    </section>

                    {/* 3. System Metrics Skeleton */}
                    <section className={styles.section}>
                        <Skeleton height={20} width={150} style={{ marginBottom: 16 }} />
                        <div className={styles.metricsGrid}>
                            <SkeletonCard style={{ height: 120 }} />
                            <SkeletonCard style={{ height: 120 }} />
                        </div>
                    </section>
                </div>
            ) : snapshot ? (
                <div className={styles.dashboardLayout}>
                    {/* 1. System Status */}
                    <section className={styles.systemStatusSection}>
                        <div className={styles.nodeIdentity}>
                            <h2 className={styles.nodeLabel}>NODE IDENTITY</h2>
                            <h1 className={styles.nodeName}>{profile?.full_name || 'USER'}</h1>
                        </div>
                        <SystemStatusIndicator state={sysState} label={sysLabel} />
                    </section>

                    {/* 2. Active Mission */}
                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>ACTIVE MISSION</h3>
                        <PrimaryCard
                            title={snapshot.today_session ? `PHASE: ${snapshot.today_session.phase.toUpperCase()}` : 'AWAITING INITIALIZATION'}
                            subtitle={snapshot.today_session && snapshot.today_session.state === 'completed' ? 'MISSION ALIGNED AND COMPLETED' : 'ADAPTIVE PROTOCOL READY'}
                        >
                            {!snapshot.today_session ? (
                                <div style={{ marginTop: '16px' }}>
                                    <PrimaryButton onClick={handleGenerateSession} disabled={generating}>
                                        {generating ? <Icon name="autorenew" style={{ animation: 'spin 1s linear infinite' }} /> : 'GENERATE PROTOCOL'}
                                    </PrimaryButton>
                                </div>
                            ) : snapshot.today_session.state === 'completed' ? (
                                <div className={styles.missionCompletedState}>
                                    <Icon name="check_circle" size={32} style={{ color: 'var(--state-success)' }} />
                                </div>
                            ) : (
                                <div style={{ marginTop: '16px' }}>
                                    <PrimaryButton onClick={() => navigate('/mission')}>
                                        EXECUTE ADAPTATION
                                    </PrimaryButton>
                                </div>
                            )}
                        </PrimaryCard>
                    </section>

                    {/* 3. System Metrics */}
                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>SYSTEM METRICS</h3>
                        <div className={styles.metricsGrid}>
                            <MetricCard
                                label="RETURN VOL"
                                value={snapshot.sessions_30d}
                                icon={<Icon name="check_circle" size={16} />}
                            />
                            <MetricCard
                                label="RETURN RATE"
                                value={`${snapshot.adherence_7d}%`}
                                icon={<Icon name="data_usage" size={16} />}
                            >
                                <MetricBar value={snapshot.adherence_7d} color="accent" height={2} />
                            </MetricCard>
                            <MetricCard
                                label="STRAIN"
                                value={`${snapshot.avg_pain_7d}/10`}
                                icon={<Icon name="healing" size={16} />}
                            >
                                <MetricBar
                                    value={snapshot.avg_pain_7d * 10}
                                    color={snapshot.avg_pain_7d >= 6 ? 'alert' : snapshot.avg_pain_7d >= 3 ? 'warning' : 'success'}
                                    height={2}
                                />
                            </MetricCard>
                        </div>
                    </section>

                    {/* 4. Recent Activity */}
                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>RECENT ACTIVITY (7D)</h3>
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
                                                ...(isToday && !done ? { border: '1px solid var(--accent)', background: 'transparent' } :
                                                    done ? { background: 'var(--accent)', color: '#fff' } :
                                                        { background: 'var(--surface-secondary)' })
                                            }}
                                        >
                                            {done && <Icon name="check" size={14} style={{ color: '#fff' }} />}
                                        </div>
                                        <span className={styles.dayLabel} style={isToday ? { color: 'var(--text-primary)', fontWeight: 600 } : {}}>{dayName}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>
            ) : null}
        </AppShell>
    );
}

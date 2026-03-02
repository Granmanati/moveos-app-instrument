import { useEffect, useState } from 'react';
import styles from './ProgressPage.module.css';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AppShell from '../components/AppShell';
import { Icon } from '../components/Icon';

export default function ProgressPage() {
    const { user } = useAuth();

    const [viewState, setViewState] = useState<'loading' | 'error' | 'empty' | 'success'>('loading');
    const [errorMsg, setErrorMsg] = useState('');
    const [activeTab, setActiveTab] = useState<'7d' | '30d'>('7d');

    const [trends, setTrends] = useState<any[]>([]);
    const [metrics, setMetrics] = useState({
        avg7d: 0,
        avg30d: 0,
        todayPain: 0
    });



    const fetchProgress = async () => {
        if (!user) return;
        setViewState('loading');
        setErrorMsg('');

        try {
            // Get pain trends
            const { data, error } = await supabase
                .from('pain_trends')
                .select('pain_avg_7d, pain_avg_30d, updated_at')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false })
                .limit(30);

            if (error) throw error;

            if (!data || data.length === 0) {
                setViewState('empty');
                return;
            }

            const latest = data[0];

            setTrends(data);
            setMetrics({
                avg30d: latest.pain_avg_30d != null ? parseFloat(Number(latest.pain_avg_30d).toFixed(1)) : 0,
                avg7d: latest.pain_avg_7d != null ? parseFloat(Number(latest.pain_avg_7d).toFixed(1)) : 0,
                todayPain: 0 // Omitted until specific daily pain API is exposed 
            });

            setViewState('success');

        } catch (err: any) {
            console.error('Progress error:', err);
            setErrorMsg(err.message || 'Error al cargar el historial.');
            setViewState('error');
        }
    };

    useEffect(() => {
        fetchProgress();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const getTrendIcon = (val: number, prev: number) => {
        if (val > prev) return 'trending_up';
        if (val < prev) return 'trending_down';
        return 'trending_flat';
    };

    const getTrendColor = (val: number, prev: number) => {
        if (val > prev) return styles.danger; // Pain going up is bad
        return styles.accent; // Removing green, using accent blue only
    };

    return (
        <AppShell title="Historial" subtitle="Carga · Tolerancia · Adherencia">
            {viewState === 'loading' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '60vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    <Icon name="autorenew" style={{ animation: 'spin 1s linear infinite' }} size={32} />
                    <p style={{ marginTop: '16px', fontSize: '14px' }}>Procesando métricas...</p>
                </div>
            )}

            {viewState === 'error' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 'var(--sp-8) var(--sp-4)', gap: '16px' }}>
                    <Icon name="error" style={{ color: 'var(--warning)' }} size={48} />
                    <h2 style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: 600 }}>Error de Sistema</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{errorMsg}</p>
                    <button
                        onClick={fetchProgress}
                        style={{ marginTop: '16px', padding: '12px 24px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}
                    >
                        Reintentar
                    </button>
                </div>
            )}

            {viewState === 'empty' && (
                <div className={styles.emptyConsoleState}>
                    <Icon name="monitoring" style={{ color: 'var(--text-muted)' }} size={32} />
                    <h2 style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.5px', fontFamily: 'monospace' }}>SYSTEM ALERTT: INSUFFICIENT DATA</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'monospace' }}>
                        Complete 3 sessions to unlock analytics.
                    </p>
                </div>
            )}

            {viewState === 'success' && (
                <>
                    {/* KPI row */}
                    <div className={styles.kpiRow}>
                        <div className={styles.kpiCard}>
                            <div className={styles.kpiIconWrapper}>
                                <Icon name="event_available" className={styles.accent} />
                            </div>
                            <span className={styles.kpiValue}>{trends.length}</span>
                            <span className={styles.kpiLabel}>Sesiones</span>
                        </div>
                        <div className={styles.kpiCard}>
                            <div className={styles.kpiIconWrapper}>
                                <Icon name="trending_up" className={styles.accent} />
                            </div>
                            <span className={styles.kpiValue}>100%</span>
                            <span className={styles.kpiLabel}>Adherencia</span>
                        </div>
                    </div>

                    {/* Trends */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Tendencia de Dolor</h2>
                        <div className={styles.trendCard}>
                            <div className={styles.trendRow}>
                                <span className={styles.trendLabel}>Dolor Promedio 7d</span>
                                <div className={styles.trendRight}>
                                    <Icon name={getTrendIcon(metrics.avg7d, metrics.avg30d)} className={getTrendColor(metrics.avg7d, metrics.avg30d)} size={18} />
                                    <span className={styles.trendValue}>{metrics.avg7d}/10</span>
                                </div>
                            </div>
                            <div className={styles.trendRow}>
                                <span className={styles.trendLabel}>Dolor Promedio 30d</span>
                                <div className={styles.trendRight}>
                                    <span className={styles.trendValue}>{metrics.avg30d}/10</span>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/* Charts UI Shell */}
                    <section className={styles.section}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 className={styles.sectionTitle}>Análisis del Sistema</h2>
                            <div className={styles.tabContainer}>
                                <button className={`${styles.tabBtn} ${activeTab === '7d' ? styles.tabActive : ''}`} onClick={() => setActiveTab('7d')}>7 Days</button>
                                <button className={`${styles.tabBtn} ${activeTab === '30d' ? styles.tabActive : ''}`} onClick={() => setActiveTab('30d')}>30 Days</button>
                            </div>
                        </div>

                        <div className={styles.chartUI}>
                            <h3 className={styles.chartTitle}>Tendencia de Dolor</h3>
                            <div className={styles.chartLineContainer}>
                                {/* Fake Line Chart rendering using SVG */}
                                <div className={styles.fakeChartLine}>
                                    <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                                        {activeTab === '7d' ? (
                                            <>
                                                <path d="M0,30 L20,28 L40,35 L60,20 L80,25 L100,10" fill="none" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <circle cx="100" cy="10" r="3" fill="var(--danger)" />
                                            </>
                                        ) : (
                                            <>
                                                <path d="M0,10 L20,15 L40,12 L60,25 L80,30 L100,35" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <circle cx="100" cy="35" r="3" fill="var(--accent)" />
                                            </>
                                        )}
                                    </svg>
                                </div>
                                <div className={styles.chartXAxis}>
                                    <span>{activeTab === '7d' ? '-7d' : '-30d'}</span>
                                    <span>Hoy</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.chartUI}>
                            <h3 className={styles.chartTitle}>Volumen de Carga</h3>
                            <div className={styles.chartBarContainer}>
                                {/* Fake bar chart */}
                                <div className={styles.bars}>
                                    {(activeTab === '7d' ? [40, 60, 45, 80, 50, 90, 100] : [70, 85, 95, 100]).map((h, i) => (
                                        <div key={i} className={styles.barWrapper}>
                                            <div className={styles.bar} style={{ height: `${h}%` }}></div>
                                        </div>
                                    ))}
                                </div>
                                <div className={styles.chartXAxis}>
                                    <span>{activeTab === '7d' ? 'L M X J V S D' : 'Semana 1 - Semana 4'}</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </>
            )}
        </AppShell>
    );
}

import { useEffect, useState } from 'react';
import styles from './ProgressPage.module.css';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AppShell from '../components/AppShell';
import { Icon } from '../components/Icon';
import { safeSelect } from '../lib/db';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ProgressPage() {
    const { user } = useAuth();

    const [viewState, setViewState] = useState<'loading' | 'error' | 'empty' | 'success'>('loading');
    const [errorMsg, setErrorMsg] = useState('');
    const [activeTab, setActiveTab] = useState<'7d' | '30d'>('7d');

    const [chartData, setChartData] = useState<any[]>([]);
    const [metrics, setMetrics] = useState({
        avgPain: '0.0',
        completed: 0,
        adherence: 0
    });

    const windowDays = activeTab === '7d' ? 7 : 30;

    const fetchProgress = async () => {
        if (!user) return;
        setViewState('loading');
        setErrorMsg('');

        try {
            const end = new Date();
            const start = new Date();
            start.setDate(end.getDate() - (windowDays - 1));

            const endIso = end.toISOString().split('T')[0];
            const startIso = start.toISOString().split('T')[0];

            // Parallel fetch from the materialized views or regular views
            const qPain = supabase
                .from('v_pain_daily')
                .select('day, pain_avg')
                .gte('day', startIso)
                .lte('day', endIso)
                .eq('user_id', user.id);

            const qAdh = supabase
                .from('v_adherence_daily')
                .select('day, completed')
                .gte('day', startIso)
                .lte('day', endIso)
                .eq('user_id', user.id);

            const [painRes, adhRes] = await Promise.all([
                safeSelect<any[]>(qPain, 'ProgressPain'),
                safeSelect<any[]>(qAdh, 'ProgressAdh')
            ]);

            if (painRes.error) throw painRes.error;
            if (adhRes.error) throw adhRes.error;

            const painData = painRes.data || [];
            const adhData = adhRes.data || [];

            const newData = [];
            let totalPain = 0;
            let painDays = 0;
            let sessionsCompleted = 0;

            for (let i = windowDays - 1; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];

                const p = painData.find(x => x.day === dateStr);
                const a = adhData.find(x => x.day === dateStr);

                const painVal = p && p.pain_avg != null ? Number(p.pain_avg) : null;
                const compVal = a && a.completed ? 1 : 0;

                if (painVal !== null) {
                    totalPain += painVal;
                    painDays++;
                }
                if (compVal === 1) {
                    sessionsCompleted++;
                }

                // Format display date: MM/DD
                const displayDate = `${d.getMonth() + 1}/${d.getDate()}`;

                newData.push({
                    date: dateStr,
                    displayDate,
                    pain: painVal,
                    completed: compVal
                });
            }

            const avgPain = painDays > 0 ? (totalPain / painDays).toFixed(1) : '0.0';
            const adherence = Math.round((sessionsCompleted / windowDays) * 100);

            setChartData(newData);
            setMetrics({
                avgPain,
                completed: sessionsCompleted,
                adherence
            });

            setViewState('success');

        } catch (err: any) {
            console.error('Progress error:', err);
            setErrorMsg(err.message || 'Error loading clinical analytics.');
            setViewState('error');
        }
    };

    useEffect(() => {
        fetchProgress();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, activeTab]);


    // Custom Tooltip for Recharts
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: '#1A1A1F', border: '1px solid #2A2A35', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                    <p style={{ margin: '0 0 4px 0', color: '#8A8F98', fontWeight: 600 }}>{label}</p>
                    <p style={{ margin: 0, color: payload[0].color, fontWeight: 700 }}>
                        {payload[0].name}: {payload[0].value}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <AppShell>
            <div className={styles.page}>
                <header className={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <p style={{ fontSize: '12px', letterSpacing: '1.2px', color: '#2D7CFF', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>MOVE OS</p>
                    </div>
                    <h1 className={styles.title} style={{ marginTop: '8px' }}>Progress</h1>
                </header>

                {viewState === 'loading' && (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '50vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                        <Icon name="autorenew" style={{ animation: 'spin 1s linear infinite' }} size={32} />
                        <p style={{ marginTop: '16px', fontSize: '14px' }}>Aggregating system logs...</p>
                    </div>
                )}

                {viewState === 'error' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 'var(--sp-8) var(--sp-4)', gap: '16px' }}>
                        <Icon name="error" style={{ color: 'var(--warning)' }} size={48} />
                        <h2 style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: 600 }}>System Error</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{errorMsg}</p>
                        <div style={{ marginTop: '16px', width: '200px' }}>
                            <PrimaryButton onClick={fetchProgress}>Retry Connection</PrimaryButton>
                        </div>
                    </div>
                )}

                {viewState === 'success' && (
                    <>
                        {/* Toggle Segment */}
                        <div className={styles.tabContainer} style={{ width: '100%' }}>
                            <button className={`${styles.tabBtn} ${activeTab === '7d' ? styles.tabActive : ''}`} style={{ flex: 1 }} onClick={() => setActiveTab('7d')}>7 Days</button>
                            <button className={`${styles.tabBtn} ${activeTab === '30d' ? styles.tabActive : ''}`} style={{ flex: 1 }} onClick={() => setActiveTab('30d')}>30 Days</button>
                        </div>

                        {/* KPI row */}
                        <div className={styles.kpiRow} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                            <div className={styles.kpiCard}>
                                <div className={styles.kpiIconWrapper} style={{ width: '30px', height: '30px', background: 'rgba(45, 124, 255, 0.08)' }}>
                                    <Icon name="healing" className={styles.accent} size={16} />
                                </div>
                                <span className={styles.kpiValue} style={{ fontSize: '18px' }}>{metrics.avgPain}</span>
                                <span className={styles.kpiLabel}>Avg Pain</span>
                            </div>
                            <div className={styles.kpiCard}>
                                <div className={styles.kpiIconWrapper} style={{ width: '30px', height: '30px', background: 'rgba(45, 124, 255, 0.08)' }}>
                                    <Icon name="event_available" className={styles.accent} size={16} />
                                </div>
                                <span className={styles.kpiValue} style={{ fontSize: '18px' }}>{metrics.completed}</span>
                                <span className={styles.kpiLabel}>Sessions</span>
                            </div>
                            <div className={styles.kpiCard}>
                                <div className={styles.kpiIconWrapper} style={{ width: '30px', height: '30px', background: 'rgba(45, 124, 255, 0.08)' }}>
                                    <Icon name="trending_up" className={styles.accent} size={16} />
                                </div>
                                <span className={styles.kpiValue} style={{ fontSize: '18px' }}>{metrics.adherence}%</span>
                                <span className={styles.kpiLabel}>Adherence</span>
                            </div>
                        </div>

                        {/* Chart 1: Pain Trend */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Pain Trend</h2>
                            <div className={styles.chartUI}>
                                {chartData.filter(d => d.pain !== null).length === 0 ? (
                                    <div className={styles.emptyConsoleState} style={{ padding: 'var(--sp-4)', margin: 0, border: 'none' }}>
                                        <Icon name="monitoring" style={{ color: 'var(--text-muted)' }} size={24} />
                                        <h2 style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, fontFamily: 'monospace' }}>NO PAIN LOGS IN WINDOW</h2>
                                    </div>
                                ) : (
                                    <div style={{ height: '200px', width: '100%', position: 'relative', marginLeft: '-15px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                <XAxis dataKey="displayDate" stroke="#3A3A45" tick={{ fill: '#8A8F98', fontSize: 10 }} tickMargin={10} axisLine={false} tickLine={false} />
                                                <YAxis domain={[0, 10]} stroke="#3A3A45" tick={{ fill: '#8A8F98', fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Line type="monotone" dataKey="pain" name="Pain" stroke="#2D7CFF" strokeWidth={2} dot={{ r: 3, fill: '#0B0B0E', stroke: '#2D7CFF', strokeWidth: 2 }} activeDot={{ r: 5, fill: '#2D7CFF', stroke: '#fff' }} connectNulls={true} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Chart 2: Adherence */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Adherence Volume</h2>
                            <div className={styles.chartUI}>
                                {metrics.completed === 0 ? (
                                    <div className={styles.emptyConsoleState} style={{ padding: 'var(--sp-4)', margin: 0, border: 'none' }}>
                                        <Icon name="event_busy" style={{ color: 'var(--text-muted)' }} size={24} />
                                        <h2 style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, fontFamily: 'monospace' }}>COMPLETE 3 SESSIONS TO UNLOCK</h2>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-1)', marginBottom: '12px' }}>
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>Window Adherence: <strong style={{ color: 'var(--text-primary)' }}>{metrics.adherence}%</strong></span>
                                        </div>
                                        <div style={{ height: '160px', width: '100%', position: 'relative', marginLeft: '-15px' }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={chartData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                                                    <XAxis dataKey="displayDate" stroke="#3A3A45" tick={{ fill: '#8A8F98', fontSize: 10 }} tickMargin={10} axisLine={false} tickLine={false} />
                                                    <YAxis hide domain={[0, 1]} />
                                                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} content={<CustomTooltip />} />
                                                    <Bar dataKey="completed" name="Completed" fill="#2D7CFF" radius={[4, 4, 0, 0]} maxBarSize={12} isAnimationActive={true} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>

                        {/* Bottom Spacer */}
                        <div style={{ height: '100px' }} />
                    </>
                )}
            </div>
        </AppShell>
    );
}

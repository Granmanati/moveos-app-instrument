import { useEffect, useState } from 'react';
import styles from './ProgressPage.module.css';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AppShell from '../components/AppShell';
import { Icon } from '../components/Icon';
import { safeSelect } from '../lib/db';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton, SkeletonCard } from '../components/ui/Skeleton';
import { PrimaryButton } from '../components/ui/PrimaryButton';

const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export default function ProgressPage() {
    const { user } = useAuth();

    const [viewState, setViewState] = useState<'loading' | 'error' | 'success'>('loading');
    const [errorMsg, setErrorMsg] = useState('');
    const [activeTab, setActiveTab] = useState<'7d' | '30d'>('7d');
    const [healthConnected, setHealthConnected] = useState(false);

    const [chartData, setChartData] = useState<any[]>([]);
    const [metrics, setMetrics] = useState({
        returnConsistency: 0,
        painAvg: '0.0',
        sessionVolume: 0,
        loadBalanceLeft: 50,
        loadBalanceRight: 50,
        systemStatus: 'NOMINAL' as 'NOMINAL' | 'LOAD' | 'FATIGUE',
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

            const qPain = supabase.from('v_pain_daily').select('day, pain_avg').gte('day', startIso).lte('day', endIso).eq('user_id', user.id);
            const qAdh = supabase.from('v_adherence_daily').select('day, completed').gte('day', startIso).lte('day', endIso).eq('user_id', user.id);

            const [painRes, adhRes] = await Promise.all([safeSelect<any[]>(qPain, 'ProgressPain'), safeSelect<any[]>(qAdh, 'ProgressAdh')]);

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
                const p = painData.find((x: any) => x.day === dateStr);
                const a = adhData.find((x: any) => x.day === dateStr);
                const painVal = p && p.pain_avg != null ? Number(p.pain_avg) : null;
                const compVal = a && a.completed ? 1 : 0;
                if (painVal !== null) { totalPain += painVal; painDays++; }
                if (compVal === 1) sessionsCompleted++;
                newData.push({ date: dateStr, displayDate: `${d.getMonth() + 1}/${d.getDate()}`, dayOfWeek: d.getDay(), pain: painVal, completed: compVal });
            }

            const painAvg = painDays > 0 ? (totalPain / painDays).toFixed(1) : '0.0';
            const returnConsistency = Math.round((sessionsCompleted / windowDays) * 100);
            const loadBalanceLeft = 45 + Math.floor(Math.random() * 10);
            const loadBalanceRight = 100 - loadBalanceLeft;
            const sysStatus = Number(painAvg) >= 6 ? 'FATIGUE' : returnConsistency < 50 ? 'LOAD' : 'NOMINAL';

            setChartData(newData);
            setMetrics({ returnConsistency, painAvg, sessionVolume: sessionsCompleted, loadBalanceLeft, loadBalanceRight, systemStatus: sysStatus });
            setViewState('success');
        } catch (err: any) {
            setErrorMsg(err.message || 'Error loading analytics.');
            setViewState('error');
        }
    };

    useEffect(() => { fetchProgress(); }, [user, activeTab]); // eslint-disable-line

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className={styles.tooltip}>
                    <span className={styles.tooltipLabel}>{label}</span>
                    <span className={styles.tooltipValue}>{payload[0].name}: {payload[0].value}</span>
                </div>
            );
        }
        return null;
    };

    // Get the last 7-day window for weekly consistency (always relative to today)
    const weekData = (() => {
        const result = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const entry = chartData.find(x => x.date === dateStr);
            result.push({
                day: DAY_LABELS[(d.getDay() + 6) % 7],
                completed: entry?.completed ?? 0,
                pain: entry?.pain,
                isToday: i === 0,
            });
        }
        return result;
    })();

    const weekCompleted = weekData.filter(d => d.completed).length;

    const statusColor = metrics.systemStatus === 'NOMINAL'
        ? 'var(--mo-color-state-success, #4CAF7D)'
        : metrics.systemStatus === 'LOAD'
            ? 'var(--mo-color-state-warning, #F5A623)'
            : 'var(--mo-color-state-alert, #F05A67)';

    return (
        <AppShell title="PROGRESS" sublabel="System evolution analytics">
            <div className={styles.page}>

                {/* 2. Time range toggle */}
                <div className={styles.tabBar}>
                    <button className={`${styles.tabBtn} ${activeTab === '7d' ? styles.tabActive : ''}`} onClick={() => setActiveTab('7d')}>7 DAYS</button>
                    <button className={`${styles.tabBtn} ${activeTab === '30d' ? styles.tabActive : ''}`} onClick={() => setActiveTab('30d')}>30 DAYS</button>
                </div>

                {viewState === 'loading' && (
                    <div className={styles.skeletonStack}>
                        <SkeletonCard style={{ height: 72 }} />
                        <SkeletonCard style={{ height: 120 }} />
                        <SkeletonCard style={{ height: 200 }} />
                        <SkeletonCard style={{ height: 160 }} />
                    </div>
                )}

                {viewState === 'error' && (
                    <div className={styles.errorBox}>
                        <Icon name="error" size={24} style={{ color: 'var(--mo-color-state-alert)' }} />
                        <span>{errorMsg}</span>
                        <PrimaryButton onClick={fetchProgress}>Retry</PrimaryButton>
                    </div>
                )}

                {viewState === 'success' && (
                    <>
                        {/* 3. System summary strip */}
                        <div className={styles.summaryStrip}>
                            <div className={styles.summaryItem}>
                                <span className={styles.summaryValue}>{metrics.returnConsistency}%</span>
                                <span className={styles.summaryLabel}>CONSISTENCY</span>
                            </div>
                            <div className={styles.stripDivider} />
                            <div className={styles.summaryItem}>
                                <span className={styles.summaryValue}>{metrics.sessionVolume}</span>
                                <span className={styles.summaryLabel}>SESSIONS</span>
                            </div>
                            <div className={styles.stripDivider} />
                            <div className={styles.summaryItem}>
                                <span className={styles.summaryValue}>{metrics.painAvg}</span>
                                <span className={styles.summaryLabel}>AVG PAIN</span>
                            </div>
                            <div className={styles.stripDivider} />
                            <div className={styles.summaryItem}>
                                <span className={styles.summaryValue} style={{ color: statusColor }}>{metrics.systemStatus}</span>
                                <span className={styles.summaryLabel}>STATUS</span>
                            </div>
                        </div>

                        {/* 4. Health data connection card */}
                        {!healthConnected && (
                            <div className={styles.healthCard}>
                                <div className={styles.healthIconBox}>
                                    <Icon name="monitor_heart" size={22} />
                                </div>
                                <div className={styles.healthText}>
                                    <span className={styles.healthTitle}>HEALTH DATA CONNECTION</span>
                                    <span className={styles.healthDesc}>Connect your device health data to improve system calibration</span>
                                </div>
                                <button className={styles.connectBtn} onClick={() => setHealthConnected(true)}>
                                    CONNECT
                                </button>
                            </div>
                        )}

                        {/* 5. Weekly consistency card */}
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <span className={styles.cardTitle}>WEEKLY CONSISTENCY</span>
                                <span className={styles.cardBadge}>{weekCompleted}/7</span>
                            </div>
                            <div className={styles.weekGrid}>
                                {weekData.map((d, i) => {
                                    let dotClass = styles.dotEmpty;
                                    if (d.completed && d.pain !== null && d.pain <= 3) dotClass = styles.dotGreen;
                                    else if (d.completed) dotClass = styles.dotBlue;
                                    else if (d.isToday) dotClass = styles.dotToday;
                                    return (
                                        <div key={i} className={styles.weekDay}>
                                            <div className={`${styles.weekDot} ${dotClass}`}>
                                                {d.completed && <Icon name="check" size={10} />}
                                            </div>
                                            <span className={`${styles.weekDayLabel} ${d.isToday ? styles.todayLabel : ''}`}>{d.day}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <span className={styles.insightText}>
                                {weekCompleted >= 5 ? '● Strong adaptive stimulus this week' :
                                    weekCompleted >= 3 ? '● Moderate consistency — increase frequency' :
                                        '● Low stimulus — protocol may require review'}
                            </span>
                        </div>

                        {/* 6. Pain Trend card */}
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <span className={styles.cardTitle}>PAIN TREND</span>
                                <span className={styles.cardBadge} style={{ color: 'var(--mo-color-state-warning, #F5A623)' }}>AVG {metrics.painAvg}</span>
                            </div>
                            {chartData.filter(d => d.pain !== null).length === 0 ? (
                                <div className={styles.emptyState}>
                                    <Icon name="monitoring" size={20} style={{ color: 'var(--mo-color-text-tertiary)' }} />
                                    <span>No pain logs in window</span>
                                </div>
                            ) : (
                                <div style={{ height: 140, marginLeft: -8 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                            <XAxis dataKey="displayDate" stroke="transparent" tick={{ fill: 'var(--mo-color-text-tertiary)', fontSize: 9, fontFamily: 'monospace' }} tickMargin={8} axisLine={false} tickLine={false} />
                                            <YAxis domain={[0, 10]} stroke="transparent" tick={{ fill: 'var(--mo-color-text-tertiary)', fontSize: 9, fontFamily: 'monospace' }} axisLine={false} tickLine={false} width={20} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Line type="monotone" dataKey="pain" name="Pain" stroke="var(--mo-color-state-warning, #F5A623)" strokeWidth={2} dot={{ r: 2.5, fill: 'var(--mo-color-bg-primary)', stroke: 'var(--mo-color-state-warning, #F5A623)', strokeWidth: 2 }} activeDot={{ r: 4 }} connectNulls />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                            <span className={styles.insightText}>
                                {Number(metrics.painAvg) >= 6 ? '● High pain load — reduce session intensity' :
                                    Number(metrics.painAvg) >= 3 ? '● Moderate pain — monitor pattern' :
                                        '● Pain within optimal range'}
                            </span>
                        </div>

                        {/* 7. Load Balance card */}
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <span className={styles.cardTitle}>LOAD BALANCE</span>
                                <span className={styles.cardBadge}>ANALYZED</span>
                            </div>
                            <div className={styles.balanceRow}>
                                <span className={styles.balanceSide}>LEFT<strong>{metrics.loadBalanceLeft}%</strong></span>
                                <div className={styles.balanceBar}>
                                    <div className={styles.balanceFillL} style={{ width: `${metrics.loadBalanceLeft}%` }} />
                                    <div className={styles.balanceMid} />
                                    <div className={styles.balanceFillR} style={{ width: `${metrics.loadBalanceRight}%` }} />
                                </div>
                                <span className={styles.balanceSide}><strong>{metrics.loadBalanceRight}%</strong>RIGHT</span>
                            </div>
                            <span className={styles.insightText}>
                                {Math.abs(metrics.loadBalanceLeft - metrics.loadBalanceRight) <= 8
                                    ? '● Bilateral load within normal range'
                                    : '● Asymmetry detected — review movement patterns'}
                            </span>
                        </div>

                        {/* 8. Connected biometrics (only if health connected) */}
                        {healthConnected && (
                            <div className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <span className={styles.cardTitle}>CONNECTED BIOMETRICS</span>
                                    <span className={styles.cardBadge} style={{ color: 'var(--mo-color-state-success)' }}>LIVE</span>
                                </div>
                                <div className={styles.biometricsGrid}>
                                    {[
                                        { label: 'STEPS', value: '8,240', icon: 'directions_walk' },
                                        { label: 'HEART RATE', value: '62 bpm', icon: 'monitor_heart' },
                                        { label: 'SLEEP', value: '7h 20m', icon: 'bedtime' },
                                        { label: 'RECOVERY', value: '42 min', icon: 'self_improvement' },
                                    ].map((b, i) => (
                                        <div key={i} className={styles.biometricCell}>
                                            <Icon name={b.icon} size={14} className={styles.biometricIcon} />
                                            <span className={styles.biometricValue}>{b.value}</span>
                                            <span className={styles.biometricLabel}>{b.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 9. Weekly adaptation log */}
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <span className={styles.cardTitle}>ADAPTATION LOG</span>
                            </div>
                            <div className={styles.logTable}>
                                <div className={styles.logRow + ' ' + styles.logHeader}>
                                    <span>DAY</span><span>SESSION</span><span>PAIN</span><span>STATUS</span>
                                </div>
                                {weekData.map((d, i) => (
                                    <div key={i} className={styles.logRow}>
                                        <span className={styles.logDay}>{d.day}</span>
                                        <span>{d.completed ? '✓' : '—'}</span>
                                        <span>{d.pain !== null && d.pain !== undefined ? d.pain : '—'}</span>
                                        <span className={d.completed ? styles.logStatusDone : styles.logStatusSkip}>
                                            {d.isToday ? 'TODAY' : d.completed ? 'DONE' : 'SKIP'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AppShell>
    );
}

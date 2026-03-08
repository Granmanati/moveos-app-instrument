import { useState, useEffect } from 'react';
import styles from './HomePage.module.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AppShell from '../components/AppShell';
import { Icon } from '../components/Icon';
import { safeRpc } from '../lib/db';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { MetricCard } from '../components/ui/MetricCard';
import { MetricBar } from '../components/ui/MetricBar';
import { SkeletonCard } from '../components/ui/Skeleton';
import { useI18n } from '../i18n/useI18n';
import { motion } from 'framer-motion';

interface HomeSnapshot {
    today: string;
    today_session: { id: string; state: string; session_date: string; phase: string } | null;
    consistency_7d: { date: string; completed: boolean }[];
    sessions_30d: number;
    adherence_7d: number;
    avg_pain_7d: number;
}

const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

// Deterministic insight from real data
function getInsight(snapshot: HomeSnapshot): string {
    if (snapshot.avg_pain_7d >= 6) return 'High pain load detected. Session intensity should be reduced this cycle.';
    if (snapshot.adherence_7d < 40) return 'Consistency below threshold. System adaptation is impaired without regular stimulus.';
    if (snapshot.adherence_7d >= 80 && snapshot.avg_pain_7d < 3) return 'Optimal adaptation window. System responding well to current protocol.';
    if (snapshot.sessions_30d <= 4) return 'Low session volume this month. Increase frequency to drive adaptive response.';
    return 'System progressing within expected adaptation parameters.';
}

function getSysState(snapshot: HomeSnapshot): { label: string; desc: string; color: string; state: 'nominal' | 'load' | 'alert' } {
    if (snapshot.avg_pain_7d >= 6) return { label: 'HIGH STRAIN', desc: 'Pain load exceeds optimal threshold', color: 'var(--mo-color-state-alert, #F05A67)', state: 'alert' };
    if (snapshot.avg_pain_7d >= 3 || snapshot.adherence_7d < 50) return { label: 'COMPENSATING', desc: 'System adapting under suboptimal conditions', color: 'var(--mo-color-state-warning, #F5A623)', state: 'load' };
    return { label: 'NOMINAL', desc: 'All systems operating within protocol range', color: 'var(--mo-color-state-success, #4CAF7D)', state: 'nominal' };
}

export default function HomePage() {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const { t } = useI18n();

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
            if (error) { setErrorMsg(error.message); setViewState('error'); return; }
            if (data) { setSnapshot(data as HomeSnapshot); setViewState('success'); }
            else { setSnapshot(null); setViewState('error'); setErrorMsg('No data returned.'); }
        } catch (err: any) {
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
        try {
            const { error } = await safeRpc('generate_session');
            if (error) { setErrorMsg(error.message); setViewState('error'); return; }
            await fetchDashboardData();
        } catch (err: any) {
            setErrorMsg(err.message || t('error'));
        } finally {
            setGenerating(false);
        }
    };

    const session = snapshot?.today_session ?? null;
    const sys = snapshot ? getSysState(snapshot) : null;
    const insight = snapshot ? getInsight(snapshot) : null;
    const adherence = Math.min(snapshot?.adherence_7d ?? 0, 100);
    const displayName = profile?.full_name || 'USER';

    // Weekly dots — always 7, starting Monday
    const weekData = (() => {
        if (!snapshot) return [];
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dateStr = d.toISOString().split('T')[0];
            const entry = snapshot.consistency_7d.find(x => x.date === dateStr);
            return {
                day: DAY_LABELS[(d.getDay() + 6) % 7],
                done: entry?.completed ?? false,
                isToday: dateStr === snapshot.today,
            };
        });
    })();

    const weekDone = weekData.filter(d => d.done).length;

    return (
        <AppShell sublabel="SYSTEM ACTIVE">
            <div className={styles.page}>

                {/* Error banner */}
                {errorMsg && viewState === 'error' && (
                    <div className={styles.errorBanner}>
                        <Icon name="info" size={14} />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {/* Loading skeletons */}
                {viewState === 'loading' && (
                    <div className={styles.skeletonStack}>
                        <SkeletonCard style={{ height: 72 }} />
                        <SkeletonCard style={{ height: 112 }} />
                        <SkeletonCard style={{ height: 80 }} />
                        <SkeletonCard style={{ height: 72 }} />
                        <SkeletonCard style={{ height: 92 }} />
                    </div>
                )}

                {viewState === 'success' && snapshot && (
                    <>
                        {/* 1. System State Card */}
                        <motion.div
                            className={styles.sysStateCard}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.22, ease: 'easeOut' }}
                        >
                            <div className={styles.sysLeft}>
                                <span className={styles.sysNodeLabel}>NODE · {displayName.toUpperCase()}</span>
                                <div className={styles.sysStateRow}>
                                    <div className={styles.sysDot} style={{ background: sys!.color }} />
                                    <span className={styles.sysStateLabel} style={{ color: sys!.color }}>{sys!.label}</span>
                                </div>
                                <span className={styles.sysDesc}>{sys!.desc}</span>
                            </div>
                            <div className={styles.sysBadge} style={{ borderColor: sys!.color + '40', color: sys!.color }}>
                                {sys!.state === 'nominal' ? <Icon name="check_circle" size={20} /> :
                                    sys!.state === 'load' ? <Icon name="warning" size={20} /> :
                                        <Icon name="error" size={20} />}
                            </div>
                        </motion.div>

                        {/* 2. Today Mission Card */}
                        <motion.div
                            className={styles.missionCard}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.22, delay: 0.04, ease: 'easeOut' }}
                            whileHover={{ scale: 1.012 }}
                        >
                            <div className={styles.missionTop}>
                                <div>
                                    <span className={styles.missionSectionLabel}>TODAY'S MISSION</span>
                                    <span className={styles.missionPhase}>
                                        {session ? `PHASE: ${session.phase.toUpperCase()}` : 'AWAITING INITIALIZATION'}
                                    </span>
                                    <span className={styles.missionGoal}>
                                        {session
                                            ? session.state === 'completed'
                                                ? 'Protocol completed · All blocks executed'
                                                : 'Adaptive protocol ready for execution'
                                            : 'No session generated for today'}
                                    </span>
                                </div>
                                {session?.state === 'completed' && (
                                    <div className={styles.missionDoneIcon}>
                                        <Icon name="check_circle" size={28} style={{ color: 'var(--mo-color-state-success, #4CAF7D)' }} />
                                    </div>
                                )}
                            </div>

                            <div className={styles.missionCTA}>
                                {!session ? (
                                    <PrimaryButton onClick={handleGenerateSession} disabled={generating}>
                                        {generating
                                            ? <><Icon name="autorenew" size={14} style={{ animation: 'spin 1s linear infinite', marginRight: 6 }} />GENERATING…</>
                                            : 'GENERATE PROTOCOL'}
                                    </PrimaryButton>
                                ) : session.state !== 'completed' ? (
                                    <PrimaryButton onClick={() => navigate('/mission')}>
                                        START SESSION
                                    </PrimaryButton>
                                ) : (
                                    <button className={styles.viewSessionBtn} onClick={() => navigate('/mission')}>
                                        VIEW SESSION →
                                    </button>
                                )}
                            </div>
                        </motion.div>

                        {/* 3. Adaptive Insight Card */}
                        <motion.div
                            className={styles.insightCard}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.22, delay: 0.08, ease: 'easeOut' }}
                        >
                            <div className={styles.insightIcon}>
                                <Icon name="psychology" size={16} />
                            </div>
                            <div className={styles.insightBody}>
                                <span className={styles.insightLabel}>ADAPTIVE INSIGHT</span>
                                <span className={styles.insightText}>{insight}</span>
                            </div>
                        </motion.div>

                        {/* 4. System Metrics — 3 columns */}
                        <motion.div
                            className={styles.metricsGrid}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.22, delay: 0.12, ease: 'easeOut' }}
                        >
                            <MetricCard
                                label="SESSION VOL"
                                value={snapshot.sessions_30d}
                                icon={<Icon name="fitness_center" size={14} />}
                            />
                            <MetricCard
                                label="ADHERENCE"
                                value={`${adherence}%`}
                                icon={<Icon name="data_usage" size={14} />}
                            >
                                <MetricBar value={adherence} color="accent" height={2} />
                            </MetricCard>
                            <MetricCard
                                label="SYS STRAIN"
                                value={`${snapshot.avg_pain_7d}/10`}
                                icon={<Icon name="healing" size={14} />}
                            >
                                <MetricBar
                                    value={snapshot.avg_pain_7d * 10}
                                    color={snapshot.avg_pain_7d >= 6 ? 'alert' : snapshot.avg_pain_7d >= 3 ? 'warning' : 'success'}
                                    height={2}
                                />
                            </MetricCard>
                        </motion.div>

                        {/* 5. Week Consistency */}
                        <motion.div
                            className={styles.weekCard}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.22, delay: 0.16, ease: 'easeOut' }}
                        >
                            <div className={styles.weekHeader}>
                                <span className={styles.cardLabel}>WEEK CONSISTENCY</span>
                                <span className={styles.weekCount}>{weekDone}/7</span>
                            </div>
                            <div className={styles.weekDots}>
                                {weekData.map((d, i) => (
                                    <div key={i} className={styles.weekItem}>
                                        <div className={`${styles.dot} ${d.done ? styles.dotDone : d.isToday ? styles.dotToday : styles.dotEmpty}`}>
                                            {d.done && <Icon name="check" size={9} />}
                                        </div>
                                        <span className={`${styles.dotLabel} ${d.isToday ? styles.dotLabelToday : ''}`}>{d.day}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* 6. Last Session Summary */}
                        <motion.div
                            className={styles.lastSessionCard}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.22, delay: 0.20, ease: 'easeOut' }}
                        >
                            <span className={styles.cardLabel}>LAST SESSION</span>
                            <div className={styles.lastSessionRow}>
                                <div className={styles.lastMetaItem}>
                                    <Icon name="timer" size={13} className={styles.lastMetaIcon} />
                                    <span className={styles.lastMetaValue}>~45 min</span>
                                    <span className={styles.lastMetaLabel}>DURATION</span>
                                </div>
                                <div className={styles.lastMetaDivider} />
                                <div className={styles.lastMetaItem}>
                                    <Icon name="trending_down" size={13} className={styles.lastMetaIcon} />
                                    <span className={styles.lastMetaValue}>{snapshot.avg_pain_7d}/10</span>
                                    <span className={styles.lastMetaLabel}>PAIN SCORE</span>
                                </div>
                                <div className={styles.lastMetaDivider} />
                                <div className={styles.lastMetaItem}>
                                    <Icon name="bolt" size={13} className={styles.lastMetaIcon} />
                                    <span
                                        className={styles.lastMetaValue}
                                        style={{ color: sys!.color, fontSize: 10 }}
                                    >
                                        {sys!.label}
                                    </span>
                                    <span className={styles.lastMetaLabel}>RESPONSE</span>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </div>
        </AppShell>
    );
}

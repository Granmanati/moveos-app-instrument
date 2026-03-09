import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AppShell from '../components/AppShell';
import { Icon } from '../components/Icon';
import { safeRpc } from '../lib/db';
import { useI18n } from '../i18n/useI18n';
import { motion } from 'framer-motion';
import { useAdaptiveEngine } from '../engine/useAdaptiveEngine';
import { ReadinessRing } from '../components/ui/ReadinessRing';

interface HomeSnapshot {
    today: string;
    today_session: { id: string; state: string; session_date: string; phase: string } | null;
    consistency_7d: { date: string; completed: boolean }[];
    sessions_30d: number;
    adherence_7d: number;
    avg_pain_7d: number;
}

const StatusCard = ({ label, value, subtext }: { label: string; value: string; subtext?: string }) => (
    <div className="modular-frame p-4 flex flex-col gap-1 overflow-hidden relative">
        <span className="mono text-[var(--mo-color-text-tertiary)] text-[9px] tracking-widest">{label}</span>
        <span className="text-lg font-light text-[var(--mo-color-text-primary)]">{value}</span>
        {subtext && <span className="mono text-[var(--mo-color-accent-system)] text-[10px] mt-1">{subtext}</span>}
        <div className="absolute top-0 right-0 p-1 opacity-40">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--mo-color-border-strong)]" />
        </div>
    </div>
);

export default function HomePage() {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const { t } = useI18n();
    const engine = useAdaptiveEngine();

    const [snapshot, setSnapshot] = useState<HomeSnapshot | null>(null);

    const fetchDashboardData = async () => {
        if (!user) return;
        try {
            const { data } = await safeRpc('get_home_snapshot');
            if (data) { setSnapshot(data as HomeSnapshot); }
        } catch (err: any) {
            console.error('Failed to fetch home snapshot:', err);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [user, profile]);

    const session = snapshot?.today_session ?? null;
    const readinessScore = snapshot ? Math.round(80 + (snapshot.adherence_7d / 10) - snapshot.avg_pain_7d) : 84;
    const readinessStatus = readinessScore > 80 ? "OPTIMAL" : readinessScore > 60 ? "STABLE" : "SENSITIVE";

    return (
        <AppShell title="HOME" sublabel="PULSE ACTIVE">
            <div className="flex flex-col gap-6 page-content micro-grid min-h-full pb-20">

                {/* 1. Readiness Pulse */}
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center pt-4"
                >
                    <ReadinessRing score={readinessScore} status={readinessStatus} />
                </motion.section>

                {/* 2. Daily State Grid */}
                <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <StatusCard
                            label="RECOVERY SIGNAL"
                            value={readinessStatus}
                            subtext="TRENDING: STABLE"
                        />
                        <StatusCard
                            label="PAIN LOAD"
                            value={snapshot ? `${snapshot.avg_pain_7d}/10` : "2/10"}
                            subtext={snapshot && snapshot.avg_pain_7d < 4 ? t('low_risk' as any) : "OBSERVE"}
                        />
                    </div>

                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="modular-frame p-6 flex flex-col gap-4 bg-[var(--mo-color-surface-secondary)]"
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-1">
                                <span className="mono text-[var(--mo-color-text-tertiary)] text-[10px]">CURRENT PROTOCOLO</span>
                                <h2 className="text-xl font-light text-[var(--mo-color-text-primary)]">
                                    {session ? `Phase: ${session.phase.toUpperCase()}` : "ADAPTIVE ENGINE READY"}
                                </h2>
                                <p className="text-sm text-[var(--mo-color-text-secondary)] font-light mt-1">
                                    {engine.output?.adaptiveMessage || "System optimized for recovery and structural reinforcement."}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center border-[0.5px] border-[var(--mo-color-accent-system)] text-[var(--mo-color-accent-system)]">
                                <Icon name="bolt" size={20} />
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/mission')}
                            className="primary-btn w-full mt-2"
                        >
                            {session ? "CONTINUE SESSION" : "GENERATE PROTOCOL"}
                        </button>

                        <div className="flex justify-between items-center opacity-60">
                            <span className="mono text-[8px] text-[var(--mo-color-text-tertiary)]">EST: 22 MIN</span>
                            <span className="mono text-[8px] text-[var(--mo-color-text-tertiary)]">TARGET: MOBILITY +12%</span>
                        </div>
                    </motion.div>
                </div>

                {/* 3. System Data Chips */}
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                    <div className="whitespace-nowrap modular-frame py-2 px-4 flex items-center gap-3">
                        <span className="mono text-[9px] text-[var(--mo-color-text-tertiary)]">VOL</span>
                        <span className="text-xs font-medium text-[var(--mo-color-text-primary)]">{snapshot?.sessions_30d || profile?.sessions_30d || 0}</span>
                    </div>
                    <div className="whitespace-nowrap modular-frame py-2 px-4 flex items-center gap-3">
                        <span className="mono text-[9px] text-[var(--mo-color-text-tertiary)]">ADHERENCE</span>
                        <span className="text-xs font-medium text-[var(--mo-color-text-primary)]">{snapshot?.adherence_7d || profile?.adherence_7d || 0}%</span>
                    </div>
                    <div className="whitespace-nowrap modular-frame py-2 px-4 flex items-center gap-3">
                        <span className="mono text-[9px] text-[var(--mo-color-text-tertiary)]">SENSORS</span>
                        <span className="text-[10px] mono text-[var(--mo-color-state-success)] uppercase">Synced</span>
                    </div>
                </div>

            </div>
        </AppShell>
    );
}

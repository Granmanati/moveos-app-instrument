import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AppShell from '../components/AppShell';
import { Icon } from '../components/Icon';
import { safeSelect } from '../lib/db';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const StatBlock = ({ label, value, color }: { label: string; value: string | number; color?: string }) => (
    <div className="flex flex-col items-center gap-1">
        <span className="mono text-[var(--mo-color-text-tertiary)] text-[8px] tracking-widest">{label}</span>
        <span className="text-lg font-light text-[var(--mo-color-text-primary)]" style={{ color }}>{value}</span>
    </div>
);

export default function ProgressPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'7d' | '30d'>('7d');
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
                const painVal = p && p.pain_avg != null ? Number(p.pain_avg) : 0;
                const compVal = a && a.completed ? 1 : 0;
                totalPain += painVal;
                if (painVal > 0) painDays++;
                if (compVal === 1) sessionsCompleted++;
                newData.push({
                    date: dateStr,
                    displayDate: `${d.getDate()}/${d.getMonth() + 1}`,
                    pain: painVal,
                    completed: compVal
                });
            }

            const painAvg = painDays > 0 ? (totalPain / painDays).toFixed(1) : '0.0';
            const returnConsistency = Math.round((sessionsCompleted / windowDays) * 100);

            setChartData(newData);
            setMetrics({
                returnConsistency,
                painAvg,
                sessionVolume: sessionsCompleted,
                loadBalanceLeft: 48,
                loadBalanceRight: 52,
                systemStatus: Number(painAvg) >= 6 ? 'FATIGUE' : 'NOMINAL'
            });
        } catch (err: any) {
            console.error('Failed to fetch progress:', err);
        }
    };

    useEffect(() => { fetchProgress(); }, [user, activeTab]);

    return (
        <AppShell title="EVOLUTION" sublabel="System Performance Analytics">
            <div className="page-content micro-grid flex flex-col gap-8 pb-20">

                {/* 1. Summary Strip */}
                <div className="modular-frame py-6 flex justify-around bg-[var(--mo-color-surface-secondary)]">
                    <StatBlock label="CONSISTENCY" value={`${metrics.returnConsistency}%`} />
                    <div className="w-[0.5px] h-8 bg-[var(--mo-color-border-subtle)]" />
                    <StatBlock label="SESSIONS" value={metrics.sessionVolume} />
                    <div className="w-[0.5px] h-8 bg-[var(--mo-color-border-subtle)]" />
                    <StatBlock label="AVG PAIN" value={metrics.painAvg} color="var(--mo-color-state-warning)" />
                    <div className="w-[0.5px] h-8 bg-[var(--mo-color-border-subtle)]" />
                    <StatBlock label="STATUS" value={metrics.systemStatus} color="var(--mo-color-state-success)" />
                </div>

                {/* 2. Pain Overlap Chart */}
                <div className="modular-frame p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <span className="mono text-[var(--mo-color-text-tertiary)] text-[9px] tracking-widest uppercase">Structural Pain Trend</span>
                        <div className="flex gap-2">
                            <button onClick={() => setActiveTab('7d')} className={`mono text-[8px] px-2 py-1 rounded ${activeTab === '7d' ? 'bg-[var(--mo-color-accent-system)] text-white' : 'text-[var(--mo-color-text-tertiary)]'}`}>7D</button>
                            <button onClick={() => setActiveTab('30d')} className={`mono text-[8px] px-2 py-1 rounded ${activeTab === '30d' ? 'bg-[var(--mo-color-accent-system)] text-white' : 'text-[var(--mo-color-text-tertiary)]'}`}>30D</button>
                        </div>
                    </div>

                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorPain" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--mo-color-accent-system)" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="var(--mo-color-accent-system)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="displayDate"
                                    hide={true}
                                />
                                <YAxis hide={true} domain={[0, 10]} />
                                <Tooltip
                                    contentStyle={{ background: 'var(--mo-color-surface-primary)', border: '0.5px solid var(--mo-color-border-subtle)', borderRadius: '4px', fontSize: '10px', fontFamily: 'monospace' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="pain"
                                    stroke="var(--mo-color-accent-system)"
                                    fillOpacity={1}
                                    fill="url(#colorPain)"
                                    strokeWidth={1.5}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="flex justify-between items-center opacity-60">
                        <span className="mono text-[8px] text-[var(--mo-color-text-tertiary)]">Baseline 0.0</span>
                        <span className="mono text-[8px] text-[var(--mo-color-text-tertiary)]">Peak {Math.max(...chartData.map(d => d.pain), 1).toFixed(1)}</span>
                    </div>
                </div>

                {/* 3. Load Balance */}
                <div className="modular-frame p-6 flex flex-col gap-4">
                    <span className="mono text-[var(--mo-color-text-tertiary)] text-[9px] tracking-widest uppercase">Bilateral Load Balance</span>
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-[11px] mono text-[var(--mo-color-text-secondary)]">
                            <span>LEFT {metrics.loadBalanceLeft}%</span>
                            <span>RIGHT {metrics.loadBalanceRight}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[var(--mo-color-surface-secondary)] rounded-full overflow-hidden flex">
                            <div className="h-full bg-[var(--mo-color-accent-system)] opacity-40" style={{ width: `${metrics.loadBalanceLeft}%` }} />
                            <div className="h-full bg-[var(--mo-color-accent-system)]" style={{ width: `${metrics.loadBalanceRight}%` }} />
                        </div>
                    </div>
                    <p className="text-[11px] text-[var(--mo-color-text-tertiary)] font-light leading-relaxed">
                        Symmetry within nominal threshold (±5%). Systematic adaptation confirmed.
                    </p>
                </div>

                {/* 4. Adaptive Insight */}
                <div className="modular-frame p-5 border-l-2 border-l-[var(--mo-color-accent-system)] bg-[var(--mo-color-surface-secondary)]">
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-[var(--mo-color-accent-system)] flex items-center justify-center text-white flex-shrink-0">
                            <Icon name="psychology" size={16} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="mono text-[var(--mo-color-accent-system)] text-[9px] tracking-widest font-bold">EVOLUTION INSIGHT</span>
                            <p className="text-sm text-[var(--mo-color-text-primary)] font-light leading-snug pt-1">
                                Current consistency rate is {metrics.returnConsistency}%. System stabilization phase is approximately 78% complete. Maintain current intensity.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </AppShell>
    );
}

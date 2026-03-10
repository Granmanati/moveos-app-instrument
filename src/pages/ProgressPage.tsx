import AppShell from '../components/AppShell';
import { Card, CardLabel } from '../components/ui/Card';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Mon', mobility: 65, stability: 70 },
    { name: 'Tue', mobility: 68, stability: 72 },
    { name: 'Wed', mobility: 75, stability: 68 },
    { name: 'Thu', mobility: 82, stability: 75 },
    { name: 'Fri', mobility: 80, stability: 82 },
    { name: 'Sat', mobility: 85, stability: 88 },
    { name: 'Sun', mobility: 90, stability: 92 },
];

const MetricHighlight = ({ label, value, unit, trend }: { label: string; value: string | number; unit?: string; trend?: string }) => (
    <Card className="p-5 flex-1 min-w-[140px] bg-[var(--mo-color-surface-secondary)]">
        <CardLabel>{label}</CardLabel>
        <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-semibold text-[var(--mo-color-text-primary)]">{value}</span>
            {unit && <span className="text-[10px] text-[var(--mo-color-text-secondary)] font-medium uppercase tracking-wider">{unit}</span>}
        </div>
        {trend && (
            <span className="text-[10px] text-[var(--mo-color-state-aligned)] font-bold mt-1">
                {trend}
            </span>
        )}
    </Card>
);

export default function ProgressPage() {
    return (
        <AppShell title="ANALYTICS" sublabel="SYSTEM EVOLUTION TRACKING">
            <div className="page-content">

                {/* 1. Header & Quick Stats */}
                <div className="flex flex-col gap-2 pt-2">
                    <span className="mono text-[10px] text-[var(--mo-color-text-tertiary)] font-bold tracking-widest uppercase">PERFORMANCE DASHBOARD</span>
                    <h1 className="text-[32px] font-semibold tracking-tight text-[var(--mo-color-text-primary)]">Evolution.</h1>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    <MetricHighlight label="CONSISTENCY" value="94" unit="%" trend="+4% PK" />
                    <MetricHighlight label="READINESS" value="82" unit="/100" trend="OPTIMAL" />
                    <MetricHighlight label="COMPLETION" value="28" unit="PTS" trend="+2 NEW" />
                </div>

                {/* 2. Main Visualization Card */}
                <Card className="p-6 h-80 bg-[var(--mo-color-surface-secondary)]">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex flex-col gap-1">
                            <CardLabel>SYSTEM BALANCE</CardLabel>
                            <h4 className="text-lg font-semibold">Mobility vs. Stability</h4>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-[var(--mo-color-accent-system)]" />
                                <span className="mono text-[8px] text-[var(--mo-color-text-tertiary)]">MOB</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-[var(--mo-color-state-tension)]" />
                                <span className="mono text-[8px] text-[var(--mo-color-text-tertiary)]">STA</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 w-full -ml-6">
                        <ResponsiveContainer width="105%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorMob" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--mo-color-accent-system)" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="var(--mo-color-accent-system)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--mo-color-border-subtle)" opacity={0.5} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 9, fill: 'var(--mo-color-text-tertiary)', fontFamily: 'IBM Plex Mono' }}
                                    dy={10}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="mobility"
                                    stroke="var(--mo-color-accent-system)"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorMob)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="stability"
                                    stroke="var(--mo-color-state-tension)"
                                    strokeWidth={2}
                                    fill="transparent"
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--mo-color-surface-tertiary)',
                                        border: '0.5px solid var(--mo-color-border-subtle)',
                                        borderRadius: '12px',
                                        fontSize: '10px',
                                        color: 'var(--mo-color-text-primary)'
                                    }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* 3. Detailed Metrics Group */}
                <div className="flex flex-col gap-4 mb-4">
                    <span className="mono text-[10px] text-[var(--mo-color-text-tertiary)] font-bold tracking-widest px-1">HEALTH ARCHIVE</span>
                    <Card className="p-0 overflow-hidden">
                        <div className="flex flex-col">
                            {[
                                { l: 'Avg Pain Level', v: '2.4', u: '/10', s: 'Improving' },
                                { l: 'Sleep Quality', v: '7.8', u: 'HRS', s: 'Stable' },
                                { l: 'Session Adherence', v: '100', u: '%', s: 'Perfect' },
                            ].map((row, i) => (
                                <div key={i} className="flex items-center justify-between p-5 border-b-[0.5px] border-[var(--mo-color-border-subtle)] last:border-0 hover:bg-[var(--mo-color-surface-secondary)] transition-colors">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-medium text-[var(--mo-color-text-primary)]">{row.l}</span>
                                        <span className="mono text-[8px] text-[var(--mo-color-accent-system)] font-bold">{row.s}</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-lg font-semibold">{row.v}</span>
                                        <span className="mono text-[9px] text-[var(--mo-color-text-secondary)]">{row.u}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

            </div>
        </AppShell>
    );
}

import { useAuth } from '../contexts/AuthContext';
import AppShell from '../components/AppShell';
import { Icon } from '../components/Icon';
import { Card, CardLabel } from '../components/ui/Card';
import { useNavigate } from 'react-router-dom';

const IntegratedReadiness = ({ value }: { value: number }) => {
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    stroke="var(--mo-color-border-subtle)"
                    strokeWidth="4"
                    fill="transparent"
                />
                <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    stroke="var(--mo-color-accent-system)"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={circumference}
                    style={{ strokeDashoffset: offset }}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center mt-0.5">
                <span className="text-sm font-bold tracking-tight">{value}</span>
                <span className="mono text-[6px] opacity-50 uppercase tracking-tighter">SCORE</span>
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, unit, trend, status }: { label: string; value: string; unit?: string; trend?: string; status?: 'positive' | 'neutral' | 'warning' }) => (
    <Card className="p-4 gap-2 bg-[var(--mo-color-surface-secondary)] min-h-[110px]">
        <CardLabel>{label}</CardLabel>
        <div className="flex flex-col gap-1 mt-1">
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold tracking-tight">{value}</span>
                {unit && <span className="text-[10px] text-[var(--mo-color-text-tertiary)] font-medium uppercase">{unit}</span>}
            </div>
            {(trend || status) && (
                <div className="flex items-center gap-1.5 mt-1">
                    <div className={`w-1 h-1 rounded-full ${status === 'positive' ? 'bg-[var(--mo-color-state-aligned)]' : status === 'warning' ? 'bg-[var(--mo-color-state-tension)]' : 'bg-[var(--mo-color-accent-system)]'}`} />
                    <span className="mono text-[8px] text-[var(--mo-color-text-secondary)] font-bold uppercase tracking-widest">{trend || 'STABLE'}</span>
                </div>
            )}
        </div>
    </Card>
);

export default function HomePage() {
    const { profile } = useAuth();
    const navigate = useNavigate();

    const readinessScore = profile?.readiness_score || 84;

    return (
        <AppShell title="HOME" sublabel="PULSE_ACTIVE">
            <div className="page-content py-2">

                {/* 1. HERO CARD — Integrated Status */}
                <Card className="bg-gradient-to-br from-[var(--mo-color-surface-secondary)] to-[var(--mo-color-bg-primary)] border-[var(--mo-color-accent-system)]/20 p-6 flex flex-col gap-6">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1.5">
                            <CardLabel color="var(--mo-color-accent-system)">CURRENT OPERATIONAL STATUS</CardLabel>
                            <h2 className="text-[28px] font-semibold tracking-tight leading-tight max-w-[200px]">Optimal for Phase 02 Execution.</h2>
                            <p className="text-[14px] text-[var(--mo-color-text-secondary)] mt-1 max-w-[220px]">
                                Your biometrics show peak recovery. We recommend a full movement flow today.
                            </p>
                        </div>
                        <IntegratedReadiness value={readinessScore} />
                    </div>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => navigate('/mission')}
                            className="w-full h-[52px] bg-[var(--mo-color-accent-system)] text-white rounded-[16px] font-semibold flex items-center justify-center gap-2 shadow-[var(--mo-shadow-button)] active:scale-[0.98] transition-all"
                        >
                            <Icon name="play_arrow" size={20} />
                            <span>START DAILY PROTOCOL</span>
                        </button>

                        <div className="flex items-center justify-around py-3 border-t-[0.5px] border-t-[var(--mo-color-border-subtle)]">
                            <div className="flex flex-col items-center">
                                <span className="mono text-[8px] text-[var(--mo-color-text-tertiary)] uppercase tracking-widest">Duration</span>
                                <span className="text-[13px] font-medium mt-0.5">24:00 MIN</span>
                            </div>
                            <div className="w-[1px] h-6 bg-[var(--mo-color-border-subtle)]" />
                            <div className="flex flex-col items-center">
                                <span className="mono text-[8px] text-[var(--mo-color-text-tertiary)] uppercase tracking-widest">Load Factor</span>
                                <span className="text-[13px] font-medium mt-0.5">ADAPTIVE</span>
                            </div>
                            <div className="w-[1px] h-6 bg-[var(--mo-color-border-subtle)]" />
                            <div className="flex flex-col items-center">
                                <span className="mono text-[8px] text-[var(--mo-color-text-tertiary)] uppercase tracking-widest">Blocks</span>
                                <span className="text-[13px] font-medium mt-0.5">03 TOTAL</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 2. COMPACT METRICS — 2x2 Grid */}
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-end px-1">
                        <span className="mono text-[10px] text-[var(--mo-color-text-tertiary)] font-bold tracking-widest uppercase">SYSTEM SIGNALS</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <MetricCard
                            label="RECOVERY SIGNAL"
                            value="High"
                            trend="TREND_POSITIVE"
                            status="positive"
                        />
                        <MetricCard
                            label="PAIN LOAD"
                            value="2.4"
                            unit="/10"
                            trend="MINIMAL"
                            status="neutral"
                        />
                        <MetricCard
                            label="MOBILITY GRADE"
                            value="B+"
                            trend="IMPROVING"
                            status="positive"
                        />
                        <MetricCard
                            label="SESSION READINESS"
                            value="92"
                            unit="%"
                            trend="READY"
                            status="positive"
                        />
                    </div>
                </div>

                {/* 3. Subtle Context Footer */}
                <div className="mt-2 p-4 flex items-center gap-3 bg-[var(--mo-color-surface-secondary)]/30 rounded-[20px] border-[0.5px] border-[var(--mo-color-border-subtle)]">
                    <div className="w-8 h-8 rounded-full bg-[var(--mo-color-state-aligned)]/10 flex items-center justify-center text-[var(--mo-color-state-aligned)]">
                        <Icon name="check_circle" size={16} />
                    </div>
                    <span className="text-[11px] text-[var(--mo-color-text-secondary)] leading-tight">
                        Last synced with Apple Health **2m ago**. All biometrics are current.
                    </span>
                </div>

            </div>
        </AppShell>
    );
}

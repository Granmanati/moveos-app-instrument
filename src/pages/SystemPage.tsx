import AppShell from '../components/AppShell';
import { Icon } from '../components/Icon';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Card, CardLabel } from '../components/ui/Card';

const SettingRow = ({ icon, label, sub, action, toggle }: { icon: string; label: string; sub?: string; action?: () => void; toggle?: boolean }) => (
    <div
        onClick={action}
        className="flex items-center justify-between p-5 border-b-[0.5px] border-[var(--mo-color-border-subtle)] last:border-0 hover:bg-[var(--mo-color-surface-secondary)] transition-colors cursor-pointer group"
    >
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--mo-color-surface-secondary)] border-[0.5px] border-[var(--mo-color-border-subtle)] flex items-center justify-center text-[var(--mo-color-text-secondary)] group-hover:border-[var(--mo-color-accent-system)] transition-colors">
                <Icon name={icon} size={20} />
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-semibold text-[var(--mo-color-text-primary)]">{label}</span>
                {sub && <span className="mono text-[8px] text-[var(--mo-color-text-tertiary)] uppercase tracking-widest mt-0.5">{sub}</span>}
            </div>
        </div>
        {toggle !== undefined ? (
            <div className={`w-10 h-5 rounded-full p-1 transition-colors ${toggle ? 'bg-[var(--mo-color-accent-system)]' : 'bg-[var(--mo-color-border-strong)]'}`}>
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${toggle ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
        ) : (
            <Icon name="chevron_right" size={16} className="text-[var(--mo-color-text-tertiary)]" />
        )}
    </div>
);

export default function SystemPage() {
    const { user, profile, tier, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const displayName = profile?.full_name || user?.user_metadata?.full_name || 'NODE_01';

    return (
        <AppShell title="SYSTEM" sublabel="NODE IDENTITY & CONFIGURATION">
            <div className="page-content">

                {/* 1. Header & Identity */}
                <div className="flex flex-col gap-2 pt-2">
                    <span className="mono text-[10px] text-[var(--mo-color-text-tertiary)] font-bold tracking-widest uppercase">NODE REGISTRY</span>
                    <h1 className="text-[32px] font-semibold tracking-tight text-[var(--mo-color-text-primary)]">Profile.</h1>
                </div>

                <Card className="bg-[var(--mo-color-surface-secondary)] p-6">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl border-[0.5px] border-[var(--mo-color-border-strong)] p-1.5 flex items-center justify-center">
                            <div className="w-full h-full rounded-xl bg-[var(--mo-color-border-subtle)] flex items-center justify-center text-[var(--mo-color-text-tertiary)]">
                                <Icon name="person" size={32} />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <CardLabel color="var(--mo-color-accent-system)">ACTIVE NODE</CardLabel>
                            <h3 className="text-xl font-semibold tracking-tight">{displayName}</h3>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--mo-color-state-aligned)]" />
                                <span className="mono text-[8px] text-[var(--mo-color-text-tertiary)] font-bold uppercase">SECURE_SYNCED</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 2. System Configuration */}
                <div className="flex flex-col gap-4">
                    <span className="mono text-[10px] text-[var(--mo-color-text-tertiary)] font-bold tracking-widest px-1">CONFIGURATION</span>
                    <Card className="p-0 overflow-hidden">
                        <SettingRow
                            icon="dark_mode"
                            label="Theme Mode"
                            sub={theme === 'dark' ? "HIGH_CONTRAST_DARK" : "CALM_LIGHT"}
                            action={toggleTheme}
                            toggle={theme === 'dark'}
                        />
                        <SettingRow
                            icon="notifications"
                            label="System Alerts"
                            sub="REAL_TIME RECOVERY SIGNALS"
                            toggle={true}
                        />
                        <SettingRow
                            icon="shield"
                            label="Privacy & Security"
                            sub="ENCRYPTED BIOMETRICS"
                            action={() => { }}
                        />
                    </Card>
                </div>

                {/* 3. Subscription Tier */}
                <div className="flex flex-col gap-4">
                    <span className="mono text-[10px] text-[var(--mo-color-text-tertiary)] font-bold tracking-widest px-1">NETWORK TIER</span>
                    <Card className="p-6 bg-gradient-to-br from-[var(--mo-color-surface-secondary)] to-[var(--mo-color-bg-primary)] border-[var(--mo-color-accent-system)]/30">
                        <div className="flex justify-between items-center w-full">
                            <div className="flex flex-col gap-1">
                                <CardLabel color="var(--mo-color-accent-system)">{tier === 'premium' ? "PREMIUM_ACTIVE" : "FREE_NODE"}</CardLabel>
                                <h4 className="text-lg font-semibold">{tier === 'premium' ? "Unlimited Access" : "Basic Adaptive"}</h4>
                            </div>
                            <button
                                onClick={() => navigate('/pricing')}
                                className="h-10 px-6 bg-[var(--mo-color-accent-system)] text-white text-xs font-bold rounded-xl active:scale-[0.95] transition-transform"
                            >
                                UPGRADE
                            </button>
                        </div>
                    </Card>
                </div>

                {/* 4. Logout / Deactivate */}
                <div className="flex flex-col items-center gap-4 pt-4 mb-8">
                    <button
                        onClick={signOut}
                        className="w-full h-[52px] modular-frame flex items-center justify-center gap-2 text-[var(--mo-color-text-secondary)] hover:text-[var(--mo-color-state-alert)] transition-colors"
                    >
                        <Icon name="logout" size={18} />
                        <span className="mono text-[10px] font-bold tracking-widest">DEACTIVATE NODE</span>
                    </button>
                    <span className="mono text-[8px] text-[var(--mo-color-text-tertiary)] tracking-[0.2em]">MOVE OS v1.4.2 · CORE_BUILD</span>
                </div>

            </div>
        </AppShell>
    );
}

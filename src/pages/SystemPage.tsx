import { useState } from 'react';
import AppShell from '../components/AppShell';
import { Icon } from '../components/Icon';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const StatCell = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex flex-col gap-1">
        <span className="mono text-[var(--mo-color-text-tertiary)] text-[8px] tracking-widest uppercase">{label}</span>
        <span className="text-lg font-light text-[var(--mo-color-text-primary)]">{value}</span>
    </div>
);

const SettingRow = ({ icon, label, sub, action, toggle }: { icon: string; label: string; sub?: string; action?: () => void; toggle?: boolean }) => (
    <div
        onClick={action}
        className="modular-frame p-4 flex items-center justify-between bg-[var(--mo-color-surface-primary)] cursor-pointer hover:bg-[var(--mo-color-surface-secondary)] transition-colors group"
    >
        <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-[var(--mo-color-bg-primary)] border-[0.5px] border-[var(--mo-color-border-subtle)] flex items-center justify-center text-[var(--mo-color-text-secondary)]">
                <Icon name={icon} size={18} />
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-medium text-[var(--mo-color-text-primary)]">{label}</span>
                {sub && <span className="mono text-[9px] text-[var(--mo-color-text-tertiary)] uppercase tracking-wider">{sub}</span>}
            </div>
        </div>
        {toggle !== undefined ? (
            <div className={`w-10 h-5 rounded-full p-1 transition-colors ${toggle ? 'bg-[var(--mo-color-accent-system)]' : 'bg-[var(--mo-color-border-strong)]'}`}>
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${toggle ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
        ) : (
            <Icon name="chevron_right" size={16} className="text-[var(--mo-color-text-tertiary)] group-hover:text-[var(--mo-color-text-secondary)] transition-colors" />
        )}
    </div>
);

export default function SystemPage() {
    const { user, profile, tier, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const displayName = profile?.full_name || user?.user_metadata?.full_name || 'NODE_01';

    return (
        <AppShell title="SYSTEM" sublabel="Node Configuration & Identity">
            <div className="page-content micro-grid flex flex-col gap-8 pb-20">

                {/* 1. Node Identity */}
                <div className="modular-frame bg-[var(--mo-color-surface-secondary)] p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                            <span className="mono text-[var(--mo-color-text-tertiary)] text-[9px] tracking-widest">IDENTITY BLOCK</span>
                            <h2 className="text-2xl font-light text-[var(--mo-color-text-primary)]">{displayName}</h2>
                            <span className="mono text-[var(--mo-color-accent-system)] text-[10px] font-bold">PHASE: ADAPTIVE</span>
                        </div>
                        <div className="w-14 h-14 rounded-full border-[0.5px] border-[var(--mo-color-border-strong)] flex items-center justify-center p-1">
                            <div className="w-full h-full rounded-full bg-[var(--mo-color-border-subtle)] overflow-hidden flex items-center justify-center text-[var(--mo-color-text-tertiary)]">
                                <Icon name="person" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-4 border-t-[0.5px] border-t-[var(--mo-color-border-subtle)]">
                        <StatCell label="EXECUTION" value={profile?.sessions_30d || 0} />
                        <StatCell label="ADHERENCE" value={`${profile?.adherence_7d || 0}%`} />
                        <StatCell label="PAIN IDX" value={`${profile?.avg_pain_7d || 0}/10`} />
                    </div>
                </div>

                {/* 2. System Settings */}
                <div className="flex flex-col gap-4">
                    <span className="mono text-[var(--mo-color-text-tertiary)] text-[9px] tracking-widest px-1">CONFIGURATION</span>
                    <SettingRow
                        icon="dark_mode"
                        label="Theme Mode"
                        sub={theme === 'dark' ? "HIGH CONTRAST DARK" : "CALM LIGHT"}
                        action={toggleTheme}
                        toggle={theme === 'dark'}
                    />
                    <SettingRow
                        icon="notifications"
                        label="System Alerts"
                        sub="REAL-TIME RECOVERY SIGNALS"
                        toggle={true}
                    />
                    <SettingRow
                        icon="security"
                        label="Privacy & Security"
                        sub="ENCRYPTED BIOMETRICS"
                        action={() => { }}
                    />
                </div>

                {/* 3. Account & Subscription */}
                <div className="flex flex-col gap-4">
                    <span className="mono text-[var(--mo-color-text-tertiary)] text-[9px] tracking-widest px-1">NETWORK TIER</span>
                    <div className="modular-frame p-6 flex flex-col gap-4 bg-[var(--mo-color-surface-primary)]">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-medium text-[var(--mo-color-text-primary)]">
                                    {tier === 'premium' ? "PREMIUM ACCESS" : "FREE TIER"}
                                </span>
                                <span className="mono text-[9px] text-[var(--mo-color-text-tertiary)] tracking-widest">
                                    {tier === 'premium' ? "ALL PROTOCOLS UNLOCKED" : "LIMITED ADAPTIVE ENGINE"}
                                </span>
                            </div>
                            <button
                                onClick={() => navigate('/pricing')}
                                className="ghost-btn"
                            >
                                UPGRADE
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4. Actions */}
                <div className="flex flex-col gap-3 pt-4">
                    <button
                        onClick={signOut}
                        className="w-full modular-frame py-4 flex items-center justify-center gap-2 border-[var(--mo-color-border-strong)] text-[var(--mo-color-text-tertiary)] hover:text-[var(--mo-color-state-alert)] transition-colors"
                    >
                        <Icon name="logout" size={16} />
                        <span className="mono text-[10px] font-bold tracking-widest">DEACTIVATE NODE</span>
                    </button>
                    <p className="text-center mono text-[8px] text-[var(--mo-color-text-tertiary)]">
                        MOVE OS v1.4.2 · CLOUD SYNCED
                    </p>
                </div>

            </div>
        </AppShell>
    );
}

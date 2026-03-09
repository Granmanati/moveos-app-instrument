import { useState } from 'react';
import styles from './SystemPage.module.css';
import AppShell from '../components/AppShell';
import { Icon } from '../components/Icon';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MetricCard } from '../components/ui/MetricCard';

export default function SystemPage() {
    const { user, profile, tier, subscriptionStatus, trialDaysLeft } = useAuth();
    const navigate = useNavigate();

    const [stats] = useState({
        sessions: profile?.sessions_30d || 0,
        adherence: profile?.adherence_7d || 0,
        pain: profile?.avg_pain_7d || 0,
    });

    const displayName = profile?.full_name || user?.user_metadata?.full_name || 'System User';
    const displayAdherence = Math.min(stats.adherence, 100);

    const planLabel = tier !== 'free'
        ? `${tier.toUpperCase()} PLAN`
        : subscriptionStatus === 'trialing'
            ? 'TRIAL'
            : 'FREE';

    const statusLabel = tier !== 'free'
        ? 'ACTIVE'
        : subscriptionStatus === 'trialing'
            ? `${trialDaysLeft}D REMAINING`
            : 'LIMITED';

    const nextBilling = tier !== 'free'
        ? 'Apr 8, 2026'
        : subscriptionStatus === 'trialing'
            ? `Trial ends in ${trialDaysLeft} days`
            : '—';

    return (
        <AppShell title="SYSTEM" sublabel="Node identity">
            <div className={styles.page}>

                {/* Node Identity */}
                <div className={styles.identityBlock}>
                    <div className={styles.avatarPlaceholder}>
                        <Icon name="person" size={24} />
                    </div>
                    <div className={styles.identityData}>
                        <h2 className={styles.nodeName}>{displayName}</h2>
                        <span className={styles.memberSince}>MEMBER SINCE {new Date().getFullYear()}</span>
                        <span className={styles.phaseLabel}>PHASE: ADAPTIVE</span>
                    </div>
                    <span className={`${styles.planBadge} ${tier !== 'free' ? styles.planActive : ''}`}>
                        {planLabel}
                    </span>
                </div>

                {/* System Metrics — 3 column grid */}
                <div className={styles.metricsGrid}>
                    <MetricCard value={stats.sessions.toString()} label="EXECUTION" />
                    <MetricCard value={`${displayAdherence}%`} label="ADHERENCE" />
                    <MetricCard value={`${stats.pain}/10`} label="PAIN IDX" />
                </div>

                {/* Subscription card */}
                <div className={styles.subscriptionCard}>
                    <div className={styles.subRow}>
                        <span className={styles.subLabel}>Plan</span>
                        <span className={styles.subValue}>{planLabel}</span>
                    </div>
                    <div className={styles.subRow}>
                        <span className={styles.subLabel}>Status</span>
                        <span className={`${styles.subValue} ${tier !== 'free' ? styles.statusActive : styles.statusFree}`}>{statusLabel}</span>
                    </div>
                    <div className={styles.subRow}>
                        <span className={styles.subLabel}>Next billing</span>
                        <span className={styles.subValue}>{nextBilling}</span>
                    </div>
                    <button className={styles.manageBtn} onClick={() => navigate('/pricing')}>
                        MANAGE PLAN
                    </button>
                </div>

                {/* Settings entry */}
                <div className={styles.settingsEntry} onClick={() => navigate('/settings')}>
                    <div className={styles.entryInfo}>
                        <div className={styles.entryIconBox}>
                            {/* gear icon via SVG since lucide-react may not be imported */}
                            <Icon name="settings" size={20} />
                        </div>
                        <div className={styles.entryText}>
                            <span className={styles.entryTitle}>Settings</span>
                            <span className={styles.entryDesc}>Manage system configuration</span>
                        </div>
                    </div>
                    <Icon name="arrow_forward" size={18} className={styles.entryArrow} />
                </div>

            </div>
        </AppShell>
    );
}

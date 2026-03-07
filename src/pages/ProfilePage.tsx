import { useState } from 'react';
import styles from './ProfilePage.module.css';
import AppShell from '../components/AppShell';
import { Icon } from '../components/Icon';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import { PrimaryCard } from '../components/ui/PrimaryCard';
import { MetricCard } from '../components/ui/MetricCard';

export default function ProfilePage() {
    const { user, profile, tier, subscriptionStatus, trialDaysLeft } = useAuth();
    const navigate = useNavigate();

    const [stats] = useState({ sessions: profile?.sessions_30d || 0, adherence: profile?.adherence_7d || 0, pain: profile?.avg_pain_7d || 0 });

    const displayName = profile?.full_name || user?.user_metadata?.full_name || 'System User';
    const displayAdherence = Math.min(stats.adherence, 100);

    const subscriptionText = tier !== 'free'
        ? `${tier.toUpperCase()} PLAN ACTIVE`
        : (subscriptionStatus === 'trialing' ? `${trialDaysLeft} DAYS REMAINING` : 'FREE TIER');

    return (
        <AppShell title="PROFILE" sublabel="Node identity">
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
                </div>

                {/* System Summary */}
                <div className={styles.metricsGrid}>
                    <MetricCard value={stats.sessions.toString()} label="SESSIONS" />
                    <MetricCard value={`${displayAdherence}%`} label="ADHERENCE" />
                    <MetricCard value={`${stats.pain}/10`} label="AVG PAIN" />
                </div>

                {/* Subscription block */}
                <div className={styles.section}>
                    <PrimaryCard
                        title="SUBSCRIPTION STATUS"
                        subtitle={subscriptionText}
                    >
                        <div style={{ marginTop: 'var(--mo-space-4)' }}>
                            <button
                                className={styles.manageBtn}
                                onClick={() => navigate('/pricing')}
                            >
                                MANAGE PLAN
                            </button>
                        </div>
                    </PrimaryCard>
                </div>

                {/* Settings entry card */}
                <div className={styles.section}>
                    <div className={styles.settingsEntry} onClick={() => navigate('/settings')}>
                        <div className={styles.entryInfo}>
                            <div className={styles.entryIconBox}>
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

            </div>
        </AppShell>
    );
}

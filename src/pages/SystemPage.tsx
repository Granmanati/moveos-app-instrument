import { useState } from 'react';
import styles from './SystemPage.module.css';
import AppShell from '../components/AppShell';
import { Icon } from '../components/Icon';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/useI18n';
import type { Lang } from '../i18n/strings';

import { supabase } from '../lib/supabase';

export default function SystemPage() {
    const { user, profile, tier, subscriptionStatus, trialDaysLeft, startTrial, setLanguage, lang } = useAuth();
    const { t } = useI18n();
    const navigate = useNavigate();
    const [loggingOut, setLoggingOut] = useState(false);
    const [startingTrial, setStartingTrial] = useState(false);
    const [stats] = useState({ sessions: profile?.sessions_30d || 0, adherence: profile?.adherence_7d || 0, pain: profile?.avg_pain_7d || 0 });

    const displayName = profile?.full_name || user?.user_metadata?.full_name || 'System User';

    const handleLogout = async () => {
        try {
            setLoggingOut(true);
            await supabase.auth.signOut();
            window.location.replace('/auth');
        } catch (error) {
            console.error('Logout error:', error);
            setLoggingOut(false);
        }
    };

    const handleStartTrial = async () => {
        setStartingTrial(true);
        try {
            await startTrial();
        } catch (err) {
            console.error(err);
        } finally {
            setStartingTrial(false);
        }
    };

    const handleLangChange = async (newLang: Lang) => {
        await setLanguage(newLang);
    };

    const renderSubscriptionCard = () => {
        if (subscriptionStatus === 'trialing') {
            return (
                <div className={styles.activePlanCard}>
                    <div className={styles.upgradeHeader}>
                        <Icon name="workspace_premium" style={{ color: '#FFB020' }} size={22} />
                        <h2 className={styles.upgradeTitle}>{t('profileSubscription')}</h2>
                        <span className={styles.trialBadge}>{t('profileTrialing')}</span>
                    </div>
                    <p className={styles.trialCountdown}>
                        <strong>{trialDaysLeft}</strong> {t('profileTrialDaysLeft')}
                    </p>
                    <button className={styles.manageBtn} onClick={() => navigate('/pricing')}>
                        {t('profileViewPlans')}
                    </button>
                </div>
            );
        }

        if (tier === 'free') {
            return (
                <div className={styles.upgradeCard}>
                    <div className={styles.upgradeHeader}>
                        <Icon name="workspace_premium" style={{ color: '#FFB020' }} size={22} />
                        <h2 className={styles.upgradeTitle}>{t('profileUnlockPremium')}</h2>
                    </div>
                    <ul className={styles.upgradeList}>
                        <li>{t('profileFeatureLibrary')}</li>
                        <li>{t('profileFeatureEngine')}</li>
                        <li>{t('profileFeatureInsights')}</li>
                    </ul>
                    <button className={styles.upgradeBtn} onClick={handleStartTrial} disabled={startingTrial}>
                        {startingTrial ? t('loading') : t('profileStartTrial')}
                    </button>
                    <button className={styles.ghostBtn} onClick={() => navigate('/pricing')}>
                        {t('profileViewPlans')}
                    </button>
                </div>
            );
        }

        // Active premium/pro
        return (
            <div className={styles.activePlanCard}>
                <div className={styles.upgradeHeader}>
                    <Icon name="workspace_premium" style={{ color: 'var(--accent)' }} size={22} />
                    <h2 className={styles.upgradeTitle}>{t('profileSubscription')}</h2>
                    <span className={styles.statusLine}>{t('profileActive')}</span>
                </div>
                <button className={styles.manageBtn} onClick={() => navigate('/pricing')}>
                    {t('profileManageSubscription')}
                </button>
            </div>
        );
    };

    return (
        <AppShell sublabel="NODE CONFIGURATION">
            <div className={styles.page} style={{ paddingTop: 'var(--sp-6)' }}>
                {/* 1. Identity & Firmware */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>SYSTEM IDENTITY</h2>
                    <div className={styles.settingsList}>
                        <div className={styles.settingsRow} style={{ cursor: 'default' }}>
                            <div className={styles.settingsIcon}><Icon name="terminal" size={20} /></div>
                            <span className={styles.settingsLabel}>ACTIVE NODE</span>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{displayName}</span>
                        </div>
                        <div className={styles.settingsRow} style={{ cursor: 'default' }}>
                            <div className={styles.settingsIcon}><Icon name="memory" size={20} /></div>
                            <span className={styles.settingsLabel}>FIRMWARE</span>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{t('profileVersion')}</span>
                        </div>
                    </div>
                </section>

                {/* 2. System Telemetry (Stats) */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>TELEMETRY</h2>
                    <div className={styles.statsRow}>
                        <div className={styles.statCard}>
                            <div className={styles.statIconBadge}><Icon name="data_usage" className={styles.statIcon} size={20} /></div>
                            <span className={styles.statValue}>{stats.sessions}</span>
                            <span className={styles.statLabel}>{t('profileSessions')}</span>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIconBadge}><Icon name="event_available" className={styles.statIcon} size={20} /></div>
                            <span className={styles.statValue}>{stats.adherence}%</span>
                            <span className={styles.statLabel}>{t('profileAdherence')}</span>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIconBadge}><Icon name="healing" className={styles.statIcon} size={20} /></div>
                            <span className={styles.statValue}>{stats.pain}</span>
                            <span className={styles.statLabel}>{t('profilePain')}</span>
                        </div>
                    </div>
                </section>

                {/* 3. License Protocol (Subscription) */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>SYSTEM LICENSE</h2>
                    {renderSubscriptionCard()}
                </section>

                {/* 4. Core Configuration */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>CORE CONFIGURATION</h2>
                    <div className={styles.settingsList}>
                        {[
                            { icon: 'manage_accounts', labelKey: 'profilePersonalData' as const },
                            { icon: 'notifications', labelKey: 'profileNotifications' as const },
                            { icon: 'local_hospital', labelKey: 'profileClinicalHistory' as const },
                            { icon: 'shield', labelKey: 'profilePrivacy' as const },
                        ].map((item) => (
                            <button key={item.labelKey} className={styles.settingsRow}>
                                <div className={styles.settingsIcon}><Icon name={item.icon} size={20} /></div>
                                <span className={styles.settingsLabel}>{t(item.labelKey)}</span>
                                <Icon name="chevron_right" style={{ color: 'var(--text-secondary)' }} size={18} />
                            </button>
                        ))}

                        {/* Language Row */}
                        <div className={styles.settingsRow} style={{ cursor: 'default' }}>
                            <div className={styles.settingsIcon}><Icon name="language" size={20} /></div>
                            <span className={styles.settingsLabel}>{t('profileLanguage')}</span>
                            <div className={styles.langSegment}>
                                <button
                                    className={`${styles.langBtn} ${lang === 'en' ? styles.langActive : ''}`}
                                    onClick={() => handleLangChange('en')}
                                >
                                    EN
                                </button>
                                <button
                                    className={`${styles.langBtn} ${lang === 'es' ? styles.langActive : ''}`}
                                    onClick={() => handleLangChange('es')}
                                >
                                    ES
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. Session Termination */}
                <section className={styles.section} style={{ marginTop: 'var(--sp-4)' }}>
                    <button className={styles.signOutBtn} onClick={handleLogout} disabled={loggingOut}>
                        {loggingOut
                            ? <Icon name="autorenew" style={{ animation: 'spin 1s linear infinite' }} />
                            : <Icon name="power_settings_new" />}
                        TERMINATE SESSION
                    </button>
                </section>
            </div>
        </AppShell>
    );
}

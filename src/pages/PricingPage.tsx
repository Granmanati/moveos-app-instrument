import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PricingPage.module.css';
import { Icon } from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/useI18n';

export default function PricingPage() {
    const navigate = useNavigate();
    const { tier, subscriptionStatus, trialDaysLeft, startTrial, dismissPaywall } = useAuth();
    const { t } = useI18n();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
    const [startingTrial, setStartingTrial] = useState(false);
    const [dismissing, setDismissing] = useState(false);

    const isFree = tier === 'free';
    const isTrialing = subscriptionStatus === 'trialing';
    const isActive = subscriptionStatus === 'active';

    const annualDisplay = billingCycle === 'monthly' ? '$19/mo' : '$15/mo';

    const handleStartTrial = async () => {
        setStartingTrial(true);
        try {
            await startTrial();
            navigate(-1);
        } catch (err) {
            console.error('Trial error:', err);
        } finally {
            setStartingTrial(false);
        }
    };

    const renderCTA = () => {
        if (isTrialing) {
            return (
                <div className={styles.trialPill}>
                    {trialDaysLeft} {t('profileTrialDaysLeft')}
                </div>
            );
        }
        if (isFree) {
            return (
                <button
                    className={styles.ctaBtn}
                    onClick={handleStartTrial}
                    disabled={startingTrial}
                >
                    {startingTrial
                        ? <><Icon name="autorenew" style={{ animation: 'spin 0.8s linear infinite' }} size={16} /> {t('loading')}</>
                        : t('paywallStartTrial')}
                </button>
            );
        }
        if (isActive) {
            return (
                <button className={styles.manageBtn}>
                    {t('profileManageSubscription')}
                </button>
            );
        }
        return null;
    };

    return (
        <div className="app-container">
            <div className={styles.container}>
                <header className={styles.header}>
                    <button className={styles.backBtn} onClick={() => navigate(-1)}>
                        <Icon name="close" size={24} />
                    </button>
                    <div className={styles.headerText}>
                        <p className={styles.brandSubtitle}>{t('moveOS')}</p>
                        <h1 className={styles.title}>Upgrade your system</h1>
                    </div>
                </header>

                {/* Billing toggle */}
                <div className={styles.toggleContainer}>
                    <div className={styles.toggleTrack}>
                        <button
                            className={`${styles.toggleBtn} ${billingCycle === 'monthly' ? styles.toggleActive : ''}`}
                            onClick={() => setBillingCycle('monthly')}
                        >
                            {t('paywallMonthly')}
                        </button>
                        <button
                            className={`${styles.toggleBtn} ${billingCycle === 'yearly' ? styles.toggleActive : ''}`}
                            onClick={() => setBillingCycle('yearly')}
                        >
                            {t('paywallAnnually')}
                            {billingCycle === 'yearly' && (
                                <span className={styles.saveBadge}>{t('paywallBestValue')}</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Current plan label */}
                {isTrialing && (
                    <div className={styles.trialBanner}>
                        <Icon name="workspace_premium" size={16} style={{ color: '#FFB020' }} />
                        <span>Trial active · {trialDaysLeft} {t('profileTrialDaysLeft')}</span>
                    </div>
                )}

                {/* Premium plan card */}
                <div className={`${styles.planCard} ${styles.planCardHighlight}`}>
                    <div className={styles.planHeader}>
                        <div>
                            <span className={styles.planBadge}>PREMIUM</span>
                            <p className={styles.planPrice}>
                                {annualDisplay} <span>/ month</span>
                            </p>
                            {billingCycle === 'yearly' && (
                                <p className={styles.planBilling}>{t('paywallBilledAnnually')}</p>
                            )}
                        </div>
                        <Icon name="workspace_premium" size={28} style={{ color: '#FFB020' }} />
                    </div>
                    <ul className={styles.planFeatures}>
                        <li><Icon name="check_circle" size={14} active /><span>Full execution library (200+ exercises)</span></li>
                        <li><Icon name="check_circle" size={14} active /><span>Adaptive clinical engine</span></li>
                        <li><Icon name="check_circle" size={14} active /><span>Advanced progress charts</span></li>
                        <li><Icon name="check_circle" size={14} active /><span>Pain trend analysis</span></li>
                        <li><Icon name="check_circle" size={14} active /><span>Pattern distribution tracking</span></li>
                    </ul>
                    {renderCTA()}
                    {isFree && (
                        <p className={styles.trialNote}>{t('paywallTrialPill')}</p>
                    )}
                </div>

                {/* Pro plan card */}
                <div className={styles.planCard}>
                    <div className={styles.planHeader}>
                        <div>
                            <span className={styles.planBadgePro}>PRO</span>
                            <p className={styles.planPrice}>
                                $29 <span>/ month</span>
                            </p>
                        </div>
                        <Icon name="bolt" size={28} style={{ color: '#2D7CFF' }} />
                    </div>
                    <ul className={styles.planFeatures}>
                        <li><Icon name="check_circle" size={14} active /><span>Everything in Premium</span></li>
                        <li><Icon name="check_circle" size={14} active /><span>Clinical insights panel</span></li>
                        <li><Icon name="check_circle" size={14} active /><span>Priority recalibration</span></li>
                        <li><Icon name="check_circle" size={14} active /><span>Export reports (PDF)</span></li>
                    </ul>
                    <button className={styles.proPlanBtn}>Coming soon</button>
                </div>

                <button
                    className={styles.ghostBackBtn}
                    onClick={async () => {
                        setDismissing(true);
                        try {
                            await dismissPaywall();
                            navigate(-1);
                        } finally {
                            setDismissing(false);
                        }
                    }}
                    disabled={dismissing}
                >
                    {dismissing ? t('loading') : t('cancel')}
                </button>
            </div>
        </div>
    );
}

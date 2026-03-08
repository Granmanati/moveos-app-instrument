import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PricingPage.module.css';
import { Icon } from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';

const PLANS = [
    {
        id: 'premium',
        name: 'Premium',
        price: '$15',
        period: '/mo',
        badge: 'MOST POPULAR',
        highlight: true,
        features: [
            'Full execution library (200+ exercises)',
            'Adaptive clinical engine',
            'Advanced progress charts',
            'Pain trend analysis',
            'Pattern distribution tracking',
        ],
        cta: 'Upgrade to Premium',
        ctaDisabled: false,
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '$29',
        period: '/mo',
        badge: null,
        highlight: false,
        features: [
            'Everything in Premium',
            'Clinical insights panel',
            'Priority recalibration',
            'Export reports (PDF)',
            'Dedicated support',
        ],
        cta: 'Upgrade to Pro',
        ctaDisabled: false,
    },
];

export default function PricingPage() {
    const navigate = useNavigate();
    const { tier, subscriptionStatus, trialDaysLeft, startTrial, dismissPaywall } = useAuth();
    const [loading, setLoading] = useState<string | null>(null);
    const [dismissing, setDismissing] = useState(false);

    const isTrialing = subscriptionStatus === 'trialing';

    const upgradePlan = async (planId: string) => {
        if (planId === 'free') return;
        setLoading(planId);
        try {
            await startTrial();
            navigate(-1);
        } catch (err) {
            console.error('Upgrade error:', err);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <button className={styles.backBtn} onClick={() => navigate(-1)}>
                    <Icon name="arrow_back" size={20} />
                </button>
                <div className={styles.headerText}>
                    <span className={styles.brandLabel}>MOVE OS</span>
                    <h1 className={styles.title}>Upgrade your node</h1>
                    <p className={styles.subtitle}>Choose the plan that fits your protocol</p>
                </div>
            </div>

            {/* Trial banner */}
            {isTrialing && (
                <div className={styles.trialBanner}>
                    <Icon name="workspace_premium" size={14} />
                    <span>Trial active · {trialDaysLeft} days remaining</span>
                </div>
            )}

            {/* Plan cards */}
            <div className={styles.plansGrid}>
                {PLANS.map((plan) => {
                    const isCurrent = plan.id === tier || (plan.id === 'premium' && isTrialing);
                    return (
                        <div
                            key={plan.id}
                            className={`${styles.planCard} ${plan.highlight ? styles.planHighlight : ''} ${isCurrent ? styles.planCurrent : ''}`}
                        >
                            {plan.badge && (
                                <span className={styles.popularBadge}>{plan.badge}</span>
                            )}

                            <div className={styles.planHeader}>
                                <span className={styles.planName}>{plan.name}</span>
                                <div className={styles.planPricing}>
                                    <span className={styles.planPrice}>{plan.price}</span>
                                    <span className={styles.planPeriod}>{plan.period}</span>
                                </div>
                            </div>

                            <ul className={styles.featureList}>
                                {plan.features.map((f, i) => (
                                    <li key={i} className={styles.featureItem}>
                                        <Icon name="check_circle" size={12} style={{ color: plan.highlight ? 'var(--mo-color-accent-system)' : 'var(--mo-color-text-tertiary)', flexShrink: 0 }} />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={`${styles.planBtn} ${plan.highlight ? styles.planBtnPrimary : ''} ${isCurrent ? styles.planBtnCurrent : ''}`}
                                onClick={() => upgradePlan(plan.id)}
                                disabled={plan.ctaDisabled || isCurrent || loading === plan.id}
                            >
                                {loading === plan.id ? (
                                    <Icon name="autorenew" size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
                                ) : isCurrent ? 'Current Plan' : plan.cta}
                            </button>
                        </div>
                    );
                })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 'auto', paddingTop: 16 }}>
                {tier !== 'free' && (
                    <button
                        className={styles.ghostBtn}
                        style={{ color: 'var(--mo-color-text-primary)', fontWeight: 600 }}
                        onClick={async () => {
                            setDismissing(true);
                            try { await dismissPaywall(); navigate(-1); }
                            finally { setDismissing(false); }
                        }}
                        disabled={dismissing}
                    >
                        {dismissing ? 'Applying...' : 'Continue with Free'}
                    </button>
                )}
                <button
                    className={styles.ghostBtn}
                    onClick={async () => {
                        setDismissing(true);
                        try { await dismissPaywall(); navigate(-1); }
                        finally { setDismissing(false); }
                    }}
                    disabled={dismissing}
                >
                    {dismissing ? 'Closing...' : 'Maybe later'}
                </button>
            </div>
        </div>
    );
}

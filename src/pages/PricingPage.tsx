import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PricingPage.module.css';
import { Icon } from '../components/Icon';
import { useTier } from '../hooks/useTier';

export default function PricingPage() {
    const navigate = useNavigate();
    const { isFree, isPremium, isPro, loading } = useTier();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    // Setup .env placeholders for future Stripe integration
    // const STRIPE_PREMIUM_MONTHLY = import.meta.env.VITE_STRIPE_PRICE_PREMIUM_MONTHLY;
    // const STRIPE_PREMIUM_YEARLY = import.meta.env.VITE_STRIPE_PRICE_PREMIUM_YEARLY;
    // const STRIPE_PRO_MONTHLY = import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY;
    // const STRIPE_PRO_YEARLY = import.meta.env.VITE_STRIPE_PRICE_PRO_YEARLY;

    if (loading) {
        return (
            <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-default)' }}>
                <Icon name="autorenew" style={{ animation: 'spin 1s linear infinite' }} size={32} />
            </div>
        );
    }

    return (
        <div className="app-container">
            <div className={styles.container}>
                <header className={styles.header}>
                    <button className={styles.backBtn} onClick={() => navigate(-1)}>
                        <Icon name="close" size={24} />
                    </button>
                    <div className={styles.headerText}>
                        <p className={styles.brandSubtitle}>MOVE OS</p>
                        <h1 className={styles.title}>Upgrade your system</h1>
                    </div>
                </header>

                <div className={styles.toggleContainer}>
                    <div className={styles.toggleTrack}>
                        <button
                            className={`${styles.toggleBtn} ${billingCycle === 'monthly' ? styles.toggleActive : ''}`}
                            onClick={() => setBillingCycle('monthly')}
                        >
                            Monthly
                        </button>
                        <button
                            className={`${styles.toggleBtn} ${billingCycle === 'yearly' ? styles.toggleActive : ''}`}
                            onClick={() => setBillingCycle('yearly')}
                        >
                            Yearly
                        </button>
                    </div>
                </div>

                <div className={styles.plansContainer}>
                    {/* PREMIUM PLAN (Destacado) */}
                    <div className={`${styles.planCard} ${styles.planPremium}`}>
                        <div className={styles.planHeader}>
                            <div className={styles.planTitleRow}>
                                <h2>Premium</h2>
                                <span className={styles.popularBadge}>Most popular</span>
                            </div>
                            <div className={styles.priceRow}>
                                <span className={styles.price}>{billingCycle === 'monthly' ? '$19' : '$190'}</span>
                                <span className={styles.period}>/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                            </div>
                            <p className={styles.planDesc}>Full execution library & adaptive protocol engine.</p>
                        </div>

                        <div className={styles.features}>
                            <ul>
                                <li>
                                    <Icon name="check" size={16} className={styles.checkIconAccent} />
                                    <span>Everything in Free</span>
                                </li>
                                <li>
                                    <Icon name="check" size={16} className={styles.checkIconAccent} />
                                    <span>Full Execution Library</span>
                                </li>
                                <li>
                                    <Icon name="check" size={16} className={styles.checkIconAccent} />
                                    <span>Adaptive Clinical Engine</span>
                                </li>
                                <li>
                                    <Icon name="check" size={16} className={styles.checkIconAccent} />
                                    <span>Advanced Insights</span>
                                </li>
                            </ul>
                        </div>

                        <div className={styles.actionContainer}>
                            {isPremium ? (
                                <button className={styles.currentPlanBtn} disabled>Current Plan</button>
                            ) : (
                                <button className={styles.primaryBtn} onClick={() => alert('Stripe checkout for PREMIUM (Placeholder)')}>
                                    Start 7-day trial
                                </button>
                            )}
                        </div>
                    </div>

                    {/* PRO PLAN */}
                    <div className={styles.planCard}>
                        <div className={styles.planHeader}>
                            <div className={styles.planTitleRow}>
                                <h2 style={{ color: 'var(--text-primary)' }}>Pro</h2>
                            </div>
                            <div className={styles.priceRow}>
                                <span className={styles.price}>{billingCycle === 'monthly' ? '$39' : '$390'}</span>
                                <span className={styles.period}>/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                            </div>
                            <p className={styles.planDesc}>For clinical patients needing direct professional supervision.</p>
                        </div>

                        <div className={styles.features}>
                            <ul>
                                <li>
                                    <Icon name="check" size={16} className={styles.checkIcon} />
                                    <span>Everything in Premium</span>
                                </li>
                                <li>
                                    <Icon name="check" size={16} className={styles.checkIcon} />
                                    <span>Pro Insights (Coming Soon)</span>
                                </li>
                                <li>
                                    <Icon name="check" size={16} className={styles.checkIcon} />
                                    <span>Direct 1:1 Clinical Review</span>
                                </li>
                            </ul>
                        </div>

                        <div className={styles.actionContainer}>
                            {isPro ? (
                                <button className={styles.currentPlanBtn} disabled>Current Plan</button>
                            ) : (
                                <button className={styles.secondaryBtn} onClick={() => alert('Stripe checkout for PRO (Placeholder)')}>
                                    Upgrade to Pro
                                </button>
                            )}
                        </div>
                    </div>

                    {/* FREE PLAN */}
                    <div className={`${styles.planCard} ${styles.planFree}`}>
                        <div className={styles.planHeader}>
                            <h2>Free</h2>
                            <p className={styles.planDesc}>Basic access to the system.</p>
                        </div>

                        <div className={styles.features}>
                            <ul>
                                <li>
                                    <Icon name="check" size={16} className={styles.checkIcon} />
                                    <span>Limited Library (8 items)</span>
                                </li>
                                <li>
                                    <Icon name="check" size={16} className={styles.checkIcon} />
                                    <span>Basic Insights</span>
                                </li>
                                <li>
                                    <Icon name="check" size={16} className={styles.checkIcon} />
                                    <span>Session generator basic logic</span>
                                </li>
                            </ul>
                        </div>

                        <div className={styles.actionContainer}>
                            {isFree ? (
                                <button className={styles.currentPlanBtn} disabled>Current Plan</button>
                            ) : null}
                        </div>
                    </div>

                </div>

                <div className={styles.footerActions}>
                    <button className={styles.ghostBtn} onClick={() => navigate(-1)}>
                        Not now
                    </button>
                </div>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PricingPage.module.css';
import { Icon } from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';
import { mockData } from '../data/mockData'; // use mock for preview

export default function PricingPage() {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [isYearly, setIsYearly] = useState(false);

    // Default to 'Free' if not available in real profile
    const activeTier = profile?.plan || mockData?.profile?.plan || 'Free';

    // Pricing details
    const plans = [
        {
            name: 'Free',
            priceMonthly: 0,
            priceYearly: 0,
            features: ['3 sesiones funcionales semanales', 'Catálogo de ejecución básico', 'Log de dolor simple'],
            tier: 'Free'
        },
        {
            name: 'Premium',
            priceMonthly: 12,
            priceYearly: 120,
            features: ['Ajuste de carga avanzado', 'Catálogo completo HD', 'Historial 30 días y progreso'],
            tier: 'Premium'
        },
        {
            name: 'Pro',
            priceMonthly: 24,
            priceYearly: 240,
            features: ['Todo lo Premium', 'Reportes de dolor semanales', 'Soporte prioritario por chat'],
            tier: 'Pro'
        }
    ];

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <button className={styles.backBtn} onClick={() => navigate(-1)}>
                    <Icon name="arrow_back" />
                </button>
                <div className={styles.headerTitles}>
                    <p style={{ fontSize: '12px', letterSpacing: '1.2px', color: '#2D7CFF', fontWeight: 700, margin: 0, paddingBottom: '4px', textTransform: 'uppercase' }}>MOVE OS</p>
                    <h1 className={styles.title}>Planes y Acceso</h1>
                </div>
            </header>

            <div className={styles.billingToggleRow}>
                <span className={!isYearly ? styles.activeText : styles.mutedText}>Mensual</span>
                <button className={styles.toggleBtn} onClick={() => setIsYearly(!isYearly)}>
                    <div className={`${styles.toggleKnob} ${isYearly ? styles.yearly : ''}`} />
                </button>
                <span className={isYearly ? styles.activeText : styles.mutedText}>Anual <span className={styles.discount}>-20%</span></span>
            </div>

            <div className={styles.plansContainer}>
                {plans.map(plan => {
                    const isActive = activeTier === plan.tier;
                    const price = isYearly ? plan.priceYearly : plan.priceMonthly;
                    const period = isYearly ? '/año' : '/mes';

                    return (
                        <div key={plan.name} className={`${styles.planCard} ${isActive ? styles.activeCard : ''}`}>
                            {isActive && <div className={styles.activeBadge}>Tu Plan Actual</div>}
                            <h2 className={styles.planName}>{plan.name}</h2>
                            <div className={styles.priceRow}>
                                <span className={styles.currency}>€</span>
                                <span className={styles.price}>{price}</span>
                                <span className={styles.period}>{price > 0 ? period : ''}</span>
                            </div>

                            <ul className={styles.featureList}>
                                {plan.features.map((feat, i) => (
                                    <li key={i} className={styles.featureItem}>
                                        <Icon name="check" size={16} className={styles.checkIcon} />
                                        <span>{feat}</span>
                                    </li>
                                ))}
                            </ul>

                            {isActive ? (
                                <button className={styles.manageBtn}>Manage subscription</button>
                            ) : (
                                <button className={styles.primaryBtn}>
                                    {price > 0 ? 'Start 7-day free trial' : 'Plan Actual'}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

import { Icon } from '../Icon';
import styles from './SystemStatusIndicator.module.css';

interface SystemStatusIndicatorProps {
    state: 'aligned' | 'compensating' | 'overload';
    label?: string;
}

const STATE_ICONS = {
    aligned: 'check_circle',
    compensating: 'data_usage',
    overload: 'error' // fallback symbol for high strain
};

export function SystemStatusIndicator({ state, label }: SystemStatusIndicatorProps) {
    const iconName = STATE_ICONS[state] || 'info';

    return (
        <div className={`${styles.statusWrapper} ${styles[state]}`}>
            <div className={styles.nodeIndicator}>
                <Icon name={iconName} size={16} />
            </div>
            <div className={styles.statusText}>
                <span className={styles.statusLabel}>SYSTEM STATE</span>
                <span className={styles.statusValue}>{label || state.toUpperCase()}</span>
            </div>
            <div className={styles.pulseLine} />
        </div>
    );
}

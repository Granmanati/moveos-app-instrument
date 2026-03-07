import type { ReactNode } from 'react';
import styles from './MetricCard.module.css';

interface MetricCardProps {
    label: string;
    value: string | number;
    icon?: ReactNode;
    children?: ReactNode; /* For MetricBar integration */
    className?: string;
}

export function MetricCard({ label, value, icon, children, className = '' }: MetricCardProps) {
    return (
        <div className={`${styles.metricCard} ${className}`}>
            <div className={styles.header}>
                {icon && <div className={styles.iconWrapper}>{icon}</div>}
            </div>
            <div className={styles.valueContainer}>
                <span className={styles.value}>{value}</span>
            </div>
            <span className={styles.label}>{label}</span>

            {children && (
                <div className={styles.chartWrapper}>
                    {children}
                </div>
            )}
        </div>
    );
}

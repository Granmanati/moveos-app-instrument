import type { ReactNode } from 'react';
import styles from './PrimaryCard.module.css';

interface PrimaryCardProps {
    title?: string;
    subtitle?: string;
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}

export function PrimaryCard({ title, subtitle, children, className = '', onClick }: PrimaryCardProps) {
    return (
        <div
            className={`${styles.primaryCard} ${onClick ? styles.interactive : ''} ${className}`}
            onClick={onClick}
        >
            {(title || subtitle) && (
                <div className={styles.header}>
                    {title && <h3 className={styles.title}>{title}</h3>}
                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                </div>
            )}
            <div className={styles.content}>
                {children}
            </div>

            {/* Subtle structural architectural overlay for primary card */}
            <div className={styles.overlayFrame} aria-hidden="true" />
        </div>
    );
}

import styles from './StatusBadge.module.css';

export interface StatusBadgeProps {
    status: 'success' | 'warning' | 'alert' | 'neutral';
    label: string;
    className?: string;
}

export function StatusBadge({ status, label, className = '' }: StatusBadgeProps) {
    const badgeClass = [
        styles.badge,
        styles[`status-${status}`],
        className
    ].filter(Boolean).join(' ');

    return (
        <span className={badgeClass}>
            {label}
        </span>
    );
}

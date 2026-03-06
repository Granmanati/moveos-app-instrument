import styles from './MetricBar.module.css';

export interface MetricBarProps {
    value: number; // 0 to 100
    color?: 'accent' | 'success' | 'warning' | 'alert';
    height?: number;
    className?: string;
}

export function MetricBar({ value, color = 'accent', height = 4, className = '' }: MetricBarProps) {
    const clampedValue = Math.min(100, Math.max(0, value));

    const barClass = [
        styles.metricBarContainer,
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={barClass} style={{ height: `${height}px` }}>
            <div
                className={`${styles.metricBarFill} ${styles[`fill-${color}`]}`}
                style={{ width: `${clampedValue}%` }}
            />
        </div>
    );
}

import styles from './Skeleton.module.css';

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
    className?: string;
    style?: React.CSSProperties;
}

export function Skeleton({ width = '100%', height = '100%', borderRadius = 'var(--radius-sm)', className = '', style }: SkeletonProps) {
    return (
        <div
            className={`${styles.skeleton} ${className}`}
            style={{ width, height, borderRadius, ...style }}
        />
    );
}

interface SkeletonCardProps {
    className?: string;
    style?: React.CSSProperties;
}

export function SkeletonCard({ className = '', style }: SkeletonCardProps) {
    return (
        <div className={`${styles.skeletonCard} ${className}`} style={style}>
            <Skeleton height={24} width="40%" style={{ marginBottom: '16px' }} />
            <Skeleton height={60} width="100%" style={{ marginBottom: '12px' }} />
            <Skeleton height={20} width="80%" />
        </div>
    );
}

import type { ReactNode } from 'react';
import styles from './MissionCard.module.css';
import { Icon } from '../Icon';

interface MissionCardProps {
    title: string;
    subtitle?: string;
    duration?: string;
    status?: 'pending' | 'active' | 'completed';
    onClick?: () => void;
    children?: ReactNode;
}

export function MissionCard({ title, subtitle, duration, status = 'pending', onClick, children }: MissionCardProps) {
    const isCompleted = status === 'completed';
    const isActive = status === 'active';

    return (
        <div
            className={`${styles.missionCard} ${styles[status]} ${onClick ? styles.interactive : ''}`}
            onClick={onClick}
        >
            <div className={styles.header}>
                <div className={styles.contentLeft}>
                    <h3 className={styles.title}>{title}</h3>
                    {(subtitle || duration) && (
                        <div className={styles.metadata}>
                            {duration && <span className={styles.duration}><Icon name="autorenew" size={12} style={{ marginRight: '4px' }} />{duration}</span>}
                            {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
                        </div>
                    )}
                </div>
                <div className={styles.indicatorContainer}>
                    {isCompleted ? (
                        <Icon name="check_circle" size={20} className={styles.iconComplete} />
                    ) : isActive ? (
                        <div className={styles.activeNode} />
                    ) : (
                        <div className={styles.pendingNode} />
                    )}
                </div>
            </div>

            {children && (
                <div className={styles.body}>
                    {children}
                </div>
            )}

            {/* Structural line for pipeline feel */}
            <div className={styles.pipelineLine} />
        </div>
    );
}

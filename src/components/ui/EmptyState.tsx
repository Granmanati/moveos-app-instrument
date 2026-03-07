import { Icon } from '../Icon';
import { PrimaryButton } from './PrimaryButton';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
    icon: string;
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
    disabled?: boolean;
}

export default function EmptyState({
    icon,
    title,
    message,
    actionLabel,
    onAction,
    disabled = false
}: EmptyStateProps) {
    return (
        <div style={{ padding: 'var(--mo-space-8)' }}>
            <div className={styles.emptyBox}>
                <div className={styles.iconBox}>
                    <Icon name={icon} size={32} />
                </div>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.message}>{message}</p>
                {actionLabel && onAction && (
                    <PrimaryButton onClick={onAction} disabled={disabled}>
                        {actionLabel}
                    </PrimaryButton>
                )}
            </div>
        </div>
    );
}

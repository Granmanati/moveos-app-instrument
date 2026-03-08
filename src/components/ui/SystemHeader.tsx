import styles from './SystemHeader.module.css';

interface SystemHeaderProps {
    symbolOnly?: boolean;
    title?: string;
    sublabel?: string;
}

export function SystemHeader({ symbolOnly = false, title, sublabel = "SYSTEM ACTIVE" }: SystemHeaderProps) {
    return (
        <div className={styles.headerLockup}>
            <div className={styles.leftBlock}>
                <div className={styles.symbol} aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="9" stroke="var(--mo-color-accent-system)" strokeWidth="1.5" />
                        <path d="M12 3V21" stroke="var(--mo-color-accent-system)" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M3 12H21" stroke="var(--mo-color-accent-system)" strokeWidth="1.5" strokeLinecap="round" />
                        <circle cx="12" cy="12" r="3" fill="var(--mo-color-bg-primary)" stroke="var(--mo-color-accent-system)" strokeWidth="1.5" />
                    </svg>
                </div>
                {!symbolOnly && (
                    <div className={styles.textBlock}>
                        <span className={styles.wordmark}>MOVE OS</span>
                        {sublabel && <span className={styles.sublabel}>{sublabel}</span>}
                    </div>
                )}
            </div>
            {!symbolOnly && title && (
                <div className={styles.screenTitle}>{title}</div>
            )}
        </div>
    );
}

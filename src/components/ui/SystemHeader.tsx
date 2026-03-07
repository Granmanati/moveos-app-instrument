import styles from './SystemHeader.module.css';

interface SystemHeaderProps {
    symbolOnly?: boolean;
    sublabel?: string;
}

export function SystemHeader({ symbolOnly = false, sublabel = "SYSTEM ACTIVE" }: SystemHeaderProps) {
    return (
        <div className={styles.headerLockup}>
            <div className={styles.topRow}>
                <div className={styles.symbol} aria-hidden="true">
                    {/* MOVE OS Vector Symbol - SVG representation of Node+Line+System structure */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="9" stroke="var(--accent)" strokeWidth="1.5" />
                        <path d="M12 3V21" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M3 12H21" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
                        <circle cx="12" cy="12" r="3" fill="var(--bg-primary)" stroke="var(--accent)" strokeWidth="1.5" />
                    </svg>
                </div>
                {!symbolOnly && <span className={styles.wordmark}>MOVE OS</span>}
            </div>
            {!symbolOnly && <div className={styles.sublabel}>{sublabel}</div>}
        </div>
    );
}

import type { ReactNode } from 'react';
import BottomNav from './BottomNav';
import styles from './AppShell.module.css';

interface AppShellProps {
    title?: ReactNode;
    subtitle?: ReactNode;
    customHeader?: ReactNode;
    children: ReactNode;
}

export default function AppShell({ title, subtitle, customHeader, children }: AppShellProps) {
    return (
        <div className={`${styles.shell} animate-page-enter`}>
            {customHeader ? (
                <div className={styles.headerWrapper}>{customHeader}</div>
            ) : (title || subtitle) ? (
                <header className={styles.header}>
                    <div className={styles.brandLabel}>MOVE OS</div>
                    {title && <h1 className={styles.title}>{title}</h1>}
                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                </header>
            ) : null}

            <main className={styles.content}>
                <div className={styles.contentInner}>
                    {children}
                </div>
            </main>

            <BottomNav />
        </div>
    );
}

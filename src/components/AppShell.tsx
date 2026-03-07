import type { ReactNode } from 'react';
import BottomNav from './BottomNav';
import styles from './AppShell.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { SystemHeader } from './ui/SystemHeader';

interface AppShellProps {
    sublabel?: string;
    hideNav?: boolean;
    children: ReactNode;
}

export default function AppShell({ sublabel, hideNav = false, children }: AppShellProps) {
    const location = useLocation();

    return (
        <div className={styles.shell}>
            <div className={styles.systemOverlay} />
            <div className={styles.headerWrapper}>
                <SystemHeader sublabel={sublabel} />
            </div>

            <main className={`${styles.content} ${hideNav ? styles.contentFullHeight : ''}`}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        className={styles.contentInner}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            {!hideNav && <BottomNav />}
        </div>
    );
}

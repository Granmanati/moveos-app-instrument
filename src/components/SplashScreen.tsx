import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './SplashScreen.module.css';

interface SplashScreenProps {
    onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        // Symbol rotates 360° over 1.2s, then wordmark fades in, then we exit
        const timer = setTimeout(() => {
            setIsComplete(true);
            setTimeout(onComplete, 350);
        }, 1600);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {!isComplete && (
                <motion.div
                    className={styles.splashContainer}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                >
                    {/* Symbol: full 360° rotation */}
                    <motion.div
                        className={styles.symbolContainer}
                        initial={{ rotate: 0, opacity: 0, scale: 0.7 }}
                        animate={{ rotate: 360, opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                    >
                        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="9" stroke="var(--mo-color-accent-system)" strokeWidth="1.5" />
                            <path d="M12 3V21" stroke="var(--mo-color-accent-system)" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M3 12H21" stroke="var(--mo-color-accent-system)" strokeWidth="1.5" strokeLinecap="round" />
                            <circle cx="12" cy="12" r="3" fill="var(--mo-color-bg-primary)" stroke="var(--mo-color-accent-system)" strokeWidth="1.5" />
                        </svg>
                    </motion.div>

                    <motion.div
                        className={styles.wordmark}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 1.0, ease: "easeOut" }}
                    >
                        MOVE OS
                    </motion.div>

                    <motion.div
                        className={styles.sublabel}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 1.2, ease: "easeOut" }}
                    >
                        SYSTEM ACTIVE
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

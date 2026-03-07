import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './SplashScreen.module.css';

interface SplashScreenProps {
    onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        // Total duration is 1.6s
        // 0.8s for path drawing, 0.4s for node pulse, 0.4s buffer before fade
        const timer = setTimeout(() => {
            setIsComplete(true);
            setTimeout(onComplete, 400); // Wait for the fade out exit animation
        }, 1400);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {!isComplete && (
                <motion.div
                    className={styles.splashContainer}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                >
                    <div className={styles.symbolContainer}>
                        {/* MOVE OS Vector Symbol - Animated */}
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <motion.circle
                                cx="12" cy="12" r="9"
                                stroke="var(--accent, #FFB020)" strokeWidth="1.5"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                            />
                            <motion.path
                                d="M12 3V21"
                                stroke="var(--accent, #FFB020)" strokeWidth="1.5" strokeLinecap="round"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.2, ease: "easeInOut" }}
                            />
                            <motion.path
                                d="M3 12H21"
                                stroke="var(--accent, #FFB020)" strokeWidth="1.5" strokeLinecap="round"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.4, ease: "easeInOut" }}
                            />
                            <motion.circle
                                cx="12" cy="12" r="3"
                                fill="#0B0F14" stroke="var(--accent, #FFB020)" strokeWidth="1.5"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: [0, 1.5, 1], opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
                            />
                        </svg>
                    </div>
                    <motion.div
                        className={styles.wordmark}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.8, ease: "easeOut" }}
                    >
                        MOVE OS
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

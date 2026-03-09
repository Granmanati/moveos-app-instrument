import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './SessionSummaryPage.module.css';
import { Icon } from '../components/Icon';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { MetricCard } from '../components/ui/MetricCard';

export default function SessionSummaryPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { metrics, blocks } = location.state || {};

    if (!metrics) {
        return (
            <div className={styles.empty}>
                <span>No session summary available.</span>
                <PrimaryButton onClick={() => navigate('/mission')}>BACK TO MISSION</PrimaryButton>
            </div>
        );
    }

    const durationMinutes = Math.floor((metrics.endTime - metrics.startTime) / 60000);
    const exerciseCount = blocks?.reduce((acc: number, b: any) => acc + b.exercises.length, 0) || 0;

    return (
        <div className={styles.summaryPage}>
            <div className={styles.hero}>
                <motion.div
                    className={styles.successIcon}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                >
                    <Icon name="check_circle" size={64} style={{ color: "var(--mo-color-state-success, #4CAF7D)" }} />
                </motion.div>
                <h1 className={styles.title}>Session Complete</h1>
                <p className={styles.subtitle}>Protocol synchronization successful. Your adaptive profile has been updated.</p>
            </div>

            <div className={styles.content}>
                <div className={styles.metricsGrid}>
                    <MetricCard
                        label="DURATION"
                        value={`${durationMinutes} min`}
                        icon="schedule"
                    />
                    <MetricCard
                        label="EXERCISES"
                        value={exerciseCount.toString()}
                        icon="fitness_center"
                    />
                    <MetricCard
                        label="BLOCKS"
                        value={blocks?.length.toString() || '0'}
                        icon="layers"
                    />
                </div>

                <div className={styles.insightBox}>
                    <div className={styles.insightIcon}>
                        <Icon name="bolt" size={20} style={{ color: "var(--mo-color-accent-system)" }} />
                    </div>
                    <div className={styles.insightBody}>
                        <span className={styles.insightLabel}>SYSTEM UPDATE</span>
                        <p className={styles.insightText}>
                            High adherence and consistent mobility markers detected.
                            The engine is calculating potential progression criteria for your next session.
                        </p>
                    </div>
                </div>

                <div className={styles.footer}>
                    <PrimaryButton onClick={() => navigate('/mission')}>
                        DONE
                    </PrimaryButton>
                </div>
            </div>
        </div>
    );
}

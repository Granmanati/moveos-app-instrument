import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ExercisePlayerPage.module.css';
import { Icon } from '../components/Icon';
import { useExecutionEngine } from '../engine/useExecutionEngine';
import type { SessionBlock } from '../engine/executionEngine/types';

export default function ExercisePlayerPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const blocks = useMemo(() => (location.state?.blocks || []) as SessionBlock[], [location.state]);

    const {
        state,
        currentBlock,
        currentExercise,
        startTimer,
        pauseTimer,
        nextStep,
        progress
    } = useExecutionEngine({
        blocks,
        onComplete: (finalState) => {
            navigate('/session/summary', { state: { metrics: finalState.metrics, blocks } });
        }
    });

    const [showExitConfirm, setShowExitConfirm] = useState(false);

    if (!currentExercise) {
        return (
            <div className={styles.empty}>
                <span>Initializing session...</span>
            </div>
        );
    }

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className={styles.playerPage}>
            {/* Header / Progress bar */}
            <div className={styles.header}>
                <button className={styles.exitBtn} onClick={() => setShowExitConfirm(true)}>
                    <Icon name="close" size={24} />
                </button>
                <div className={styles.progressContainer}>
                    <div className={styles.progressBar}>
                        <motion.div
                            className={styles.progressFill}
                            animate={{ width: `${progress * 100}%` }}
                        />
                    </div>
                    <span className={styles.progressText}>
                        BLOCK {state.currentBlockIndex + 1}/{blocks.length}
                    </span>
                </div>
                <div style={{ width: 44 }} /> {/* balance */}
            </div>

            {/* Video / Hero Area */}
            <div className={styles.heroArea}>
                <div
                    className={styles.videoPlaceholder}
                    style={{ backgroundImage: `url(https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1000)` }}
                >
                    <div className={styles.videoOverlay} />
                    <div className={styles.videoControls}>
                        <Icon name="play_circle" size={48} style={{ color: "rgba(255,255,255,0.4)" }} />
                    </div>
                </div>

                {/* Exercise Info Overlay */}
                <div className={styles.infoOverlay}>
                    <span className={styles.blockName}>{currentBlock?.name.toUpperCase()}</span>
                    <h1 className={styles.exerciseName}>{currentExercise.exercise_library.name}</h1>
                </div>
            </div>

            {/* Metrics and Controls */}
            <div className={styles.controlsArea}>
                <div className={styles.metricsGrid}>
                    <div className={styles.metric}>
                        <span className={styles.metricLabel}>SET</span>
                        <span className={styles.metricValue}>{state.currentSet}<small>/{currentExercise.sets}</small></span>
                    </div>
                    <div className={styles.metric}>
                        <span className={styles.metricLabel}>REPS</span>
                        <span className={styles.metricValue}>{currentExercise.reps_min}<small>–{currentExercise.reps_max}</small></span>
                    </div>
                    <div className={styles.metric}>
                        <span className={styles.metricLabel}>TIME</span>
                        <span className={styles.metricValue}>{formatTime(state.elapsedSeconds)}</span>
                    </div>
                </div>

                <div className={styles.actions}>
                    {state.status !== 'EXECUTING' ? (
                        <motion.button
                            className={styles.mainAction}
                            onClick={startTimer}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Icon name="play_arrow" size={32} />
                            <span>START SET</span>
                        </motion.button>
                    ) : (
                        <div className={styles.executingActions}>
                            <button className={styles.subAction} onClick={pauseTimer}>
                                <Icon name="pause" size={24} />
                            </button>
                            <motion.button
                                className={styles.completeAction}
                                onClick={nextStep}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Icon name="check" size={32} />
                                <span>COMPLETE</span>
                            </motion.button>
                        </div>
                    )}
                </div>
            </div>

            {/* Exit Confirmation Modal */}
            <AnimatePresence>
                {showExitConfirm && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className={styles.modal}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <h2>End Session?</h2>
                            <p>Your current progress will be lost. The engine needs session data to adapt correctly.</p>
                            <div className={styles.modalBtns}>
                                <button className={styles.cancelBtn} onClick={() => setShowExitConfirm(false)}>RESUME</button>
                                <button className={styles.confirmBtn} onClick={() => navigate('/today')}>EXIT SESSION</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

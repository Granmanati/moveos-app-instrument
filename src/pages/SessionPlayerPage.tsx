import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './SessionPlayerPage.module.css';
import { Icon } from '../components/Icon';
import { useExecutionEngine } from '../engine/useExecutionEngine';
import type { SessionBlock } from '../engine/executionEngine/types';
import { supabase } from '../lib/supabase';
import { useEffect } from 'react';

export default function SessionPlayerPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const blocks = useMemo(() => (location.state?.blocks || []) as SessionBlock[], [location.state]);

    const sessionId = location.state?.sessionId;
    const rehydrationData = location.state?.rehydrationData;

    const {
        state,
        currentBlock,
        currentExercise,
        startSet,
        completeSet,
        skipRest,
        nextExercise,
        progress
    } = useExecutionEngine({
        blocks,
        rehydrationData,
        onComplete: async (finalState) => {
            if (sessionId) {
                await supabase.from('training_sessions').update({
                    state: 'awaiting_feedback',
                    current_block_index: finalState.currentBlockIndex,
                    current_exercise_index: finalState.currentExerciseIndex,
                    current_set: finalState.currentSet
                }).eq('id', sessionId);
            }
            navigate('/mission', { state: { completedSession: true, metrics: finalState.metrics } });
        }
    });

    // Auto-persistence on key state changes
    useEffect(() => {
        if (!sessionId) return;

        const persist = async () => {
            await supabase.from('training_sessions').update({
                state: 'in_progress',
                current_block_index: state.currentBlockIndex,
                current_exercise_index: state.currentExerciseIndex,
                current_set: state.currentSet
            }).eq('id', sessionId);
        };

        // We persist when status changes (started set, completed set, next ex)
        // or when moving between exercises/blocks
        persist();
    }, [state.currentBlockIndex, state.currentExerciseIndex, state.currentSet, state.status, sessionId]);

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

    const renderCTA = () => {
        switch (state.status) {
            case 'SET_READY':
                return (
                    <motion.button
                        className={styles.mainAction}
                        onClick={startSet}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Icon name="play_arrow" size={32} />
                        <span>START SET</span>
                    </motion.button>
                );
            case 'SET_EXECUTING':
                return (
                    <motion.button
                        className={`${styles.mainAction} ${styles.executing}`}
                        onClick={completeSet}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Icon name="check" size={32} />
                        <span>COMPLETE SET</span>
                    </motion.button>
                );
            case 'RESTING':
                return (
                    <div className={styles.restingContainer}>
                        <div className={styles.restTimer}>
                            <span className={styles.restLabel}>RESTING</span>
                            <span className={styles.restValue}>{formatTime(Math.max(0, (currentExercise.rest_sec || 60) - state.elapsedSeconds))}</span>
                        </div>
                        <motion.button
                            className={styles.subActionPrimary}
                            onClick={skipRest}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Icon name="fast_forward" size={24} />
                            <span>SKIP REST</span>
                        </motion.button>
                    </div>
                );
            case 'EXERCISE_COMPLETE':
                return (
                    <motion.button
                        className={styles.mainAction}
                        onClick={nextExercise}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Icon name="arrow_forward" size={32} />
                        <span>NEXT EXERCISE</span>
                    </motion.button>
                );
            default:
                return null;
        }
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
                    {renderCTA()}
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
                            <p>Your current progress is saved. You can resume later from the Mission page.</p>
                            <div className={styles.modalBtns}>
                                <button className={styles.cancelBtn} onClick={() => setShowExitConfirm(false)}>RESUME</button>
                                <button className={styles.confirmBtn} onClick={() => navigate('/mission')}>EXIT SESSION</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

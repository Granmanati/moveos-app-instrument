import { useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import styles from './ExerciseExecutionPage.module.css';
import { Icon } from '../components/Icon';
import { ROUTINES } from '../data/exploreData';

export default function ExerciseExecutionPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const routine = ROUTINES.find(r => r.id === id);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [direction, setDirection] = useState<1 | -1>(1);

    const dragY = useMotionValue(0);
    const opacity = useTransform(dragY, [-80, 0, 80], [0.5, 1, 0.5]);

    const exercises = routine?.exercises ?? [];
    const exercise = exercises[currentIndex];

    const goNext = useCallback(() => {
        if (currentIndex < exercises.length - 1) {
            setDirection(1);
            setCurrentIndex(i => i + 1);
        } else {
            navigate(-1); // All done
        }
    }, [currentIndex, exercises.length, navigate]);

    const goPrev = useCallback(() => {
        if (currentIndex > 0) {
            setDirection(-1);
            setCurrentIndex(i => i - 1);
        }
    }, [currentIndex]);

    const handleDragEnd = (_: any, info: any) => {
        const threshold = 60;
        if (info.offset.y < -threshold) goNext();
        else if (info.offset.y > threshold) goPrev();
        dragY.set(0);
    };

    if (!routine || !exercise) {
        return (
            <div className={styles.error}>
                <Icon name="error" size={32} />
                <span>Exercise not found</span>
                <button onClick={() => navigate('/explore')}>Back</button>
            </div>
        );
    }

    const variants = {
        enter: (d: number) => ({ y: d > 0 ? '100%' : '-100%', opacity: 0 }),
        center: { y: 0, opacity: 1 },
        exit: (d: number) => ({ y: d > 0 ? '-100%' : '100%', opacity: 0 }),
    };

    return (
        <div className={styles.page}>
            {/* Exercise pane — swipeable */}
            <AnimatePresence custom={direction} mode="wait">
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.28, ease: 'easeInOut' }}
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 0 }}
                    dragElastic={0.18}
                    onDragEnd={handleDragEnd}
                    style={{ opacity }}
                    className={styles.exercisePane}
                >
                    {/* Background thumbnail */}
                    <div
                        className={styles.exerciseBg}
                        style={{ backgroundImage: `url(${exercise.thumbnail})` }}
                    >
                        <div className={styles.bgGradient} />
                    </div>

                    {/* Progress dots */}
                    <div className={styles.progressDots}>
                        {exercises.map((_, i) => (
                            <div key={i} className={`${styles.dot} ${i === currentIndex ? styles.dotActive : i < currentIndex ? styles.dotDone : ''}`} />
                        ))}
                    </div>

                    {/* Swipe hint */}
                    {!isPaused && (
                        <div className={styles.swipeHint}>
                            <Icon name="keyboard_arrow_up" size={14} />
                            <span>Swipe to navigate</span>
                        </div>
                    )}

                    {/* Exercise info overlay */}
                    <div className={styles.infoOverlay}>
                        <div className={styles.exerciseIndex}>
                            {String(currentIndex + 1).padStart(2, '0')} / {String(exercises.length).padStart(2, '0')}
                        </div>
                        <h1 className={styles.exerciseName}>{exercise.name}</h1>
                        <div className={styles.exerciseMeta}>
                            <span className={styles.metaChip}>{exercise.sets} SETS</span>
                            <span className={styles.metaChip}>{exercise.duration}</span>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Info panel */}
            <AnimatePresence>
                {showInfo && (
                    <motion.div
                        className={styles.infoPanel}
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                        <div className={styles.panelHandle} />
                        <h3 className={styles.panelTitle}>{exercise.name}</h3>
                        <div className={styles.panelRows}>
                            <div className={styles.panelRow}><span>Sets</span><strong>{exercise.sets}</strong></div>
                            <div className={styles.panelRow}><span>Duration</span><strong>{exercise.duration}</strong></div>
                            <div className={styles.panelRow}><span>Rest</span><strong>30 sec</strong></div>
                        </div>
                        <button className={styles.closePanelBtn} onClick={() => setShowInfo(false)}>CLOSE</button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Controls bar */}
            <div className={styles.controls}>
                <button className={styles.controlBtn} onClick={() => navigate(-1)} aria-label="Exit">
                    <Icon name="close" size={20} />
                    <span>EXIT</span>
                </button>
                <button className={`${styles.controlBtn} ${isPaused ? styles.btnActive : ''}`} onClick={() => setIsPaused(p => !p)} aria-label="Pause">
                    <Icon name={isPaused ? 'play_arrow' : 'pause'} size={20} />
                    <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
                </button>
                <button className={`${styles.controlBtn} ${showInfo ? styles.btnActive : ''}`} onClick={() => setShowInfo(p => !p)} aria-label="Info">
                    <Icon name="info" size={20} />
                    <span>INFO</span>
                </button>
                <button className={`${styles.controlBtn} ${styles.nextBtn}`} onClick={goNext} aria-label="Next">
                    <Icon name={currentIndex === exercises.length - 1 ? 'check' : 'skip_next'} size={20} />
                    <span>{currentIndex === exercises.length - 1 ? 'DONE' : 'NEXT'}</span>
                </button>
            </div>
        </div>
    );
}

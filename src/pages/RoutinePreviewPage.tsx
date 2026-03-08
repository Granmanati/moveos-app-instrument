import { useParams, useNavigate } from 'react-router-dom';
import styles from './RoutinePreviewPage.module.css';
import { Icon } from '../components/Icon';
import { motion } from 'framer-motion';
import { ROUTINES } from '../data/exploreData';

export default function RoutinePreviewPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const routine = ROUTINES.find(r => r.id === id);

    if (!routine) {
        return (
            <div className={styles.error}>
                <Icon name="error" size={32} />
                <span>Routine not found</span>
                <button onClick={() => navigate('/explore')}>Back to Explore</button>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            {/* Video/Thumbnail preview */}
            <div className={styles.heroWrap}>
                <div className={styles.hero} style={{ backgroundImage: `url(${routine.thumbnail})` }}>
                    <div className={styles.heroOverlay} />

                    {/* Back button */}
                    <button className={styles.backBtn} onClick={() => navigate(-1)}>
                        <Icon name="arrow_back" size={20} />
                    </button>

                    {/* Play button */}
                    <div className={styles.heroPlay}>
                        <Icon name="play_arrow" size={36} />
                    </div>

                    {/* Category chip */}
                    <span className={styles.heroCat}>{routine.category.toUpperCase()}</span>
                </div>
            </div>

            {/* Routine info */}
            <div className={styles.content}>
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                    className={styles.infoBlock}
                >
                    <h1 className={styles.title}>{routine.title}</h1>
                    <span className={styles.expert}>{routine.expert}</span>

                    {/* Meta row */}
                    <div className={styles.metaRow}>
                        <div className={styles.metaItem}>
                            <Icon name="timer" size={14} className={styles.metaIcon} />
                            <span>{routine.duration}</span>
                        </div>
                        <div className={styles.metaDivider} />
                        <div className={styles.metaItem}>
                            <Icon name="format_list_bulleted" size={14} className={styles.metaIcon} />
                            <span>{routine.exerciseCount} exercises</span>
                        </div>
                    </div>

                    {/* Primary CTA */}
                    <button
                        className={styles.startBtn}
                        onClick={() => navigate(`/explore/execute/${routine.id}`)}
                    >
                        <Icon name="play_arrow" size={16} />
                        START ROUTINE
                    </button>
                </motion.div>

                {/* Exercise list */}
                <div className={styles.exerciseList}>
                    <span className={styles.listTitle}>EXERCISE SEQUENCE</span>
                    {routine.exercises.map((ex, i) => (
                        <motion.div
                            key={ex.id}
                            className={styles.exerciseRow}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * i, duration: 0.22, ease: 'easeOut' }}
                        >
                            <div className={styles.exIndex}>{String(i + 1).padStart(2, '0')}</div>
                            <div className={styles.exThumb} style={{ backgroundImage: `url(${ex.thumbnail})` }} />
                            <div className={styles.exInfo}>
                                <span className={styles.exName}>{ex.name}</span>
                                <span className={styles.exMeta}>{ex.sets} sets · {ex.duration}</span>
                            </div>
                            <Icon name="chevron_right" size={14} className={styles.exArrow} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

import { useState, useRef } from 'react';
import styles from './ExplorePage.module.css';
import AppShell from '../components/AppShell';
import { Icon } from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTINES, CATEGORIES, getByCategory, getForYou, type Routine } from '../data/exploreData';

function RoutineCard({ routine, onClick, locked }: { routine: Routine; onClick: () => void; locked: boolean }) {
    return (
        <motion.div
            className={styles.routineCard}
            onClick={onClick}
            whileHover={{ scale: 1.025 }}
            transition={{ duration: 0.18 }}
        >
            <div className={styles.cardThumb} style={{ backgroundImage: `url(${routine.thumbnail})` }}>
                {locked ? (
                    <div className={styles.lockOverlay}>
                        <Icon name="lock" size={18} />
                    </div>
                ) : (
                    <div className={styles.playDot}>
                        <Icon name="play_arrow" size={16} />
                    </div>
                )}
                <span className={styles.durationChip}>{routine.duration}</span>
                {routine.premium && <span className={styles.premiumChip}>PRO</span>}
            </div>
            <div className={styles.cardBody}>
                <span className={styles.cardTitle}>{routine.title}</span>
                <span className={styles.cardExpert}>{routine.expert}</span>
            </div>
        </motion.div>
    );
}

function FeedCard({ routine, onClick, locked }: { routine: Routine; onClick: () => void; locked: boolean }) {
    return (
        <motion.div
            className={styles.feedCard}
            onClick={onClick}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.15 }}
        >
            <div className={styles.feedThumb} style={{ backgroundImage: `url(${routine.thumbnail})` }}>
                {locked && (
                    <div className={styles.lockOverlay}>
                        <Icon name="lock" size={22} />
                        <span>PREMIUM</span>
                    </div>
                )}
                <span className={styles.feedDuration}>{routine.duration}</span>
                <span className={styles.feedCategory}>{routine.category.toUpperCase()}</span>
            </div>
            <div className={styles.feedBody}>
                <div>
                    <h3 className={styles.feedTitle}>{routine.title}</h3>
                    <span className={styles.feedExpert}>{routine.expert}</span>
                </div>
                <div className={styles.feedMeta}>
                    <span className={styles.exerciseCount}>{routine.exerciseCount} exercises</span>
                    {locked ? (
                        <button className={styles.unlockBtn} onClick={e => { e.stopPropagation(); }}>UNLOCK</button>
                    ) : (
                        <button className={styles.watchBtn}>PREVIEW</button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default function ExplorePage() {
    const { tier } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const isLocked = (r: Routine) => r.premium && tier === 'free';

    const openRoutine = (r: Routine) => {
        if (isLocked(r)) { navigate('/pricing'); return; }
        navigate(`/explore/routine/${r.id}`);
    };

    const filtered = searchQuery
        ? ROUTINES.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.category.toLowerCase().includes(searchQuery.toLowerCase()))
        : null;

    return (
        <AppShell title="EXPLORE" sublabel="Movement knowledge engine">
            <div className={styles.page}>

                {/* Search */}
                <div className={styles.searchWrap}>
                    <Icon name="search" size={16} className={styles.searchIcon} />
                    <input
                        ref={searchRef}
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search movement, pain or exercise"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className={styles.clearBtn} onClick={() => { setSearchQuery(''); searchRef.current?.focus(); }}>
                            <Icon name="close" size={14} />
                        </button>
                    )}
                </div>

                {/* Search results */}
                {filtered ? (
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionTitle}>RESULTS</span>
                            <span className={styles.sectionCount}>{filtered.length}</span>
                        </div>
                        {filtered.length === 0 ? (
                            <div className={styles.emptySearch}>
                                <Icon name="search_off" size={20} style={{ color: 'var(--mo-color-text-tertiary)' }} />
                                <span>No routines found</span>
                            </div>
                        ) : (
                            <div className={styles.feedStack}>
                                {filtered.map(r => (
                                    <FeedCard key={r.id} routine={r} onClick={() => openRoutine(r)} locked={isLocked(r)} />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Category filter pills */}
                        <div className={styles.categoryScroll}>
                            <button
                                className={`${styles.pill} ${activeCategory === null ? styles.pillActive : ''}`}
                                onClick={() => setActiveCategory(null)}
                            >
                                All
                            </button>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    className={`${styles.pill} ${activeCategory === cat ? styles.pillActive : ''}`}
                                    onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {activeCategory ? (
                            /* Filtered category full list */
                            <div className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <span className={styles.sectionTitle}>{activeCategory.toUpperCase()}</span>
                                </div>
                                <div className={styles.feedStack}>
                                    {getByCategory(activeCategory).map(r => (
                                        <FeedCard key={r.id} routine={r} onClick={() => openRoutine(r)} locked={isLocked(r)} />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* For You section — vertical feed */}
                                <div className={styles.section}>
                                    <div className={styles.sectionHeader}>
                                        <span className={styles.sectionTitle}>FOR YOU</span>
                                        <span className={styles.sectionSub}>Personalized picks</span>
                                    </div>
                                    <div className={styles.feedStack}>
                                        {getForYou().map(r => (
                                            <FeedCard key={r.id} routine={r} onClick={() => openRoutine(r)} locked={isLocked(r)} />
                                        ))}
                                    </div>
                                </div>

                                {/* Category carousels */}
                                {CATEGORIES.map(cat => {
                                    const items = getByCategory(cat);
                                    if (!items.length) return null;
                                    return (
                                        <div key={cat} className={styles.section}>
                                            <div className={styles.sectionHeader}>
                                                <span className={styles.sectionTitle}>{cat.toUpperCase()}</span>
                                                <button className={styles.seeAllBtn} onClick={() => setActiveCategory(cat)}>See all</button>
                                            </div>
                                            <div className={styles.carousel}>
                                                {items.map(r => (
                                                    <RoutineCard key={r.id} routine={r} onClick={() => openRoutine(r)} locked={isLocked(r)} />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </>
                )}
            </div>
        </AppShell>
    );
}

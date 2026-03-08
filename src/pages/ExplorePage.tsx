import { useState } from 'react';
import styles from './ExplorePage.module.css';
import AppShell from '../components/AppShell';
import { Icon } from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const CATEGORIES = [
    { id: 'pain', label: 'Pain Relief' },
    { id: 'mobility', label: 'Mobility' },
    { id: 'strength', label: 'Strength' },
    { id: 'recovery', label: 'Recovery' },
    { id: 'posture', label: 'Posture' },
    { id: 'injuries', label: 'Injuries' },
];

const FEED_ITEMS = [
    {
        id: '1',
        premium: false,
        title: 'Spinal Articulation Protocol',
        category: 'MOBILITY',
        duration: '12 min',
        expert: 'Dr. Ana Torres',
        thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
        id: '2',
        premium: true,
        title: 'Neuromuscular Re-Activation',
        category: 'TRAINING',
        duration: '8 min',
        expert: 'Felipe Ruiz, PT',
        thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
        id: '3',
        premium: false,
        title: 'Post-Load Autonomic Recovery',
        category: 'RECOVERY',
        duration: '15 min',
        expert: 'María Gómez, PhD',
        thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
        id: '4',
        premium: true,
        title: 'Deep Tissue Release & Isometrics',
        category: 'PAIN RELIEF',
        duration: '10 min',
        expert: 'Dr. Carlos Vera',
        thumbnail: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
        id: '5',
        premium: false,
        title: 'Hip Controlled Articular Rotation',
        category: 'MOBILITY',
        duration: '6 min',
        expert: 'Laura Sanz, PT',
        thumbnail: 'https://images.unsplash.com/photo-1590987337591-47bcd1f4f69b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
];

const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
};

export default function ExplorePage() {
    const { tier } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const filteredFeed = FEED_ITEMS.filter(item => {
        const matchesSearch = !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !activeCategory || item.category.toLowerCase().includes(activeCategory);
        return matchesSearch && matchesCategory;
    });

    const isLocked = (item: typeof FEED_ITEMS[0]) => item.premium && tier === 'free';

    return (
        <AppShell title="EXPLORE" sublabel="Movement knowledge engine">
            <div className={styles.page}>

                {/* Search bar */}
                <div className={styles.searchContainer}>
                    <Icon name="search" size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search movement, pain or exercise"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className={styles.searchClear} onClick={() => setSearchQuery('')}>
                            <Icon name="close" size={16} />
                        </button>
                    )}
                </div>

                {/* Category horizontal scroll */}
                <div className={styles.categoryScroll}>
                    <button
                        className={`${styles.categoryChip} ${activeCategory === null ? styles.chipActive : ''}`}
                        onClick={() => setActiveCategory(null)}
                    >
                        All
                    </button>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            className={`${styles.categoryChip} ${activeCategory === cat.id ? styles.chipActive : ''}`}
                            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Content feed */}
                <motion.div
                    className={styles.feedContainer}
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    {filteredFeed.map(item => (
                        <motion.div key={item.id} className={styles.feedCard} variants={itemVariants} whileHover={{ scale: 1.02 }}>
                            {/* Thumbnail */}
                            <div
                                className={styles.thumbnail}
                                style={{ backgroundImage: `url(${item.thumbnail})` }}
                            >
                                {isLocked(item) ? (
                                    <div className={styles.lockedOverlay}>
                                        <Icon name="lock" size={28} />
                                        <span>PREMIUM</span>
                                    </div>
                                ) : (
                                    <div className={styles.playOverlay}>
                                        <div className={styles.playBtn}>
                                            <Icon name="play_arrow" size={28} />
                                        </div>
                                    </div>
                                )}
                                <span className={styles.durationBadge}>{item.duration}</span>
                                {item.premium && (
                                    <span className={styles.premiumBadge}>PREMIUM</span>
                                )}
                            </div>

                            {/* Card info */}
                            <div className={styles.cardInfo}>
                                <div className={styles.cardMeta}>
                                    <span className={styles.categoryTag}>{item.category}</span>
                                </div>
                                <h3 className={styles.cardTitle}>{item.title}</h3>
                                <div className={styles.cardFooter}>
                                    <span className={styles.expertName}>{item.expert}</span>
                                    {isLocked(item) ? (
                                        <button className={styles.unlockBtn} onClick={() => navigate('/pricing')}>
                                            UNLOCK
                                        </button>
                                    ) : (
                                        <button className={styles.watchBtn}>
                                            WATCH
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

            </div>
        </AppShell>
    );
}

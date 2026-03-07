import { useState } from 'react';
import styles from './ExplorePage.module.css';
import AppShell from '../components/AppShell';
import { Icon } from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PrimaryButton } from '../components/ui/PrimaryButton';

// Mock data to hydrate the visual design
const DISCOVERY_FEED = [
    {
        id: '1',
        type: 'video',
        title: 'Spinal Articulation Protocol',
        category: 'MOBILITY',
        duration: '12:45',
        thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
        id: '2',
        type: 'premium_insight',
        title: 'Deep Tissue Release & Isometrics',
        description: 'Advanced protocols for chronic localized pain.',
    },
    {
        id: '3',
        type: 'video',
        title: 'Neuromuscular Activation',
        category: 'TRAINING',
        duration: '08:20',
        thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
        id: '4',
        type: 'video',
        title: 'Post-Load Autonomic Recovery',
        category: 'RECOVERY',
        duration: '15:00',
        thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    }
];

export default function ExplorePage() {
    const { tier } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <AppShell title="EXPLORE" sublabel="Movement knowledge engine">
            <div className={styles.page}>

                {/* 2. Search bar */}
                <div className={styles.searchContainer}>
                    <Icon name="search" size={20} className={styles.searchIcon} />
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search movement, pain or exercise"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* 5. Exercise Library Entry */}
                <div className={styles.libraryCard} onClick={() => console.log('Navigate to library')}>
                    <div className={styles.libraryInfo}>
                        <Icon name="menu_book" size={24} className={styles.libraryIcon} />
                        <div>
                            <h3 className={styles.libraryTitle}>System Library</h3>
                            <span className={styles.librarySub}>View full exercise index</span>
                        </div>
                    </div>
                    <Icon name="arrow_forward" size={20} className={styles.libraryArrow} />
                </div>

                {/* 3 & 4. Discover Feed */}
                <div className={styles.feedContainer}>
                    {DISCOVERY_FEED.map((item) => {
                        if (item.type === 'premium_insight') {
                            return (
                                <div key={item.id} className={styles.premiumCard}>
                                    <div className={styles.premiumIconBox}>
                                        <Icon name="lock" size={24} />
                                    </div>
                                    <div className={styles.premiumContent}>
                                        <span className={styles.premiumLabel}>PREMIUM PROTOCOL</span>
                                        <h3 className={styles.premiumTitle}>{item.title}</h3>
                                        <p className={styles.premiumDesc}>{item.description}</p>
                                    </div>
                                    {tier === 'free' ? (
                                        <PrimaryButton onClick={() => navigate('/pricing')}>UNLOCK PREMIUM</PrimaryButton>
                                    ) : (
                                        <PrimaryButton onClick={() => console.log('Access premium protocol')}>ACCESS PROTOCOL</PrimaryButton>
                                    )}
                                </div>
                            );
                        }

                        return (
                            <div key={item.id} className={styles.videoCard}>
                                <div className={styles.videoWrapper} style={{ backgroundImage: `url(${item.thumbnail})` }}>
                                    <div className={styles.videoOverlay}>
                                        <div className={styles.playButton}>
                                            <Icon name="play_arrow" size={32} />
                                        </div>
                                    </div>
                                    <div className={styles.videoBadges}>
                                        <span className={styles.categoryTag}>{item.category}</span>
                                        <span className={styles.durationTag}>{item.duration}</span>
                                    </div>
                                </div>
                                <div className={styles.videoInfo}>
                                    <h3 className={styles.videoTitle}>{item.title}</h3>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </AppShell>
    );
}

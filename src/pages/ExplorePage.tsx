import { useEffect, useState } from 'react';
import styles from './ExplorePage.module.css';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AppShell from '../components/AppShell';
import { Icon } from '../components/Icon';

import { useNavigate } from 'react-router-dom';

const PATTERNS = ['Todos', 'squat', 'hinge', 'push', 'pull', 'carry', 'regulate'];
const EQUIPMENTS = ['Todos', 'bodyweight', 'bands', 'kettlebell', 'barbell', 'other'];
const LEVELS = ['Todos', 'L1', 'L2', 'L3'];

export default function ExplorePage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // UI States
    const [viewState, setViewState] = useState<'loading' | 'error' | 'empty' | 'success'>('loading');
    const [errorMsg, setErrorMsg] = useState('');

    const [library, setLibrary] = useState<any[]>([]);
    const [subscription, setSubscription] = useState<any>(null);

    const [search, setSearch] = useState('');
    const [activePattern, setActivePattern] = useState('Todos');
    const [activeEquipment, setActiveEquipment] = useState('Todos');
    const [activeLevel, setActiveLevel] = useState('Todos');

    const [limit, setLimit] = useState(30);
    const [hasMore, setHasMore] = useState(true);

    const [mutedVideos, setMutedVideos] = useState<Record<string, boolean>>({});
    const [showLockModal, setShowLockModal] = useState(false);

    const toggleMute = (id: string) => {
        setMutedVideos(prev => ({ ...prev, [id]: prev[id] === false }));
    };

    const fetchExploreData = async () => {
        if (!user) return;
        setViewState('loading');
        setErrorMsg('');

        try {
            // Fetch subscription tier
            const { data: subData, error: subError } = await supabase
                .from('subscription_status')
                .select('tier')
                .eq('user_id', user.id)
                .maybeSingle();

            if (subError) throw subError;
            setSubscription(subData || { tier: 'free' });

            // Fetch library with pagination limit
            const { data: exData, error: exError } = await supabase
                .from('exercise_library')
                .select('*')
                .order('name')
                .limit(limit);

            if (exError) throw exError;

            if (exData) {
                setLibrary(exData);
                setHasMore(exData.length === limit); // basic check for hasMore
                setViewState(exData.length > 0 ? 'success' : 'empty');
            }

        } catch (err: any) {
            console.error('Explore error:', err);
            setErrorMsg(err.message || 'Error cargando la biblioteca.');
            setViewState('error');
        }
    };

    useEffect(() => {
        fetchExploreData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, limit]); // Re-fetch when limit increases

    const filtered = library.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
        const matchesPattern = activePattern === 'Todos' || item.pattern === activePattern;
        const matchesEquipment = activeEquipment === 'Todos' || item.equipment === activeEquipment;
        // In DB, levels might be '1', '2' or 'L1', 'L2'. Using loose match for flexibility.
        const matchesLevel = activeLevel === 'Todos' || (item.level && `L${item.level}` === activeLevel) || item.level === activeLevel;

        return matchesSearch && matchesPattern && matchesEquipment && matchesLevel;
    });

    const isLocked = (index: number) => {
        const userTier = subscription?.tier || 'free';
        return userTier === 'free' && index >= 8;
    };

    return (
        <AppShell
            customHeader={
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', paddingBottom: 'var(--sp-2)' }}>
                    <header className={styles.header}>
                        <h1 className={styles.title}>Biblioteca de ejecución</h1>
                        <p className={styles.subtitle}>Patrones clínicos y rutinas</p>
                    </header>

                    <div className={styles.searchBar}>
                        <Icon name="search" size={18} style={{ color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Buscar patrón..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={styles.searchInput}
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className={styles.clearBtn}>
                                <Icon name="close" size={18} />
                            </button>
                        )}
                    </div>

                    <div className={styles.filterRow}>
                        {PATTERNS.map((cat) => (
                            <button
                                key={cat}
                                className={`${styles.filterChip} ${activePattern === cat ? styles.filterActive : ''}`}
                                onClick={() => setActivePattern(cat)}
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className={styles.filterRow} style={{ paddingTop: 0 }}>
                        {EQUIPMENTS.map((eq) => (
                            <button
                                key={eq}
                                className={`${styles.filterChip} ${activeEquipment === eq ? styles.filterActive : ''}`}
                                onClick={() => setActiveEquipment(eq)}
                            >
                                {eq.charAt(0).toUpperCase() + eq.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className={styles.filterRow} style={{ paddingTop: 0 }}>
                        {LEVELS.map((lvl) => (
                            <button
                                key={lvl}
                                className={`${styles.filterChip} ${activeLevel === lvl ? styles.filterActive : ''}`}
                                onClick={() => setActiveLevel(lvl)}
                            >
                                {lvl}
                            </button>
                        ))}
                    </div>
                </div>
            }
        >
            {/* Scrollable Content Area */}
            <div style={{ scrollSnapType: 'y mandatory', display: 'flex', flexDirection: 'column' }}>
                {viewState === 'loading' && (
                    <div style={{ display: 'flex', flexDirection: 'column', padding: 'var(--sp-8) 0', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                        <Icon name="autorenew" style={{ animation: 'spin 1s linear infinite' }} size={32} />
                        <p style={{ marginTop: '16px', fontSize: '14px' }}>Cargando catálogo...</p>
                    </div>
                )}

                {viewState === 'error' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 'var(--sp-8) var(--sp-4)', gap: '16px' }}>
                        <Icon name="error" style={{ color: 'var(--warning)' }} size={48} />
                        <h2 style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: 600 }}>Error de Sistema</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{errorMsg}</p>
                        <button
                            onClick={fetchExploreData}
                            style={{ marginTop: '16px', padding: '12px 24px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {viewState === 'empty' && (
                    <div className={styles.emptyState}>
                        <Icon name="video_library" size={48} />
                        <p>El catálogo está vacío actualmente.</p>
                    </div>
                )}

                {viewState === 'success' && filtered.length === 0 && (
                    <div className={styles.emptyState}>
                        <Icon name="search_off" size={48} />
                        <p>No hay resultados para tu búsqueda. Ajusta los filtros.</p>
                    </div>
                )}

                {viewState === 'success' && filtered.length > 0 && (
                    <div className={styles.grid}>
                        {filtered.map((item, index) => {
                            const locked = isLocked(index);
                            return (
                                <div
                                    key={item.id}
                                    className={`${styles.videoCard} ${locked ? styles.locked : ''}`}
                                    onClick={() => {
                                        if (locked) setShowLockModal(true);
                                    }}
                                >
                                    <div className={styles.videoContainer}>
                                        {item.media_video_url && !locked ? (
                                            <video src={item.media_video_url} playsInline muted={mutedVideos[item.id] !== false} loop autoPlay preload="metadata" className={styles.thumbnailVideo} />
                                        ) : (
                                            <div className={styles.thumbnailPlaceholder}>
                                                <Icon name="play_circle" style={{ color: 'rgba(255,255,255,0.5)' }} size={48} />
                                            </div>
                                        )}
                                        {/* Scrim for text readability */}
                                        <div className={styles.scrim}></div>

                                        {/* Top indicators */}
                                        <div className={styles.topRow}>
                                            <div className={styles.patternChip}>{item.pattern || 'Movement'}</div>
                                            {item.media_video_url && (
                                                <button className={styles.muteToggle} onClick={(e) => { e.stopPropagation(); toggleMute(item.id); }}>
                                                    <Icon name={mutedVideos[item.id] !== false ? "volume_off" : "volume_up"} size={18} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Overlay Content (Bottom) */}
                                        <div className={styles.overlayContent}>
                                            <div className={styles.clinicalCues}>
                                                <div className={styles.cue}><Icon name="info" size={14} /> <span>Focus: Neutral Spine</span></div>
                                            </div>

                                            <h3 className={styles.cardTitle}>{item.name}</h3>

                                            {(item.sets || item.reps || item.rest_seconds) && (
                                                <div className={styles.metaPillRow}>
                                                    {item.sets && <span className={styles.metaPill}>{item.sets} Sets</span>}
                                                    {item.reps && <span className={styles.metaPill}>{item.reps} Reps</span>}
                                                    {item.rest_seconds && <span className={styles.metaPill}>{item.rest_seconds}s Rest</span>}
                                                </div>
                                            )}
                                        </div>

                                        {locked && (
                                            <div className={styles.lockOverlay}>
                                                <Icon name="lock" size={32} />
                                                <span>PRO</span>
                                                <button
                                                    className={styles.trialPillBtn}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowLockModal(true);
                                                    }}
                                                >
                                                    Start 7-day trial
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}

                        {hasMore && (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--sp-4) 0 var(--sp-8) 0' }}>
                                <button
                                    className={styles.loadMoreBtn}
                                    onClick={() => setLimit(prev => prev + 30)}
                                >
                                    Load more
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Lock Modal */}
            {showLockModal && (
                <div className={styles.modalOverlay} onClick={() => setShowLockModal(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalIconBox}>
                            <Icon name="lock" size={32} />
                        </div>
                        <h2 className={styles.modalTitle}>Unlock Execution Library</h2>
                        <p className={styles.modalText}>
                            Access full exercise database, adaptive engine, and analytics.
                        </p>

                        <div className={styles.modalActions}>
                            <button
                                className={styles.primaryBtn}
                                onClick={() => navigate('/pricing')}
                            >
                                Start 7-day trial
                            </button>
                            <button
                                className={styles.ghostBtn}
                                onClick={() => setShowLockModal(false)}
                            >
                                Not now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppShell>
    );
}

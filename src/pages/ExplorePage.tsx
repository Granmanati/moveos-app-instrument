import { useEffect, useState, useRef } from 'react';
import styles from './ExplorePage.module.css';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AppShell from '../components/AppShell';
import { Icon } from '../components/Icon';
import { useI18n } from '../i18n/useI18n';
import { useNavigate } from 'react-router-dom';
import { safeSelect } from '../lib/db';
import { PageHeader } from '../components/ui/PageHeader';
import { PrimaryButton } from '../components/ui/PrimaryButton';

const PATTERNS = ['Todos', 'squat', 'hinge', 'push', 'pull', 'carry', 'regulate'];
const EQUIPMENTS = ['Todos', 'bodyweight', 'bands', 'kettlebell', 'barbell', 'other'];
const LEVELS = ['Todos', 'L1', 'L2', 'L3'];

export default function ExplorePage() {
    const { user, tier } = useAuth();
    const { t } = useI18n();
    const navigate = useNavigate();
    const isFree = tier === 'free';

    // UI States
    const [viewState, setViewState] = useState<'loading' | 'error' | 'empty' | 'success'>('loading');
    const [errorMsg, setErrorMsg] = useState('');

    const [library, setLibrary] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [activePattern, setActivePattern] = useState('Todos');
    const [activeEquipment, setActiveEquipment] = useState('Todos');
    const [activeLevel, setActiveLevel] = useState('Todos');
    const [limit, setLimit] = useState(40);
    const [hasMore, setHasMore] = useState(false);
    const [showLockModal, setShowLockModal] = useState(false);

    const [mutedVideos, setMutedVideos] = useState<Record<string, boolean>>({});

    // Refs for videos to play/pause programmatically and observe
    const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.getAttribute('data-id');
                if (!id) return;

                if (entry.isIntersecting) {
                    // attempt autoplay
                    const vid = videoRefs.current[id];
                    if (vid) {
                        vid.play().catch(e => console.log('Autoplay blocked', e));
                    }
                } else {
                    // pause when leaving
                    const vid = videoRefs.current[id];
                    if (vid) {
                        vid.pause();
                    }
                }
            });
        }, { threshold: 0.6 }); // 60% of card must be visible to trigger

        // observe all cards
        Object.values(videoRefs.current).forEach(vid => {
            if (vid && vid.parentElement) observer.observe(vid.parentElement);
        });

        return () => observer.disconnect();
    }, [library, activePattern, activeEquipment, activeLevel, search]);

    const toggleMute = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const currentRef = videoRefs.current[id];
        if (currentRef) {
            currentRef.muted = !currentRef.muted;
            setMutedVideos(prev => ({ ...prev, [id]: currentRef.muted }));
        }
    };

    const fetchExploreData = async () => {
        if (!user) return;
        setViewState('loading');
        setErrorMsg('');
        try {
            // Fetch full library (we gate client-side based on tier)
            const queryInfo = supabase
                .from('exercise_library')
                .select('*')
                .eq('is_active', true)
                .order('name')
                .limit(limit);

            const { data: exData, error: exError } = await safeSelect(queryInfo, 'ExploreData');

            if (exError) {
                setErrorMsg(exError.message);
                setViewState('error');
                return;
            }

            if (exData) {
                setLibrary(exData);
                setHasMore(false); // MVP fetches all 40 at once
                setViewState(exData.length > 0 ? 'success' : 'empty');
            }
        } catch (err: any) {
            setErrorMsg(err.message || 'Error occurred while loading data.');
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

    const isLocked = (item: any) => {
        return isFree && item.is_premium === true;
    };

    // Remove FREE_TIER_LIMIT unused warning logic as well hook if not used. 
    // And activeVideoId since it's just set for potential future use but not read inline. 
    // Wait, activeVideoId is used to render? No, we used videoRefs.current[id].play().
    // We can leave activeVideoId or read it in the UI if needed, for instance, a playing state logo, but let's just use it to avoid TS warning:
    // We can console.log it or actually use it to display a 'Now Playing' debug or simply suppress warning by using it in a class.

    return (
        <AppShell
            customHeader={
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', paddingBottom: 'var(--sp-2)' }}>
                    <PageHeader
                        title="Biblioteca de ejecución"
                        subtitle="Patrones clínicos y rutinas"
                    />

                    <div className={styles.searchBar}>
                        <Icon name="search" size={18} style={{ color: 'var(--text-secondary)' }} />
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
                        <Icon name="error" style={{ color: 'var(--state-warning)' }} size={48} />
                        <h2 style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: 600 }}>Error de Sistema</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{errorMsg}</p>
                        <div style={{ marginTop: '16px', width: '200px' }}>
                            <PrimaryButton onClick={fetchExploreData}>Reintentar</PrimaryButton>
                        </div>
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
                    <div className={styles.feedContainer}>
                        {filtered.map((item) => {
                            const locked = isLocked(item);
                            const isMuted = mutedVideos[item.id.toString()] !== false; // default true

                            return (
                                <div
                                    key={item.id}
                                    data-id={item.id}
                                    className={`${styles.videoCard} ${locked ? styles.locked : ''}`}
                                    onClick={() => {
                                        if (locked) {
                                            setShowLockModal(true);
                                        } else {
                                            // Optional: toggle play/pause on tap
                                            const vid = videoRefs.current[item.id.toString()];
                                            if (vid) {
                                                if (vid.paused) vid.play();
                                                else vid.pause();
                                            }
                                        }
                                    }}
                                >
                                    <div className={styles.videoContainer}>
                                        {item.media_video_url && !locked ? (
                                            <video
                                                ref={el => { videoRefs.current[item.id.toString()] = el; }}
                                                src={item.media_video_url}
                                                playsInline
                                                muted={isMuted}
                                                loop
                                                preload="metadata"
                                                className={styles.thumbnailVideo}
                                            />
                                        ) : (
                                            <div ref={el => { videoRefs.current[item.id.toString()] = el as any; }} className={styles.thumbnailPlaceholder}>
                                                <Icon name="play_circle" style={{ color: 'rgba(255,255,255,0.5)' }} size={48} />
                                            </div>
                                        )}
                                        {/* Scrim for text readability */}
                                        <div className={styles.scrim}></div>

                                        {/* Top indicators */}
                                        <div className={styles.topRow}>
                                            <div className={styles.patternChip}>{item.pattern || 'Movement'}</div>
                                            {item.equipment && (
                                                <div className={styles.patternChip} style={{ marginLeft: '8px', background: 'rgba(255,255,255,0.1)' }}>{item.equipment}</div>
                                            )}
                                            <div style={{ flex: 1 }} />
                                            {item.media_video_url && !locked && (
                                                <button className={styles.muteToggle} onClick={(e) => toggleMute(item.id.toString(), e)}>
                                                    <Icon name={isMuted ? "volume_off" : "volume_up"} size={18} />
                                                </button>
                                            )}
                                        </div>

                                        <div className={styles.overlayContent}>
                                            <h3 className={styles.cardTitle}>{item.name}</h3>

                                            <div className={styles.metaPillRow}>
                                                {item.default_sets > 0 && <span className={styles.metaPill}>{item.default_sets} Sets</span>}
                                                {item.default_reps_min > 0 && <span className={styles.metaPill}>{item.default_reps_min}{item.default_reps_max > item.default_reps_min ? `-${item.default_reps_max}` : ''} Reps</span>}
                                                {item.default_rest_sec > 0 && <span className={styles.metaPill}>{item.default_rest_sec}s Rest</span>}
                                            </div>

                                            <div className={styles.metaPillRow} style={{ marginTop: '8px', opacity: 0.7 }}>
                                                {item.progression_level && <span className={styles.metaPill}>Lvl {item.progression_level}</span>}
                                                {item.movement_complexity && <span className={styles.metaPill}>{item.movement_complexity}</span>}
                                                {item.load_potential && <span className={styles.metaPill}>{item.load_potential} Load</span>}
                                            </div>
                                        </div>

                                        {locked && (
                                            <div className={styles.lockOverlay}>
                                                <Icon name="lock" size={32} />
                                                <span style={{ fontWeight: 600, letterSpacing: '1px' }}>PRO</span>
                                                <div style={{ marginTop: '8px', minWidth: '160px' }}>
                                                    <PrimaryButton size="sm" onClick={(e) => { e.stopPropagation(); setShowLockModal(true); }}>
                                                        {t('exploreUnlockCTA')}
                                                    </PrimaryButton>
                                                </div>
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
                                    onClick={() => setLimit(prev => prev + 40)}
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
